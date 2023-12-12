package consumer

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
)

// Intermediary object that handles communication between consumers and storage.
type storageUpdater struct {
	storer storage.Storer

	msgChannel   listenOnlyMsgChannel
	closeChannel listenOnlySignalChannel

	wg *sync.WaitGroup
}

func newDatabaseUpdater(storer storage.Storer, msgChannel msgChannelType, closeChannel signalChannelType, wg *sync.WaitGroup) *storageUpdater {
	result := &storageUpdater{
		storer: storer,

		msgChannel:   msgChannel,
		closeChannel: closeChannel,
		wg:           wg,
	}

	// launch a pool of database handler goroutines that can consume
	// messages from the channel and handle the records
	poolSize := 20
	for i := 0; i < poolSize; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			result.storageUpdaterLoop()
		}()
	}

	return result
}

// Handle actual database updates from consumers
func (u *storageUpdater) storageUpdaterLoop() {
	closeChannel := u.closeChannel
	msgChannel := u.msgChannel
readLoop:
	for {
		select {
		case <-closeChannel:
			// Close this one too when we get a closeChannel message
			break readLoop
		case msg := <-msgChannel:
			var untypedRecord UntypedRecord
			err := json.Unmarshal(msg, &untypedRecord)
			if err != nil {
				log.Printf("Failed to unmarshal: %v", err)
				continue readLoop
			}

			err = u.handlingDispatch(&untypedRecord)
			if err != nil {
				log.Printf("Handling failed: %v", err)
				continue readLoop
			}
		}
	}
}

func (u *storageUpdater) handlingDispatch(untypedRecord *UntypedRecord) error {
	var err error

	switch untypedRecord.ValueType { // nolint:exhaustive
	case "":
		return fmt.Errorf("zero-value value type in record")
	case ValueTypeDeployment:
		err = u.handleDeployment(untypedRecord)
		if err != nil {
			return fmt.Errorf("failed to handle deployment: %w", err)
		}
	case ValueTypeProcess:
		err = u.handleProcess(untypedRecord)
		if err != nil {
			return fmt.Errorf("failed to handle process: %w", err)
		}
	case ValueTypeProcessInstance:
		err = u.handleProcessInstance(untypedRecord)
		if err != nil {
			return fmt.Errorf("failed to handle process instance: %w", err)
		}
	case ValueTypeVariable:
		err = u.handleVariable(untypedRecord)
		if err != nil {
			return fmt.Errorf("failed to handle variable: %w", err)
		}
	case ValueTypeIncident:
		err = u.handleIncident(untypedRecord)
		if err != nil {
			return fmt.Errorf("failed to handle incident: %w", err)
		}
	case ValueTypeJob:
		err = u.handleJob(untypedRecord)
		if err != nil {
			return fmt.Errorf("failed to handle job: %w", err)
		}
	default:
		log.Printf("Unhandled record: %v (intent: %v)",
			untypedRecord.ValueType, untypedRecord.Intent)
	}
	return nil
}

func (u *storageUpdater) handleDeployment(untypedRecord *UntypedRecord) error {
	storer := u.storer

	record, err := WithTypedValue[DeploymentValue](*untypedRecord)
	if err != nil {
		return fmt.Errorf("failed to cast: %w", err)
	}

	switch record.Intent { // nolint:exhaustive
	case IntentCreated:
		resources := record.Value.Resources
		processes := record.Value.ProcessesMetadata

		resourceMap := map[string][]byte{}
		for _, resource := range resources {
			resourceMap[resource.ResourceName] = resource.Resource
		}

		// Make storage for errors
		var errs []error
		for _, process := range processes {
			bpmnResource, ok := resourceMap[process.ResourceName]
			if !ok {
				err := fmt.Errorf("resource not in map: %s",
					process.ResourceName)
				errs = append(errs, err)
				continue
			}

			bpmnProcessID := process.BpmnProcessID
			processDefinitionKey := process.ProcessDefinitionKey
			deploymentTime := time.UnixMilli(record.Timestamp)
			version := process.Version
			log.Printf("Deploying %s", bpmnProcessID)

			err := storer.ProcessDeployed(
				processDefinitionKey,
				bpmnProcessID,
				version,
				deploymentTime,
				bpmnResource,
			)
			if err != nil {
				errs = append(errs, err)
			} else {
				log.Printf("Deployed process %d (%s)",
					processDefinitionKey, bpmnProcessID)
			}
		}

		if len(errs) != 0 {
			err := fmt.Errorf("failed some deploys: %w", errors.Join(errs...))
			return err
		}

		// We'll also get IntentFullyDistributed once it's distributed to all
		// zeebe partitions but I'm not sure that's useful information to us
	default:
		log.Printf("Unhandled intent for %v: %s",
			record.ValueType, record.Intent)
	}

	// If we get here we did nothing or missed all err returns so handling
	// succeeded
	return nil
}

