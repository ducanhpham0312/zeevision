import { NavLink } from "react-router-dom";
import { Table } from "../components/Table";
import { useQueryInstances } from "../hooks/useQueryInstances";
import { Button } from "../components/Button";

export default function InstancesPage() {
  const { instances } = useQueryInstances();
  return (
    <Table
      alterRowColor
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
                <NavLink to={instanceKey.toString()}>
                  <Button variant="secondary">{instanceKey}</Button>
                </NavLink>,
                bpmnProcessId,
                status,
                version,
                startTime,
              ],
            )
          : []
      }
    />
  );
}
