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

// Creates new fetcher.
//
// Database object is assumed to be already initialized.
func NewFetcher(db *gorm.DB) *Fetcher {
	return &Fetcher{db: db}
}

// Returns a database object with context used for single queries.
func (f *Fetcher) ContextDB(ctx context.Context) *gorm.DB {
	return f.db.WithContext(ctx)
}

// Gets a BPMN resource by its process ID.
func (f *Fetcher) GetBpmnResource(ctx context.Context, bpmnProcessID string) (BpmnResource, error) {
	var bpmnResource BpmnResource
	err := f.ContextDB(ctx).
		Where(&BpmnResource{BpmnProcessID: bpmnProcessID}).
		First(&bpmnResource).
		Error

	return bpmnResource, err
}

// Gets an instance by its key.
func (f *Fetcher) GetInstance(ctx context.Context, instanceKey int64) (Instance, error) {
	var instance Instance
	err := f.ContextDB(ctx).
		Where(&Instance{ProcessInstanceKey: instanceKey}).
		First(&instance).
		Error

	return instance, err
}

// Gets all instances for all processes.
func (f *Fetcher) GetInstances(ctx context.Context) ([]Instance, error) {
	var instances []Instance
	err := f.ContextDB(ctx).
		Order("start_time DESC").
		Find(&instances).
		Error

	return instances, err
}

// Gets all instances for a process based on its definition key.
func (f *Fetcher) GetInstancesForProcess(ctx context.Context, processDefKey int64) ([]Instance, error) {
	var instances []Instance
	err := f.ContextDB(ctx).
		Where(&Instance{ProcessDefinitionKey: processDefKey}).
		Order("start_time DESC").
		Find(&instances).
		Error

	return instances, err
}

// Gets a process by its key.
func (f *Fetcher) GetProcess(ctx context.Context, processDefKey int64) (Process, error) {
	var process Process
	err := f.ContextDB(ctx).
		Where(&Process{ProcessDefinitionKey: processDefKey}).
		First(&process).
		Error

	return process, err
}

// Gets all processes.
func (f *Fetcher) GetProcesses(ctx context.Context) ([]Process, error) {
	var processes []Process
	err := f.ContextDB(ctx).
		Order("deployment_time DESC").
		Find(&processes).
		Error

	return processes, err
}

// Gets all jobs
func (f *Fetcher) GetJobs(ctx context.Context) ([]Job, error) {
	var jobs []Job
	err := f.ContextDB(ctx).
		Order("time DESC").
		Find(&jobs).
		Error

	return jobs, err
}

// Gets all jobs for an instance.
func (f *Fetcher) GetJobsForInstance(ctx context.Context, instanceKey int64) ([]Job, error) {
	var jobs []Job
	err := f.ContextDB(ctx).
		Where(&Job{ProcessInstanceKey: instanceKey}).
		Order("time DESC").
		Find(&jobs).
		Error

	return jobs, err
}

// Gets all variables for an instance.
func (f *Fetcher) GetVariablesForInstance(ctx context.Context, instanceKey int64) ([]Variable, error) {
	var variables []Variable
	err := f.ContextDB(ctx).
		Where(&Variable{ProcessInstanceKey: instanceKey}).
		Order("time DESC").
		Find(&variables).
		Error

	return variables, err
}
