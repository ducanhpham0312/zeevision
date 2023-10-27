package handler

import "encoding/json"

type ProcessesHandler struct{}

func (h *ProcessesHandler) HandleRequest(req Request) (any, error) {
	var processesReq ProcessesRequest
	err := json.Unmarshal(req.Payload, &processesReq)
	if err != nil {
		return struct{}{}, err
	}

	return dummyProcesses, nil
}

type ProcessesRequest struct{}

type ProcessesResponse struct {
	Processes []ProcessesProcess `json:"processes"`
}

type ProcessesProcess struct {
	ProcessKey     int64  `json:"processKey"`
	ProcessID      int64  `json:"processId"`
	Version        int64  `json:"version"`
	BpmnLiveStatus string `json:"bpmnLiveStatus"`
	BpmnResource   string `json:"bpmnResource"`
	DeploymentTime string `json:"deploymentTime"`
}

type ProcessesProcessInstance struct {
	InstanceID int64  `json:"instanceId"`
	State      string `json:"state"`
	CreatedAt  string `json:"createdAt"`
}
