// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

import (
	"fmt"
	"io"
	"strconv"
)

type AuditLog struct {
	ElementID   string `json:"elementId"`
	ElementType string `json:"elementType"`
	Intent      string `json:"intent"`
	Position    int64  `json:"position"`
	Time        string `json:"time"`
}

type Incident struct {
	IncidentKey  int64     `json:"incidentKey"`
	InstanceKey  int64     `json:"instanceKey"`
	ElementID    string    `json:"elementId"`
	ErrorType    string    `json:"errorType"`
	ErrorMessage string    `json:"errorMessage"`
	State        string    `json:"state"`
	Time         string    `json:"time"`
	Instance     *Instance `json:"instance"`
}

type Instance struct {
	BpmnLiveStatus string              `json:"bpmnLiveStatus"`
	StartTime      string              `json:"startTime"`
	EndTime        *string             `json:"endTime,omitempty"`
	InstanceKey    int64               `json:"instanceKey"`
	ProcessKey     int64               `json:"processKey"`
	Version        int64               `json:"version"`
	Status         string              `json:"status"`
	AuditLogs      *PaginatedAuditLogs `json:"auditLogs"`
	Incidents      *PaginatedIncidents `json:"incidents"`
	Jobs           *PaginatedJobs      `json:"jobs"`
	Variables      *PaginatedVariables `json:"variables"`
	Process        *Process            `json:"process"`
}

type Job struct {
	ElementID   string    `json:"elementId"`
	InstanceKey int64     `json:"instanceKey"`
	Key         int64     `json:"key"`
	Type        string    `json:"type"`
	Retries     int64     `json:"retries"`
	Worker      string    `json:"worker"`
	State       string    `json:"state"`
	Time        string    `json:"time"`
	Instance    *Instance `json:"instance"`
}

type PaginatedAuditLogs struct {
	Items      []*AuditLog `json:"items"`
	TotalCount int64       `json:"totalCount"`
}

type PaginatedIncidents struct {
	Items      []*Incident `json:"items"`
	TotalCount int64       `json:"totalCount"`
}

type PaginatedInstances struct {
	Items      []*Instance `json:"items"`
	TotalCount int64       `json:"totalCount"`
}

type PaginatedJobs struct {
	Items      []*Job `json:"items"`
	TotalCount int64  `json:"totalCount"`
}

type PaginatedProcesses struct {
	Items      []*Process `json:"items"`
	TotalCount int64      `json:"totalCount"`
}

type PaginatedVariables struct {
	Items      []*Variable `json:"items"`
	TotalCount int64       `json:"totalCount"`
}

type Pagination struct {
	Offset int64 `json:"offset"`
	Limit  int64 `json:"limit"`
}

type Process struct {
	ActiveInstances    int64               `json:"activeInstances"`
	CompletedInstances int64               `json:"completedInstances"`
	BpmnLiveStatus     string              `json:"bpmnLiveStatus"`
	BpmnResource       string              `json:"bpmnResource"`
	BpmnProcessID      string              `json:"bpmnProcessId"`
	DeploymentTime     string              `json:"deploymentTime"`
	Instances          *PaginatedInstances `json:"instances"`
	ProcessKey         int64               `json:"processKey"`
	Version            int64               `json:"version"`
}

type Variable struct {
	Name  string `json:"name"`
	Value string `json:"value"`
	Time  string `json:"time"`
}

type VariableFilter struct {
	Name string     `json:"name"`
	Type FilterType `json:"type"`
}

type FilterType string

const (
	FilterTypeIs       FilterType = "IS"
	FilterTypeIsNot    FilterType = "IS_NOT"
	FilterTypeContains FilterType = "CONTAINS"
)

var AllFilterType = []FilterType{
	FilterTypeIs,
	FilterTypeIsNot,
	FilterTypeContains,
}

func (e FilterType) IsValid() bool {
	switch e {
	case FilterTypeIs, FilterTypeIsNot, FilterTypeContains:
		return true
	}
	return false
}

func (e FilterType) String() string {
	return string(e)
}

func (e *FilterType) UnmarshalGQL(v interface{}) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = FilterType(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid FilterType", str)
	}
	return nil
}

func (e FilterType) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
