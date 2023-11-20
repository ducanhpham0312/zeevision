package graph

import "github.com/ducanhpham0312/zeevision/backend/graph/model"

var dummyInstances = []*model.Instance{
	{
		//nolint:gomnd
		InstanceKey: 12345,
		BpmnProcessID:   "multi-instance-process",
		Status:      "Active",
		StartTime:   "2023-01-02T00:00:00Z",
	},
	{
		//nolint:gomnd
		InstanceKey: 54321,
		BpmnProcessID:   "money-loan",
		Status:      "Completed",
		StartTime:   "2023-01-01T00:15:00Z",
	},
	{
		//nolint:gomnd
		InstanceKey: 55555,
		BpmnProcessID:   "order-main",
		Status:      "Completed",
		StartTime:   "2023-01-08T00:15:00Z",
	},
}
