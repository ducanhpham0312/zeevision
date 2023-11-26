package storage

import (
	"encoding/base64"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// TODO: use context for queries where reasonable

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

	err := r.db.Create(&Process{
		ProcessDefinitionKey: processDefinitionKey,
		BpmnProcessID:        bpmnProcessID,
		Version:              version,
		DeploymentTime:       deploymentTime,
		BpmnResource:         bpmnResource,
	}).Error
	if err != nil {
		return fmt.Errorf("failed to create process: %w", err)
	}

	return nil
}

func (r *Storer) ProcessInstanceActivated(
	processInstanceKey int64,
	processDefinitionKey int64,
	version int64,
	startTime time.Time,
) error {
	// TODO set EndTime to NULL perhaps?
	err := r.db.Create(&Instance{
		ProcessInstanceKey:   processInstanceKey,
		ProcessDefinitionKey: processDefinitionKey,
		Version:              version,
		Status:               "ACTIVE",
		StartTime:            startTime,
	}).Error
	if err != nil {
		return fmt.Errorf("failed to create process instance: %w", err)
	}

	return nil
}

func (r *Storer) ProcessInstanceCompleted(
	processInstanceKey int64,
	endTime time.Time,
) error {
	var instance Instance
	err := r.db.
		Where(&Instance{ProcessInstanceKey: processInstanceKey}).
		First(&instance).Error
	if err != nil {
		return fmt.Errorf("failed to find process instance: %w", err)
	}

	err = r.db.Model(&instance).
		Select("Status", "EndTime").
		Updates(Instance{
			Status:  "COMPLETED",
			EndTime: endTime,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to update instance: %w", err)
	}

	return nil
}

func (r *Storer) VariableCreated(
	processInstanceKey int64,
	name string,
	value string,
	time time.Time,
) error {
	err := r.db.Create(&Variable{
		ProcessInstanceKey: processInstanceKey,
		Name: name,
		Value: value,
		Time: time,
	}).Error
	if err != nil {
		return fmt.Errorf("failed to create variable: %w", err)
	}

	return nil
}

func (r *Storer) VariableUpdated(
	processInstanceKey int64,
	name string,
	value string,
	time time.Time,
) error {
	var variable Variable
	err := r.db.
		Where(&Variable{
			ProcessInstanceKey: processInstanceKey,
			Name: name,
		}).
		First(&variable).Error
	if err != nil {
		return fmt.Errorf("failed to find process instance: %w", err)
	}

	err = r.db.Model(&variable).
		Select("Value", "Time").
		Updates(&Variable{
			Value: value,
			Time: time,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to save variable: %w", err)
	}

	return nil
}
