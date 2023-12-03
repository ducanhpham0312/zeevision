package storage

import (
	"database/sql"
	"time"
)

// List of migrations to be run on database during initialization.
var TableMigrations = []any{
	&Process{},
	&Instance{},
	&Incident{},
	&Job{},
	&Variable{},
	&BpmnResource{},
}

// Instance model struct for the 'instances' database table.
type Instance struct {
	ProcessInstanceKey   int64     `gorm:"primarykey"`
	ProcessDefinitionKey int64     `gorm:"not null"`
	Version              int64     `gorm:"not null"`
	Status               string    `gorm:"not null"`
	StartTime            time.Time `gorm:"not null"`
	EndTime              sql.NullTime
	Incidents            []Incident `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
	Jobs                 []Job      `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
	Variables            []Variable `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
}

// Process model struct for the 'processes' database table.
type Process struct {
	ProcessDefinitionKey int64        `gorm:"primarykey"`
	BpmnProcessID        string       `gorm:"not null"`
	Version              int64        `gorm:"not null"`
	DeploymentTime       time.Time    `gorm:"not null"`
	BpmnResource         BpmnResource `gorm:"foreignKey:ProcessDefinitionKey;references:ProcessDefinitionKey"`
	Instances            []Instance   `gorm:"foreignKey:ProcessDefinitionKey;references:ProcessDefinitionKey"`
}

type Incident struct {
	Key                int64     `gorm:"primarykey"`
	ProcessInstanceKey int64     `gorm:"not null"`
	ElementID          string    `gorm:"not null"`
	ErrorType          string    `gorm:"not null"`
	ErrorMessage       string    `gorm:"not null"`
	State              string    `gorm:"not null"`
	Time               time.Time `gorm:"not null"`
}

// Job model struct for the 'jobs' database table.
type Job struct {
	Key                int64     `gorm:"primarykey"`
	ElementID          string    `gorm:"not null"`
	ProcessInstanceKey int64     `gorm:"not null"`
	Type               string    `gorm:"not null"`
	Retries            int64     `gorm:"not null"`
	Worker             string    `gorm:"not null"`
	State              string    `gorm:"not null"`
	Time               time.Time `gorm:"not null"`
}

// Variable model struct for the 'variables' database table.
type Variable struct {
	ProcessInstanceKey int64     `gorm:"primarykey;autoIncrement:false"`
	Name               string    `gorm:"primarykey"`
	Value              string    `gorm:"not null"`
	Time               time.Time `gorm:"not null"`
}

// BpmnResource model struct for the 'bpmn_resources' database table.
//
// This table is used to store the BPMN XML files which are relatively large
// in size. The XML files are stored in the database as a base64 encoded string.
type BpmnResource struct {
	ProcessDefinitionKey int64 `gorm:"primarykey;autoIncrement:false"`
	// A base64 encoded string of the BPMN XML file.
	BpmnFile string `gorm:"not null"`
}