func (u *storageUpdater) handleProcess(untypedRecord *UntypedRecord) error {
	record, err := WithTypedValue[ProcessValue](*untypedRecord)
	if err != nil {
		return fmt.Errorf("failed to cast: %w", err)
	}

	processDefinitionKey := record.Value.ProcessDefinitionKey
	bpmnProcessID := record.Value.BpmnProcessID

	switch record.Intent { // nolint:exhaustive
	case IntentCreated:
		// I think these should already be handled in deploy?
		// Log them here anyway in case that's *not* always the case
		log.Printf("Process created: %d (%s)",
			processDefinitionKey, bpmnProcessID)
	default:
		log.Printf("Unhandled intent for %v: %s",
			record.ValueType, record.Intent)
	}

	// If we get here we did nothing or missed all err returns so handling
	// succeeded
	return nil
}

func (u *storageUpdater) handleProcessInstance(untypedRecord *UntypedRecord) error {
	storer := u.storer

	record, err := WithTypedValue[ProcessInstanceValue](*untypedRecord)
	if err != nil {
		return fmt.Errorf("failed to cast: %w", err)
	}

	processInstanceKey := record.Value.ProcessInstanceKey
	processDefinitionKey := record.Value.ProcessDefinitionKey
	elementID := record.Value.ElementID
	bpmnElementType := record.Value.BpmnElementType
	version := record.Value.Version

	timestamp := time.UnixMilli(record.Timestamp)

	// Record all events in the audit log first
	err = storer.AuditLogEventOccurred(
		record.Position,
		processInstanceKey,
		elementID,
		string(bpmnElementType),
		string(record.Intent),
		timestamp,
	)
	if err != nil {
		log.Printf(
			"Failed to log event to audit log: position %d, element id %s, err: %v",
			record.Position,
			elementID,
			err,
		)
	}

	// Once we handle further element types it may be desirable to dispatch
	// them further based on either intent or element type, depending on
	// which one seems more reasonable.
	switch record.Intent { // nolint:exhaustive
	case IntentElementActivating:
		if bpmnElementType == BpmnElementTypeProcess {
			log.Printf("Process instance activating: %d", processInstanceKey)
		}
	case IntentElementActivated:
		if bpmnElementType == BpmnElementTypeProcess {
			log.Printf("Process instance activated: %d", processInstanceKey)
			return storer.ProcessInstanceActivated(
				processInstanceKey,
				processDefinitionKey,
				version,
				timestamp,
			)
		}
	case IntentElementCompleting:
		if bpmnElementType == BpmnElementTypeProcess {
			log.Printf("Process instance completing: %d", processInstanceKey)
		}
	case IntentElementCompleted:
		if bpmnElementType == BpmnElementTypeProcess {
			log.Printf("Process instance completed: %d", processInstanceKey)
			return storer.ProcessInstanceCompleted(
				processInstanceKey,
				timestamp,
			)
		}
	case IntentElementTerminating:
		if bpmnElementType == BpmnElementTypeProcess {
			log.Printf("Process instance terminating: %d", processInstanceKey)
		}
	case IntentElementTerminated:
		if bpmnElementType == BpmnElementTypeProcess {
			log.Printf("Process instance terminated: %d", processInstanceKey)
			return storer.ProcessInstanceTerminated(
				processInstanceKey,
				timestamp,
			)
		}
	default:
		log.Printf("Unhandled intent for %v: %s",
			record.ValueType, record.Intent)
	}

	// If we get here we did nothing or missed all err returns so handling
	// succeeded
	return nil
}

