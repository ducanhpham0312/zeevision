package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.40

import (
	"context"
	"fmt"

	"github.com/ducanhpham0312/zeevision/backend/graph/model"
)

// Jobs is the resolver for the jobs field.
func (r *instanceResolver) Jobs(ctx context.Context, obj *model.Instance) ([]*model.Job, error) {
	dbJobs, err := r.Fetcher.GetJobsForInstance(ctx, obj.InstanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch jobs: %w", err)
	}

	return model.Map(dbJobs, model.FromStorageJob), nil
}

// Variables is the resolver for the variables field.
func (r *instanceResolver) Variables(ctx context.Context, obj *model.Instance) ([]*model.Variable, error) {
	dbVariables, err := r.Fetcher.GetVariablesForInstance(ctx, obj.InstanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch variables: %w", err)
	}

	return model.Map(dbVariables, model.FromStorageVariable), nil
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
	dbBpmnResource, err := r.Fetcher.GetBpmnResource(ctx, obj.BpmnProcessID)
	if err != nil {
		return "", fmt.Errorf("failed to fetch bpmn resource: %w", err)
	}

	return model.FromStorageBpmnResource(dbBpmnResource), nil
}

// Instances is the resolver for the instances field.
func (r *processResolver) Instances(ctx context.Context, obj *model.Process) ([]*model.Instance, error) {
	dbInstances, err := r.Fetcher.GetInstancesForProcess(ctx, obj.ProcessKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instances: %w", err)
	}

	return model.Map(dbInstances, model.FromStorageInstance), nil
}

// MessageSubscriptions is the resolver for the messageSubscriptions field.
func (r *processResolver) MessageSubscriptions(ctx context.Context, obj *model.Process) ([]*model.MessageSubscription, error) {
	return []*model.MessageSubscription{}, nil
}

// Timers is the resolver for the timers field.
func (r *processResolver) Timers(ctx context.Context, obj *model.Process) ([]*model.Timer, error) {
	return []*model.Timer{}, nil
}

// Processes is the resolver for the processes field.
func (r *queryResolver) Processes(ctx context.Context) ([]*model.Process, error) {
	dbProcesses, err := r.Fetcher.GetProcesses(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch processes: %w", err)
	}

	return model.Map(dbProcesses, model.FromStorageProcess), nil
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
func (r *queryResolver) Instances(ctx context.Context) ([]*model.Instance, error) {
	dbInstances, err := r.Fetcher.GetInstances(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instances: %w", err)
	}

	return model.Map(dbInstances, model.FromStorageInstance), nil
}

// Instance is the resolver for the instance field.
func (r *queryResolver) Instance(ctx context.Context, instanceKey int64) (*model.Instance, error) {
	dbInstance, err := r.Fetcher.GetInstance(ctx, instanceKey)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instance: %w", err)
	}

	return model.FromStorageInstance(dbInstance), nil
}

// Jobs is the resolver for the jobs field.
func (r *queryResolver) Jobs(ctx context.Context) ([]*model.Job, error) {
	dbJobs, err := r.Fetcher.GetJobs(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch instances: %w", err)
	}

	return model.Map(dbJobs, model.FromStorageJob), nil
}

// Instance returns InstanceResolver implementation.
func (r *Resolver) Instance() InstanceResolver { return &instanceResolver{r} }

// Job returns JobResolver implementation.
func (r *Resolver) Job() JobResolver { return &jobResolver{r} }

// Process returns ProcessResolver implementation.
func (r *Resolver) Process() ProcessResolver { return &processResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type instanceResolver struct{ *Resolver }
type jobResolver struct{ *Resolver }
type processResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
