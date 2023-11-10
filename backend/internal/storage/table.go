package storage

import "gorm.io/gorm"

// Process model struct for database table
type Process struct {
	gorm.Model
	ProcessID    uint   `gorm:"unique;not null"`
	ProcessKey   uint   `gorm:"unique;not null"`
	BpmnResource string `gorm:"not null"`
}