func (u *storageUpdater) handleVariable(untypedRecord *UntypedRecord) error {
	storer := u.storer

	record, err := WithTypedValue[VariableValue](*untypedRecord)
	if err != nil {
		return fmt.Errorf("failed to cast: %w", err)
	}

	processInstanceKey := record.Value.ProcessInstanceKey
	name := record.Value.Name
	value := record.Value.Value
	switch record.Intent { // nolint:exhaustive
	case IntentCreated:
		log.Printf("Variable created: %s = %s (instance %d)",
			name, value, processInstanceKey)
		return storer.VariableCreated(
			processInstanceKey,
			name,
			value,
			time.UnixMilli(record.Timestamp),
		)
	case IntentUpdated:
		log.Printf("Variable updated: %s = %s (instance %d)",
			name, value, processInstanceKey)
		return storer.VariableUpdated(
			processInstanceKey,
			name,
			value,
			time.UnixMilli(record.Timestamp),
		)
	default:
		log.Printf("Unhandled intent for %v: %s",
			record.ValueType, record.Intent)
	}

	// If we get here we did nothing or missed all err returns so handling
	// succeeded
	return nil
}

func (u *storageUpdater) handleIncident(untypedRecord *UntypedRecord) error {
	storer := u.storer

	record, err := WithTypedValue[IncidentValue](*untypedRecord)
	if err != nil {
		return fmt.Errorf("failed to cast: %w", err)
	}

	key := record.Key
	processInstanceKey := record.Value.ProcessInstanceKey
	elementID := record.Value.ElementID
	errorType := record.Value.ErrorType
	errorMessage := record.Value.ErrorMessage
	time := time.UnixMilli(record.Timestamp)

	switch record.Intent { // nolint:exhaustive
	case IntentCreated:
		log.Printf("Incident created: %s (instance %d)",
			errorType, processInstanceKey)
		return storer.IncidentCreated(
			key,
			processInstanceKey,
			elementID,
			errorType,
			errorMessage,
			time,
		)
	case IntentResolved:
		log.Printf("Incident resolved: %s (instance %d)",
			errorType, processInstanceKey)
		return storer.IncidentResolved(
			key,
			time,
		)
	default:
		log.Printf("Unhandled intent for %v: %s",
			record.ValueType, record.Intent)
	}

	return nil

}

func (u *storageUpdater) handleJob(untypedRecord *UntypedRecord) error {
	storer := u.storer

	record, err := WithTypedValue[JobValue](*untypedRecord)
	if err != nil {
		return fmt.Errorf("failed to cast: %w", err)
	}

	// Other than created we just need to handle all the other ones as
	// state updates.
	// It looks like they're still adding more intents here so we'll
	// automatically support those if we just plop the intent in there, and
	// if I'm understanding correctly all the state should come in each message.
	// The key is the unique key, but other than that i think element id,
	// process instance key and job type *probably* shouldn't change in
	// state updates, since element id and process instance key specify
	// which part of which process instance the job is executing for, and
	// job type is used to dispatch to workers.
	// If this assumption is wrong, the JobUpdated interface needs to be updated.

	key := record.Key
	elementID := record.Value.ElementID
	processInstanceKey := record.Value.ProcessInstanceKey
	jobType := record.Value.Type
	retries := record.Value.Retries
	worker := record.Value.Worker
	state := string(record.Intent)
	time := time.UnixMilli(record.Timestamp)

	if record.Intent == IntentCreated {
		log.Printf("Job created: %s (instance %d, element %s)",
			jobType, processInstanceKey, elementID)
		return storer.JobCreated(
			key,
			elementID,
			processInstanceKey,
			jobType,
			retries,
			worker,
			time,
		)
	}
	// Other intents should only come in for jobs that already
	// exist so they're Update type tasks
	log.Printf("Job state changed: %s, %s (instance %d, element %s)",
		state, jobType, processInstanceKey, elementID)
	return storer.JobUpdated(
		key,
		retries,
		worker,
		state,
		time,
	)
}
