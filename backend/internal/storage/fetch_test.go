package storage

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

var expectedInstances = []Instance{
	{
		ProcessInstanceKey:   10,
		ProcessDefinitionKey: 1,
		Status:               "ACTIVE",
	},
	{
		ProcessInstanceKey:   20,
		ProcessDefinitionKey: 2,
		Status:               "COMPLETED",
	},
}

var expectedProcesses = []Process{
	{
		ProcessDefinitionKey: 1,
		BpmnProcessID:        "process1",
		Instances:            expectedInstances,
	},
	{
		ProcessDefinitionKey: 2,
		BpmnProcessID:        "process2",
		Instances:            []Instance{},
	},
}

var expectedJobs = []Job{
	{
		ElementID:          "element-1",
		Key:                1,
		Type:               "type-1",
		Retries:            1,
		Worker:             "worker-1",
		State:              "state-1",
		ProcessInstanceKey: 10,
	},
	{
		ElementID:          "element-2",
		Key:                2,
		Type:               "type-2",
		Retries:            2,
		Worker:             "worker-2",
		State:              "state-2",
		ProcessInstanceKey: 10,
	},
	{
		ElementID:          "element-3",
		Key:                3,
		Type:               "type-3",
		Retries:            3,
		Worker:             "worker-3",
		State:              "state-3",
		ProcessInstanceKey: 20,
	},
}

var expectedIncidents = []Incident{
	{
		Key:                1,
		ProcessInstanceKey: 10,
		ElementID:          "element-1",
		ErrorType:          "error-type-1",
		ErrorMessage:       "error-message-1",
		State:              "state-1",
	},
	{
		Key:                2,
		ProcessInstanceKey: 20,
		ElementID:          "element-2",
		ErrorType:          "error-type-2",
		ErrorMessage:       "error-message-2",
		State:              "state-2",
	},
	{
		Key:                3,
		ProcessInstanceKey: 20,
		ElementID:          "element-3",
		ErrorType:          "error-type-3",
		ErrorMessage:       "error-message-3",
		State:              "state-3",
	},
}

var expectedAuditLogs = []AuditLog{
	{
		ProcessInstanceKey: 10,
		ElementID:          "element-1",
		ElementType:        "type-1",
		Intent:             "intent-1",
		Position:           3,
	},
	{
		ProcessInstanceKey: 10,
		ElementID:          "element-2",
		ElementType:        "type-2",
		Intent:             "intent-2",
		Position:           2,
	},
	{
		ProcessInstanceKey: 20,
		ElementID:          "element-3",
		ElementType:        "type-3",
		Intent:             "intent-3",
		Position:           1,
	},
}

var expectedVariables = []Variable{
	{
		ProcessInstanceKey: 10,
		Name:               "name-1",
		Value:              "value-1",
	},
	{
		ProcessInstanceKey: 10,
		Name:               "name-2",
		Value:              "value-2",
	},
	{
		ProcessInstanceKey: 10,
		Name:               "name-3",
		Value:              "value-3",
	},
	{
		ProcessInstanceKey: 20,
		Name:               "name-4",
		Value:              "value-4",
	},
}

func TestBpmnResourceQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedBpmnResource := BpmnResource{
		ProcessDefinitionKey: 1,
		BpmnFile:             "test",
	}
	err := db.Create(&expectedBpmnResource).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name          string
		processDefKey int64
		expectedErr   string
	}{
		{
			name:          "existing bpmn resource",
			processDefKey: expectedBpmnResource.ProcessDefinitionKey,
		},
		{
			name:          "non-existent bpmn resource",
			processDefKey: 123,
			expectedErr:   "record not found",
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			bpmnResource, err := fetcher.GetBpmnResource(context.Background(), test.processDefKey)

			if test.expectedErr != "" {
				assert.EqualError(t, err, test.expectedErr)
				return
			}
			assert.NoError(t, err)

			assert.Equal(t, expectedBpmnResource, bpmnResource)
		})
	}
}

func TestInstanceQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedInstance := expectedInstances[0]
	err := db.Create(&expectedInstance).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name        string
		instanceKey int64
		expectedErr string
	}{
		{
			name:        "existing instance",
			instanceKey: expectedInstance.ProcessInstanceKey,
		},
		{
			name:        "non-existent instance",
			instanceKey: 123,
			expectedErr: "record not found",
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			instance, err := fetcher.GetInstance(context.Background(), test.instanceKey)

			if test.expectedErr != "" {
				assert.EqualError(t, err, test.expectedErr)
				return
			}
			assert.NoError(t, err)

			assert.Equal(t, expectedInstance, instance)
		})
	}
}

func TestInstancesQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedInstances).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	instances, err := fetcher.GetInstances(context.Background(), nil)
	assert.NoError(t, err)

	assert.Len(t, instances.Items, 2)
	for i := range instances.Items {
		assert.Equal(t, expectedInstances[i], instances.Items[i])
	}
}

func TestInstancesForProcessQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedProcesses).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name          string
		processDefKey int64
		instances     []Instance
	}{
		{
			name:          "existing process",
			processDefKey: 1,
			instances:     expectedInstances,
		},
		{
			name:          "non-existent process",
			processDefKey: 2,
			instances:     []Instance{},
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			instances, err := fetcher.GetInstancesForProcess(context.Background(), nil, test.processDefKey)
			assert.NoError(t, err)

			assert.Len(t, instances.Items, len(test.instances))
			for i := range instances.Items {
				assert.Equal(t, test.instances[i], instances.Items[i])
			}
		})
	}
}

func TestProcessesQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedProcesses).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	processes, err := fetcher.GetProcesses(context.Background(), nil)
	assert.NoError(t, err)

	assert.Len(t, processes.Items, 2)
	for i := range processes.Items {
		assert.Equal(t, expectedProcesses[i].ProcessDefinitionKey, processes.Items[i].ProcessDefinitionKey)
	}
}

func TestProcessQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedProcess := expectedProcesses[0]
	err := db.Create(&expectedProcess).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name          string
		processDefKey int64
		expectedErr   string
	}{
		{
			name:          "existing process",
			processDefKey: expectedProcess.ProcessDefinitionKey,
		},
		{
			name:          "non-existent process",
			processDefKey: 123,
			expectedErr:   "record not found",
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			process, err := fetcher.GetProcess(context.Background(), test.processDefKey)

			if test.expectedErr != "" {
				assert.EqualError(t, err, test.expectedErr)
				return
			}
			assert.NoError(t, err)

			assert.Equal(t, expectedProcess.ProcessDefinitionKey, process.ProcessDefinitionKey)
		})
	}
}

func TestJobsQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedJobs).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	jobs, err := fetcher.GetJobs(context.Background(), nil)
	assert.NoError(t, err)

	assert.Len(t, jobs.Items, 3)
	for i := range jobs.Items {
		assert.Equal(t, expectedJobs[i], jobs.Items[i])
	}
}

func TestJobsForInstanceQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedJobs).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name        string
		instanceKey int64
		jobs        []Job
	}{
		{
			name:        "instance with two jobs",
			instanceKey: 10,
			jobs:        expectedJobs[0:2],
		},
		{
			name:        "instance with one job",
			instanceKey: 20,
			jobs:        expectedJobs[2:3],
		},
		{
			name:        "instance with no jobs",
			instanceKey: 40,
			jobs:        []Job{},
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			jobs, err := fetcher.GetJobsForInstance(context.Background(), nil, test.instanceKey)
			assert.NoError(t, err)

			assert.Len(t, jobs.Items, len(test.jobs))
			for i := range jobs.Items {
				assert.Equal(t, test.jobs[i], jobs.Items[i])
			}
		})
	}
}

func TestIncidentsQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	fetcher := NewFetcher(db)

	err := db.Create(expectedIncidents).Error
	assert.NoError(t, err)

	incidents, err := fetcher.GetIncidents(context.Background(), nil)
	assert.NoError(t, err)

	assert.Len(t, incidents.Items, len(expectedIncidents))
	for i := range incidents.Items {
		assert.Equal(t, expectedIncidents[i], incidents.Items[i])
	}
}

func TestIncidentsForInstanceQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()

	fetcher := NewFetcher(testDb.DB())

	err := testDb.DB().Create(expectedIncidents).Error
	assert.NoError(t, err)

	tests := []struct {
		name        string
		instanceKey int64
		incidents   []Incident
	}{
		{
			name:        "instance with one incident",
			instanceKey: 10,
			incidents:   expectedIncidents[:1],
		},
		{
			name:        "instance with two incidents",
			instanceKey: 20,
			incidents:   expectedIncidents[1:3],
		},
		{
			name:        "instance with no incidents",
			instanceKey: 30,
			incidents:   []Incident{},
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			incidents, err := fetcher.GetIncidentsForInstance(context.Background(), nil, test.instanceKey)
			assert.NoError(t, err)

			assert.Len(t, incidents.Items, len(test.incidents))
			for i := range incidents.Items {
				assert.Equal(t, test.incidents[i], incidents.Items[i])
			}
		})
	}
}

func TestVariablesForInstanceQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	expectedVariables := []Variable{
		{
			ProcessInstanceKey: 10,
			Name:               "proc-1-name-1",
			Value:              "proc-1-value-1",
		},
		{
			ProcessInstanceKey: 10,
			Name:               "proc-1-name-2",
			Value:              "proc-1-value-2",
		},
		{
			ProcessInstanceKey: 20,
			Name:               "proc-2-name-1",
			Value:              "proc-2-value-1",
		},
	}
	err := db.Create(expectedVariables).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name        string
		instanceKey int64
		variables   []Variable
	}{
		{
			name:        "instance with two variables",
			instanceKey: expectedVariables[0].ProcessInstanceKey,
			variables:   expectedVariables[:2],
		},
		{
			name:        "instance with one variable",
			instanceKey: expectedVariables[2].ProcessInstanceKey,
			variables:   expectedVariables[2:],
		},
		{
			name:        "instance with no variables",
			instanceKey: 30,
			variables:   []Variable{},
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			variables, err := fetcher.GetVariablesForInstance(context.Background(), nil, nil, test.instanceKey)
			assert.NoError(t, err)

			assert.Len(t, variables.Items, len(test.variables))
			for i := range variables.Items {
				assert.Equal(t, test.variables[i], variables.Items[i])
			}
		})
	}
}

func TestFilterVariableName(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedVariables).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name      string
		filter    *Filter
		variables []Variable
	}{
		{
			name: "is filter",
			filter: &Filter{
				Input: "name-1",
				Type:  FilterTypeIs,
			},
			variables: expectedVariables[:1],
		},
		{
			name: "is filter no items",
			filter: &Filter{
				Input: "name-4",
				Type:  FilterTypeIs,
			},
			variables: []Variable{},
		},
		{
			name: "is not filter",
			filter: &Filter{
				Input: "name-1",
				Type:  FilterTypeIsNot,
			},
			variables: expectedVariables[1:3],
		},
		{
			name: "is not filter no items",
			filter: &Filter{
				Input: "name",
				Type:  FilterTypeIsNot,
			},
			variables: expectedVariables[:3],
		},
		{
			name: "contains filter",
			filter: &Filter{
				Input: "name",
				Type:  FilterTypeContains,
			},
			variables: expectedVariables[:3],
		},
		{
			name: "contains filter single item",
			filter: &Filter{
				Input: "2",
				Type:  FilterTypeContains,
			},
			variables: expectedVariables[1:2],
		},
		{
			name: "contains filter no items",
			filter: &Filter{
				Input: "4",
				Type:  FilterTypeContains,
			},
			variables: []Variable{},
		},
		{
			name:      "nil filter",
			filter:    nil,
			variables: expectedVariables[:3],
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			variables, err := fetcher.GetVariablesForInstance(context.Background(), nil, test.filter, 10)
			assert.NoError(t, err)

			assert.Len(t, variables.Items, len(test.variables))
			for i := range variables.Items {
				assert.Equal(t, test.variables[i], variables.Items[i])
			}
		})
	}
}

func TestAuditLogsForInstanceQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	fetcher := NewFetcher(db)

	err := db.Create(expectedAuditLogs).Error
	assert.NoError(t, err)

	tests := []struct {
		name        string
		instanceKey int64
		auditLogs   []AuditLog
	}{
		{
			name:        "instance with two audit logs",
			instanceKey: expectedAuditLogs[0].ProcessInstanceKey,
			auditLogs:   expectedAuditLogs[:2],
		},
		{
			name:        "instance with one audit log",
			instanceKey: expectedAuditLogs[2].ProcessInstanceKey,
			auditLogs:   expectedAuditLogs[2:],
		},
		{
			name:        "instance with no audit logs",
			instanceKey: 30,
			auditLogs:   []AuditLog{},
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			auditLogs, err := fetcher.GetAuditLogsForInstance(context.Background(), nil, test.instanceKey)
			assert.NoError(t, err)

			assert.Len(t, auditLogs.Items, len(test.auditLogs))
			for i := range auditLogs.Items {
				assert.Equal(t, test.auditLogs[i], auditLogs.Items[i])
			}
		})
	}
}

func TestPaginatedQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()
	db := testDb.DB()

	err := db.Create(expectedJobs).Error
	assert.NoError(t, err)

	fetcher := NewFetcher(db)

	tests := []struct {
		name       string
		pagination *Pagination
		results    []Job
	}{
		{
			name:       "first item",
			pagination: &Pagination{Offset: 0, Limit: 1},
			results:    expectedJobs[:1],
		},
		{
			name:       "first two items",
			pagination: &Pagination{Offset: 0, Limit: 2},
			results:    expectedJobs[:2],
		},
		{
			name:       "second item",
			pagination: &Pagination{Offset: 1, Limit: 1},
			results:    expectedJobs[1:2],
		},
		{
			name:       "less items than limit",
			pagination: &Pagination{Offset: 2, Limit: 2},
			results:    expectedJobs[2:3],
		},
		{
			name:       "large offset",
			pagination: &Pagination{Offset: 100, Limit: 1},
			results:    []Job{},
		},
		{
			name:       "large limit",
			pagination: &Pagination{Offset: 0, Limit: 100},
			results:    expectedJobs,
		},
		{
			name:       "no pagination with nil",
			pagination: nil,
			results:    expectedJobs,
		},
		{
			name:       "no pagination with magic numbers",
			pagination: &Pagination{Offset: -1, Limit: -1},
			results:    expectedJobs,
		},
	}

	for _, test := range tests {
		// Capture range variable.
		test := test
		t.Run(test.name, func(t *testing.T) {
			jobs, err := fetcher.GetJobs(context.Background(), test.pagination)
			assert.NoError(t, err)

			assert.Equal(t, int64(3), jobs.TotalCount)

			assert.Len(t, jobs.Items, len(test.results))
			for i := range jobs.Items {
				assert.Equal(t, test.results[i], jobs.Items[i])
			}
		})
	}
}

func TestCancelQuery(t *testing.T) {
	testDb := newMigratedTestDB(t)
	defer func() {
		assert.NoError(t, testDb.Rollback())
	}()

	fetcher := NewFetcher(testDb.DB())

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	_, err := fetcher.GetProcesses(ctx, nil)
	assert.EqualError(t, err, "context canceled")
}
