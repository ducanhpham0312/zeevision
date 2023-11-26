import { Table } from "../components/Table";
import { queryPollIntervalMs } from "../utils/constants";
import { NavLink } from "react-router-dom";
import { useQueryInstances } from "../hooks/useQueryInstances";

export default function InstancesPage() {
  const { instances } = useQueryInstances();
  return (
    <Table
      orientation="horizontal"
      header={[
        "Instance Key",
        "BPMN Process ID",
        "Status",
        "Version",
        "Start Time",
      ]}
      content={
        instances
          ? instances.map(
              ({
                instanceKey,
                process: { bpmnProcessId },
                status,
                version,
                startTime,
              }) => [instanceKey, bpmnProcessId, status, version, startTime],
            )
          : []
      }
    />
  );
}
