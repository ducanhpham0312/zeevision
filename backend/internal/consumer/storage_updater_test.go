package consumer

import (
	"encoding/json"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

type fixedErrStorer struct {
	touched map[string]bool
	err     error
}

func newFixedErrStorer(err error) *fixedErrStorer {
	return &fixedErrStorer{
		map[string]bool{},
		err,
	}
}

func (s *fixedErrStorer) reset() {
	s.touched = map[string]bool{}
	s.err = nil
}

func (s *fixedErrStorer) ProcessDeployed(int64, string, int64, time.Time, []byte) error {
	s.touched["ProcessDeployed"] = true
	return s.err
}

func (s *fixedErrStorer) ProcessInstanceActivated(int64, int64, int64, time.Time) error {
	s.touched["ProcessInstanceActivated"] = true
	return s.err
}

func (s *fixedErrStorer) ProcessInstanceCompleted(int64, time.Time) error {
	s.touched["ProcessInstanceCompleted"] = true
	return s.err
}

func (s *fixedErrStorer) ProcessInstanceTerminated(int64, time.Time) error {
	s.touched["ProcessInstanceTerminated"] = true
	return s.err
}

func (s *fixedErrStorer) VariableCreated(int64, string, string, time.Time) error {
	s.touched["VariableCreated"] = true
	return s.err
}

func (s *fixedErrStorer) VariableUpdated(int64, string, string, time.Time) error {
	s.touched["VariableUpdated"] = true
	return s.err
}

func (s *fixedErrStorer) IncidentCreated(int64, int64, string, string, string, time.Time) error {
	s.touched["IncidentCreated"] = true
	return s.err
}

func (s *fixedErrStorer) IncidentResolved(int64, time.Time) error {
	s.touched["IncidentResolved"] = true
	return s.err
}

func (s *fixedErrStorer) AuditLogEventOccurred(int64, int64, string, string, string, time.Time) error {
	s.touched["AuditLogEventOccurred"] = true
	return s.err
}

func (s *fixedErrStorer) JobCreated(int64, string, int64, string, int64, string, time.Time) error {
	s.touched["JobCreated"] = true
	return s.err
}

func (s *fixedErrStorer) JobUpdated(int64, int64, string, string, time.Time) error {
	s.touched["JobUpdated"] = true
	return s.err
}

type testRecord struct {
	name    string
	topic   string
	record  *UntypedRecord
	touched []string
	err     error
}

func newDeploymentTestRecord(
	name string,
	topic string,
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
		topic,
		&UntypedRecord{
			PartitionID: 1,
			Value: json.RawMessage(`{
				"resources": [
					{
						"resource": "Cg==",
						"resourceName": "test-id"
					}
				],
				"processesMetadata": [
					{
						"bpmnProcessID": "test-id",
						"version": 1,
						"processDefinitionKey": 2,
						"resourceName": "test-id",
						"checksum": "Cg==",
						"duplicate": false
					}
				],
				"decisionRequirementsMetadata": [],
				"decisionsMetadata": []
			}`),
			RejectionType:        RejectionTypeNullVal,
			RejectionReason:      "",
			SourceRecordPosition: 4,
			Key:                  5,
			Timestamp:            time.Now().UnixMilli(),
			Position:             6,
			ValueType:            ValueTypeDeployment,
			Intent:               intent,
			RecordType:           RecordTypeEvent,
			BrokerVersion:        "1.2.3",
		},
		touched,
		err,
	}
}

func newProcessTestRecord(
	name string,
	topic string,
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
		topic,
		&UntypedRecord{
			PartitionID: 1,
			Value: json.RawMessage(`{
				"bpmnProcessId": "test-id",
				"version": 1,
				"processDefinitionKey": 1,
				"resourceName": "test-id",
				"checksum": "Cg==",
				"resource": "Cg=="
			}`),
			RejectionType:        RejectionTypeNullVal,
			RejectionReason:      "",
			SourceRecordPosition: 4,
			Key:                  5,
			Timestamp:            time.Now().UnixMilli(),
			Position:             6,
			ValueType:            ValueTypeProcess,
			Intent:               intent,
			RecordType:           RecordTypeEvent,
			BrokerVersion:        "1.2.3",
		},
		touched,
		err,
	}
}

