package storage

import (
	"context"

	"gorm.io/gorm"
)

// Fetcher is used by the API to fetch data from the database.
type Fetcher struct {
	// Database object used for fetching data.
	db *gorm.DB
}

type Pagination struct {
	Offset int
	Limit  int
}

// Creates new fetcher.
//
// Database object is assumed to be already initialized.
func NewFetcher(db *gorm.DB) *Fetcher {
	return &Fetcher{db: db}
}

// Returns a database object with context used for single queries. The returned
// object allows setting pagination options or leaving it nil for no pagination.
func (f *Fetcher) ContextDB(ctx context.Context, pagination *Pagination) *gorm.DB {
	db := f.db.WithContext(ctx)
	if pagination != nil {
		db = db.Limit(pagination.Limit).Offset(pagination.Offset)
	}
	return db
}

// Gets a BPMN resource by its process ID.
func (f *Fetcher) GetBpmnResource(ctx context.Context, processDefKey int64) (BpmnResource, error) {
	var bpmnResource BpmnResource
	err := f.ContextDB(ctx, nil).
		Where(&BpmnResource{ProcessDefinitionKey: processDefKey}).
		First(&bpmnResource).
		Error

	return bpmnResource, err
}

// Gets an instance by its key.
func (f *Fetcher) GetInstance(ctx context.Context, instanceKey int64) (Instance, error) {
	var instance Instance
	err := f.ContextDB(ctx, nil).
		Where(&Instance{ProcessInstanceKey: instanceKey}).
		First(&instance).
		Error

	return instance, err
}

// Gets all instances for all processes.
func (f *Fetcher) GetInstances(ctx context.Context, pagination *Pagination) ([]Instance, error) {
	var instances []Instance
	err := f.ContextDB(ctx, pagination).
		Order("start_time DESC").
		Find(&instances).
		Error

	return instances, err
}

// Gets all instances for a process based on its definition key.
func (f *Fetcher) GetInstancesForProcess(ctx context.Context, pagination *Pagination, processDefKey int64) ([]Instance, error) {
	var instances []Instance
	err := f.ContextDB(ctx, pagination).
		Where(&Instance{ProcessDefinitionKey: processDefKey}).
		Order("start_time DESC").
		Find(&instances).
		Error

	return instances, err
}

// Gets a process by its key.
func (f *Fetcher) GetProcess(ctx context.Context, processDefKey int64) (Process, error) {
	var process Process
	err := f.ContextDB(ctx, nil).
		Where(&Process{ProcessDefinitionKey: processDefKey}).
		First(&process).
		Error

	return process, err
}

// Gets all processes.
func (f *Fetcher) GetProcesses(ctx context.Context, pagination *Pagination) ([]Process, error) {
	var processes []Process
	err := f.ContextDB(ctx, pagination).
		Order("deployment_time DESC").
		Find(&processes).
		Error

	return processes, err
}

// Gets all jobs
func (f *Fetcher) GetJobs(ctx context.Context, pagination *Pagination) ([]Job, error) {
	var jobs []Job
	err := f.ContextDB(ctx, pagination).
		Order("time DESC").
		Find(&jobs).
		Error

	return jobs, err
}

// Gets all jobs for an instance.
func (f *Fetcher) GetJobsForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) ([]Job, error) {
	var jobs []Job
	err := f.ContextDB(ctx, pagination).
		Where(&Job{ProcessInstanceKey: instanceKey}).
		Order("time DESC").
		Find(&jobs).
		Error

	return jobs, err
}

// Gets all incidents.
func (f *Fetcher) GetIncidents(ctx context.Context, pagination *Pagination) ([]Incident, error) {
	var incidents []Incident
	err := f.ContextDB(ctx, pagination).
		Order("time DESC").
		Find(&incidents).
		Error

	return incidents, err
}

// Gets all incidents for an instance.
func (f *Fetcher) GetIncidentsForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) ([]Incident, error) {
	var incidents []Incident
	err := f.ContextDB(ctx, pagination).
		Where(&Incident{ProcessInstanceKey: instanceKey}).
		Order("time DESC").
		Find(&incidents).
		Error

	return incidents, err
}

// Gets all variables for an instance.
func (f *Fetcher) GetVariablesForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) ([]Variable, error) {
	var variables []Variable
	err := f.ContextDB(ctx, pagination).
		Where(&Variable{ProcessInstanceKey: instanceKey}).
		Order("time DESC").
		Find(&variables).
		Error

	return variables, err
}
