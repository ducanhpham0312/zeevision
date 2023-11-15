package storage

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestProcessesQuery(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	assert.NoError(t, err)

	err = db.AutoMigrate(&Process{})
	assert.NoError(t, err)

	expectedProcess := Process{
		ProcessKey:   1,
		ProcessID:    2,
		BpmnResource: "hlasd876/fhd=",
	}
	err = db.Create(&expectedProcess).Error
	assert.NoError(t, err)

	fetch := Fetch{db: db}

	processes, err := fetch.GetProcesses(context.Background())
	assert.NoError(t, err)

	assert.Len(t, processes, 1)
	assert.Equal(t, expectedProcess.ProcessKey, processes[0].ProcessKey)
	assert.Equal(t, expectedProcess.ProcessID, processes[0].ProcessID)
	assert.Equal(t, expectedProcess.BpmnResource, processes[0].BpmnResource)
}

func TestCancelQuery(t *testing.T) {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	assert.NoError(t, err)

	err = db.AutoMigrate(&Process{})
	assert.NoError(t, err)

	fetch := Fetch{db: db}

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err = fetch.GetProcesses(ctx)
	assert.EqualError(t, err, "context canceled")
}