func newProcessInstanceTestRecord(
	name string,
	topic string,
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
		topic,
		&UntypedRecord{
			PartitionID: 1,
			Value: json.RawMessage(`{
				"bpmnProcessId": "test-id",
				"processInstanceKey": 1,
				"processDefinitionKey": 2,
				"elementId": "test-id",
				"flowScopeKey": -1,
				"bpmnEventType": "UNSPECIFIED",
				"parentProcessInstanceKey": -1,
				"parentElementInstanceKey": -1,
				"bpmnElementType": "PROCESS",
				"version": 1
			}`),
			RejectionType:        RejectionTypeNullVal,
			RejectionReason:      "",
			SourceRecordPosition: 4,
			Key:                  5,
			Timestamp:            time.Now().UnixMilli(),
			Position:             6,
			ValueType:            ValueTypeProcessInstance,
			Intent:               intent,
			RecordType:           RecordTypeEvent,
			BrokerVersion:        "1.2.3",
		},
		touched,
		err,
	}
}

func newVariableTestRecord(
	name string,
	topic string,
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
		topic,
		&UntypedRecord{
			PartitionID: 1,
			Value: json.RawMessage(`{
				"processInstanceKey": 1,
				"processDefinitionKey": 2,
				"bpmnProcessId": "test-id",
				"scopeKey": 3,
				"name": "testName",
				"value": "testValue"
			}`),
			RejectionType:        RejectionTypeNullVal,
			RejectionReason:      "",
			SourceRecordPosition: 4,
			Key:                  5,
			Timestamp:            time.Now().UnixMilli(),
			Position:             6,
			ValueType:            ValueTypeVariable,
			Intent:               intent,
			RecordType:           RecordTypeEvent,
			BrokerVersion:        "1.2.3",
		},
		touched,
		err,
	}
}

func newIncidentTestRecord(
	name string,
	topic string,
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
		topic,
		&UntypedRecord{
			PartitionID: 1,
			Value: json.RawMessage(`{
				"errorType": "EXTRACT_VALUE_ERROR",
				"errorMessage": "Some error",
				"bpmnProcessID": "test-id",
				"processInstanceKey": 1,
				"elementId": "Gateway_abcdefg",
				"elementInstanceKey": 10,
				"jobKey": -1,
				"processDefinitionKey": 2,
				"variableScopeKey": 3
			}`),
			RejectionType:        RejectionTypeNullVal,
			RejectionReason:      "",
			SourceRecordPosition: 4,
			Key:                  5,
			Timestamp:            time.Now().UnixMilli(),
			Position:             6,
			ValueType:            ValueTypeIncident,
			Intent:               intent,
			RecordType:           RecordTypeEvent,
			BrokerVersion:        "1.2.3",
		},
		touched,
		err,
	}
}

func newJobTestRecord(
	name string,
	topic string,
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
		topic,
		&UntypedRecord{
			PartitionID: 1,
			Value: json.RawMessage(`{
				"deadline": 1234567890,
				"processInstanceKey": 1,
				"retries": 2,
				"retryBackoff": 10,
				"recurringTime": 10,
				"processDefinitionVersion": 1,
				"processDefinitionKey": 2,
				"elementInstanceKey": 10,
				"elementId": "example-job",
				"errorMessage": "",
				"customHeaders": {},
				"bpmnProcessID": "test-id",
				"variables": {},
				"type": "example-job",
				"errorCode": "",
				"worker": "worker"
			}`),
			RejectionType:        RejectionTypeNullVal,
			RejectionReason:      "",
			SourceRecordPosition: 4,
			Key:                  5,
			Timestamp:            time.Now().UnixMilli(),
			Position:             6,
			ValueType:            ValueTypeJob,
			Intent:               intent,
			RecordType:           RecordTypeEvent,
			BrokerVersion:        "1.2.3",
		},
		touched,
		err,
	}
}

