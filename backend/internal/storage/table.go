package storage

import (
	"database/sql"
	"time"
)

// List of migrations to be run on database during initialization.
var TableMigrations = []any{
	&Instance{},
	&Process{},
	&AuditLog{},
	&Incident{},
	&Job{},
	&Variable{},
	&BpmnResource{},
}

// Interface for models that have a table name. Implementing this interface
// changes the table's name in GORM and allows it to be queried by generic
// functions.
type Tabler interface {
	TableName() string
}

// Instance model struct for the 'instances' database table.
type Instance struct {
	ProcessInstanceKey   int64     `gorm:"primarykey"`
	ProcessDefinitionKey int64     `gorm:"not null"`
	Version              int64     `gorm:"not null"`
	Status               string    `gorm:"not null"`
	StartTime            time.Time `gorm:"not null"`
	EndTime              sql.NullTime
	AuditLogs            []AuditLog `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
	Incidents            []Incident `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
	Jobs                 []Job      `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
	Variables            []Variable `gorm:"foreignKey:ProcessInstanceKey;references:ProcessInstanceKey"`
}

func (Instance) TableName() string {
	return "instances"
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

func (Process) TableName() string {
	return "processes"
}

type AuditLog struct {
	Position           int64     `gorm:"primarykey"`
	ProcessInstanceKey int64     `gorm:"not null"`
	ElementID          string    `gorm:"not null"`
	ElementType        string    `gorm:"not null"`
	Intent             string    `gorm:"not null"`
	Time               time.Time `gorm:"not null"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
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

func (Incident) TableName() string {
	return "incidents"
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

func (Job) TableName() string {
	return "jobs"
}

// Variable model struct for the 'variables' database table.
type Variable struct {
	ProcessInstanceKey int64     `gorm:"primarykey;autoIncrement:false"`
	Name               string    `gorm:"primarykey"`
	Value              string    `gorm:"not null"`
	Time               time.Time `gorm:"not null"`
}

func (Variable) TableName() string {
	return "variables"
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

func (BpmnResource) TableName() string {
	return "bpmn_resources"
}
