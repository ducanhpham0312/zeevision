package graph

import "github.com/ducanhpham0312/zeevision/backend/graph/model"

var dummyProcesses = []*model.Process{
	{
		ProcessKey:           1,
		ProcessID:            123,
		Version:              1,
		BpmnLiveStatus:       "alive",
		BpmnResource:         "a8s7dft87agvsdf=",
		DeploymentTime:       "2023-01-01T00:00:00Z",
		Instances:            []*model.Instance{},
		MessageSubscriptions: []*model.MessageSubscription{},
		Timers:               []*model.Timer{},
	},
	{
		ProcessKey:           2,
		ProcessID:            222,
		Version:              3,
		BpmnLiveStatus:       "dead",
		BpmnResource:         "a7s6dtf7aiw3=",
		DeploymentTime:       "2023-01-01T00:00:00Z",
		Instances:            []*model.Instance{},
		MessageSubscriptions: []*model.MessageSubscription{},
		Timers:               []*model.Timer{},
	},
}
