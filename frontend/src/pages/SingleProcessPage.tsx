import { Table } from "../components/Table";
import { useParams } from "react-router-dom";
import { ResponsiveBpmnViewer } from "../components/BpmnViewer";
import { useQueryProcessData } from "../hooks/useQuerySingleProcess";
import { ResizableContainer } from "../components/ResizableContainer";

export default function SingleProcessPage() {
  const params = useParams();
  const { process } = useQueryProcessData(params.id || "");

  console.log(process);
  const {
    processKey,
    bpmnProcessId,
    version,
    deploymentTime,
    bpmnResource,
    instances,
  } = process;

  return (
    <div className="flex h-full w-full flex-col gap-3 pr-4">
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
        <div className="absolute mt-2 h-full w-full">
          <Table
            alterRowColor
            orientation="horizontal"
            header={["Instance Key", "Status", "Version", "Start Time"]}
            navLinkColumn={{
              "Instance Key": (value: string | number) =>
                `/instances/${value.toString()}`,
            }}
            filterConfig={{
              mainFilter: { column: "Instance Key" },
              filterOptions: {
                "Instance Key": "string",
                Status: "string",
                Version: "number",
                "Start Time": "time",
              },
            }}
            content={
              instances
                ? instances.items.map(
                    ({ instanceKey, version, status, startTime }) => [
                      instanceKey,
                      status,
                      version,
                      startTime,
                    ],
                  )
                : []
            }
          />
        </div>
      </div>
    </div>
  );
}
