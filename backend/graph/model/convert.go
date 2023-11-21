package model

import (
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

func FromStorageInstance(instance storage.Instance) *Instance {
	return &Instance{
		BpmnLiveStatus: "", // TODO
		BpmnResource:   "", // TODO
		StartTime:      instance.StartTime.UTC().Format(time.RFC3339),
		BpmnProcessID:  instance.BpmnProcessID,
		InstanceKey:    instance.ProcessInstanceKey,
		Version:        1, // TODO
		Status:         instance.Status,
	}
}

func FromStorageProcess(process storage.Process) *Process {
	return &Process{
		ActiveInstances:    0,  // TODO
		CompletedInstances: 0,  // TODO
		BpmnLiveStatus:     "", // TODO
		BpmnResource:       process.BpmnResource,
		DeploymentTime:     time.Now().UTC().Format(time.RFC3339), // TODO
		BpmnProcessID:      process.BpmnProcessID,
		ProcessKey:         process.ProcessDefinitionKey,
		Version:            process.Version,
		// Instances, MessageSubscriptions, and Timers have their
		// own resolvers and are not populated here.
	}
}
