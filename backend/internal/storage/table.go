package storage

import "gorm.io/gorm"

// Process model struct for database table
type Process struct {
	gorm.Model
	ProcessID    string `gorm:"not null"`
	ProcessKey   int64  `gorm:"not null;primaryKey"`
	BpmnResource string `gorm:"not null"`
	Version      int64  `gorm:"not null"`
}
