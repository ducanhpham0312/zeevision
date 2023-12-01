package model

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
)

// Convert slice of values T to slice of values U by applying function f.
//
// TODO: replace with stdlib equivalent once, if ever, available.
func Map[T, U any](slice []T, f func(T) U) []U {
	result := make([]U, 0, len(slice))
	for _, item := range slice {
		result = append(result, f(item))
	}

	return result
}

// Convert storage bpmn resource to GraphQL bpmn resource containing the
// base64 encoded BPMN XML file.
func FromStorageBpmnResource(bpmnResource storage.BpmnResource) string {
	return bpmnResource.BpmnFile
}

// Convert storage instance to GraphQL instance.
func FromStorageInstance(instance storage.Instance) *Instance {
	var status Status
	if err := status.UnmarshalGQL(instance.Status); err != nil {
		// Panic will be caught by the GraphQL server as internal server error.
		panic(fmt.Errorf("unmarshal storage instance: %w", err))
	}

	return &Instance{
		BpmnLiveStatus: "", // TODO
		StartTime:      formatTime(instance.StartTime),
		EndTime:        formatNullTime(instance.EndTime),
		InstanceKey:    instance.ProcessInstanceKey,
		ProcessKey:     instance.ProcessDefinitionKey,
		Version:        instance.Version,
		Status:         status,
		// Variables and Process have their own resolvers and are not populated
		// here.
	}
}

// Convert storage process to GraphQL process.
func FromStorageProcess(process storage.Process) *Process {
	return &Process{
		ActiveInstances:    0,  // TODO
		CompletedInstances: 0,  // TODO
		BpmnLiveStatus:     "", // TODO
		BpmnProcessID:      process.BpmnProcessID,
		DeploymentTime:     formatTime(process.DeploymentTime),
		ProcessKey:         process.ProcessDefinitionKey,
		Version:            process.Version,
		// Instances, MessageSubscriptions, Timers, BpmnResource have their
		// own resolvers and are not populated here.
	}
}

// Convert storage job to GraphQL job.
func FromStorageJob(job storage.Job) *Job {
	return &Job{
		ElementID: job.ElementID,
		InstanceKey: job.ProcessInstanceKey,
		Key:       job.Key,
		Type:      job.Type,
		Retries:   job.Retries,
		Worker:    job.Worker,
		State:     job.State,
		Time:      formatTime(job.Time),
	}
}

// Convert storage variable to GraphQL variable.
func FromStorageVariable(variable storage.Variable) *Variable {
	return &Variable{
		Name:  variable.Name,
		Value: variable.Value,
		Time:  formatTime(variable.Time),
	}
}

// Convert time to RFC3339 format.
func formatTime(t time.Time) string {
	return t.UTC().Format(time.RFC3339)
}

// Convert nullable time to RFC3339 format. Null times are converted to nil.
func formatNullTime(nt sql.NullTime) *string {
	if !nt.Valid {
		return nil
	}

	t := formatTime(nt.Time)
	return &t
}
