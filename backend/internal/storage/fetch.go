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

// Returns a database object with context used for single queries.
func (f *Fetcher) ContextDB(ctx context.Context) *gorm.DB {
	return f.db.WithContext(ctx)
}

// Gets all processes.
func (f *Fetcher) GetProcesses(ctx context.Context) ([]Process, error) {
	var processes []Process
	err := f.ContextDB(ctx).Find(&processes).Error

	return processes, err
}

// Gets a process by its key.
func (f *Fetcher) GetProcess(ctx context.Context, processKey int64) (Process, error) {
	var process Process
	err := f.ContextDB(ctx).Where(&Process{ProcessKey: processKey}).First(&process).Error

	return process, err
}
