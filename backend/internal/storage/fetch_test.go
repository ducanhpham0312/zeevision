package storage

import (
	"context"
	"testing"

	"github.com/ducanhpham0312/zeevision/backend/internal/testutils"
	"github.com/stretchr/testify/assert"
)

var expectedProcesses = []Process{
	{
		ProcessKey:    1,
		BpmnProcessID: 1000,
		BpmnResource:  "hlasd876/fhd=",
	},
	{
		ProcessKey:    2,
		BpmnProcessID: 2000,
		BpmnResource:  "9I79a8s7gKJH",
	},
}

func TestProcessesQuery(t *testing.T) {
	testDb := newProcessesTestDB(t)
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
		assert.Equal(t, expectedProcesses[i].ProcessKey, processes[i].ProcessKey)
		assert.Equal(t, expectedProcesses[i].BpmnProcessID, processes[i].BpmnProcessID)
		assert.Equal(t, expectedProcesses[i].BpmnResource, processes[i].BpmnResource)
	}
}

func TestProcessQuery(t *testing.T) {
	testDb := newProcessesTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedProcess := expectedProcesses[0]
	err := db.Create(&expectedProcess).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name        string
		processKey  int64
		expectedErr string
	}{
		{
			name:       "existing process",
			processKey: expectedProcess.ProcessKey,
		},
		{
			name:        "non-existent process",
			processKey:  123,
			expectedErr: "record not found",
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			process, err := fetcher.GetProcess(context.Background(), test.processKey)

			if test.expectedErr != "" {
				assert.EqualError(t, err, test.expectedErr)
				return
			}
			assert.NoError(t, err)

			assert.Equal(t, expectedProcess.ProcessKey, process.ProcessKey)
			assert.Equal(t, expectedProcess.BpmnProcessID, process.BpmnProcessID)
			assert.Equal(t, expectedProcess.BpmnResource, process.BpmnResource)
		})
	}
}

func TestCancelQuery(t *testing.T) {
	testDb := newProcessesTestDB(t)
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
func newProcessesTestDB(t *testing.T) *testutils.TestDB {
	testDb := testutils.NewTestDB(t)

	err := testDb.DB().AutoMigrate(&Process{})
	assert.NoError(t, err)

	return testDb
}