var errTest = errors.New("errTest")
var testData = []*testRecord{
	newDeploymentTestRecord(
		"DeploymentCreated",
		"zeebe-deployment",
		IntentCreated,
		[]string{"ProcessDeployed"},
		nil,
	),
	newDeploymentTestRecord(
		"DeploymentCreatedError",
		"zeebe-deployment",
		IntentCreated,
		[]string{"ProcessDeployed"},
		errTest,
	),

	newProcessTestRecord(
		"ProcessCreated",
		"zeebe-process",
		IntentCreated,
		nil,
		nil,
	),

	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivating",
		"zeebe-process-instance",
		IntentElementActivating,
		[]string{"AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivated",
		"zeebe-process-instance",
		IntentElementActivated,
		[]string{"ProcessInstanceActivated", "AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivatedError",
		"zeebe-process-instance",
		IntentElementActivated,
		[]string{"ProcessInstanceActivated", "AuditLogEventOccurred"},
		errTest,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompleting",
		"zeebe-process-instance",
		IntentElementCompleting,
		[]string{"AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompleted",
		"zeebe-process-instance",
		IntentElementCompleted,
		[]string{"ProcessInstanceCompleted", "AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompletedError",
		"zeebe-process-instance",
		IntentElementCompleted,
		[]string{"ProcessInstanceCompleted", "AuditLogEventOccurred"},
		errTest,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminating",
		"zeebe-process-instance",
		IntentElementTerminating,
		[]string{"AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminated",
		"zeebe-process-instance",
		IntentElementTerminated,
		[]string{"ProcessInstanceTerminated", "AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminatedError",
		"zeebe-process-instance",
		IntentElementTerminated,
		[]string{"ProcessInstanceTerminated", "AuditLogEventOccurred"},
		errTest,
	),

	newVariableTestRecord(
		"VariableCreated",
		"zeebe-variable",
		IntentCreated,
		[]string{"VariableCreated"},
		nil,
	),
	newVariableTestRecord(
		"VariableCreatedError",
		"zeebe-variable",
		IntentCreated,
		[]string{"VariableCreated"},
		errTest,
	),
	newVariableTestRecord(
		"VariableUpdated",
		"zeebe-variable",
		IntentUpdated,
		[]string{"VariableUpdated"},
		nil,
	),
	newVariableTestRecord(
		"VariableUpdatedError",
		"zeebe-variable",
		IntentUpdated,
		[]string{"VariableUpdated"},
		errTest,
	),

	newIncidentTestRecord(
		"IncidentCreated",
		"zeebe-incident",
		IntentCreated,
		[]string{"IncidentCreated"},
		nil,
	),
	newIncidentTestRecord(
		"IncidentCreatedError",
		"zeebe-incident",
		IntentCreated,
		[]string{"IncidentCreated"},
		errTest,
	),
	newIncidentTestRecord(
		"IncidentResolved",
		"zeebe-incident",
		IntentResolved,
		[]string{"IncidentResolved"},
		nil,
	),
	newIncidentTestRecord(
		"IncidentResolvedError",
		"zeebe-incident",
		IntentResolved,
		[]string{"IncidentResolved"},
		errTest,
	),

	newJobTestRecord(
		"JobCreated",
		"zeebe-job",
		IntentCreated,
		[]string{"JobCreated"},
		nil,
	),
	newJobTestRecord(
		"JobCreatedError",
		"zeebe-job",
		IntentCreated,
		[]string{"JobCreated"},
		errTest,
	),
	newJobTestRecord(
		"JobUpdated",
		"zeebe-job",
		IntentCompleted,
		[]string{"JobUpdated"},
		nil,
	),
	newJobTestRecord(
		"JobUpdatedError",
		"zeebe-job",
		IntentCompleted,
		[]string{"JobUpdated"},
		errTest,
	),
}

// Test creating and closing database updater successfully and processing a record.
func TestDatabaseUpdater(t *testing.T) {
	var wg sync.WaitGroup
	storer := newFixedErrStorer(nil)
	msgChannels := map[string]msgChannelType{}
	msgChannels["zeebe-process"] = make(msgChannelType)
	closeChannel := make(signalChannelType)

	updater := newDatabaseUpdater(storer, msgChannels, closeChannel, &wg)
	defer func() {
		// close closeChannel to make reads from it succeed (and return
		// nil)
		close(closeChannel)
		wg.Wait()
		// Note that this test will *hang* if it fails due to not
		// successfully closing all the goroutines!
	}()

	t.Run("UpdaterCreated", func(t *testing.T) {
		assert.NotNil(t, updater)
	})

	// Handle a record. We can't, really, see the results of the code path
	// we're exercising here, but we can exercise the path regardless.
	// Perhaps later we'll create a way to test this..?
	// Put in an empty JSON record - this is invalid and will cause an
	// error in handling, but errors in handling should not crash or
	// anything.
	msgChannels["zeebe-process"] <- []byte(`{}`)
}

// Automatically test that handlers hit all their intended storer functions.
func TestStoring(t *testing.T) {
	storer := newFixedErrStorer(nil)

	// We're not actually starting the goroutines so we can set the
	// channels and wg to nil and not worry about them
	updater := &storageUpdater{
		storer: storer,

		msgChannels:  nil,
		closeChannel: nil,

		wg: nil,
	}

	for _, r := range testData {
		t.Run(r.name, func(t *testing.T) {
			t.Cleanup(func() {
				// Reset err and the touched map after a test
				storer.reset()
			})
			storer.err = r.err
			// Pass it to the handling dispatcher (if the dispatch
			// does something wrong we'll likely touch the wrong
			// database updater at the end and fail that way)
			err := updater.handlingDispatch(r.topic, r.record)

			if r.err == nil {
				assert.NoError(t, err)
			} else {
				assert.ErrorContains(t, err, r.err.Error())
			}

			for _, touched := range r.touched {
				// Verify that we hit the updater functions we
				// were supposed to.
				assert.True(t, storer.touched[touched])
				delete(storer.touched, touched)
			}

			for _, value := range storer.touched {
				// Verify that we didn't hit any updater
				// functions we weren't supposed to.
				assert.False(t, value)
			}
		})

	}
}

func TestMissingDeploymentResource(t *testing.T) {
	storer := newFixedErrStorer(nil)
	updater := &storageUpdater{
		storer: storer,

		msgChannels:  nil,
		closeChannel: nil,

		wg: nil,
	}

	// Create a record that's otherwise processible but is missing
	// resources
	untypedRecord := &UntypedRecord{
		PartitionID: 1,
		Value: json.RawMessage(`{
			"resources": [],
			"processesMetadata": [
				{
					"bpmnProcessID": "test-id",
					"version": 1,
					"processDefinitionKey": 2,
					"resourceName": "test-id",
					"checksum": "Cg==",
					"duplicate": false
				}
			],
			"decisionRequirementsMetadata": [],
			"decisionsMetadata": []
		}`),
		RejectionType:        RejectionTypeNullVal,
		RejectionReason:      "",
		SourceRecordPosition: 4,
		Key:                  5,
		Timestamp:            time.Now().UnixMilli(),
		Position:             6,
		ValueType:            ValueTypeDeployment,
		Intent:               IntentCreated,
		RecordType:           RecordTypeEvent,
		BrokerVersion:        "1.2.3",
	}

	// There should be an error now
	err := updater.handlingDispatch("zeebe-deployment", untypedRecord)
	assert.ErrorContains(t, err, "resource not in map")
}

func TestDispatchInvalidRecord(t *testing.T) {
	storer := newFixedErrStorer(nil)
	updater := &storageUpdater{
		storer: storer,

		msgChannels:  nil,
		closeChannel: nil,

		wg: nil,
	}

	// Pass in a zero-value record; this should fail and not hit topic
	// handling at all
	err := updater.handlingDispatch("invalid-topic", &UntypedRecord{})
	assert.ErrorContains(t, err, "zero-value value type in record")
}

// Test that a value type in the incorrect topic breaks
func TestValueTypeInWrongTopic(t *testing.T) {
	storer := newFixedErrStorer(nil)
	updater := &storageUpdater{
		storer: storer,

		msgChannels:  nil,
		closeChannel: nil,

		wg: nil,
	}

	// First create two records we'll use for this
	// Job for all the non-job topics
	r := newJobTestRecord(
		"Job",
		"zeebe-job",
		IntentCreated,
		[]string{"JobCreated"},
		nil,
	)
	// process instnce for the others
	r2 := newProcessInstanceTestRecord(
		"JobInstance",
		"zeebe-process-instance",
		IntentCreated,
		[]string{"ProcessInstanceCreated"},
		nil,
	)

	topics := []string{
		"zeebe-deployment",
		"zeebe-process",
		"zeebe-process-instance",
		"zeebe-variable",
		"zeebe-incident",
		"zeebe-job",
	}

	for _, topic := range topics {
		t.Run(topic, func(t *testing.T) {
			t.Cleanup(func() {
				// Reset err and the touched map after a test
				storer.reset()
			})

			if topic != r.topic {
				err := updater.handlingDispatch(topic, r.record)
				assert.ErrorContains(t, err, "failed to cast")
			} else {
				// for the one other topic use r2 instead
				err := updater.handlingDispatch(topic, r2.record)
				assert.ErrorContains(t, err, "failed to cast")
			}
		})

	}
}
