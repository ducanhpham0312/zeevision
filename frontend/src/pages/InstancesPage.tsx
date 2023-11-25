import { Table } from "../components/Table";
import { useQueryInstances } from "../hooks/useQueryInstances";

export default function InstancesPage() {
  const { instances } = useQueryInstances();

  return (
    <Table
      orientation="horizontal"
      header={["Instance Key", "BPMN Process ID", "Status", "Start Time"]}
      content={
        instances
          ? instances.map(
              ({
                instanceKey,
                process: { bpmnProcessId },
                status,
                startTime,
              }: {
                instanceKey: number;
                process: { bpmnProcessId: string };
                status: string;
                startTime: string;
              }) => [instanceKey, bpmnProcessId, status, startTime],
            )
          : []
      }
    />
  );
}
