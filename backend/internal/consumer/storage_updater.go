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

	switch record.Intent {
	case IntentCreated:
		fmt.Printf("Record: %v", record)
	}

	// If we get here we did nothing or missed all err returns so handling
	// succeeded
	return nil
}
