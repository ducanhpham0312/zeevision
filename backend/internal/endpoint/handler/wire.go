package handler

import (
	"encoding/json"
	"fmt"
)

type ResourceType string

const (
	ResourceProcess   ResourceType = "process"
	ResourceProcesses ResourceType = "processes"
)

type Request struct {
	CorrelationId string          `json:"correlationId"`
	ResourceType  ResourceType    `json:"resourceType"`
	Payload       json.RawMessage `json:"payload"`
}

type Response struct {
	CorrelationId string `json:"correlationId"`
	Payload       any    `json:"payload"`
}

func NewErrorResponse(correlationId string, err error) Response {
	return Response{
		CorrelationId: correlationId,
		Payload: map[string]string{
			"error": err.Error(),
		},
	}
}

type Handler interface {
	// TODO: take in a context.Context for cancellation
	HandleRequest(Request) (any, error)
}

type HandlerMux struct {
	handlers map[ResourceType]Handler
}

func NewHandlerMux() *HandlerMux {
	return &HandlerMux{
		handlers: map[ResourceType]Handler{
			ResourceProcesses: &ProcessesHandler{},
			ResourceProcess:   &ProcessHandler{},
		},
	}
}

func (m *HandlerMux) HandleRequest(msg []byte) Response {
	var req Request
	if err := json.Unmarshal(msg, &req); err != nil {
		return NewErrorResponse("", fmt.Errorf("unable to unmarshal request: %w", err))
	}

	handler, ok := m.handlers[req.ResourceType]
	if !ok {
		return NewErrorResponse(req.CorrelationId, fmt.Errorf("unknown resource type %q", req.ResourceType))
	}

	respPayload, err := handler.HandleRequest(req)
	if err != nil {
		return NewErrorResponse(req.CorrelationId, err)
	}

	return Response{
		CorrelationId: req.CorrelationId,
		Payload:       respPayload,
	}
}

var dummyProcesses = []ProcessResponse{
	{
		ProcessKey:           1,
		ProcessId:            123,
		Version:              1,
		BpmnLiveStatus:       "alive",
		BpmnResource:         "a8s7dft87agvsdf=",
		DeploymentTime:       "2023-01-01T00:00:00Z",
		Instances:            []ProcessInstance{},
		MessageSubscriptions: []ProcessMessageSubscription{},
		Timers:               []ProcessTimer{},
	},
	{
		ProcessKey:           2,
		ProcessId:            222,
		Version:              3,
		BpmnLiveStatus:       "dead",
		BpmnResource:         "a7s6dtf7aiw3=",
		DeploymentTime:       "2022-01-01T00:00:00Z",
		Instances:            []ProcessInstance{},
		MessageSubscriptions: []ProcessMessageSubscription{},
		Timers:               []ProcessTimer{},
	},
}
