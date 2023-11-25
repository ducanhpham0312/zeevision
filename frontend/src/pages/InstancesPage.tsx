import { gql, useQuery } from "@apollo/client";
import { Table } from "../components/Table";
import { queryPollIntervalMs } from "../utils/constants";
import { NavLink } from "react-router-dom";

export default function InstancesPage() {
  const INSTANCES = gql`
    query Instances {
      instances {
        instanceKey
        process {
          bpmnProcessId
        }
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
                process: { bpmnProcessId },
                status,
                startTime,
              }: {
                instanceKey: string;
                process: { bpmnProcessId: string };
                status: string;
                startTime: string;
              }) => [<NavLink to={instanceKey.toString()}>{instanceKey}</NavLink>, bpmnProcessId, status, startTime],
            )
          : []
      }
    />
  );
}
