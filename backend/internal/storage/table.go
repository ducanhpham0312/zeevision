package storage

import (
	"time"

	"gorm.io/gorm"
)

// Instance model struct for the 'instances' database table.
type Instance struct {
	ProcessInstanceKey   int64     `gorm:"primarykey"`
	ProcessDefinitionKey int64     `gorm:"not null"`
	Status               string    `gorm:"not null"`
	StartTime            time.Time `gorm:"not null"`
	BpmnProcessID        string    `gorm:"not null"`
}

// Process model struct for the 'processes' database table.
type Process struct {
	ProcessDefinitionKey int64      `gorm:"primarykey"`
	Version              int64      `gorm:"not null"`
	DeploymentTime       time.Time  `gorm:"not null"`
	BpmnProcessID        string     `gorm:"not null"`
	Instances            []Instance `gorm:"foreignKey:ProcessDefinitionKey;references:ProcessDefinitionKey"`
}

// BpmnResource model struct for the 'bpmn_resources' database table.
//
// This table is used to store the BPMN XML files which are relatively large
// in size. The XML files are stored in the database as a base64 encoded string.
type BpmnResource struct {
	gorm.Model
	BpmnProcessID string `gorm:"unique"`
	BpmnFile      string `gorm:"not null"`
}
