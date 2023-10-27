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

// Incoming JSON request.
type Request struct {
	// Correlation ID for matching request and response.
	CorrelationID string `json:"correlationId"`
	// Resource type for the request. Determines contents of payload
	// on success.
	ResourceType ResourceType `json:"resourceType"`
	// JSON payload for the request.
	Payload json.RawMessage `json:"payload"`
}

// Outgoing JSON response.
type Response struct {
	// Correlation ID for matching request and response.
	CorrelationID string `json:"correlationId"`
	// Any payload which is serializable to JSON.
	Payload any `json:"payload"`
}

// Create a new structured error response.
func NewErrorResponse(correlationID string, err error) Response {
	return Response{
		CorrelationID: correlationID,
		Payload: map[string]string{
			"error": err.Error(),
		},
	}
}

// Handler for incoming requests. All handlers must implement this
// interface.
//
// Handler must be safe to use concurrently for simultaneous requests.
type Handler interface {
	// TODO: take in a context.Context for cancellation
	HandleRequest(Request) (any, error)
}

// Mux is a multiplexer for incoming requests. It routes requests
// to the appropriate handler based on the resource type.
type Mux struct {
	handlers map[ResourceType]Handler
}

func NewMux() *Mux {
	return &Mux{
		handlers: map[ResourceType]Handler{
			ResourceProcesses: &ProcessesHandler{},
			ResourceProcess:   &ProcessHandler{},
		},
	}
}

func (m *Mux) HandleRequest(msg []byte) Response {
	var req Request
	if err := json.Unmarshal(msg, &req); err != nil {
		return NewErrorResponse("", fmt.Errorf("unable to unmarshal request: %w", err))
	}

	handler, ok := m.handlers[req.ResourceType]
	if !ok {
		return NewErrorResponse(req.CorrelationID, fmt.Errorf("unknown resource type %q", req.ResourceType))
	}

	respPayload, err := handler.HandleRequest(req)
	if err != nil {
		return NewErrorResponse(req.CorrelationID, err)
	}

	return Response{
		CorrelationID: req.CorrelationID,
		Payload:       respPayload,
	}
}

var dummyProcesses = []ProcessResponse{
	{
		ProcessKey:           1,
		ProcessID:            123,
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
		ProcessID:            222,
		Version:              3,
		BpmnLiveStatus:       "dead",
		BpmnResource:         "a7s6dtf7aiw3=",
		DeploymentTime:       "2022-01-01T00:00:00Z",
		Instances:            []ProcessInstance{},
		MessageSubscriptions: []ProcessMessageSubscription{},
		Timers:               []ProcessTimer{},
	},
}
