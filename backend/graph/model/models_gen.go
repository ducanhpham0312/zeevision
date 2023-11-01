// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package model

type Instance struct {
	ActiveInstances    int64  `json:"activeInstances"`
	BpmnLiveStatus     string `json:"bpmnLiveStatus"`
	BpmnResource       string `json:"bpmnResource"`
	CompletedInstances int64  `json:"completedInstances"`
	DeploymentTime     string `json:"deploymentTime"`
	ProcessID          int64  `json:"processId"`
	ProcessKey         int64  `json:"processKey"`
	Version            int64  `json:"version"`
}

type MessageSubscription struct {
	CreatedAt   string `json:"createdAt"`
	ElementID   int64  `json:"elementId"`
	MessageName string `json:"messageName"`
	Status      string `json:"status"`
}

type Process struct {
	BpmnLiveStatus       string                 `json:"bpmnLiveStatus"`
	BpmnResource         string                 `json:"bpmnResource"`
	DeploymentTime       string                 `json:"deploymentTime"`
	Instances            []*Instance            `json:"instances"`
	MessageSubscriptions []*MessageSubscription `json:"messageSubscriptions"`
	ProcessID            int64                  `json:"processId"`
	ProcessKey           int64                  `json:"processKey"`
	Timers               []*Timer               `json:"timers"`
	Version              int64                  `json:"version"`
}

type Timer struct {
	DueDate            string `json:"dueDate"`
	ProcessInstanceKey int64  `json:"processInstanceKey"`
	Repetitions        string `json:"repetitions"`
	StartTime          string `json:"startTime"`
	Status             string `json:"status"`
}