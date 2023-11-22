package model

import (
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

func FromStorageBpmnResource(resource storage.BpmnResource) string {
	return resource.BpmnFile
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
		BpmnProcessID:  instance.BpmnProcessID,
		StartTime:      instance.StartTime.UTC().Format(time.RFC3339),
		InstanceKey:    instance.ProcessInstanceKey,
		Version:        1, // TODO
		Status:         status,
		// BpmnResource has its own resolver and is not populated here.
	}
}

// Convert storage process to GraphQL process.
func FromStorageProcess(process storage.Process) *Process {
	return &Process{
		ActiveInstances:    0,  // TODO
		CompletedInstances: 0,  // TODO
		BpmnLiveStatus:     "", // TODO
		BpmnProcessID:      process.BpmnProcessID,
		DeploymentTime:     process.DeploymentTime.UTC().Format(time.RFC3339),
		ProcessKey:         process.ProcessDefinitionKey,
		Version:            process.Version,
		// Instances, MessageSubscriptions, Timers, BpmnResource have their
		// own resolvers and are not populated here.
	}
}
