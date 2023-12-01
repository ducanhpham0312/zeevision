package model

import (
	"database/sql"
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

func TestFromStorageBpmnResource(t *testing.T) {
	storageResource := storage.BpmnResource{
		BpmnProcessID: "main-loop",
		BpmnFile:      "test",
	}
	expected := "test"

	actual := FromStorageBpmnResource(storageResource)
	assert.Equal(t, expected, actual)
}

func TestFromStorageInstance(t *testing.T) {
	now := time.Now()
	nowFormatted := now.UTC().Format(time.RFC3339)

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
				Version:              1,
				Status:               "ACTIVE",
				StartTime:            now,
				EndTime:              sql.NullTime{},
			},
			expected: &Instance{
				BpmnLiveStatus: "", // TODO
				StartTime:      nowFormatted,
				EndTime:        nil,
				InstanceKey:    10,
				ProcessKey:     1,
				Version:        1,
				Status:         StatusActive,
			},
		},
		{
			name: "Completed instance",
			storageInstance: storage.Instance{
				ProcessInstanceKey:   20,
				ProcessDefinitionKey: 2,
				Version:              2,
				Status:               "COMPLETED",
				StartTime:            now,
				EndTime:              sql.NullTime{Time: now, Valid: true},
			},
			expected: &Instance{
				BpmnLiveStatus: "", // TODO
				StartTime:      nowFormatted,
				EndTime:        &nowFormatted,
				InstanceKey:    20,
				ProcessKey:     2,
				Version:        2,
				Status:         StatusCompleted,
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual := FromStorageInstance(test.storageInstance)

			assert.Equal(t, test.expected, actual)
		})
	}
}

func TestStatus(t *testing.T) {
	tests := []struct {
		name        string
		status      any
		expectedErr string
		expected    Status
	}{
		{
			name:     "Active",
			status:   "ACTIVE",
			expected: StatusActive,
		},
		{
			name:     "Completed",
			status:   "COMPLETED",
			expected: StatusCompleted,
		},
		{
			name:     "Terminated",
			status:   "TERMINATED",
			expected: StatusTerminated,
		},
		{
			name:        "Invalid status",
			status:      "INVALID_STATUS",
			expectedErr: "INVALID_STATUS is not a valid Status",
		},
		{
			name:        "Invalid type",
			status:      1,
			expectedErr: "enums must be strings",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			var actual Status
			err := actual.UnmarshalGQL(test.status)
			if test.expectedErr != "" {
				assert.EqualError(t, err, test.expectedErr)
				return
			}

			assert.Equal(t, test.expected, actual)
		})
	}
}

func TestStorageInstanceConversionPanic(t *testing.T) {
	defer func() {
		if r := recover(); r == nil {
			assert.Fail(t, "expected panic")
		}
	}()

	storageInstance := storage.Instance{
		Status: "INVALID_STATUS",
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
				// BpmnResource should not transfer to model.Instance.
				BpmnResource: storage.BpmnResource{
					BpmnProcessID: "main-loop",
					BpmnFile:      "test",
				},
				// Instances should not transfer to model.Instance.
				Instances: []storage.Instance{
					{
						ProcessInstanceKey:   10,
						ProcessDefinitionKey: 1,
						Status:               "Active",
						StartTime:            now,
					},
				},
			},
			expected: &Process{
				ActiveInstances:    0,  // TODO
				CompletedInstances: 0,  // TODO
				BpmnLiveStatus:     "", // TODO
				DeploymentTime:     now.UTC().Format(time.RFC3339),
				BpmnProcessID:      "main-loop",
				BpmnResource:       "",
				ProcessKey:         1,
				Version:            1,
			},
		},
		{
			name: "Completed instance",
			storageProcess: storage.Process{
				ProcessDefinitionKey: 2,
				Version:              1,
				DeploymentTime:       now,
				BpmnProcessID:        "main-loop",
				// BpmnResource should not transfer to model.Instance.
				BpmnResource: storage.BpmnResource{
					BpmnProcessID: "main-loop",
					BpmnFile:      "test",
				},
				// Instances should not transfer to model.Instance.
				Instances: []storage.Instance{},
			},
			expected: &Process{
				ActiveInstances:    0,  // TODO
				CompletedInstances: 0,  // TODO
				BpmnLiveStatus:     "", // TODO
				DeploymentTime:     now.UTC().Format(time.RFC3339),
				BpmnProcessID:      "main-loop",
				BpmnResource:       "",
				ProcessKey:         2,
				Version:            1,
			},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual := FromStorageProcess(test.storageProcess)

			assert.Equal(t, test.expected, actual)
		})
	}
}

func TestFromStorageJob(t *testing.T) {
	now := time.Now()

	storageJob := storage.Job{
		ElementID:          "element-id",
		Key:                10,
		Type:               "type",
		Retries:            3,
		Worker:             "worker",
		State:              "state",
		Time:               now,
		ProcessInstanceKey: 100,
	}
	expected := &Job{
		ElementID: "element-id",
		Key:       10,
		Type:      "type",
		Retries:   3,
		Worker:    "worker",
		State:     "state",
		Time:      now.UTC().Format(time.RFC3339),
		InstanceKey: 100,
	}

	actual := FromStorageJob(storageJob)

	assert.Equal(t, expected, actual)
}

func TestFromStorageVariable(t *testing.T) {
	now := time.Now()

	storageVariable := storage.Variable{
		ProcessInstanceKey: 10,
		Name:               "variable-name",
		Value:              "variable-value",
		Time:               now,
	}
	expected := &Variable{
		Name:  "variable-name",
		Value: "variable-value",
		Time:  now.UTC().Format(time.RFC3339),
	}

	actual := FromStorageVariable(storageVariable)

	assert.Equal(t, expected, actual)
}
