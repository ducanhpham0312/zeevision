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
func (f *Fetcher) contextDB(ctx context.Context) *gorm.DB {
	return f.db.WithContext(ctx)
}

// Returns a new fetcher with pagination scope applied to the database object.
// Pagination is ignored if nil.
func (f *Fetcher) paginated(pagination *Pagination) *Fetcher {
	return f.scopes(func(db *gorm.DB) *gorm.DB {
		if pagination != nil {
			return db.Limit(pagination.Limit).Offset(pagination.Offset)
		}
		return db
	})
}

// Returns a new fetcher with scopes applied to the database object.
func (f *Fetcher) scopes(fn ...func(db *gorm.DB) *gorm.DB) *Fetcher {
	return &Fetcher{db: f.db.Scopes(fn...)}
}

// Returns the total number of rows in a table. Fetcher can be scoped to
// limit the query to a subset of rows.
func (f *Fetcher) tableTotalCount(ctx context.Context, table string) (int64, error) {
	var count int64
	err := f.contextDB(ctx).
		Table(table).
		Count(&count).
		Error

	return count, err
}

// Gets a BPMN resource by its process ID.
func (f *Fetcher) GetBpmnResource(ctx context.Context, processDefKey int64) (BpmnResource, error) {
	var bpmnResource BpmnResource
	err := f.contextDB(ctx).
		Where(&BpmnResource{ProcessDefinitionKey: processDefKey}).
		First(&bpmnResource).
		Error

	return bpmnResource, err
}

// Gets an instance by its key.
func (f *Fetcher) GetInstance(ctx context.Context, instanceKey int64) (Instance, error) {
	var instance Instance
	err := f.contextDB(ctx).
		Where(&Instance{ProcessInstanceKey: instanceKey}).
		First(&instance).
		Error

	return instance, err
}

// Gets all instances for all processes.
func (f *Fetcher) GetInstances(ctx context.Context, pagination *Pagination) (Paginated[Instance], error) {
	return paginatedFetch[Instance](ctx, f, pagination, func(db *gorm.DB, instances *[]Instance) *gorm.DB {
		return db.Order("start_time DESC").Find(instances)
	})
}

// Gets all instances for a process based on its definition key.
func (f *Fetcher) GetInstancesForProcess(ctx context.Context, pagination *Pagination, processDefKey int64) (Paginated[Instance], error) {
	return f.scopes(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Instance{ProcessDefinitionKey: processDefKey})
	}).GetInstances(ctx, pagination)
}

// Gets a process by its key.
func (f *Fetcher) GetProcess(ctx context.Context, processDefKey int64) (Process, error) {
	var process Process
	err := f.contextDB(ctx).
		Where(&Process{ProcessDefinitionKey: processDefKey}).
		First(&process).
		Error

	return process, err
}

// Gets all processes.
func (f *Fetcher) GetProcesses(ctx context.Context, pagination *Pagination) (Paginated[Process], error) {
	return paginatedFetch[Process](ctx, f, pagination, func(db *gorm.DB, processes *[]Process) *gorm.DB {
		return db.Order("deployment_time DESC").Find(processes)
	})
}

// Gets all jobs.
func (f *Fetcher) GetJobs(ctx context.Context, pagination *Pagination) (Paginated[Job], error) {
	return paginatedFetch[Job](ctx, f, pagination, func(db *gorm.DB, jobs *[]Job) *gorm.DB {
		return db.Order("time DESC").Find(jobs)
	})
}

// Gets all jobs for an instance.
func (f *Fetcher) GetJobsForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) (Paginated[Job], error) {
	return f.scopes(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Job{ProcessInstanceKey: instanceKey})
	}).GetJobs(ctx, pagination)
}

// Gets all incidents.
func (f *Fetcher) GetIncidents(ctx context.Context, pagination *Pagination) (Paginated[Incident], error) {
	return paginatedFetch[Incident](ctx, f, pagination, func(db *gorm.DB, incidents *[]Incident) *gorm.DB {
		return db.Order("time DESC").Find(incidents)
	})
}

// Gets all incidents for an instance.
func (f *Fetcher) GetIncidentsForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) (Paginated[Incident], error) {
	return f.scopes(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Incident{ProcessInstanceKey: instanceKey})
	}).GetIncidents(ctx, pagination)
}

// Gets all variables for an instance.
func (f *Fetcher) GetVariablesForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) (Paginated[Variable], error) {
	return paginatedFetch[Variable](ctx, f.scopes(func(db *gorm.DB) *gorm.DB {
		return db.Where(&Variable{ProcessInstanceKey: instanceKey})
	}), pagination, func(db *gorm.DB, variables *[]Variable) *gorm.DB {
		return db.Order("time DESC").Find(variables)
	})
}

// Gets all audit logs for an instance.
func (f *Fetcher) GetAuditLogsForInstance(ctx context.Context, pagination *Pagination, instanceKey int64) (Paginated[AuditLog], error) {
	return paginatedFetch[AuditLog](ctx, f.scopes(func(db *gorm.DB) *gorm.DB {
		return db.Where(&AuditLog{ProcessInstanceKey: instanceKey})
	}), pagination, func(db *gorm.DB, auditLogs *[]AuditLog) *gorm.DB {
		return db.Order("time DESC").Find(auditLogs)
	})
}

// Fetches paginated results from the database.
//
// `fetcher` should be a Fetcher with the filtering scope already applied to
// limit the number of results. `nonFilteringFetch` should be a function that
// does the actual result fetching, but it is not allowed to apply any
// filtering scopes so that the total count still reflects the total number
// of results.
func paginatedFetch[T Tabler](
	ctx context.Context,
	fetcher *Fetcher,
	pagination *Pagination,
	nonFilteringFetch func(*gorm.DB, *[]T) *gorm.DB,
) (Paginated[T], error) {
	var paginated Paginated[T]

	var dummy T
	totalCount, err := fetcher.tableTotalCount(ctx, dummy.TableName())
	if err != nil || totalCount == 0 {
		return paginated, err
	}
	paginated.TotalCount = totalCount

	err = nonFilteringFetch(fetcher.paginated(pagination).contextDB(ctx), &paginated.Items).Error

	return paginated, err
}
