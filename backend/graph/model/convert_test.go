package model

import (
	"testing"
	"time"

	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
	"github.com/stretchr/testify/assert"
)

func TestMap(t *testing.T) {
	slice := []string{"a", "bb", "ccc"}
	expected := []int{1, 2, 3}

	actual := Map(slice, func(s string) int {
		return len(s)
	})

	assert.Equal(t, expected, actual)
}

func TestFromStorageInstance(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name            string
		storageInstance storage.Instance
		expected        *Instance
	}{
		{
			name: "Active instance",
			storageInstance: storage.Instance{
				ProcessInstanceKey:   10,
				ProcessDefinitionKey: 1,
				Status:               "ACTIVE",
				StartTime:            now,
				BpmnProcessID:        "main-loop",
			},
			expected: &Instance{
				BpmnLiveStatus: "", // TODO
				StartTime:      now.UTC().Format(time.RFC3339),
				BpmnProcessID:  "main-loop",
				BpmnResource:   "",
				InstanceKey:    10,
				Version:        1, // TODO
				Status:         StatusActive,
			},
		},
		{
			name: "Completed instance",
			storageInstance: storage.Instance{
				ProcessInstanceKey:   20,
				ProcessDefinitionKey: 2,
				Status:               "COMPLETED",
				StartTime:            now,
				BpmnProcessID:        "main-loop",
			},
			expected: &Instance{
				BpmnLiveStatus: "", // TODO
				StartTime:      now.UTC().Format(time.RFC3339),
				BpmnProcessID:  "main-loop",
				BpmnResource:   "",
				InstanceKey:    20,
				Version:        1, // TODO
				Status:         StatusCompleted,
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual := FromStorageInstance(test.storageInstance)

			assert.Equal(t, test.expected.InstanceKey, actual.InstanceKey)
			assert.Equal(t, test.expected.BpmnResource, actual.BpmnResource)
			assert.Equal(t, test.expected.Status, actual.Status)
			assert.Equal(t, test.expected.StartTime, actual.StartTime)
			assert.Equal(t, test.expected.BpmnLiveStatus, actual.BpmnLiveStatus)
			assert.Equal(t, test.expected.Version, actual.Version)
		})
	}
}

func TestInvalidStatus(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			assert.Fail(t, "expected panic")
		}
	}()

	storageInstance := storage.Instance{
		ProcessInstanceKey:   10,
		ProcessDefinitionKey: 1,
		Status:               "InvalidStatus",
		StartTime:            time.Now(),
	}

	// Should panic.
	FromStorageInstance(storageInstance)
}

func TestFromStorageProcess(t *testing.T) {
	now := time.Now()

	tests := []struct {
		name           string
		storageProcess storage.Process
		expected       *Process
	}{
		{
			name: "Active instance",
			storageProcess: storage.Process{
				ProcessDefinitionKey: 1,
				Version:              1,
				DeploymentTime:       now,
				BpmnProcessID:        "main-loop",
				// Instances should not transfer to model.Instance.
				Instances: []storage.Instance{
					{
						ProcessInstanceKey:   10,
						ProcessDefinitionKey: 1,
						Status:               "Active",
						StartTime:            now,
						BpmnProcessID:        "main-loop",
					},
				},
			},
			expected: &Process{
				ActiveInstances:      0,  // TODO
				CompletedInstances:   0,  // TODO
				BpmnLiveStatus:       "", // TODO
				DeploymentTime:       now.UTC().Format(time.RFC3339),
				BpmnProcessID:        "main-loop",
				BpmnResource:         "",
				ProcessKey:           1,
				Version:              1,
				Instances:            []*Instance{},
				MessageSubscriptions: []*MessageSubscription{},
				Timers:               []*Timer{},
			},
		},
		{
			name: "Completed instance",
			storageProcess: storage.Process{
				ProcessDefinitionKey: 2,
				Version:              1,
				DeploymentTime:       now,
				BpmnProcessID:        "main-loop",
				Instances:            []storage.Instance{},
			},
			expected: &Process{
				ActiveInstances:      0,  // TODO
				CompletedInstances:   0,  // TODO
				BpmnLiveStatus:       "", // TODO
				DeploymentTime:       now.UTC().Format(time.RFC3339),
				BpmnProcessID:        "main-loop",
				BpmnResource:         "",
				ProcessKey:           2,
				Version:              1,
				Instances:            []*Instance{},
				MessageSubscriptions: []*MessageSubscription{},
				Timers:               []*Timer{},
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual := FromStorageProcess(test.storageProcess)

			assert.Equal(t, test.expected.ProcessKey, actual.ProcessKey)
			assert.Equal(t, test.expected.BpmnResource, actual.BpmnResource)
			assert.Equal(t, test.expected.DeploymentTime, actual.DeploymentTime)
			assert.Equal(t, test.expected.BpmnLiveStatus, actual.BpmnLiveStatus)
			assert.Equal(t, test.expected.Version, actual.Version)
		})
	}
}
