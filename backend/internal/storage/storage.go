package storage

import (
	"fmt"

	"gorm.io/gorm"
)

// TODO more useful name
type StoreApi struct {
	db *gorm.DB
}

// call this for each processesMetadata
func (r *StoreApi) ProcessDeployed(
	processId string,
	processKey int64,
	bpmnResource string,
	version int64,
) error {
	result := r.db.Create(&Process{
		ProcessID:    processId,
		ProcessKey:   processKey,
		BpmnResource: bpmnResource,
		Version:      version,
	})

	err := result.Error
	if err != nil {
		return fmt.Errorf("failed to create process: %w", err)
	}

	return nil
}
