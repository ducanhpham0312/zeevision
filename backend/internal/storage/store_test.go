package storage

import (
	"database/sql"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// Shared for multiple tests
var expectedBpmnResource = BpmnResource{
	BpmnProcessID: "test-id",
	BpmnFile:      "Cg==",
}

// Equal to the encoded form
var bpmnResourceRaw = []byte("\n")

var expectedProcess = Process{
	ProcessDefinitionKey: 1,
	BpmnProcessID:        "test-id",
	Version:              1,
	DeploymentTime:       time.Unix(1701235395, 0),
	BpmnResource:         expectedBpmnResource,
}

var expectedInstance = Instance{
	ProcessInstanceKey:   1,
	ProcessDefinitionKey: expectedProcess.ProcessDefinitionKey,
	Version:              1,
	Status:               "ACTIVE",
	StartTime:            time.Unix(1701235495, 0),
	EndTime: sql.NullTime{
		Time:  time.Unix(1701235595, 0),
		Valid: true,
	},
}

var expectedVariable = Variable{
	ProcessInstanceKey: expectedInstance.ProcessInstanceKey,
	Name:               "testName",
	Value:              "testValue",
	Time:               time.Unix(1701235496, 0),
}

func TestProcessDeployed(t *testing.T) {
	// helper defined in fetch_test.go
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()
	storer := NewStorer(db)

	t.Run("deploy process", func(t *testing.T) {
		err := storer.ProcessDeployed(
			expectedProcess.ProcessDefinitionKey,
			expectedProcess.BpmnProcessID,
			expectedProcess.Version,
			expectedProcess.DeploymentTime,
			bpmnResourceRaw,
		)
		assert.NoError(t, err)
	})

	t.Run("deploy duplicate process", func(t *testing.T) {
		// deploying the same process again should fail
		err := storer.ProcessDeployed(
			expectedProcess.ProcessDefinitionKey,
			expectedProcess.BpmnProcessID,
			expectedProcess.Version,
			expectedProcess.DeploymentTime,
			bpmnResourceRaw,
		)
		assert.ErrorContains(t, err, "failed to create process")
	})

	t.Run("ensure equal value", func(t *testing.T) {
		var process Process
		err := db.First(&process).Error
		assert.NoError(t, err)

		assert.Equal(t, expectedProcess.ProcessDefinitionKey, process.ProcessDefinitionKey)
		assert.Equal(t, expectedProcess.BpmnProcessID, process.BpmnProcessID)
		assert.Equal(t, expectedProcess.Version, process.Version)
		assert.Equal(t, expectedProcess.DeploymentTime.UTC(), process.DeploymentTime.UTC())
	})
}

func TestProcessInstanceActivated(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()
	storer := NewStorer(db)

	// Deploy process so we don't fail activating instance
	err := storer.ProcessDeployed(
		expectedProcess.ProcessDefinitionKey,
		expectedProcess.BpmnProcessID,
		expectedProcess.Version,
		expectedProcess.DeploymentTime,
		bpmnResourceRaw,
	)
	assert.NoError(t, err)

	t.Run("activate instance", func(t *testing.T) {
		err = storer.ProcessInstanceActivated(
			expectedInstance.ProcessInstanceKey,
			expectedInstance.ProcessDefinitionKey,
			expectedInstance.Version,
			expectedInstance.StartTime,
		)
		assert.NoError(t, err)
	})

	t.Run("activate duplicate instance", func(t *testing.T) {
		// duplicate should fail again
		err = storer.ProcessInstanceActivated(
			expectedInstance.ProcessInstanceKey,
			expectedInstance.ProcessDefinitionKey,
			expectedInstance.Version,
			expectedInstance.StartTime,
		)
		assert.ErrorContains(t, err, "failed to create process instance")
	})

	t.Run("no such process", func(t *testing.T) {
		// Use invalid process definition key
		err = storer.ProcessInstanceActivated(
			expectedInstance.ProcessInstanceKey,
			expectedInstance.ProcessDefinitionKey+1,
			expectedInstance.Version,
			expectedInstance.StartTime,
		)
		assert.ErrorContains(t, err, "failed to create process instance")
	})

	t.Run("ensure equal value", func(t *testing.T) {
		var instance Instance
		err := db.First(&instance).Error
		assert.NoError(t, err)

		assert.Equal(t, expectedInstance.ProcessInstanceKey, instance.ProcessInstanceKey)
		assert.Equal(t, expectedInstance.ProcessDefinitionKey, instance.ProcessDefinitionKey)
		assert.Equal(t, expectedInstance.Version, instance.Version)
		assert.Equal(t, "ACTIVE", instance.Status)
		assert.Equal(t, expectedInstance.StartTime.UTC(), instance.StartTime.UTC())
	})
}

func TestProcessInstanceCompleted(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()
	storer := NewStorer(db)

	// Deploy process so we don't fail activating instance
	err := storer.ProcessDeployed(
		expectedProcess.ProcessDefinitionKey,
		expectedProcess.BpmnProcessID,
		expectedProcess.Version,
		expectedProcess.DeploymentTime,
		bpmnResourceRaw,
	)
	assert.NoError(t, err)

	// Activate instance
	err = storer.ProcessInstanceActivated(
		expectedInstance.ProcessInstanceKey,
		expectedInstance.ProcessDefinitionKey,
		expectedInstance.Version,
		expectedInstance.StartTime,
	)
	assert.NoError(t, err)

	t.Run("complete instance", func(t *testing.T) {
		err = storer.ProcessInstanceCompleted(
			expectedInstance.ProcessInstanceKey,
			expectedInstance.EndTime.Time,
		)
		assert.NoError(t, err)
	})

	t.Run("no such instance", func(t *testing.T) {
		// Use invalid process instance key
		err = storer.ProcessInstanceCompleted(
			expectedInstance.ProcessInstanceKey+1,
			expectedInstance.EndTime.Time,
		)
		assert.ErrorContains(t, err, "failed to find process instance")
	})

	t.Run("ensure equal value", func(t *testing.T) {
		var instance Instance
		err := db.First(&instance).Error
		assert.NoError(t, err)

		assert.Equal(t, expectedInstance.ProcessInstanceKey, instance.ProcessInstanceKey)
		assert.Equal(t, "COMPLETED", instance.Status)
		assert.Equal(t, expectedInstance.EndTime.Valid, instance.EndTime.Valid)
		assert.Equal(t, expectedInstance.EndTime.Time.UTC(), instance.EndTime.Time.UTC())
	})
}

func TestProcessInstanceTerminated(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()
	storer := NewStorer(db)

	// Deploy process so we don't fail activating instance
	err := storer.ProcessDeployed(
		expectedProcess.ProcessDefinitionKey,
		expectedProcess.BpmnProcessID,
		expectedProcess.Version,
		expectedProcess.DeploymentTime,
		bpmnResourceRaw,
	)
	assert.NoError(t, err)

	// Activate instance
	err = storer.ProcessInstanceActivated(
		expectedInstance.ProcessInstanceKey,
		expectedInstance.ProcessDefinitionKey,
		expectedInstance.Version,
		expectedInstance.StartTime,
	)
	assert.NoError(t, err)

	t.Run("terminate instance", func(t *testing.T) {
		err = storer.ProcessInstanceTerminated(
			expectedInstance.ProcessInstanceKey,
			expectedInstance.EndTime.Time,
		)
		assert.NoError(t, err)
	})

	t.Run("no such instance", func(t *testing.T) {
		// Use invalid process instance key
		err = storer.ProcessInstanceTerminated(
			expectedInstance.ProcessInstanceKey+1,
			expectedInstance.EndTime.Time,
		)
		assert.ErrorContains(t, err, "failed to find process instance")
	})

	t.Run("ensure equal value", func(t *testing.T) {
		var instance Instance
		err := db.First(&instance).Error
		assert.NoError(t, err)

		assert.Equal(t, expectedInstance.ProcessInstanceKey, instance.ProcessInstanceKey)
		assert.Equal(t, "TERMINATED", instance.Status)
		assert.Equal(t, expectedInstance.EndTime.Valid, instance.EndTime.Valid)
		assert.Equal(t, expectedInstance.EndTime.Time.UTC(), instance.EndTime.Time.UTC())
	})
}

func TestVariableCreated(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()
	storer := NewStorer(db)

	// Deploy process so we don't fail activating instance
	err := storer.ProcessDeployed(
		expectedProcess.ProcessDefinitionKey,
		expectedProcess.BpmnProcessID,
		expectedProcess.Version,
		expectedProcess.DeploymentTime,
		bpmnResourceRaw,
	)
	assert.NoError(t, err)

	// Activate instance so we can create variable
	err = storer.ProcessInstanceActivated(
		expectedInstance.ProcessInstanceKey,
		expectedInstance.ProcessDefinitionKey,
		expectedInstance.Version,
		expectedInstance.StartTime,
	)
	assert.NoError(t, err)

	t.Run("create variable", func(t *testing.T) {
		err = storer.VariableCreated(
			expectedVariable.ProcessInstanceKey,
			expectedVariable.Name,
			expectedVariable.Value,
			expectedVariable.Time,
		)
		assert.NoError(t, err)
	})

	t.Run("create duplicate", func(t *testing.T) {
		err = storer.VariableCreated(
			expectedVariable.ProcessInstanceKey,
			expectedVariable.Name,
			expectedVariable.Value,
			expectedVariable.Time,
		)
		assert.ErrorContains(t, err, "failed to create variable")
	})

	t.Run("ensure equal value", func(t *testing.T) {
		var variable Variable
		err := db.First(&variable).Error
		assert.NoError(t, err)

		assert.Equal(t, expectedVariable.ProcessInstanceKey, variable.ProcessInstanceKey)
		assert.Equal(t, expectedVariable.Name, variable.Name)
		assert.Equal(t, expectedVariable.Value, variable.Value)
		assert.Equal(t, expectedVariable.Time.UTC(), variable.Time.UTC())
	})
}

func TestVariableUpdated(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()
	storer := NewStorer(db)

	// Deploy process so we don't fail activating instance
	err := storer.ProcessDeployed(
		expectedProcess.ProcessDefinitionKey,
		expectedProcess.BpmnProcessID,
		expectedProcess.Version,
		expectedProcess.DeploymentTime,
		bpmnResourceRaw,
	)
	assert.NoError(t, err)

	// Activate instance so we can create variable
	err = storer.ProcessInstanceActivated(
		expectedInstance.ProcessInstanceKey,
		expectedInstance.ProcessDefinitionKey,
		expectedInstance.Version,
		expectedInstance.StartTime,
	)
	assert.NoError(t, err)

	// Create variable so we can update it
	err = storer.VariableCreated(
		expectedVariable.ProcessInstanceKey,
		expectedVariable.Name,
		expectedVariable.Value,
		expectedVariable.Time,
	)
	assert.NoError(t, err)

	expectedVariableUpdated := Variable{
		ProcessInstanceKey: expectedVariable.ProcessInstanceKey,
		Name:               expectedVariable.Name,
		Value:              "testValueUpdated",
		Time:               time.Unix(1701235498, 0),
	}

	t.Run("update variable", func(t *testing.T) {
		err = storer.VariableUpdated(
			expectedVariableUpdated.ProcessInstanceKey,
			expectedVariableUpdated.Name,
			expectedVariableUpdated.Value,
			expectedVariableUpdated.Time,
		)
		assert.NoError(t, err)
	})

	t.Run("no such variable", func(t *testing.T) {
		err = storer.VariableUpdated(
			expectedVariableUpdated.ProcessInstanceKey,
			"invalidTestName",
			expectedVariableUpdated.Value,
			expectedVariableUpdated.Time,
		)
		assert.ErrorContains(t, err, "failed to find variable")
	})

	t.Run("ensure equal value", func(t *testing.T) {
		var variable Variable
		err := db.First(&variable).Error
		assert.NoError(t, err)

		assert.Equal(t, expectedVariableUpdated.ProcessInstanceKey, variable.ProcessInstanceKey)
		assert.Equal(t, expectedVariableUpdated.Name, variable.Name)
		assert.Equal(t, expectedVariableUpdated.Value, variable.Value)
		assert.Equal(t, expectedVariableUpdated.Time.UTC(), variable.Time.UTC())
	})
}
