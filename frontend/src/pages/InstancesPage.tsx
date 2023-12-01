import { NavLink } from "react-router-dom";
import { Table } from "../components/Table";
import { useQueryInstances } from "../hooks/useQueryInstances";

export default function InstancesPage() {
  const { instances } = useQueryInstances();
  return (
    <div className="flex h-full flex-col gap-10 overflow-auto">
      <h1>INSTANCES</h1>
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
                }) => [
                  <NavLink to={instanceKey.toString()}>{instanceKey}</NavLink>,
                  bpmnProcessId,
                  status,
                  version,
                  startTime,
                ],
              )
            : []
        }
      />
    </div>
  );
}
