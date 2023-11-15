package storage

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var expectedProcesses = []Process{
	{
		ProcessKey:   1,
		ProcessID:    1000,
		BpmnResource: "hlasd876/fhd=",
	},
	{
		ProcessKey:   2,
		ProcessID:    2000,
		BpmnResource: "9I79a8s7gKJH",
	},
}

func TestProcessesQuery(t *testing.T) {
	testDb := newProcessesTestDb(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedProcesses).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(testDb.DB())

	processes, err := fetcher.GetProcesses(context.Background())
	assert.NoError(t, err)

	assert.Len(t, processes, 2)
	for i := range processes {
		assert.Equal(t, expectedProcesses[i].ProcessKey, processes[i].ProcessKey)
		assert.Equal(t, expectedProcesses[i].ProcessID, processes[i].ProcessID)
		assert.Equal(t, expectedProcesses[i].BpmnResource, processes[i].BpmnResource)
	}
}

func TestProcessQuery(t *testing.T) {
	testDb := newProcessesTestDb(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedProcess := expectedProcesses[0]
	err := db.Create(&expectedProcess).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(testDb.DB())

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
			assert.Equal(t, expectedProcess.ProcessID, process.ProcessID)
			assert.Equal(t, expectedProcess.BpmnResource, process.BpmnResource)
		})
	}
}

func TestCancelQuery(t *testing.T) {
	testDb := newProcessesTestDb(t)
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
func newProcessesTestDb(t *testing.T) *testDb {
	testDb := newTestDb(t)

	err := testDb.DB().AutoMigrate(&Process{})
	assert.NoError(t, err)

	return testDb
}

// Creates new test database which starts transaction. Transaction is rolled back
// when Rollback() is called.
//
// NOTE: You shouldn't use more than one test database at a time,
// since the underlying database is shared. So no `t.Parallel()`.
func newTestDb(t *testing.T) *testDb {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	assert.NoError(t, err)

	tx := db.Begin()

	return &testDb{db: tx}
}

// Rolls back to empty state.
func (d *testDb) Rollback() error {
	return d.db.Rollback().Error
}

// Returns database object.
func (d *testDb) DB() *gorm.DB {
	return d.db
}

// In-memory test database using sqlite.
type testDb struct {
	db *gorm.DB
}
