package storage

import (
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Configuration to connect to database
type DsnConfig struct {
	// Username to login database
	User string
	// User password to verify user
	Password string
	// Database name to be accessed
	DatabaseName string
	// The host used to host database
	Host string
	// The port used to connect database
	Port uint16
}

// Create a valid DSN string to connect database from DsnConfig
func NewDsn(config DsnConfig) string {
	dsn := fmt.Sprintf(
		"user=%s password=%s dbname=%s host=%s port=%d",
		config.User, config.Password, config.DatabaseName, config.Host, config.Port,
	)
	return dsn
}

// Connect to database by DsnConfig
func ConnectDb(dsnConfig DsnConfig) *gorm.DB {

	dsn := NewDsn(dsnConfig)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect db: " + err.Error())
	}

	return db
}

// AutoMigrate Process table, create, modify if the table is not existed, changed base on model
func CreateProcessTable(db *gorm.DB) {
	err := db.AutoMigrate(&Process{})
	if err != nil {
		panic("Failed to create tables: " + err.Error())
	}
}