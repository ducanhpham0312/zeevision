package consumer

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

const jobRecordJSON = `{
	"partitionId": 14,
	"value": {
			"deadline": -1,
			"processInstanceKey": 31525197427841255,
			"retries": 3,
			"retryBackoff": 0,
			"recurringTime": -1,
			"processDefinitionVersion": 1,
			"processDefinitionKey": 2251799813686516,
			"elementInstanceKey": 31525197429944928,
			"elementId": "SomeElement",
			"errorMessage": "",
			"customHeaders": {},
			"bpmnProcessId": "SomeBPMN",
			"variables": {},
			"type": "someType",
			"errorCode": "",
			"worker": ""
	},
	"rejectionType": "NULL_VAL",
	"rejectionReason": "",
	"sourceRecordPosition": 308989657,
	"key": 31525197429944929,
	"timestamp": 1696756438613,
	"position": 308991363,
	"valueType": "JOB",
	"recordType": "EVENT",
	"intent": "CREATED",
	"brokerVersion": "8.2.15"
}`

var expectedJobRecord = Job{
	PartitionID: 14,
	Value: JobValue{
		Deadline:                 -1,
		ProcessInstanceKey:       31525197427841255,
		Retries:                  3,
		RetryBackoff:             0,
		RecurringTime:            -1,
		ProcessDefinitionVersion: 1,
		ProcessDefinitionKey:     2251799813686516,
		ElementInstanceKey:       31525197429944928,
		ElementID:                "SomeElement",
		ErrorMessage:             "",
		CustomHeaders:            map[string]string{},
		BpmnProcessID:            "SomeBPMN",
		Variables:                map[string]any{},
		Type:                     "someType",
		ErrorCode:                "",
		Worker:                   "",
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: 308989657,
	Key:                  31525197429944929,
	Timestamp:            1696756438613,
	Position:             308991363,
	ValueType:            ValueTypeJob,
	RecordType:           RecordTypeEvent,
	Intent:               IntentCreated,
	BrokerVersion:        "8.2.15",
}

const jobBatchRecordJSON = `{
		"partitionId": 6,
		"value": {
				"truncated": false,
				"maxJobsToActivate": 1664,
				"jobs": [],
				"type": "someType",
				"timeout": 30000,
				"worker": "aWorker",
				"jobKeys": []
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": -1,
		"key": -1,
		"timestamp": 1696825294084,
		"position": 193293429,
		"valueType": "JOB_BATCH",
		"recordType": "COMMAND",
		"intent": "ACTIVATE",
		"brokerVersion": "8.2.15"
}`

var expectedJobBatchRecord = JobBatch{
	PartitionID: 6,
	Value: JobBatchValue{
		Truncated:         false,
		MaxJobsToActivate: 1664,
		Jobs:              []Job{},
		Type:              "someType",
		Timeout:           30000,
		Worker:            "aWorker",
		JobKeys:           []int64{},
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: -1,
	Key:                  -1,
	Timestamp:            1696825294084,
	Position:             193293429,
	ValueType:            ValueTypeJobBatch,
	RecordType:           RecordTypeCommand,
	Intent:               IntentActivate,
	BrokerVersion:        "8.2.15",
}

const messageRecordJSON = `{
		"partitionId": 6,
		"value": {
				"deadline": -1,
				"messageId": "",
				"variables": {},
				"correlationKey": "18aeec12-821e-48ec-8f83-22ff091e2a92",
				"name": "some-message",
				"timeToLive": 120000
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": -1,
		"key": -1,
		"timestamp": 1696757671699,
		"position": 184358015,
		"valueType": "MESSAGE",
		"recordType": "COMMAND",
		"intent": "PUBLISH",
		"brokerVersion": "8.2.15"
}`

var expectedMessageRecord = Message{
	PartitionID: 6,
	Value: MessageValue{
		Deadline:       -1,
		MessageID:      "",
		Variables:      map[string]any{},
		CorrelationKey: "18aeec12-821e-48ec-8f83-22ff091e2a92",
		Name:           "some-message",
		TimeToLive:     120000,
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: -1,
	Key:                  -1,
	Timestamp:            1696757671699,
	Position:             184358015,
	ValueType:            ValueTypeMessage,
	RecordType:           RecordTypeCommand,
	Intent:               IntentPublish,
	BrokerVersion:        "8.2.15",
}

const messageSubscriptionRecordJSON = `{
		"partitionId": 5,
		"value": {
				"processInstanceKey": 13510798915826422,
				"elementInstanceKey": 13510798916883411,
				"messageKey": -1,
				"messageName": "someMessageName",
				"interrupting": true,
				"bpmnProcessId": "",
				"variables": {},
				"correlationKey": ""
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": -1,
		"key": -1,
		"timestamp": 1696762411888,
		"position": 251266775,
		"valueType": "MESSAGE_SUBSCRIPTION",
		"recordType": "COMMAND",
		"intent": "DELETE",
		"brokerVersion": "8.2.15"
}`

var expectedMessageSubscriptionRecord = MessageSubscription{
	PartitionID: 5,
	Value: MessageSubscriptionValue{
		ProcessInstanceKey: 13510798915826422,
		ElementInstanceKey: 13510798916883411,
		MessageKey:         -1,
		MessageName:        "someMessageName",
		Interrupting:       true,
		BpmnProcessID:      "",
		Variables:          map[string]any{},
		CorrelationKey:     "",
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: -1,
	Key:                  -1,
	Timestamp:            1696762411888,
	Position:             251266775,
	ValueType:            ValueTypeMessageSubscription,
	RecordType:           RecordTypeCommand,
	Intent:               IntentDelete,
	BrokerVersion:        "8.2.15",
}

const processEventRecordJSON = `{
		"partitionId": 13,
		"value": {
				"processInstanceKey": 29273397611141825,
				"processDefinitionKey": 2251799813686516,
				"variables": {},
				"scopeKey": 29273397612131729,
				"targetElementId": "someElement"
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": 207622866,
		"key": 29273397612131910,
		"timestamp": 1696756440046,
		"valueType": "PROCESS_EVENT",
		"recordType": "EVENT",
		"intent": "TRIGGERING",
		"brokerVersion": "8.2.15",
		"position": 207622933
}`

var expectedProcessEventRecord = ProcessEvent{
	PartitionID: 13,
	Value: ProcessEventValue{
		ProcessInstanceKey:   29273397611141825,
		ProcessDefinitionKey: 2251799813686516,
		Variables:            map[string]any{},
		ScopeKey:             29273397612131729,
		TargetElementID:      "someElement",
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: 207622866,
	Key:                  29273397612131910,
	Timestamp:            1696756440046,
	ValueType:            ValueTypeProcessEvent,
	RecordType:           RecordTypeEvent,
	Intent:               IntentTriggering,
	BrokerVersion:        "8.2.15",
	Position:             207622933,
}

const processInstanceRecordJSON = `{
		"partitionId": 1,
		"value": {
				"bpmnProcessId": "someBPMN",
				"processInstanceKey": 2251799849810364,
				"processDefinitionKey": 2251799813686516,
				"elementId": "SomeElement",
				"flowScopeKey": 2251799849810364,
				"bpmnEventType": "UNSPECIFIED",
				"parentProcessInstanceKey": -1,
				"parentElementInstanceKey": -1,
				"bpmnElementType": "SERVICE_TASK",
				"version": 1
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": 249443342,
		"key": 2251799851470130,
		"timestamp": 1696781729668,
		"position": 249443347,
		"valueType": "PROCESS_INSTANCE",
		"intent": "ELEMENT_COMPLETING",
		"recordType": "EVENT",
		"brokerVersion": "8.2.15"
}`

var expcetedProcessInstanceRecord = ProcessInstance{
	PartitionID: 1,
	Value: ProcessInstanceValue{
		BpmnProcessID:            "someBPMN",
		ProcessInstanceKey:       2251799849810364,
		ProcessDefinitionKey:     2251799813686516,
		ElementID:                "SomeElement",
		FlowScopeKey:             2251799849810364,
		BpmnEventType:            "UNSPECIFIED",
		ParentProcessInstanceKey: -1,
		ParentElementInstanceKey: -1,
		BpmnElementType:          BpmnElementTypeServiceTask,
		Version:                  1,
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: 249443342,
	Key:                  2251799851470130,
	Timestamp:            1696781729668,
	Position:             249443347,
	ValueType:            ValueTypeProcessInstance,
	Intent:               IntentElementCompleting,
	RecordType:           RecordTypeEvent,
	BrokerVersion:        "8.2.15",
}

const processMessageSubscriptionRecordJSON = `{
		"partitionId": 2,
		"value": {
				"bpmnProcessId": "SomeBPMN",
				"elementInstanceKey": 4503599663519923,
				"elementId": "Event_0343jd9",
				"variables": {},
				"messageKey": -1,
				"messageName": "someMessageName",
				"interrupting": true,
				"correlationKey": "28724861",
				"processInstanceKey": 4503599661948748
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": 290859556,
		"key": 4503599663519924,
		"timestamp": 1696758861889,
		"position": 290859657,
		"valueType": "PROCESS_MESSAGE_SUBSCRIPTION",
		"intent": "DELETING",
		"recordType": "EVENT",
		"brokerVersion": "8.2.15"
}`

var expectedProcessMessageSubscriptionRecord = ProcessMessageSubscription{
	PartitionID: 2,
	Value: ProcessMessageSubscriptionValue{
		BpmnProcessID:      "SomeBPMN",
		ElementInstanceKey: 4503599663519923,
		ElementID:          "Event_0343jd9",
		Variables:          map[string]any{},
		MessageKey:         -1,
		MessageName:        "someMessageName",
		Interrupting:       true,
		CorrelationKey:     "28724861",
		ProcessInstanceKey: 4503599661948748,
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: 290859556,
	Key:                  4503599663519924,
	Timestamp:            1696758861889,
	Position:             290859657,
	ValueType:            ValueTypeProcessMessageSubscription,
	Intent:               IntentDeleting,
	RecordType:           RecordTypeEvent,
	BrokerVersion:        "8.2.15",
}

const timerRecordJSON = `{
		"partitionId": 14,
		"value": {
				"targetElementId": "SomeElement",
				"processInstanceKey": 31525197427841255,
				"processDefinitionKey": 2251799813686516,
				"elementInstanceKey": 31525197429944694,
				"dueDate": 1696756438587,
				"repetitions": 1
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": 308989657,
		"key": 31525197429944695,
		"timestamp": 1696756438613,
		"position": 308991349,
		"valueType": "TIMER",
		"recordType": "EVENT",
		"intent": "TRIGGERED",
		"brokerVersion": "8.2.15"
}`

var expectedTimerRecord = Timer{
	PartitionID: 14,
	Value: TimerValue{
		TargetElementID:      "SomeElement",
		ProcessInstanceKey:   31525197427841255,
		ProcessDefinitionKey: 2251799813686516,
		ElementInstanceKey:   31525197429944694,
		DueDate:              1696756438587,
		Repetitions:          1,
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: 308989657,
	Key:                  31525197429944695,
	Timestamp:            1696756438613,
	Position:             308991349,
	ValueType:            ValueTypeTimer,
	RecordType:           RecordTypeEvent,
	Intent:               IntentTriggered,
	BrokerVersion:        "8.2.15",
}

const variableRecordJSON = `{
		"partitionId": 5,
		"value": {
				"processInstanceKey": 11258999100189181,
				"processDefinitionKey": 2251799813686310,
				"bpmnProcessId": "SomeBPMN",
				"scopeKey": 11258999104522786,
				"name": "maximumDuration",
				"value": "\"PT168H\""
		},
		"rejectionType": "NULL_VAL",
		"rejectionReason": "",
		"sourceRecordPosition": 249961163,
		"key": 11258999104522787,
		"timestamp": 1696758123056,
		"position": 249961315,
		"valueType": "VARIABLE",
		"recordType": "EVENT",
		"intent": "CREATED",
		"brokerVersion": "8.2.15"
}`

var expectedVariableRecord = Variable{
	PartitionID: 5,
	Value: VariableValue{
		ProcessInstanceKey:   11258999100189181,
		ProcessDefinitionKey: 2251799813686310,
		BpmnProcessID:        "SomeBPMN",
		ScopeKey:             11258999104522786,
		Name:                 "maximumDuration",
		Value:                "\"PT168H\"",
	},
	RejectionType:        RejectionTypeNullVal,
	RejectionReason:      "",
	SourceRecordPosition: 249961163,
	Key:                  11258999104522787,
	Timestamp:            1696758123056,
	Position:             249961315,
	ValueType:            ValueTypeVariable,
	RecordType:           RecordTypeEvent,
	Intent:               IntentCreated,
	BrokerVersion:        "8.2.15",
}

func TestUntypedRecord(t *testing.T) {
	// Delay value unmarshaling until we know the value type.
	var untypedJobRecord UntypedRecord
	err := json.Unmarshal([]byte(jobRecordJSON), &untypedJobRecord)
	assert.NoError(t, err)

	// Unmarshal the value field into the correct type.
	jobRecord, err := WithTypedValue[JobValue](untypedJobRecord)
	assert.NoError(t, err)
	assert.Equal(t, expectedJobRecord, jobRecord)
}

func TestUntypedRecordWrongType(t *testing.T) {
	// Delay value unmarshaling until we know the value type.
	var untypedJobRecord UntypedRecord
	err := json.Unmarshal([]byte(jobRecordJSON), &untypedJobRecord)
	assert.NoError(t, err)

	// Try to unmashal the value field into the wrong type.
	_, err = WithTypedValue[ProcessInstanceValue](untypedJobRecord)
	assert.EqualError(t, err, "record: cannot convert 'JOB' into 'PROCESS_INSTANCE'")
}

func TestJobRecord(t *testing.T) {
	var jobRecord Job
	err := json.Unmarshal([]byte(jobRecordJSON), &jobRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedJobRecord, jobRecord)
}

func TestJobBatchRecord(t *testing.T) {
	var jobBatchRecord JobBatch
	err := json.Unmarshal([]byte(jobBatchRecordJSON), &jobBatchRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedJobBatchRecord, jobBatchRecord)
}

func TestMessageRecord(t *testing.T) {
	var messageRecord Message
	err := json.Unmarshal([]byte(messageRecordJSON), &messageRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedMessageRecord, messageRecord)
}

func TestMessageSubscriptionRecord(t *testing.T) {
	var messageSubscriptionRecord MessageSubscription
	err := json.Unmarshal([]byte(messageSubscriptionRecordJSON), &messageSubscriptionRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedMessageSubscriptionRecord, messageSubscriptionRecord)
}

func TestProcessEventRecord(t *testing.T) {
	var processEventRecord ProcessEvent
	err := json.Unmarshal([]byte(processEventRecordJSON), &processEventRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedProcessEventRecord, processEventRecord)
}

func TestProcessInstanceRecord(t *testing.T) {
	var processInstanceRecord ProcessInstance
	err := json.Unmarshal([]byte(processInstanceRecordJSON), &processInstanceRecord)

	assert.NoError(t, err)
	assert.Equal(t, expcetedProcessInstanceRecord, processInstanceRecord)
}

func TestProcessMessageSubscriptionRecord(t *testing.T) {
	var processMessageSubscriptionRecord ProcessMessageSubscription
	err := json.Unmarshal([]byte(processMessageSubscriptionRecordJSON), &processMessageSubscriptionRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedProcessMessageSubscriptionRecord, processMessageSubscriptionRecord)
}

func TestTimerRecord(t *testing.T) {
	var timerRecord Timer
	err := json.Unmarshal([]byte(timerRecordJSON), &timerRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedTimerRecord, timerRecord)
}

func TestVariableRecord(t *testing.T) {
	var variableRecord Variable
	err := json.Unmarshal([]byte(variableRecordJSON), &variableRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedVariableRecord, variableRecord)
}

func TestRecordTypeString(t *testing.T) {
	assert.Equal(t, "EVENT", RecordTypeEvent.String())
	assert.Equal(t, "COMMAND", RecordTypeCommand.String())
}

func TestRejectionTypeString(t *testing.T) {
	assert.Equal(t, "ALREADY_EXISTS", RejectionTypeAlreadyExists.String())
	assert.Equal(t, "NULL_VAL", RejectionTypeNullVal.String())
}

func TestValueTypeString(t *testing.T) {
	assert.Equal(t, "JOB", ValueTypeJob.String())
	assert.Equal(t, "MESSAGE", ValueTypeMessage.String())
}
