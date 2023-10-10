package consumer

import (
	"encoding/json"
	"fmt"
)

// Intent indicates the intent of the record.
type Intent string

func (i Intent) String() string {
	return string(i)
}

const (
	IntentActivate                 Intent = "ACTIVATE"
	IntentActivated                Intent = "ACTIVATED"
	IntentActivateElement          Intent = "ACTIVATE_ELEMENT"
	IntentCancel                   Intent = "CANCEL"
	IntentCanceled                 Intent = "CANCELED"
	IntentComplete                 Intent = "COMPLETE"
	IntentCompleted                Intent = "COMPLETED"
	IntentCompleteElement          Intent = "COMPLETE_ELEMENT"
	IntentCorrelate                Intent = "CORRELATE"
	IntentCorrelated               Intent = "CORRELATED"
	IntentCorrelating              Intent = "CORRELATING"
	IntentCreate                   Intent = "CREATE"
	IntentCreated                  Intent = "CREATED"
	IntentCreateWithAwaitingResult Intent = "CREATE_WITH_AWAITING_RESULT"
	IntentCreating                 Intent = "CREATING"
	IntentDelete                   Intent = "DELETE"
	IntentDeleted                  Intent = "DELETED"
	IntentDeleting                 Intent = "DELETING"
	IntentDistribute               Intent = "DISTRIBUTE"
	IntentDistributed              Intent = "DISTRIBUTED"
	IntentElementActivated         Intent = "ELEMENT_ACTIVATED"
	IntentElementActivating        Intent = "ELEMENT_ACTIVATING"
	IntentElementCompleted         Intent = "ELEMENT_COMPLETED"
	IntentElementCompleting        Intent = "ELEMENT_COMPLETING"
	IntentElementTerminated        Intent = "ELEMENT_TERMINATED"
	IntentElementTerminating       Intent = "ELEMENT_TERMINATING"
	IntentErrorThrown              Intent = "ERROR_THROWN"
	IntentEscalated                Intent = "ESCALATED"
	IntentEvaluated                Intent = "EVALUATED"
	IntentExpire                   Intent = "EXPIRE"
	IntentExpired                  Intent = "EXPIRED"
	IntentFail                     Intent = "FAIL"
	IntentFailed                   Intent = "FAILED"
	IntentFullyDistributed         Intent = "FULLY_DISTRIBUTED"
	IntentModified                 Intent = "MODIFIED"
	IntentModify                   Intent = "MODIFY"
	IntentNotEscalated             Intent = "NOT_ESCALATED"
	IntentPublish                  Intent = "PUBLISH"
	IntentPublished                Intent = "PUBLISHED"
	IntentRecurredAfterBackoff     Intent = "RECURRED_AFTER_BACKOFF"
	IntentRecurAfterBackoff        Intent = "RECUR_AFTER_BACKOFF"
	IntentReject                   Intent = "REJECT"
	IntentRejected                 Intent = "REJECTED"
	IntentResolve                  Intent = "RESOLVE"
	IntentResolved                 Intent = "RESOLVED"
	IntentRetriesUpdated           Intent = "RETRIES_UPDATED"
	IntentSequenceFlowTaken        Intent = "SEQUENCE_FLOW_TAKEN"
	IntentTerminateElement         Intent = "TERMINATE_ELEMENT"
	IntentThrowError               Intent = "THROW_ERROR"
	IntentTimedOut                 Intent = "TIMED_OUT"
	IntentTimeOut                  Intent = "TIME_OUT"
	IntentTrigger                  Intent = "TRIGGER"
	IntentTriggered                Intent = "TRIGGERED"
	IntentTriggering               Intent = "TRIGGERING"
	IntentUpdate                   Intent = "UPDATE"
	IntentUpdated                  Intent = "UPDATED"
	IntentUpdateRetries            Intent = "UPDATE_RETRIES"
)

// RecordType indicates the type of the record.
type RecordType string

func (r RecordType) String() string {
	return string(r)
}

const (
	RecordTypeCommand          RecordType = "COMMAND"
	RecordTypeCommandRejection RecordType = "COMMAND_REJECTION"
	RecordTypeEvent            RecordType = "EVENT"
)

// RejectionType indicates the type of the rejection for a record.
// RejectionType has associated reason in 'rejectionReason' field.
type RejectionType string

