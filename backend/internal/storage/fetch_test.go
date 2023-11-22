package storage

import (
	"context"
	"testing"

	"github.com/ducanhpham0312/zeevision/backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

var expectedInstances = []Instance{
	{
		ProcessInstanceKey:   10,
		ProcessDefinitionKey: 1,
		Status:               "ACTIVE",
	},
	{
		ProcessInstanceKey:   20,
		ProcessDefinitionKey: 2,
		Status:               "COMPLETED",
	},
}

var expectedProcesses = []Process{
	{
		ProcessDefinitionKey: 1,
		BpmnProcessID:        "process1",
		Instances:            expectedInstances,
	},
	{
		ProcessDefinitionKey: 2,
		BpmnProcessID:        "process2",
		Instances:            []Instance{},
	},
}

func TestInstanceQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedInstance := expectedInstances[0]
	err := db.Create(&expectedInstance).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name        string
		instanceKey int64
		expectedErr string
	}{
		{
			name:        "existing instance",
			instanceKey: expectedInstance.ProcessInstanceKey,
		},
		{
			name:        "non-existent instance",
			instanceKey: 123,
			expectedErr: "record not found",
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			instance, err := fetcher.GetInstance(context.Background(), test.instanceKey)

			if test.expectedErr != "" {
				assert.EqualError(t, err, test.expectedErr)
				return
			}
			assert.NoError(t, err)

			assert.Equal(t, expectedInstance, instance)
		})
	}
}

func TestInstancesQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedInstances).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	instances, err := fetcher.GetInstances(context.Background())
	assert.NoError(t, err)

	assert.Len(t, instances, 2)
	for i := range instances {
		assert.Equal(t, expectedInstances[i], instances[i])
	}
}

func TestInstancesForProcessQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedProcesses).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name          string
		processDefKey int64
		instances     []Instance
	}{
		{
			name:          "existing process",
			processDefKey: 1,
			instances:     expectedInstances,
		},
		{
			name:          "non-existent process",
			processDefKey: 2,
			instances:     []Instance{},
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			instances, err := fetcher.GetInstancesForProcess(context.Background(), test.processDefKey)
			assert.NoError(t, err)

			assert.Len(t, instances, len(test.instances))
			for i := range instances {
				assert.Equal(t, test.instances[i], instances[i])
			}
		})
	}
}

func TestProcessesQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedProcesses).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	processes, err := fetcher.GetProcesses(context.Background())
	assert.NoError(t, err)

	assert.Len(t, processes, 2)
	for i := range processes {
		assert.Equal(t, expectedProcesses[i].ProcessDefinitionKey, processes[i].ProcessDefinitionKey)
	}
}

func TestProcessQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedProcess := expectedProcesses[0]
	err := db.Create(&expectedProcess).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name          string
		processDefKey int64
		expectedErr   string
	}{
		{
			name:          "existing process",
			processDefKey: expectedProcess.ProcessDefinitionKey,
		},
		{
			name:          "non-existent process",
			processDefKey: 123,
			expectedErr:   "record not found",
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			process, err := fetcher.GetProcess(context.Background(), test.processDefKey)

			if test.expectedErr != "" {
				assert.EqualError(t, err, test.expectedErr)
				return
			}
			assert.NoError(t, err)

			assert.Equal(t, expectedProcess.ProcessDefinitionKey, process.ProcessDefinitionKey)
		})
	}
}

func TestCancelQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()

	fetcher := NewFetcher(testDb.DB())

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err := fetcher.GetProcesses(ctx)
	assert.EqualError(t, err, "context canceled")
}

// Creates new test database with processes table.
func newMigratedTestDB(t *testing.T) *testutils.TestDB {
	testDb := testutils.NewTestDB(t)

	err := AutoMigrate(testDb.DB())
	assert.NoError(t, err)

	return testDb
}
