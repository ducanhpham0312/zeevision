import { Table } from "../components/Table";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { BpmnViewer } from "../components/BpmnViewer";
import { queryPollIntervalMs } from "../utils/constants";

export default function ProcessesPage() {
  const params = useParams();
  const PROCESS = gql`
    query SingleProcess {
      process(processKey: ${params.id}) {
        processId
        processKey
        version
        deploymentTime
        bpmnResource
        instances {
          instanceKey
          status
          startTime
        }
      }
    }
  `;
  const { data } = useQuery(PROCESS, {
    pollInterval: queryPollIntervalMs,
  });
  const {
    processKey,
    processId,
    version,
    deploymentTime,
    bpmnResource,
    instances,
  } = data ? data.process : [];
  const decodedBpmn = atob(data ? bpmnResource : "");

  return (
    <div className="m-[40px]">
      <div className="mb-[40px] flex">
        <Table
          orientation="vertical"
          header={[
            "Process Key",
            "BPMN Process ID",
            "Version",
            "Deployment Time",
          ]}
          content={
            data ? [[processKey, processId, version, deploymentTime]] : []
          }
        />
        <BpmnViewer bpmnString={decodedBpmn} />
      </div>
      <Table
        orientation="horizontal"
        header={["Instance Key", "Version", "Start Time"]}
        content={
          instances
            ? instances.map(
                ({
                  instanceKey,
                  status,
                  startTime,
                }: {
                  instanceKey: number;
                  status: string;
                  startTime: string;
                }) => [instanceKey, status, startTime],
              )
            : []
        }
      />
    </div>
  );
}