func (r RejectionType) String() string {
	return string(r)
}

const (
	RejectionTypeAlreadyExists       RejectionType = "ALREADY_EXISTS"
	RejectionTypeExceededBatchRecord RejectionType = "EXCEEDED_BATCH_RECORD_SIZE"
	RejectionTypeInvalidArgument     RejectionType = "INVALID_ARGUMENT"
	RejectionTypeInvalidState        RejectionType = "INVALID_STATE"
	RejectionTypeNotFound            RejectionType = "NOT_FOUND"
	RejectionTypeNullVal             RejectionType = "NULL_VAL"
	RejectionTypeProcessingError     RejectionType = "PROCESSING_ERROR"
)

// ValueType indicates the structure of the 'value' field in a record.
type ValueType string

func (v ValueType) String() string {
	return string(v)
}

const (
	ValueTypeDecision                      ValueType = "DECISION"
	ValueTypeDecisionEvaluation            ValueType = "DECISION_EVALUATION"
	ValueTypeDecisionRequirements          ValueType = "DECISION_REQUIREMENTS"
	ValueTypeDeployment                    ValueType = "DEPLOYMENT"
	ValueTypeDeploymentDistribution        ValueType = "DEPLOYMENT_DISTRIBUTION"
	ValueTypeError                         ValueType = "ERROR"
	ValueTypeEscalation                    ValueType = "ESCALATION"
	ValueTypeIncident                      ValueType = "INCIDENT"
	ValueTypeJob                           ValueType = "JOB"
	ValueTypeJobBatch                      ValueType = "JOB_BATCH"
	ValueTypeMessage                       ValueType = "MESSAGE"
	ValueTypeMessageStartEventSubscription ValueType = "MESSAGE_START_EVENT_SUBSCRIPTION"
	ValueTypeMessageSubscription           ValueType = "MESSAGE_SUBSCRIPTION"
	ValueTypeProcess                       ValueType = "PROCESS"
	ValueTypeProcessEvent                  ValueType = "PROCESS_EVENT"
	ValueTypeProcessInstance               ValueType = "PROCESS_INSTANCE"
	ValueTypeProcessInstanceCreation       ValueType = "PROCESS_INSTANCE_CREATION"
	ValueTypeProcessInstanceModification   ValueType = "PROCESS_INSTANCE_MODIFICATION"
	ValueTypeProcessInstanceResult         ValueType = "PROCESS_INSTANCE_RESULT"
	ValueTypeProcessMessageSubscription    ValueType = "PROCESS_MESSAGE_SUBSCRIPTION"
	ValueTypeTimer                         ValueType = "TIMER"
	ValueTypeVariable                      ValueType = "VARIABLE"
	ValueTypeVariableDocument              ValueType = "VARIABLE_DOCUMENT"
)

// Container for all types of incoming records.
//
// The 'value' field is generic and can be of any type.
type Record[V any] struct {
	PartitionID          int64         `json:"partitionId"`
	Value                V             `json:"value"`
	RejectionType        RejectionType `json:"rejectionType"`
	RejectionReason      string        `json:"rejectionReason"`
	SourceRecordPosition int64         `json:"sourceRecordPosition"`
	Key                  int64         `json:"key"`
	Timestamp            int64         `json:"timestamp"`
	Position             int64         `json:"position"`
	ValueType            ValueType     `json:"valueType"`
	RecordType           RecordType    `json:"recordType"`
	Intent               Intent        `json:"intent"`
	BrokerVersion        string        `json:"brokerVersion"`
}

// UntypedRecord is a record whose 'value' field isn't parsed.
type UntypedRecord = Record[json.RawMessage]

