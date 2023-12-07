import { Table } from "../components/Table";
import { useQueryInstances } from "../hooks/useQueryInstances";

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
      navLinkColumn={{
        "Instance Key": (value: string | number) => value.toString(),
      }}
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
