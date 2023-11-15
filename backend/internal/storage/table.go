package storage

import "gorm.io/gorm"

// Process model struct for database table.
type Process struct {
	gorm.Model
	ProcessID    int64  `gorm:"unique;not null"`
	ProcessKey   int64  `gorm:"unique;not null"`
	BpmnResource string `gorm:"not null"`
}