// WithTypedValue converts an UntypedRecord into a typed Record.
//
// Function validates the 'valueType' field of the record and returns
// an error if it doesn't match the type of the value. Any JSON unmarshaling
// errors are also returned.
func WithTypedValue[V NamedValueType](untyped UntypedRecord) (Record[V], error) {
	var value V
	targetValueType := value.ValueType()

	if untyped.ValueType != targetValueType {
		return Record[V]{}, fmt.Errorf("record: cannot convert '%s' into '%s'", untyped.ValueType, targetValueType)

	}

	if err := json.Unmarshal(untyped.Value, &value); err != nil {
		return Record[V]{}, fmt.Errorf("record: %w", err)
	}

	return Record[V]{
		PartitionID:          untyped.PartitionID,
		Value:                value,
		RejectionType:        untyped.RejectionType,
		RejectionReason:      untyped.RejectionReason,
		SourceRecordPosition: untyped.SourceRecordPosition,
		Key:                  untyped.Key,
		Timestamp:            untyped.Timestamp,
		Position:             untyped.Position,
		ValueType:            untyped.ValueType,
		RecordType:           untyped.RecordType,
		Intent:               untyped.Intent,
		BrokerVersion:        untyped.BrokerVersion,
	}, nil
}

// All possible record types.

type Deployment = Record[DeploymentValue]
type DeploymentDistribution = Record[DeploymentDistributionValue]
type Error = Record[ErrorValue]
type Incident = Record[IncidentValue]
type Job = Record[JobValue]
type JobBatch = Record[JobBatchValue]
type Message = Record[MessageValue]
type MessageStartEventSubscription = Record[MessageStartEventSubscriptionValue]
type MessageSubscription = Record[MessageSubscriptionValue]
type Process = Record[ProcessValue]
type ProcessEvent = Record[ProcessEventValue]
type ProcessInstance = Record[ProcessInstanceValue]
type ProcessInstanceResult = Record[ProcessInstanceResultValue]
type ProcessMessageSubscription = Record[ProcessMessageSubscriptionValue]
type Timer = Record[TimerValue]
type Variable = Record[VariableValue]

// NamedValueType is an interface for all record types which have known
// structure based on the 'valueType' field.
type NamedValueType interface {
	ValueType() ValueType
}

// Deployment record's 'value' field.
type DeploymentValue struct {
	Resources                    []DeploymentValueResource                     `json:"resources"`
	ProcessMetadata              []DeploymentValueProcessMetadata              `json:"processMetadata"`
	DecisionRequirementsMetadata []DeploymentValueDecisionRequirementsMetadata `json:"decisionRequirementsMetadata"`
	DecisionMetadata             []DeploymentValueDecisionMetadata             `json:"decisionMetadata"`
}

func (DeploymentValue) ValueType() ValueType {
	return ValueTypeDeployment
}

// DeploymentDistribution record's 'value' field.
type DeploymentDistributionValue struct {
	PartitionID int64 `json:"partitionId"`
}

func (DeploymentDistributionValue) ValueType() ValueType {
	return ValueTypeDeploymentDistribution
}

// Error record's 'value' field.
type ErrorValue struct {
	ExceptionMessage   string `json:"exceptionMessage"`
	Stacktrace         string `json:"stacktrace"`
	ErrorEventPosition int64  `json:"errorEventPosition"`
	ProcessInstanceKey int64  `json:"processInstanceKey"`
}

func (ErrorValue) ValueType() ValueType {
	return ValueTypeError
}

// Incident record's 'value' field.
type IncidentValue struct {
	ErrorType            string `json:"errorType"`
	ErrorMessage         string `json:"errorMessage"`
	BpmnProcessID        string `json:"bpmnProcessId"`
	ProcessInstanceKey   int64  `json:"processInstanceKey"`
	ElementID            string `json:"elementId"`
	ElementInstanceKey   int64  `json:"elementInstanceKey"`
	JobKey               int64  `json:"jobKey"`
	ProcessDefinitionKey int64  `json:"processDefinitionKey"`
	VariableScopeKey     int64  `json:"variableScopeKey"`
}

func (IncidentValue) ValueType() ValueType {
	return ValueTypeIncident
}

// Job record's 'value' field.
type JobValue struct {
	Deadline                 int64          `json:"deadline"`
	ProcessInstanceKey       int64          `json:"processInstanceKey"`
	Retries                  int64          `json:"retries"`
	RetryBackoff             int64          `json:"retryBackoff"`
	RecurringTime            int64          `json:"recurringTime"`
	ProcessDefinitionVersion int64          `json:"processDefinitionVersion"`
	ProcessDefinitionKey     int64          `json:"processDefinitionKey"`
	ElementInstanceKey       int64          `json:"elementInstanceKey"`
	ElementID                string         `json:"elementId"`
	ErrorMessage             string         `json:"errorMessage"`
	CustomHeaders            map[string]any `json:"customHeaders"`
	BpmnProcessID            string         `json:"bpmnProcessId"`
	Variables                map[string]any `json:"variables"`
	Type                     string         `json:"type"`
	ErrorCode                string         `json:"errorCode"`
	Worker                   string         `json:"worker"`
}

