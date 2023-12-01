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
    <div className="flex h-full w-full flex-col">
      <ResizableContainer direction="vertical">
        <div className="flex h-full">
          <ResizableContainer direction="horizontal">
            <div className="w-full overflow-hidden">
              <div className="min-w-[400px] pr-3">
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
            </div>
          </ResizableContainer>
          <ResponsiveBpmnViewer
            control
            navigated
            className="h-full flex-grow overflow-hidden"
            bpmnString={bpmnResource}
          />
        </div>
      </ResizableContainer>
      <div className="relative flex-grow overflow-auto">
        <Table
          className="absolute mt-5"
          orientation="horizontal"
          header={["Instance Key", "Status", "Version", "Start Time"]}
          content={
            instances
              ? instances.map(({ instanceKey, version, status, startTime }) => [
                  <NavLink to={`/instances/${instanceKey.toString()}`}>
                    {instanceKey}
                  </NavLink>,
                  status,
                  version,
                  startTime,
                ])
              : []
          }
        />
      </div>
    </div>
  );
}
