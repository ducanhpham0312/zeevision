package consumer

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"sync"

	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
)

type databaseUpdater struct {
	storer *storage.Storer

	msgChannel   msgChannelType
	closeChannel signalChannelType

	wg *sync.WaitGroup
}

func newDatabaseUpdater(storer *storage.Storer, msgChannel msgChannelType, closeChannel signalChannelType, wg *sync.WaitGroup) *databaseUpdater {
	result := &databaseUpdater{
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
		result.databaseUpdaterLoop()
	}()

	return result
}

// Handle actual database updates from consumers
func (u *databaseUpdater) databaseUpdaterLoop() {
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
				record, err := WithTypedValue[DeploymentValue](untypedRecord)
				if err != nil {
					log.Printf("Failed to cast: %v", err)
					continue readLoop
				}

				err = u.handleDeployment(&record)
				if err != nil {
					log.Printf("Failed to handle deployment: %v", err)
					continue readLoop
				}
			}

		}
	}
}

func (u *databaseUpdater) handleDeployment(record *Deployment) error {
	storer := u.storer

	switch record.Intent {
	case IntentCreated:
		resources := record.Value.Resources
		processes := record.Value.ProcessesMetadata

		resourceMap := map[string]string{}
		for _, resource := range resources {
			resourceMap[resource.ResourceName] = string(resource.Resource)
		}

		// Make storage for errors
		var errs []error
		for _, process := range processes {
			processId := process.BpmnProcessID
			processKey := process.ProcessDefinitionKey
			bpmnResource := resourceMap[process.ResourceName]
			version := process.Version
			log.Printf("Deploying %s", bpmnResource)
			err := storer.ProcessDeployed(
				processId,
				processKey,
				bpmnResource,
				version,
			)
			if err != nil {
				errs = append(errs, err)
			}
			log.Printf("Deployed process %d (%s)",
				processKey, processId)
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
