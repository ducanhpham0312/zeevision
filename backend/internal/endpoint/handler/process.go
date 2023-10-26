package handler

import (
	"encoding/json"
	"fmt"

	"golang.org/x/exp/slices"
)

type ProcessHandler struct{}

func (h *ProcessHandler) HandleRequest(req Request) (any, error) {
	var processReq ProcessRequest
	err := json.Unmarshal(req.Payload, &processReq)
	if err != nil {
		return struct{}{}, err
	}

	idx := slices.IndexFunc(dummyProcesses, func(p ProcessResponse) bool {
		return p.ProcessId == processReq.ID
	})
	if idx == -1 {
		return struct{}{}, fmt.Errorf("process with id %d not found", processReq.ID)
	}

	return dummyProcesses[idx], nil
}

type ProcessRequest struct {
	ID int64 `json:"id"`
}

type ProcessResponse struct {
	ProcessKey           int64                        `json:"processKey"`
	ProcessId            int64                        `json:"processId"`
	Version              int64                        `json:"version"`
	BpmnLiveStatus       string                       `json:"bpmnLiveStatus"`
	BpmnResource         string                       `json:"bpmnResource"`
	DeploymentTime       string                       `json:"deploymentTime"`
	Instances            []ProcessInstance            `json:"instances"`
	MessageSubscriptions []ProcessMessageSubscription `json:"messageSubscriptions"`
	Timers               []ProcessTimer               `json:"timers"`
}

type ProcessInstance struct {
	ProcessKey       int64  `json:"processKey"`
	ProcessId        int64  `json:"processId"`
	Version          int64  `json:"version"`
	BpmnLiveStatus   string `json:"bpmnLiveStatus"`
	ActiveInstances  int64  `json:"activeInstances"`
	PassiveInstances int64  `json:"passiveInstances"`
	BpmnResource     string `json:"bpmnResource"`
	DeploymentTime   string `json:"deploymentTime"`
}

type ProcessMessageSubscription struct {
	ElementID   int64  `json:"elementID"`
	MessageName string `json:"messageName"`
	Status      string `json:"status"`
	CreatedAt   string `json:"createdAt"`
}

type ProcessTimer struct {
	InstanceKey int64  `json:"instanceKey"`
	DueDate     string `json:"dueDate"`
	Repetition  int64  `json:"repetition"`
	Status      string `json:"status"`
	StartTime   string `json:"startTime"`
}
