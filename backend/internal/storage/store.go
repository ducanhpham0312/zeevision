package storage

import (
	"encoding/base64"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// TODO more useful name
type Storer struct {
	db *gorm.DB
}

func NewStorer(db *gorm.DB) *Storer {
	return &Storer{db}
}

// call this for each processesMetadata
func (r *Storer) ProcessDeployed(
	processDefinitionKey int64,
	bpmnProcessID string,
	version int64,
	deploymentTime time.Time,
	bpmnResourceRaw []byte,
) error {
	bpmnResource := BpmnResource{
		BpmnProcessID: bpmnProcessID,
		BpmnFile:      base64.StdEncoding.EncodeToString(bpmnResourceRaw),
	}

	result := r.db.Create(&Process{
		ProcessDefinitionKey: processDefinitionKey,
		BpmnProcessID:        bpmnProcessID,
		Version:              version,
		DeploymentTime:       deploymentTime,
		BpmnResource:         bpmnResource,
	})

	err := result.Error
	if err != nil {
		return fmt.Errorf("failed to create process: %w", err)
	}

	return nil
}