func (JobValue) ValueType() ValueType {
	return ValueTypeJob
}

// JobBatch record's 'value' field.
type JobBatchValue struct {
	Truncated         bool    `json:"truncated"`
	MaxJobsToActivate int64   `json:"maxJobsToActivate"`
	Jobs              []Job   `json:"jobs"`
	Type              string  `json:"type"`
	Timeout           int64   `json:"timeout"`
	Worker            string  `json:"worker"`
	JobKeys           []int64 `json:"jobKeys"`
}

func (JobBatchValue) ValueType() ValueType {
	return ValueTypeJobBatch
}

// Message record's 'value' field.
type MessageValue struct {
	Deadline       int64          `json:"deadline"`
	MessageID      string         `json:"messageId"`
	Variables      map[string]any `json:"variables"`
	CorrelationKey string         `json:"correlationKey"`
	Name           string         `json:"name"`
	TimeToLive     int64          `json:"timeToLive"`
}

func (MessageValue) ValueType() ValueType {
	return ValueTypeMessage
}

// MessageStartEventSubscription record's 'value' field.
type MessageStartEventSubscriptionValue struct {
	ProcessDefinitionKey int64          `json:"processDefinitionKey"`
	StartEventID         string         `json:"startEventId"`
	MessageName          string         `json:"messageName"`
	BpmnProcessID        string         `json:"bpmnProcessId"`
	CorrelationKey       string         `json:"correlationKey"`
	MessageKey           int64          `json:"messageKey"`
	ProcessInstanceKey   int64          `json:"processInstanceKey"`
	Variables            map[string]any `json:"variables"`
}

func (MessageStartEventSubscriptionValue) ValueType() ValueType {
	return ValueTypeMessageStartEventSubscription
}

// MessageSubscription record's 'value' field.
type MessageSubscriptionValue struct {
	ProcessInstanceKey int64          `json:"processInstanceKey"`
	ElementInstanceKey int64          `json:"elementInstanceKey"`
	MessageKey         int64          `json:"messageKey"`
	MessageName        string         `json:"messageName"`
	Interrupting       bool           `json:"interrupting"`
	BpmnProcessID      string         `json:"bpmnProcessId"`
	Variables          map[string]any `json:"variables"`
	CorrelationKey     string         `json:"correlationKey"`
}

func (MessageSubscriptionValue) ValueType() ValueType {
	return ValueTypeMessageSubscription
}

// Process record's 'value' field.
type ProcessValue struct {
	BpmnProcessID        string `json:"bpmnProcessId"`
	Version              int64  `json:"version"`
	ProcessDefinitionKey int64  `json:"processDefinitionKey"`
	ResourceName         string `json:"resourceName"`
	Checksum             []byte `json:"checksum"`
	Resource             []byte `json:"resource"`
}

func (ProcessValue) ValueType() ValueType {
	return ValueTypeProcess
}

// ProcessEvent record's 'value' field.
type ProcessEventValue struct {
	ProcessInstanceKey   int64          `json:"processInstanceKey"`
	ProcessDefinitionKey int64          `json:"processDefinitionKey"`
	Variables            map[string]any `json:"variables"`
	ScopeKey             int64          `json:"scopeKey"`
	TargetElementID      string         `json:"targetElementId"`
}

func (ProcessEventValue) ValueType() ValueType {
	return ValueTypeProcessEvent
}

// ProcessInstance record's 'value' field.
type ProcessInstanceValue struct {
	BpmnProcessID            string `json:"bpmnProcessId"`
	ProcessInstanceKey       int64  `json:"processInstanceKey"`
	ProcessDefinitionKey     int64  `json:"processDefinitionKey"`
	ElementID                string `json:"elementId"`
	FlowScopeKey             int64  `json:"flowScopeKey"`
	BpmnEventType            string `json:"bpmnEventType"`
	ParentProcessInstanceKey int64  `json:"parentProcessInstanceKey"`
	ParentElementInstanceKey int64  `json:"parentElementInstanceKey"`
	BpmnElementType          string `json:"bpmnElementType"`
	Version                  int64  `json:"version"`
}

