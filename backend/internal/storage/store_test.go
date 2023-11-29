package storage

import (
	"encoding/base64"
	"time"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProcessDeployed(t *testing.T) {
	// helper defined in fetch_test.go
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()
	storer := NewStorer(db)

	expectedBpmnResource := BpmnResource {
		BpmnProcessID: "test-id",
		BpmnFile: "Cg==",
	}

	bpmnResourceRaw := make(
		[]byte,
		base64.StdEncoding.DecodedLen(len(expectedBpmnResource.BpmnFile)),
	)
	_, err := base64.StdEncoding.Decode(
		bpmnResourceRaw,
		[]byte(expectedBpmnResource.BpmnFile),
	)
	assert.NoError(t, err)

	expectedProcess := Process {
		ProcessDefinitionKey: 1,
		BpmnProcessID: "test-id",
		Version: 1,
		DeploymentTime: time.Unix(1701235395, 0),
		BpmnResource: expectedBpmnResource,
	}

	t.Run("deploy process", func(t *testing.T) {
		err = storer.ProcessDeployed(
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
		err = storer.ProcessDeployed(
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
