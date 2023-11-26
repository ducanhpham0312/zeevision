package storage

import (
	"database/sql"
	"time"
)

// Instance model struct for the 'instances' database table.
type Instance struct {
	ProcessInstanceKey   int64     `gorm:"primarykey"`
	ProcessDefinitionKey int64     `gorm:"not null"`
	Version              int64     `gorm:"not null"`
	Status               string    `gorm:"not null"`
	StartTime            time.Time `gorm:"not null"`
	EndTime              sql.NullTime
	Variables            []Variable `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
}

// Process model struct for the 'processes' database table.
type Process struct {
	ProcessDefinitionKey int64        `gorm:"primarykey"`
	BpmnProcessID        string       `gorm:"unique;not null"`
	Version              int64        `gorm:"not null"`
	DeploymentTime       time.Time    `gorm:"not null"`
	BpmnResource         BpmnResource `gorm:"foreignKey:BpmnProcessID;references:BpmnProcessID"`
	Instances            []Instance   `gorm:"foreignKey:ProcessDefinitionKey;references:ProcessDefinitionKey"`
}

// Variable model struct for the 'variables' database table.
type Variable struct {
	ElementID          int64     `gorm:"primarykey"`
	ProcessInstanceKey int64     `gorm:"not null"`
	Name               string    `gorm:"not null"`
	Value              string    `gorm:"not null"`
	Time               time.Time `gorm:"not null"`
}

// BpmnResource model struct for the 'bpmn_resources' database table.
//
// This table is used to store the BPMN XML files which are relatively large
// in size. The XML files are stored in the database as a base64 encoded string.
type BpmnResource struct {
	BpmnProcessID string `gorm:"primarykey"`
	// A base64 encoded string of the BPMN XML file.
	BpmnFile string `gorm:"not null"`
}
