import { Table } from "../components/Table";
import { useParams } from "react-router-dom";
import { useQuerySingleInstance } from "../hooks/useQuerySingleInstance";
import { ResponsiveBpmnViewer } from "../components/BpmnViewer";
import { ResizableContainer } from "../components/ResizableContainer";

export default function SingleInstancesPage() {
  const params = useParams();
  const { instance } = useQuerySingleInstance(params.id || "");
  const {
    instanceKey,
    version,
    processKey,
    status,
    startTime,
    endTime,
    bpmnResource,
    bpmnProcessId,
    variables,
  } = instance;
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
                    "Instance Key",
                    "BPMN Process ID",
                    "Version",
                    "Process Key",
                    "Status",
                    "Start Time",
                    "End Time",
                  ]}
                  content={
                    instance
                      ? [
                          [
                            instanceKey,
                            bpmnProcessId,
                            version,
                            processKey,
                            status,
                            startTime,
                            endTime,
                          ],
                        ]
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
          header={["Variable Name", "Variable Value", "Time"]}
          content={
            variables
              ? variables.map(({ name, value, time }) => [name, value, time])
              : []
          }
        />
      </div>
    </div>
  );
}
