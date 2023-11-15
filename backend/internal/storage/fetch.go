package storage

import (
	"context"

	"gorm.io/gorm"
)

// Fetcher is used by the API to fetch data from the database.
type Fetcher struct {
	// Database object used for fetching data.
	db *gorm.DB
}

// Creates new fetcher.
//
// Database object is assumed to be already initialized.
func NewFetcher(db *gorm.DB) *Fetcher {
	return &Fetcher{db: db}
}

// Gets all processes.
func (f *Fetcher) GetProcesses(ctx context.Context) ([]Process, error) {
	var processes []Process
	err := f.db.WithContext(ctx).Find(&processes).Error
	if err != nil {
		return nil, err
	}

	return processes, nil
}

// Gets a process by its key.
func (f *Fetcher) GetProcess(ctx context.Context, processKey int64) (Process, error) {
	var process Process
	err := f.db.WithContext(ctx).First(&process, processKey).Error
	if err != nil {
		return Process{}, err
	}

	return process, nil
}
