package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.41

import (
	"context"
	"fmt"

	"github.com/ducanhpham0312/zeevision/backend/graph/model"
)

// Instance is the resolver for the instance field.
func (r *incidentResolver) Instance(ctx context.Context, obj *model.Incident) (*model.Instance, error) {
	dbInstance, err := r.Fetcher.GetInstance(ctx, obj.InstanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instance: %w", err)
	}

	return model.FromStorageInstance(dbInstance), nil
}

// AuditLogs is the resolver for the auditLogs field.
func (r *instanceResolver) AuditLogs(ctx context.Context, obj *model.Instance, pagination *model.Pagination) (*model.PaginatedAuditLogs, error) {
	dbAuditLogs, err := r.Fetcher.GetAuditLogsForInstance(ctx, model.ToStoragePagination(pagination), obj.InstanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch audit logs: %w", err)
	}

	return &model.PaginatedAuditLogs{
		Items:      model.Map(dbAuditLogs.Items, model.FromStorageAuditLog),
		TotalCount: dbAuditLogs.TotalCount,
	}, nil
}

// Incidents is the resolver for the incidents field.
func (r *instanceResolver) Incidents(ctx context.Context, obj *model.Instance, pagination *model.Pagination) (*model.PaginatedIncidents, error) {
	dbIncidents, err := r.Fetcher.GetIncidentsForInstance(ctx, model.ToStoragePagination(pagination), obj.InstanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch incidents: %w", err)
	}

	return &model.PaginatedIncidents{
		Items:      model.Map(dbIncidents.Items, model.FromStorageIncident),
		TotalCount: dbIncidents.TotalCount,
	}, nil
}

// Jobs is the resolver for the jobs field.
func (r *instanceResolver) Jobs(ctx context.Context, obj *model.Instance, pagination *model.Pagination) (*model.PaginatedJobs, error) {
	dbJobs, err := r.Fetcher.GetJobsForInstance(ctx, model.ToStoragePagination(pagination), obj.InstanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch jobs: %w", err)
	}

	return &model.PaginatedJobs{
		Items:      model.Map(dbJobs.Items, model.FromStorageJob),
		TotalCount: dbJobs.TotalCount,
	}, nil
}

// Variables is the resolver for the variables field.
func (r *instanceResolver) Variables(ctx context.Context, obj *model.Instance, pagination *model.Pagination, filter *model.VariableFilter) (*model.PaginatedVariables, error) {
	dbVariables, err := r.Fetcher.GetVariablesForInstance(ctx,
		model.ToStoragePagination(pagination),
		model.VariableFilterToStorageFilter(filter),
		obj.InstanceKey,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch variables: %w", err)
	}

	return &model.PaginatedVariables{
		Items:      model.Map(dbVariables.Items, model.FromStorageVariable),
		TotalCount: dbVariables.TotalCount,
	}, nil
}

// Process is the resolver for the process field.
func (r *instanceResolver) Process(ctx context.Context, obj *model.Instance) (*model.Process, error) {
	dbProcess, err := r.Fetcher.GetProcess(ctx, obj.ProcessKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch process: %w", err)
	}

	return model.FromStorageProcess(dbProcess), nil
}

// Instance is the resolver for the instance field.
func (r *jobResolver) Instance(ctx context.Context, obj *model.Job) (*model.Instance, error) {
	dbInstance, err := r.Fetcher.GetInstance(ctx, obj.InstanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instance: %w", err)
	}

	return model.FromStorageInstance(dbInstance), nil
}

// BpmnResource is the resolver for the bpmnResource field.
func (r *processResolver) BpmnResource(ctx context.Context, obj *model.Process) (string, error) {
	dbBpmnResource, err := r.Fetcher.GetBpmnResource(ctx, obj.ProcessKey)
	if err != nil {
		return "", fmt.Errorf("failed to fetch bpmn resource: %w", err)
	}

	return model.FromStorageBpmnResource(dbBpmnResource), nil
}

