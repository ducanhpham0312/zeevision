package testutils

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Creates new test database which starts transaction. Transaction is rolled back
// when Rollback() is called. You should call Rollback() in defer in your test.
//
// NOTE: You shouldn't use more than one test database at a time,
// since the underlying database is shared. So no `t.Parallel()`.
func NewTestDB(t *testing.T) *TestDB {
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	assert.NoError(t, err)

	tx := db.Begin()

	return &TestDB{db: tx}
}

// Rolls back to empty state.
func (d *TestDB) Rollback() error {
	return d.db.Rollback().Error
}

// Returns database object.
func (d *TestDB) DB() *gorm.DB {
	return d.db
}

// In-memory test database using sqlite.
type TestDB struct {
	db *gorm.DB
}
