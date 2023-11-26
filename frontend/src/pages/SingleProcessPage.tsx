import { Table } from "../components/Table";
import { NavLink, useParams } from "react-router-dom";
import { ResponsiveBpmnViewer } from "../components/BpmnViewer";
import { useQueryProcessData } from "../hooks/useQuerySingleProcess";
import { ResizableContainer } from "../components/ResizableContainer";

export default function SingleProcessPage() {
  const params = useParams();
  const { process } = useQueryProcessData(params.id || "");

  const {
    processKey,
    bpmnProcessId,
    version,
    deploymentTime,
    bpmnResource,
    instances,
  } = process;

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <ResizableContainer direction="vertical">
        <div className="flex h-full">
          <ResizableContainer direction="horizontal">
            <div className="w-full pr-3">
              <Table
                orientation="vertical"
                header={[
                  "Process Key",
                  "BPMN Process ID",
                  "Version",
                  "Deployment Time",
                ]}
                content={
                  process
                    ? [[processKey, bpmnProcessId, version, deploymentTime]]
                    : []
                }
              />
            </div>
          </ResizableContainer>
          <ResponsiveBpmnViewer
            navigated
            className="h-full flex-grow"
            bpmnString={bpmnResource}
          />
        </div>
      </ResizableContainer>
      <Table
        orientation="horizontal"
        header={["Instance Key", "Status", "Version", "Start Time"]}
        content={
          instances
            ? instances.map(({ instanceKey, version, status, startTime }) => [
                <NavLink to={`/instances/${instanceKey.toString()}`}>{instanceKey}</NavLink>,
                status,
                version,
                startTime,
              ])
            : []
        }
      />
    </div>
  );
}