func (ProcessInstanceValue) ValueType() ValueType {
	return ValueTypeProcessInstance
}

// ProcessInstanceResult record's 'value' field.
type ProcessInstanceResultValue struct {
	BpmnProcessID        string         `json:"bpmnProcessId"`
	ProcessDefinitionKey int64          `json:"processDefinitionKey"`
	ProcessInstanceKey   int64          `json:"processInstanceKey"`
	Variables            map[string]any `json:"variables"`
	Version              int64          `json:"version"`
}

func (ProcessInstanceResultValue) ValueType() ValueType {
	return ValueTypeProcessInstanceResult
}

// ProcessMessageSubscription record's 'value' field.
type ProcessMessageSubscriptionValue struct {
	BpmnProcessID      string         `json:"bpmnProcessId"`
	ElementInstanceKey int64          `json:"elementInstanceKey"`
	ElementID          string         `json:"elementId"`
	Variables          map[string]any `json:"variables"`
	MessageKey         int64          `json:"messageKey"`
	MessageName        string         `json:"messageName"`
	Interrupting       bool           `json:"interrupting"`
	CorrelationKey     string         `json:"correlationKey"`
	ProcessInstanceKey int64          `json:"processInstanceKey"`
}

func (ProcessMessageSubscriptionValue) ValueType() ValueType {
	return ValueTypeProcessMessageSubscription
}

// Timer record's 'value' field.
type TimerValue struct {
	TargetElementID      string `json:"targetElementId"`
	ProcessInstanceKey   int64  `json:"processInstanceKey"`
	ProcessDefinitionKey int64  `json:"processDefinitionKey"`
	ElementInstanceKey   int64  `json:"elementInstanceKey"`
	DueDate              int64  `json:"dueDate"`
	Repetitions          int64  `json:"repetitions"`
}

func (TimerValue) ValueType() ValueType {
	return ValueTypeTimer
}

// Variable record's 'value' field.
type VariableValue struct {
	ProcessInstanceKey   int64  `json:"processInstanceKey"`
	ProcessDefinitionKey int64  `json:"processDefinitionKey"`
	BpmnProcessID        string `json:"bpmnProcessId"`
	ScopeKey             int64  `json:"scopeKey"`
	Name                 string `json:"name"`
	Value                string `json:"value"`
}

func (VariableValue) ValueType() ValueType {
	return ValueTypeVariable
}

// Detail types for DeploymentValue.

type DeploymentValueResource struct {
	Resource     []byte `json:"resource"`
	ResourceName string `json:"resourceName"`
}

type DeploymentValueProcessMetadata struct {
	BpmnProcessID        string `json:"bpmnProcessId"`
	Version              int64  `json:"version"`
	ProcessDefinitionKey int64  `json:"processDefinitionKey"`
	ResourceName         string `json:"resourceName"`
	Checksum             []byte `json:"checksum"`
	IsDuplicate          bool   `json:"isDuplicate"`
}

type DeploymentValueDecisionRequirementsMetadata struct {
	DecisionRequirementsID      string `json:"decisionRequirementsId"`
	DecisionRequirementsName    string `json:"decisionRequirementsName"`
	DecisionRequirementsVersion int64  `json:"decisionRequirementsVersion"`
	DecisionRequirementsKey     int64  `json:"decisionRequirementsKey"`
	Namespace                   string `json:"namespace"`
	ResourceName                string `json:"resourceName"`
	Checksum                    []byte `json:"checksum"`
	IsDuplicate                 bool   `json:"isDuplicate"`
}

type DeploymentValueDecisionMetadata struct {
	DecisionID              string `json:"decisionId"`
	Version                 int64  `json:"version"`
	DecisionKey             int64  `json:"decisionKey"`
	DecisionName            string `json:"decisionName"`
	DecisionRequirementsID  string `json:"decisionRequirementsId"`
	DecisionRequirementsKey int64  `json:"decisionRequirementsKey"`
	IsDuplicate             bool   `json:"isDuplicate"`
}
