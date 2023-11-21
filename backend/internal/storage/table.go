package storage

import (
	"time"
)

// Instance model struct for the 'instances' database table.
type Instance struct {
	ProcessInstanceKey   int64     `gorm:"primarykey"`
	BpmnProcessID        string    `gorm:"not null"`
	ProcessDefinitionKey int64     `gorm:"not null"`
	Status               string    `gorm:"not null"`
	StartTime            time.Time `gorm:"not null"`
}

// Process model struct for the 'processes' database table.
type Process struct {
	ProcessDefinitionKey int64      `gorm:"primarykey"`
	BpmnProcessID        string     `gorm:"not null"`
	Version              int64      `gorm:"not null"`
	BpmnResource         string     `gorm:"not null"`
	DeploymentTime       time.Time  `gorm:"not null"`
	Instances            []Instance `gorm:"foreignKey:ProcessDefinitionKey;references:ProcessDefinitionKey"`
}
