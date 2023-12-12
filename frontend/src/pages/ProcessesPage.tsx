import { Table } from "../components/Table";
import { useQueryProcesses } from "../hooks/useQueryProcesses";

export default function ProcessesPage() {
  const { processes } = useQueryProcesses();

  return (
    <div className="flex h-full flex-col gap-10 overflow-auto">
      <Table
        alterRowColor
        header={[
          "Process Key",
          "BPMN Process ID",
          "Version",
          "Deployment Time",
        ]}
        orientation="horizontal"
        navLinkColumn={{
          "Process Key": (value: string | number) => `/processes/${value}`,
        }}
        expandElement={(idx: number) => (
          <div className="flex flex-col gap-4 p-4">
            <div>
              <Table
                alterRowColor={false}
                orientation="horizontal"
                header={["Instance Key", "Status", "Version", "Start Time"]}
                navLinkColumn={{
                  "Instance Key": (value: string | number) =>
                    `/instances/${value.toString()}`,
                }}
                content={
                  processes[idx].instances
                    ? processes[idx].instances.items.map(
                        ({ instanceKey, status, version, startTime }) => [
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
        )}
        content={
          processes
            ? processes.map(
                ({ processKey, bpmnProcessId, version, deploymentTime }) => [
                  processKey,
                  bpmnProcessId,
                  version,
                  deploymentTime,
                ],
              )
            : []
        }
      />
    </div>
  );
}
