package storage

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
func newTestDB(t *testing.T) *testDB {
	db, err := gorm.Open(
		sqlite.Open("file::memory:?cache=shared"),
		createGormConfig(),
	)
	assert.NoError(t, err)

	tx := db.Begin()

	return &testDB{db: tx}
}

// Creates new test database with processes table.
func newMigratedTestDB(t *testing.T) *testDB {
	testDb := newTestDB(t)

	err := AutoMigrate(testDb.DB())
	assert.NoError(t, err)

	return testDb
}

// Rolls back to empty state.
func (d *testDB) Rollback() error {
	return d.db.Rollback().Error
}

// Returns database object.
func (d *testDB) DB() *gorm.DB {
	return d.db
}

// In-memory test database using sqlite.
type testDB struct {
	db *gorm.DB
}
