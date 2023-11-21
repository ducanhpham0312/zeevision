package storage

import (
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// List of migrations to be run on database during initialization.
var migrations = []any{
	&Process{},
	&Instance{},
}

// Configuration to connect to database.
type DsnConfig struct {
	// Username used to log in to the database.
	User string
	// Password of the logging in user.
	Password string
	// Database name to be accessed.
	DatabaseName string
	// The host used to host the database.
	Host string
	// The port used to connect to the database.
	Port uint16
}

// Create a valid DSN string to connect database from DsnConfig.
func (config *DsnConfig) String() string {
	dsn := fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s port=%d",
		config.User, config.Password, config.DatabaseName, config.Host, config.Port,
	)
	return dsn
}

// Connect to database by DsnConfig.
func ConnectDb(dsnConfig DsnConfig, maxRetries int, retryDelay time.Duration) (*gorm.DB, error) {
	dsn := dsnConfig.String()

	var db *gorm.DB
	var err error

	for attempt := 1; attempt <= maxRetries; attempt++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			return db, nil
		}
		time.Sleep(retryDelay)
	}
	return nil, fmt.Errorf("maximum number of retries reached: %w", err)
}

// Migrate all tables in database automatically.
func AutoMigrate(db *gorm.DB) error {
	if err := db.AutoMigrate(migrations...); err != nil {
		return fmt.Errorf("failed to migrate tables: %w", err)
	}

	return nil
}
