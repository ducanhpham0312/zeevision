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

	IncidentCreated(
		key int64,
		processInstanceKey int64,
		elementID string,
		errorType string,
		errorMessage string,
		time time.Time,
	) error

	IncidentResolved(
		key int64,
		time time.Time,
	) error

	AuditLogEventOccurred(
		position int64,
		processInstanceKey int64,
		elementID string,
		elementType string,
		intent string,
		time time.Time,
	) error

	JobCreated(
		key int64,
		elementID string,
		processInstanceKey int64,
		jobType string,
		retries int64,
		worker string,
		time time.Time,
	) error

	JobUpdated(
		key int64,
		retries int64,
		worker string,
		state string,
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

// Store a newly created incident in the database.
func (r *databaseStorer) IncidentCreated(
	key int64,
	processInstanceKey int64,
	elementID string,
	errorType string,
	errorMessage string,
	time time.Time,
) error {
	err := r.db.Create(&Incident{
		Key:                key,
		ProcessInstanceKey: processInstanceKey,
		ElementID:          elementID,
		ErrorType:          errorType,
		ErrorMessage:       errorMessage,
		State:              "CREATED",
		Time:               time,
	}).Error
	if err != nil {
		return fmt.Errorf("failed to create incident: %w", err)
	}

	return nil
}

// Handle incident being resolved.
func (r *databaseStorer) IncidentResolved(
	key int64,
	time time.Time,
) error {
	var incident Incident
	err := r.db.
		Where(&Incident{
			Key: key,
		}).
		First(&incident).Error
	if err != nil {
		return fmt.Errorf("failed to find incident: %w", err)
	}

	err = r.db.Model(&incident).
		Select("State", "Time").
		Updates(&Incident{
			State: "RESOLVED",
			Time:  time,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to save incident: %w", err)
	}

	return nil
}

func (r *databaseStorer) AuditLogEventOccurred(
	position int64,
	processInstanceKey int64,
	elementID string,
	elementType string,
	intent string,
	timestamp time.Time,
) error {
	err := r.db.Create(&AuditLog{
		Position:           position,
		ProcessInstanceKey: processInstanceKey,
		ElementID:          elementID,
		ElementType:        elementType,
		Intent:             intent,
		Time:               timestamp,
	}).Error
	if err != nil {
		return fmt.Errorf("failed to add to audit log: %w", err)
	}

	return nil
}

func (r *databaseStorer) JobCreated(
	key int64,
	elementID string,
	processInstanceKey int64,
	jobType string,
	retries int64,
	worker string,
	time time.Time,
) error {
	err := r.db.Create(&Job{
		Key:                key,
		ElementID:          elementID,
		ProcessInstanceKey: processInstanceKey,
		Type:               jobType,
		Retries:            retries,
		Worker:             worker,
		State:              "CREATED",
		Time:               time,
	}).Error
	if err != nil {
		return fmt.Errorf("failed to create job: %w", err)
	}

	return nil
}

func (r *databaseStorer) JobUpdated(
	key int64,
	retries int64,
	worker string,
	state string,
	time time.Time,
) error {
	var job Job
	err := r.db.
		Where(&Job{
			Key: key,
		}).
		First(&job).Error
	if err != nil {
		return fmt.Errorf("failed to find job: %w", err)
	}

	err = r.db.Model(&job).
		Select("Retries", "Worker", "State", "Time").
		Updates(&Job{
			Retries: retries,
			Worker:  worker,
			State:   state,
			Time:    time,
		}).Error
	if err != nil {
		return fmt.Errorf("failed to save job: %w", err)
	}

	return nil
}
