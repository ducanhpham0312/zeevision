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

// Pagination is used to limit the number of results returned by a query for
// performance reasons in tabular views.
type Pagination struct {
	Offset int
	Limit  int
}

// Paginated is a generic type for paginated results.
type Paginated[T any] struct {
	TotalCount int64
	Items      []T
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

// Returns a new fetcher with pagination scope applied to the database object.
// Pagination is ignored if nil.
func (f *Fetcher) Paginated(pagination *Pagination) *Fetcher {
	return f.Scope(func(db *gorm.DB) *gorm.DB {
		if pagination != nil {
			return db.Limit(pagination.Limit).Offset(pagination.Offset)
		}
		return db
	})
}

// Returns a new fetcher with a scope applied to the database object.
func (f *Fetcher) Scope(fn func(db *gorm.DB) *gorm.DB) *Fetcher {
	return &Fetcher{db: fn(f.db)}
}

// Returns the total number of rows in a table. Fetcher can be scoped to
// limit the query to a subset of rows.
func (f *Fetcher) tableTotalCount(ctx context.Context, table string) (int64, error) {
	var count int64
	err := f.ContextDB(ctx).
		Table(table).
		Count(&count).
		Error

	return count, err
}

// Gets a BPMN resource by its process ID.
func (f *Fetcher) GetBpmnResource(ctx context.Context, processDefKey int64) (BpmnResource, error) {
	var bpmnResource BpmnResource
	err := f.ContextDB(ctx).
		Where(&BpmnResource{ProcessDefinitionKey: processDefKey}).
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
func (f *Fetcher) GetInstances(ctx context.Context, pagination *Pagination) (Paginated[Instance], error) {
	var instances Paginated[Instance]

	totalCount, err := f.tableTotalCount(ctx, "instances")
	if err != nil || totalCount == 0 {
		return Paginated[Instance]{}, err
	}
	instances.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("start_time DESC").
		Find(&instances.Items).
		Error

	return instances, err
}

// Gets all instances for a process based on its definition key.
func (f *Fetcher) GetInstancesForProcess(ctx context.Context, pagination *Pagination, processDefKey int64) (Paginated[Instance], error) {
	f = f.Scope(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Instance{ProcessDefinitionKey: processDefKey})
	})

	var instances Paginated[Instance]

	totalCount, err := f.tableTotalCount(ctx, "instances")
	if err != nil || totalCount == 0 {
		return Paginated[Instance]{}, err
	}
	instances.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("start_time DESC").
		Find(&instances.Items).
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
func (f *Fetcher) GetProcesses(ctx context.Context, pagination *Pagination) (Paginated[Process], error) {
	var processes Paginated[Process]

	totalCount, err := f.tableTotalCount(ctx, "processes")
	if err != nil || totalCount == 0 {
		return Paginated[Process]{}, err
	}
	processes.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("deployment_time DESC").
		Find(&processes.Items).
		Error

	return processes, err
}

// Gets all jobs
func (f *Fetcher) GetJobs(ctx context.Context, pagination *Pagination) (Paginated[Job], error) {
	var jobs Paginated[Job]

	totalCount, err := f.tableTotalCount(ctx, "jobs")
	if err != nil || totalCount == 0 {
		return Paginated[Job]{}, err
	}
	jobs.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("time DESC").
		Find(&jobs.Items).
		Error

	return jobs, err
}

// Gets all jobs for an instance.
func (f *Fetcher) GetJobsForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) (Paginated[Job], error) {
	f = f.Scope(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Job{ProcessInstanceKey: instanceKey})
	})

	var jobs Paginated[Job]

	totalCount, err := f.tableTotalCount(ctx, "jobs")
	if err != nil || totalCount == 0 {
		return Paginated[Job]{}, err
	}
	jobs.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("time DESC").
		Find(&jobs.Items).
		Error

	return jobs, err
}

// Gets all incidents.
func (f *Fetcher) GetIncidents(ctx context.Context, pagination *Pagination) (Paginated[Incident], error) {
	var incidents Paginated[Incident]

	totalCount, err := f.tableTotalCount(ctx, "incidents")
	if err != nil || totalCount == 0 {
		return Paginated[Incident]{}, err
	}
	incidents.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("time DESC").
		Find(&incidents.Items).
		Error

	return incidents, err
}

// Gets all incidents for an instance.
func (f *Fetcher) GetIncidentsForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) (Paginated[Incident], error) {
	f = f.Scope(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Incident{ProcessInstanceKey: instanceKey})
	})

	var incidents Paginated[Incident]

	totalCount, err := f.tableTotalCount(ctx, "incidents")
	if err != nil || totalCount == 0 {
		return Paginated[Incident]{}, err
	}
	incidents.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("time DESC").
		Find(&incidents.Items).
		Error

	return incidents, err
}

// Gets all variables for an instance.
func (f *Fetcher) GetVariablesForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) (Paginated[Variable], error) {
	f = f.Scope(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Variable{ProcessInstanceKey: instanceKey})
	})

	var variables Paginated[Variable]

	totalCount, err := f.tableTotalCount(ctx, "variables")
	if err != nil || totalCount == 0 {
		return Paginated[Variable]{}, err
	}
	variables.TotalCount = totalCount

	err = f.Paginated(pagination).
		ContextDB(ctx).
		Order("time DESC").
		Find(&variables.Items).
		Error

	return variables, err
}
