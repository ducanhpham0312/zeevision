import { gql, useQuery } from "@apollo/client";
import { Table } from "../components/Table";
import { queryPollIntervalMs } from "../utils/constants";

export default function InstancesPage() {
  const INSTANCES = gql`
    query Instances {
      instances {
        instanceKey
        bpmnProcessId
        status
        startTime
      }
    }
  `;
  const { data } = useQuery(INSTANCES, {
    pollInterval: queryPollIntervalMs,
  });
  return (
    <Table
      orientation="horizontal"
      header={["Instance Key", "BPMN Process ID", "Status", "Start Time"]}
      content={
        data
          ? data.instances.map(
              ({
                instanceKey,
                bpmnProcessId,
                status,
                startTime,
              }: {
                instanceKey: number;
                bpmnProcessId: string;
                status: string;
                startTime: string;
              }) => [instanceKey, bpmnProcessId, status, startTime]
            )
          : []
      }
    />
  );
}
