import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { useQueryProcesses } from "../hooks/useQueryProcesses";
import { useTableStore } from "../contexts/useTableStore";

export default function ProcessesPage() {
  const { page, limit, setLimit, setPage, resetPagination } = useTableStore();
  const { processes, totalCount } = useQueryProcesses(page, limit);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleOpen = () => setIsPopUpOpen(true);
  const handleClose = () => setIsPopUpOpen(false);

  useEffect(() => {
    return () => {
      resetPagination();
    };
  }, [resetPagination]);

  return (
    <div className="flex h-full flex-col gap-10 overflow-auto pr-4">
        <div className="flex-grow">
        <Table
            useApiPagination={{
              setLimit,
              setPage,
            }}
            apiTotalCount={totalCount}
          alterRowColor
            filterConfig={{
              mainFilter: {
                column: "Process ID",
              },
              filterOptions: {
                "Process Key": "string",
                "Process ID": "string",
                Version: "value",
                "Deployment Time": "time",
              },
            }}
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
            <div className="flex h-full flex-col gap-4 p-4">
                <div className="flex-grow">
                <Table
                  alterRowColor={false}
                  orientation="horizontal"
                  header={["Instance Key", "Status", "Version", "Start Time"]}
                  navLinkColumn={{
                    "Instance Key": (value: string | number) =>
                      `/instances/${value.toString()}`,
                  }}
                  content={
                    processes && processes[idx] && processes[idx].instances
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
                  ({
                    processKey,
                    bpmnProcessId,
                    version,
                    deploymentTime,
                  }) => [processKey, bpmnProcessId, version, deploymentTime],
                )
              : []
          }
        />
        </div>
    </div>
  );
}
