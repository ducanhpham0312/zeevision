import { Table } from "../components/Table";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { BpmnViewer } from "../components/BpmnViewer";
import { styled } from "@mui/system";

export default function ProcessesPage() {
  const params = useParams();
  const PROCESS = gql`
  query Test {
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
  const { data } = useQuery(PROCESS);
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
    <ProcessPageContainer>
      <ProcessContainer>
        <Table
          orientation="vertical"
          header={[
            "Process key",
            "BPMN Process ID",
            "Version",
            "Deployment time",
          ]}
          content={data ? [[processKey, processId, version, deploymentTime]] : []}
        />
        <BpmnViewer bpmnString={decodedBpmn}/>
      </ProcessContainer>
        <Table
          orientation="horizontal"
          header={["Instance Key", "Version", "Start time"]}
          content={
            instances ?
              instances.map(
                ({
                  instanceKey,
                  status,
                  startTime,
                }: {
                  instanceKey: number,
                  status: string;
                  startTime: string;
                }) => [instanceKey, status, startTime]
              ) : []
          }
        />
    </ProcessPageContainer>
  );
}

const ProcessPageContainer = styled("div")`
  margin: 40px;
`

const ProcessContainer = styled(`div`)`
  display: flex;
  flex-direction: row;
  margin-bottom: 40px;
`