// Instances is the resolver for the instances field.
func (r *processResolver) Instances(ctx context.Context, obj *model.Process, pagination *model.Pagination) (*model.PaginatedInstances, error) {
	dbInstances, err := r.Fetcher.GetInstancesForProcess(ctx, model.ToStoragePagination(pagination), obj.ProcessKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instances: %w", err)
	}

	return &model.PaginatedInstances{
		Items:      model.Map(dbInstances.Items, model.FromStorageInstance),
		TotalCount: dbInstances.TotalCount,
	}, nil
}

// Processes is the resolver for the processes field.
func (r *queryResolver) Processes(ctx context.Context, pagination *model.Pagination) (*model.PaginatedProcesses, error) {
	dbProcesses, err := r.Fetcher.GetProcesses(ctx, model.ToStoragePagination(pagination))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch processes: %w", err)
	}

	return &model.PaginatedProcesses{
		Items:      model.Map(dbProcesses.Items, model.FromStorageProcess),
		TotalCount: dbProcesses.TotalCount,
	}, nil
}

// Process is the resolver for the process field.
func (r *queryResolver) Process(ctx context.Context, processKey int64) (*model.Process, error) {
	dbProcess, err := r.Fetcher.GetProcess(ctx, processKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch process: %w", err)
	}

	return model.FromStorageProcess(dbProcess), nil
}

// Instances is the resolver for the instances field.
func (r *queryResolver) Instances(ctx context.Context, pagination *model.Pagination) (*model.PaginatedInstances, error) {
	dbInstances, err := r.Fetcher.GetInstances(ctx, model.ToStoragePagination(pagination))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instances: %w", err)
	}

	return &model.PaginatedInstances{
		Items:      model.Map(dbInstances.Items, model.FromStorageInstance),
		TotalCount: dbInstances.TotalCount,
	}, nil
}

// Instance is the resolver for the instance field.
func (r *queryResolver) Instance(ctx context.Context, instanceKey int64) (*model.Instance, error) {
	dbInstance, err := r.Fetcher.GetInstance(ctx, instanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instance: %w", err)
	}

	return model.FromStorageInstance(dbInstance), nil
}

// Incidents is the resolver for the incidents field.
func (r *queryResolver) Incidents(ctx context.Context, pagination *model.Pagination) (*model.PaginatedIncidents, error) {
	dbIncidents, err := r.Fetcher.GetIncidents(ctx, model.ToStoragePagination(pagination))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch incidents: %w", err)
	}

	return &model.PaginatedIncidents{
		Items:      model.Map(dbIncidents.Items, model.FromStorageIncident),
		TotalCount: dbIncidents.TotalCount,
	}, nil
}

// Jobs is the resolver for the jobs field.
func (r *queryResolver) Jobs(ctx context.Context, pagination *model.Pagination) (*model.PaginatedJobs, error) {
	dbJobs, err := r.Fetcher.GetJobs(ctx, model.ToStoragePagination(pagination))
	if err != nil {
		return nil, fmt.Errorf("failed to fetch jobs: %w", err)
	}

	return &model.PaginatedJobs{
		Items:      model.Map(dbJobs.Items, model.FromStorageJob),
		TotalCount: dbJobs.TotalCount,
	}, nil
}

// Incident returns IncidentResolver implementation.
func (r *Resolver) Incident() IncidentResolver { return &incidentResolver{r} }

// Instance returns InstanceResolver implementation.
func (r *Resolver) Instance() InstanceResolver { return &instanceResolver{r} }

// Job returns JobResolver implementation.
func (r *Resolver) Job() JobResolver { return &jobResolver{r} }

// Process returns ProcessResolver implementation.
func (r *Resolver) Process() ProcessResolver { return &processResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type incidentResolver struct{ *Resolver }
type instanceResolver struct{ *Resolver }
type jobResolver struct{ *Resolver }
type processResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
