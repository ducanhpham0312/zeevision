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

type testRecord struct {
	name    string
	record  *UntypedRecord
	touched []string
	err     error
}

func newDeploymentTestRecord(
	name string,
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
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
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
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
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
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
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
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
	intent Intent,
	touched []string,
	err error,
) *testRecord {
	return &testRecord{
		name,
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

var errTest = errors.New("errTest")
var testData = []*testRecord{
	newDeploymentTestRecord(
		"DeploymentCreated",
		IntentCreated,
		[]string{"ProcessDeployed"},
		nil,
	),
	newDeploymentTestRecord(
		"DeploymentCreatedError",
		IntentCreated,
		[]string{"ProcessDeployed"},
		errTest,
	),

	newProcessTestRecord(
		"ProcessCreated",
		IntentCreated,
		nil,
		nil,
	),

	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivating",
		IntentElementActivating,
		[]string{"AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivated",
		IntentElementActivated,
		[]string{"ProcessInstanceActivated", "AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivatedError",
		IntentElementActivated,
		[]string{"ProcessInstanceActivated", "AuditLogEventOccurred"},
		errTest,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompleting",
		IntentElementCompleting,
		[]string{"AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompleted",
		IntentElementCompleted,
		[]string{"ProcessInstanceCompleted", "AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompletedError",
		IntentElementCompleted,
		[]string{"ProcessInstanceCompleted", "AuditLogEventOccurred"},
		errTest,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminating",
		IntentElementTerminating,
		[]string{"AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminated",
		IntentElementTerminated,
		[]string{"ProcessInstanceTerminated", "AuditLogEventOccurred"},
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminatedError",
		IntentElementTerminated,
		[]string{"ProcessInstanceTerminated", "AuditLogEventOccurred"},
		errTest,
	),

	newVariableTestRecord(
		"VariableCreated",
		IntentCreated,
		[]string{"VariableCreated"},
		nil,
	),
	newVariableTestRecord(
		"VariableCreatedError",
		IntentCreated,
		[]string{"VariableCreated"},
		errTest,
	),
	newVariableTestRecord(
		"VariableUpdated",
		IntentUpdated,
		[]string{"VariableUpdated"},
		nil,
	),
	newVariableTestRecord(
		"VariableUpdatedError",
		IntentUpdated,
		[]string{"VariableUpdated"},
		errTest,
	),

	newIncidentTestRecord(
		"IncidentCreated",
		IntentCreated,
		[]string{"IncidentCreated"},
		nil,
	),
	newIncidentTestRecord(
		"IncidentCreatedError",
		IntentCreated,
		[]string{"IncidentCreated"},
		errTest,
	),
	newIncidentTestRecord(
		"IncidentResolved",
		IntentResolved,
		[]string{"IncidentResolved"},
		nil,
	),
	newIncidentTestRecord(
		"IncidentResolvedError",
		IntentResolved,
		[]string{"IncidentResolved"},
		errTest,
	),
}

// Test creating and closing database updater successfully and processing a record.
func TestDatabaseUpdater(t *testing.T) {
	var wg sync.WaitGroup
	storer := newFixedErrStorer(nil)
	msgChannel := make(msgChannelType)
	closeChannel := make(signalChannelType)

	updater := newDatabaseUpdater(storer, msgChannel, closeChannel, &wg)
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
	msgChannel <- []byte(`{}`)
}

// Automatically test that handlers hit all their intended storer functions.
func TestStoring(t *testing.T) {
	storer := newFixedErrStorer(nil)

	// We're not actually starting the goroutines so we can set the
	// channels and wg to nil and not worry about them
	updater := &storageUpdater{
		storer: storer,

		msgChannel:   nil,
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
			err := updater.handlingDispatch(r.record)

			if r.err == nil {
				assert.NoError(t, err)
			} else {
				assert.ErrorContains(t, err, r.err.Error())
			}

			if r.touched != nil {
				for i := range r.touched {
					// The value will be the zero value (bool) if
					// the key doesn't exist so this will work
					// without the ok check
					assert.True(t, storer.touched[r.touched[i]])
				}
			}

		wrongTouchLoop:
			for key, value := range storer.touched {
				// Fail if we hit the wrong updater function
				for i := range r.touched {
					if key == r.touched[i] {
						continue wrongTouchLoop
					}
				}
				// If we fell through the loop, we didn't hit a continue
				assert.False(t, value)
			}
		})

	}
}

func TestMissingDeploymentResource(t *testing.T) {
	storer := newFixedErrStorer(nil)
	updater := &storageUpdater{
		storer: storer,

		msgChannel:   nil,
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
	err := updater.handlingDispatch(untypedRecord)
	assert.ErrorContains(t, err, "resource not in map")
}

func TestDispatchInvalidRecord(t *testing.T) {
	storer := newFixedErrStorer(nil)
	updater := &storageUpdater{
		storer: storer,

		msgChannel:   nil,
		closeChannel: nil,

		wg: nil,
	}

	// Pass in a zero-value record; this should fail
	err := updater.handlingDispatch(&UntypedRecord{})
	assert.ErrorContains(t, err, "zero-value value type in record")
}
