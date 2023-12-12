package consumer

import (
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
	"go.uber.org/zap"
)

// Intermediary object that handles communication between consumers and storage.
type storageUpdater struct {
	storer storage.Storer

	msgChannel   listenOnlyMsgChannel
	closeChannel listenOnlySignalChannel

	wg *sync.WaitGroup
}

func newDatabaseUpdater(storer storage.Storer, msgChannel msgChannelType, closeChannel signalChannelType,
	wg *sync.WaitGroup) *storageUpdater {
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
				zap.L().Error("Failed to unmarshal: ", zap.Error(err))
				continue readLoop
			}

			err = u.handlingDispatch(&untypedRecord)
			if err != nil {
				zap.L().Error("Handling failed: ", zap.Error(err))
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
	default:
		zap.L().Warn("Unhandled record:",
			zap.String("value type", string(untypedRecord.ValueType)),
			zap.String("intent", string(untypedRecord.Intent)))
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
			zap.L().Info("Deploying ", zap.String("bpmn process", bpmnProcessID))

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
				zap.L().Info("Deployed process with ",
					zap.Int64("process definition", processDefinitionKey),
					zap.String("bpmn process", bpmnProcessID))
			}
		}

		if len(errs) != 0 {
			err := fmt.Errorf("failed some deploys: %w", errors.Join(errs...))
			return err
		}

		// We'll also get IntentFullyDistributed once it's distributed to all
		// zeebe partitions but I'm not sure that's useful information to us
	default:
		zap.L().Warn("Unhandled intent for ",
			zap.String("value type", string(record.ValueType)),
			zap.String("intent", string(record.Intent)))
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
		zap.L().Info("Process created:",
			zap.Int64("process definition", processDefinitionKey),
			zap.String("bpmn process", bpmnProcessID))
	default:
		zap.L().Warn("Unhandled intent for ",
			zap.String("value type", string(record.ValueType)),
			zap.String("intent", string(record.Intent)))
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
		zap.L().Error(
			"Failed to log event to audit log: position %d, element id %s, err: %v",
			zap.Int64("record position", record.Position),
			zap.String("elementID", elementID),
			zap.Error(err),
		)
	}

	// Once we handle further element types it may be desirable to dispatch
	// them further based on either intent or element type, depending on
	// which one seems more reasonable.
	switch record.Intent { // nolint:exhaustive
	case IntentElementActivating:
		if bpmnElementType == BpmnElementTypeProcess {
			zap.L().Info("Process instance activating:", zap.Int64("process instance", processInstanceKey))
		}
	case IntentElementActivated:
		if bpmnElementType == BpmnElementTypeProcess {
			zap.L().Info("Process instance activated:", zap.Int64("process instance", processInstanceKey))
			return storer.ProcessInstanceActivated(
				processInstanceKey,
				processDefinitionKey,
				version,
				timestamp,
			)
		}
	case IntentElementCompleting:
		if bpmnElementType == BpmnElementTypeProcess {
			zap.L().Info("Process instance completing:", zap.Int64("process instance", processInstanceKey))
		}
	case IntentElementCompleted:
		if bpmnElementType == BpmnElementTypeProcess {
			zap.L().Info("Process instance completed:", zap.Int64("process instance", processInstanceKey))
			return storer.ProcessInstanceCompleted(
				processInstanceKey,
				timestamp,
			)
		}
	case IntentElementTerminating:
		if bpmnElementType == BpmnElementTypeProcess {
			zap.L().Info("Process instance terminating:", zap.Int64("process instance", processInstanceKey))
		}
	case IntentElementTerminated:
		if bpmnElementType == BpmnElementTypeProcess {
			zap.L().Info("Process instance terminated:", zap.Int64("process instance", processInstanceKey))
			return storer.ProcessInstanceTerminated(
				processInstanceKey,
				timestamp,
			)
		}
	default:
		zap.L().Warn("Unhandled intent for ",
			zap.String("value type", string(record.ValueType)),
			zap.String("intent", string(record.Intent)))
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
		zap.L().Info("Variable created",
			zap.String("name", name),
			zap.String("value", value),
			zap.Int64("process instance", processInstanceKey))
		return storer.VariableCreated(
			processInstanceKey,
			name,
			value,
			time.UnixMilli(record.Timestamp),
		)
	case IntentUpdated:
		zap.L().Info("Variable updated",
			zap.String("name", name),
			zap.String("value", value),
			zap.Int64("process instance", processInstanceKey))
		return storer.VariableUpdated(
			processInstanceKey,
			name,
			value,
			time.UnixMilli(record.Timestamp),
		)
	default:
		zap.L().Warn("Unhandled intent for ",
			zap.String("value type", string(record.ValueType)),
			zap.String("intent", string(record.Intent)))
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
		zap.L().Info("Incident created",
			zap.String("error type", errorType),
			zap.Int64("process instance", processInstanceKey))
		return storer.IncidentCreated(
			key,
			processInstanceKey,
			elementID,
			errorType,
			errorMessage,
			time,
		)
	case IntentResolved:
		zap.L().Info("Incident resolved",
			zap.String("error type", errorType),
			zap.Int64("process instance", processInstanceKey))
		return storer.IncidentResolved(
			key,
			time,
		)
	default:
		zap.L().Warn("Unhandled intent for ",
			zap.String("value type", string(record.ValueType)),
			zap.String("intent", string(record.Intent)))

	}

	return nil

}
