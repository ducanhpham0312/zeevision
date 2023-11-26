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

type storageUpdater struct {
	storer *storage.Storer

	msgChannel   msgChannelType
	closeChannel signalChannelType

	wg *sync.WaitGroup
}

func newDatabaseUpdater(storer *storage.Storer, msgChannel msgChannelType, closeChannel signalChannelType, wg *sync.WaitGroup) *storageUpdater {
	result := &storageUpdater{
		storer: storer,

		msgChannel:   msgChannel,
		closeChannel: closeChannel,
		wg:           wg,
	}

	// launch a database handler goroutine
	// TODO This is very temporary - perhaps we should instead have specialised
	// per-topic goroutines..?
	wg.Add(1)
	go func() {
		defer wg.Done()
		result.storageUpdaterLoop()
	}()

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

			switch untypedRecord.ValueType {
			case ValueTypeDeployment:
				err = u.handleDeployment(&untypedRecord)
				if err != nil {
					log.Printf("Failed to handle deployment: %v", err)
					continue readLoop
				}
			case ValueTypeProcess:
				err = u.handleProcess(&untypedRecord)
				if err != nil {
					log.Printf("Failed to handle process: %v", err)
					continue readLoop
				}
			case ValueTypeProcessInstance:
				err = u.handleProcessInstance(&untypedRecord)
				if err != nil {
					log.Printf("Failed to handle process instance: %v", err)
					continue readLoop
				}
			case ValueTypeVariable:
				err = u.handleVariable(&untypedRecord)
				if err != nil {
					log.Printf("Failed to handle variable: %v", err)
					continue readLoop
				}
			default:
				log.Printf("Unhandled record: %v (intent: %v)",
					untypedRecord.ValueType, untypedRecord.Intent)
			}
		}
	}
}

func (u *storageUpdater) handleDeployment(untypedRecord *UntypedRecord) error {
	storer := u.storer

	record, err := WithTypedValue[DeploymentValue](*untypedRecord)
	if err != nil {
		return fmt.Errorf("failed to cast: %w", err)
	}

	switch record.Intent {
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
			bpmnProcessID := process.BpmnProcessID
			processDefinitionKey := process.ProcessDefinitionKey
			bpmnResource := resourceMap[process.ResourceName]
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

		if errs != nil {
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
	switch record.Intent {
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

	// bpmnProcessID := record.Value.BpmnProcessID
	processInstanceKey := record.Value.ProcessInstanceKey
	processDefinitionKey := record.Value.ProcessDefinitionKey
	// elementID := record.Value.ElementID
	// bpmnEventType := record.Value.BpmnEventType
	// parentProcessInstanceKey := record.Value.ParentProcessInstanceKey
	// parentElementInstanceKey := record.Value.ParentElementInstanceKey
	bpmnElementType := record.Value.BpmnElementType
	version := record.Value.Version

	// log.Printf("intent %v; process id %s, instance key %d, definition key %d, element id %s, event type %s, parent instance key %d, parent element instance key %d, element type %v",
	// 	record.Intent,
	// 	bpmnProcessID,
	// 	processInstanceKey,
	// 	processDefinitionKey,
	// 	elementID,
	// 	bpmnEventType,
	// 	parentProcessInstanceKey,
	// 	parentElementInstanceKey,
	// 	bpmnElementType,
	// )
	switch record.Intent {
	case IntentElementActivating:
		if bpmnElementType == "PROCESS" {
			log.Printf("Process instance activating: %d", processInstanceKey)
		}
	case IntentElementActivated:
		if bpmnElementType == "PROCESS" {
			log.Printf("Process instance activated: %d", processInstanceKey)
			return storer.ProcessInstanceActivated(
				processInstanceKey,
				processDefinitionKey,
				version,
				time.UnixMilli(record.Timestamp),
			)
		}
	case IntentElementCompleting:
		if bpmnElementType == "PROCESS" {
			log.Printf("Process instance completing: %d", processInstanceKey)
		}
	case IntentElementCompleted:
		if bpmnElementType == "PROCESS" {
			log.Printf("Process instance completed: %d", processInstanceKey)
			return storer.ProcessInstanceCompleted(
				processInstanceKey,
				time.UnixMilli(record.Timestamp),
			)
		}
	case IntentElementTerminating:
		if bpmnElementType == "PROCESS" {
			log.Printf("Process instance completing: %d", processInstanceKey)
		}
	case IntentElementTerminated:
		if bpmnElementType == "PROCESS" {
			log.Printf("Process instance completed: %d", processInstanceKey)
			// TODO we need a status for this
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
	switch record.Intent {
	case IntentCreated:
		// I think these should already be handled in deploy?
		// Log them here anyway in case that's *not* always the case
		log.Printf("Variable created: %s = %s (instance %d)",
			name, value, processInstanceKey)
		return storer.VariableCreated(
			processInstanceKey,
			name,
			value,
			time.UnixMilli(record.Timestamp),
		)
	case IntentUpdated:
		// I think these should already be handled in deploy?
		// Log them here anyway in case that's *not* always the case
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
