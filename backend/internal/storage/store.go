package storage

import (
	"database/sql"
	"encoding/base64"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Storer interface {
	ProcessDeployed(
		processDefinitionKey int64,
		bpmnProcessID string,
		version int64,
		deploymentTime time.Time,
		bpmnResourceRaw []byte,
	) error

	ProcessInstanceActivated(
		processInstanceKey int64,
		processDefinitionKey int64,
		version int64,
		startTime time.Time,
	) error

	ProcessInstanceCompleted(
		processInstanceKey int64,
		endTime time.Time,
	) error

	ProcessInstanceTerminated(
		processInstanceKey int64,
		endTime time.Time,
	) error

	VariableCreated(
		processInstanceKey int64,
		name string,
		value string,
		time time.Time,
	) error

	VariableUpdated(
		processInstanceKey int64,
		name string,
		value string,
		time time.Time,
	) error
}

// TODO: use context for queries where reasonable

type databaseStorer struct {
	db *gorm.DB
}

func NewStorer(db *gorm.DB) Storer {
	return &databaseStorer{db}
}

// call this for each processesMetadata
func (r *databaseStorer) ProcessDeployed(
	processDefinitionKey int64,
	bpmnProcessID string,
	version int64,
	deploymentTime time.Time,
	bpmnResourceRaw []byte,
) error {
	bpmnResource := BpmnResource{
		ProcessDefinitionKey: processDefinitionKey,
		BpmnFile:             base64.StdEncoding.EncodeToString(bpmnResourceRaw),
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

func (r *databaseStorer) ProcessInstanceActivated(
	processInstanceKey int64,
	processDefinitionKey int64,
	version int64,
	startTime time.Time,
) error {
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

func (r *databaseStorer) ProcessInstanceCompleted(
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
			Status: "COMPLETED",
			EndTime: sql.NullTime{
				Time:  endTime,
				Valid: true,
			},
		}).Error
	if err != nil {
		return fmt.Errorf("failed to update instance: %w", err)
	}

	return nil
}

func (r *databaseStorer) ProcessInstanceTerminated(
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
			Status: "TERMINATED",
			EndTime: sql.NullTime{
				Time:  endTime,
				Valid: true,
			},
		}).Error
	if err != nil {
		return fmt.Errorf("failed to update instance: %w", err)
	}

	return nil
}

func (r *databaseStorer) VariableCreated(
	processInstanceKey int64,
	name string,
	value string,
	time time.Time,
) error {
	err := r.db.Create(&Variable{
		ProcessInstanceKey: processInstanceKey,
		Name:               name,
		Value:              value,
		Time:               time,
	}).Error
	if err != nil {
		return fmt.Errorf("failed to create variable: %w", err)
	}

	return nil
}

func (r *databaseStorer) VariableUpdated(
	processInstanceKey int64,
	name string,
	value string,
	time time.Time,
) error {
	var variable Variable
	err := r.db.
		Where(&Variable{
			ProcessInstanceKey: processInstanceKey,
			Name:               name,
		}).
		First(&variable).Error
	if err != nil {
		return fmt.Errorf("failed to find variable: %w", err)
	}

	err = r.db.Model(&variable).
		Select("Value", "Time").
		Updates(&Variable{
			Value: value,
			Time:  time,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to save variable: %w", err)
	}

	return nil
}
