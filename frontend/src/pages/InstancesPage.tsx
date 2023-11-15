import { gql, useQuery } from "@apollo/client";
import { Table } from "../components/Table";
export default function InstancesPage() {
  const INSTANCES = gql`
    query Instances {
      instances {
        instanceKey
        processId
        status
        startTime
      }
    }
  `
  const { data } = useQuery(INSTANCES)
  return (
    <Table 
      orientation="horizontal" 
      header={["Instance Key", "BPMN Process ID", "Status", "Start Time"]}
      content={
        data
          ? data.instances.map(
              ({
                instanceKey,
                processId,
                status,
                startTime,
              }: {
                instanceKey: number;
                processId: string;
                status: string;
                startTime: string;
              }) => [instanceKey,processId, status, startTime]
            )
          : []
      }
    />
  );
}
