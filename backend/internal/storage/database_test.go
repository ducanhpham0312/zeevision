package storage

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

const DSN = "user=user password=password dbname=zeevision_db host=postgres port=5432"

func TestNewDsn(t *testing.T) {
	dsnConfig := DsnConfig{
		User:         "user",
		Password:     "password",
		DatabaseName: "zeevision_db",
		Host:         "postgres",
		Port:         5432,
	}

	result := dsnConfig.String()
	assert.Equal(t, result, DSN)
}

func TestFillDatabase(t *testing.T) {
	testDb := newTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	// Migrate table structure.
	err := AutoMigrate(db)
	assert.NoError(t, err)

	// Load data used to fill database.
	bytes, err := os.ReadFile("../../test/data/fill_db.sql")
	assert.NoError(t, err)

	// Run raw SQL statements to fill database.
	err = db.Exec(string(bytes)).Error
	assert.NoError(t, err)

	// Validate database content with smoke test.

	t.Run("contains 5 processes", func(t *testing.T) {
		var processes []Process
		db.Find(&processes)
		assert.Len(t, processes, 5)
	})

	t.Run("contains specific process", func(t *testing.T) {
		var process Process
		db.Where(&Process{ProcessDefinitionKey: 409187}).First(&process)
		assert.Equal(t, process.BpmnProcessID, "order-subprocess")
	})

	t.Run("contains 11 instances", func(t *testing.T) {
		var instances []Instance
		db.Find(&instances)
		assert.Len(t, instances, 11)
	})

	t.Run("contains specific instance", func(t *testing.T) {
		var instance Instance
		db.Where(&Instance{ProcessInstanceKey: 11}).First(&instance)
		assert.Equal(t, instance.ProcessDefinitionKey, int64(209384))
	})

	t.Run("contains variables for specific instance", func(t *testing.T) {
		var variables []Variable
		db.Where(&Variable{ProcessInstanceKey: 11}).Find(&variables)
		assert.Len(t, variables, 2)

		first := variables[0]
		assert.Equal(t, first.Name, "a")
		assert.Equal(t, first.Value, "1")

		second := variables[1]
		assert.Equal(t, second.Name, "b")
		assert.Equal(t, second.Value, "2")
	})
}
