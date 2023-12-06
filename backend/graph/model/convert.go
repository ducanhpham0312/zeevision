package model

import (
	"database/sql"
	"time"

	"github.com/ducanhpham0312/zeevision/backend/internal/storage"
)

// Convert slice of values T to slice of values U by applying function f.
//
// TODO: replace with stdlib equivalent once, if ever, available.
func Map[T, U any](slice []T, f func(T) U) []U {
	result := make([]U, 0, len(slice))
	for _, item := range slice {
		result = append(result, f(item))
	}

	return result
}

// Convert storage bpmn resource to GraphQL bpmn resource containing the
// base64 encoded BPMN XML file.
func FromStorageBpmnResource(bpmnResource storage.BpmnResource) string {
	return bpmnResource.BpmnFile
}

// Convert storage instance to GraphQL instance.
func FromStorageInstance(instance storage.Instance) *Instance {
	return &Instance{
		BpmnLiveStatus: "", // TODO
		StartTime:      formatTime(instance.StartTime),
		EndTime:        formatNullTime(instance.EndTime),
		InstanceKey:    instance.ProcessInstanceKey,
		ProcessKey:     instance.ProcessDefinitionKey,
		Version:        instance.Version,
		Status:         instance.Status,
		// Variables and Process have their own resolvers and are not populated
		// here.
	}
}

// Convert storage process to GraphQL process.
func FromStorageProcess(process storage.Process) *Process {
	return &Process{
		ActiveInstances:    0,  // TODO
		CompletedInstances: 0,  // TODO
		BpmnLiveStatus:     "", // TODO
		BpmnProcessID:      process.BpmnProcessID,
		DeploymentTime:     formatTime(process.DeploymentTime),
		ProcessKey:         process.ProcessDefinitionKey,
		Version:            process.Version,
		// Instances, MessageSubscriptions, Timers, BpmnResource have their
		// own resolvers and are not populated here.
	}
}

// Convert storage audit log to GraphQL audit log.
func FromStorageAuditLog(auditLog storage.AuditLog) *AuditLog {
	return &AuditLog{
		ElementID:   auditLog.ElementID,
		ElementType: auditLog.ElementType,
		Intent:      auditLog.Intent,
		Position:    auditLog.Position,
		Time:        formatTime(auditLog.Time),
	}
}

// Convert storage incident to GraphQL incident.
func FromStorageIncident(incident storage.Incident) *Incident {
	return &Incident{
		IncidentKey:  incident.Key,
		InstanceKey:  incident.ProcessInstanceKey,
		ElementID:    incident.ElementID,
		ErrorType:    incident.ErrorType,
		ErrorMessage: incident.ErrorMessage,
		State:        incident.State,
		Time:         formatTime(incident.Time),
		// Instance is populated by the Instance resolver.
	}
}

// Convert storage job to GraphQL job.
func FromStorageJob(job storage.Job) *Job {
	return &Job{
		ElementID:   job.ElementID,
		InstanceKey: job.ProcessInstanceKey,
		Key:         job.Key,
		Type:        job.Type,
		Retries:     job.Retries,
		Worker:      job.Worker,
		State:       job.State,
		Time:        formatTime(job.Time),
	}
}

// Convert storage variable to GraphQL variable.
func FromStorageVariable(variable storage.Variable) *Variable {
	return &Variable{
		Name:  variable.Name,
		Value: variable.Value,
		Time:  formatTime(variable.Time),
	}
}

// Convert GraphQL variable filter to storage filter. Nil value is preserved.
func VariableFilterToStorageFilter(filter *VariableFilter) *storage.Filter {
	if filter == nil {
		return nil
	}
	return &storage.Filter{
		Input: filter.Name,
		// Not really ideal solution but it works for now.
		Type: storage.FilterType(filter.Type.String()),
	}
}

// Convert GraphQL pagination to storage pagination. Nil value is preserved.
func ToStoragePagination(pagination *Pagination) *storage.Pagination {
	if pagination == nil {
		return nil
	}
	return &storage.Pagination{
		Limit:  int(pagination.Limit),
		Offset: int(pagination.Offset),
	}
}

// Convert time to RFC3339 format.
func formatTime(t time.Time) string {
	return t.UTC().Format(time.RFC3339)
}

// Convert nullable time to RFC3339 format. Null times are converted to nil.
func formatNullTime(nt sql.NullTime) *string {
	if !nt.Valid {
		return nil
	}

	t := formatTime(nt.Time)
	return &t
}
