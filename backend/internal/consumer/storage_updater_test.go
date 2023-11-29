package consumer

import (
	"encoding/json"
	"errors"
	"sync"
	"testing"
	"time"
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

// Test creating and closing database updater successfully.
func TestNewDatabaseUpdater(t *testing.T) {
	var wg sync.WaitGroup
	storer := &fixedErrStorer{map[string]bool{}, nil}
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

	if updater == nil {
		t.Errorf("Updater was nil")
	}
}

type testRecord struct {
	name    string
	record  *UntypedRecord
	touched string
	err     error
}

func newProcessInstanceTestRecord(
	name string,
	intent Intent,
	touched string,
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
	touched string,
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

var testError = errors.New("testError")
var testData = []*testRecord{
	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivating",
		IntentElementActivating,
		"",
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivated",
		IntentElementActivated,
		"ProcessInstanceActivated",
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementActivatedError",
		IntentElementActivated,
		"ProcessInstanceActivated",
		testError,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompleting",
		IntentElementCompleting,
		"",
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompleted",
		IntentElementCompleted,
		"ProcessInstanceCompleted",
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementCompletedError",
		IntentElementCompleted,
		"ProcessInstanceCompleted",
		testError,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminating",
		IntentElementTerminating,
		"",
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminated",
		IntentElementTerminated,
		"ProcessInstanceTerminated",
		nil,
	),
	newProcessInstanceTestRecord(
		"ProcessInstanceElementTerminatedError",
		IntentElementTerminated,
		"ProcessInstanceTerminated",
		testError,
	),

	newVariableTestRecord(
		"VariableCreated",
		IntentCreated,
		"VariableCreated",
		nil,
	),
	newVariableTestRecord(
		"VariableCreatedError",
		IntentCreated,
		"VariableCreated",
		testError,
	),
	newVariableTestRecord(
		"VariableUpdated",
		IntentUpdated,
		"VariableUpdated",
		nil,
	),
	newVariableTestRecord(
		"VariableUpdatedError",
		IntentUpdated,
		"VariableUpdated",
		testError,
	),
}

// Automatically test that handlers hit all their intended storer functions.
func TestStoring(t *testing.T) {
	storer := newFixedErrStorer(nil)

	// We're not actually starting the goroutines so we can set the
	// channels and wg to nil and not worry about them
	updater := &storageUpdater{
		storer: storer,

		msgChannel: nil,
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

			if (r.err == nil) && (err != nil) {
				t.Errorf("Unexpected handler error: %v", err)
			} else if (r.err != nil) && (err == nil) {
				t.Errorf("Expected error but got nil")
			}

			if r.touched != "" {
				// The value will be the zero value (bool) if
				// the key doesn't exist so this will work
				// without the ok check
				if !storer.touched[r.touched] {
					t.Errorf("Didn't touch %v", r.touched)
				}
			}

			for key, value := range storer.touched {
				// Fail if we hit the wrong updater function
				if (key != r.touched) && value {
					t.Errorf("Touched %v", key)
				}
			}
		})

	}
}
