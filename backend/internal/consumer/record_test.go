package consumer

import (
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
)

const jsonJobRecord = `{
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

func TestJobRecord(t *testing.T) {
	expectedJobRecord := Job{
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
			CustomHeaders:            map[string]any{},
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

	var jobRecord Job
	err := json.Unmarshal([]byte(jsonJobRecord), &jobRecord)

	assert.NoError(t, err)
	assert.Equal(t, expectedJobRecord, jobRecord)
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
