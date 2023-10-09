package consumer

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

type RecordType string

func (r RecordType) String() string {
	return string(r)
}

const (
	RecordTypeCommand          RecordType = "COMMAND"
	RecordTypeCommandRejection RecordType = "COMMAND_REJECTION"
	RecordTypeEvent            RecordType = "EVENT"
)

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

type Record[V any] struct {
	PartitionId          int64         `json:"partitionId"`
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

type Zeebe = any                  // TODO
type Deployment = any             // TODO
type DeploymentDistribution = any // TODO
type Error = any                  // TODO
type Incident = any               // TODO
type Job = Record[JobValue]
type JobBatch = Record[JobBatchValue]
type Message = Record[MessageValue]
type MessageSubscription = Record[MessageSubscriptionValue]
type MessageSubscriptionStartEvent = any // TODO
type Process = any                       // TODO
type ProcessEvent = Record[ProcessEventValue]
type ProcessInstance = Record[ProcessInstanceValue]
type ProcessInstanceResult = any // TODO
type ProcessMessageSubscription = Record[ProcessMessageSubscriptionValue]
type Timer = Record[TimerValue]
type Variable = Record[VariableValue]

type JobValue struct {
	Deadline                 int64          `json:"deadline"`
	ProcessInstanceKey       int64          `json:"processInstanceKey"`
	Retries                  int64          `json:"retries"`
	RetryBackoff             int64          `json:"retryBackoff"`
	RecurringTime            int64          `json:"recurringTime"`
	ProcessDefinitionVersion int64          `json:"processDefinitionVersion"`
	ProcessDefinitionKey     int64          `json:"processDefinitionKey"`
	ElementInstanceKey       int64          `json:"elementInstanceKey"`
	ElementId                string         `json:"elementId"`
	ErrorMessage             string         `json:"errorMessage"`
	CustomHeaders            map[string]any `json:"customHeaders"`
	BpmnProcessId            string         `json:"bpmnProcessId"`
	Variables                map[string]any `json:"variables"`
	Type                     string         `json:"type"`
	ErrorCode                string         `json:"errorCode"`
	Worker                   string         `json:"worker"`
}

type JobBatchValue struct {
	Truncated         bool  `json:"truncated"`
	MaxJobsToActivate int64 `json:"maxJobsToActivate"`
	// TODO: what is the inner type
	Jobs    []any  `json:"jobs"`
	Type    string `json:"type"`
	Timeout int64  `json:"timeout"`
	Worker  string `json:"worker"`
	// TODO: what is the inner type
	JobKeys []any `json:"jobKeys"`
}

type MessageValue struct {
	Deadline       int64          `json:"deadline"`
	MessageId      string         `json:"messageId"`
	Variables      map[string]any `json:"variables"`
	CorrelationKey string         `json:"correlationKey"`
	Name           string         `json:"name"`
	TimeToLive     int64          `json:"timeToLive"`
}

type MessageSubscriptionValue struct {
	ProcessInstanceKey int64          `json:"processInstanceKey"`
	ElementInstanceKey int64          `json:"elementInstanceKey"`
	MessageKey         int64          `json:"messageKey"`
	MessageName        string         `json:"messageName"`
	Interrupting       bool           `json:"interrupting"`
	BpmnProcessId      string         `json:"bpmnProcessId"`
	Variables          map[string]any `json:"variables"`
	CorrelationKey     string         `json:"correlationKey"`
}

type ProcessEventValue struct {
	ProcessInstanceKey   int64          `json:"processInstanceKey"`
	ProcessDefinitionKey int64          `json:"processDefinitionKey"`
	Variables            map[string]any `json:"variables"`
	ScopeKey             int64          `json:"scopeKey"`
	TargetElementId      string         `json:"targetElementId"`
}

type ProcessInstanceValue struct {
	BpmnProcessId            string `json:"bpmnProcessId"`
	ProcessInstanceKey       int64  `json:"processInstanceKey"`
	ProcessDefinitionKey     int64  `json:"processDefinitionKey"`
	ElementId                string `json:"elementId"`
	FlowScopeKey             int64  `json:"flowScopeKey"`
	BpmnEventType            string `json:"bpmnEventType"`
	ParentProcessInstanceKey int64  `json:"parentProcessInstanceKey"`
	ParentElementInstanceKey int64  `json:"parentElementInstanceKey"`
	BpmnElementType          string `json:"bpmnElementType"`
	Version                  int64  `json:"version"`
}

type ProcessMessageSubscriptionValue struct {
	BpmnProcessId      string         `json:"bpmnProcessId"`
	ElementInstanceKey int64          `json:"elementInstanceKey"`
	ElementId          string         `json:"elementId"`
	Variables          map[string]any `json:"variables"`
	MessageKey         int64          `json:"messageKey"`
	MessageName        string         `json:"messageName"`
	Interrupting       bool           `json:"interrupting"`
	CorrelationKey     string         `json:"correlationKey"`
	ProcessInstanceKey int64          `json:"processInstanceKey"`
}

type TimerValue struct {
	TargetElementId      string `json:"targetElementId"`
	ProcessInstanceKey   int64  `json:"processInstanceKey"`
	ProcessDefinitionKey int64  `json:"processDefinitionKey"`
	ElementInstanceKey   int64  `json:"elementInstanceKey"`
	DueDate              int64  `json:"dueDate"`
	Repetitions          int64  `json:"repetitions"`
}

type VariableValue struct {
	ProcessInstanceKey   int64  `json:"processInstanceKey"`
	ProcessDefinitionKey int64  `json:"processDefinitionKey"`
	BpmnProcessId        string `json:"bpmnProcessId"`
	ScopeKey             int64  `json:"scopeKey"`
	Name                 string `json:"name"`
	Value                string `json:"value"`
}
