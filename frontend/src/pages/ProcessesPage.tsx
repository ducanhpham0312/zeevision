import { useCallback, useEffect, useMemo } from "react";
import { Table } from "../components/Table";
import { useQueryProcesses } from "../hooks/useQueryProcesses";
import { useTableStore } from "../contexts/useTableStore";

export default function ProcessesPage() {
  const {
    page,
    limit,
    setLimit,
    setPage,
    resetPagination,
    shouldUseClientPagination,
  } = useTableStore();
  const { processes, totalCount } = useQueryProcesses(
    page,
    limit,
    shouldUseClientPagination,
  );

  const apiPagination = useMemo(
    () => ({
      setLimit,
      setPage,
    }),
    [setLimit, setPage],
  );

  useEffect(() => {
    return () => {
      resetPagination();
    };
  }, [resetPagination]);

  return (
    <div className="flex h-full flex-col gap-10 overflow-auto pr-4">
      <div className="flex-grow">
        <Table
          useApiPagination={apiPagination}
          apiTotalCount={totalCount}
          alterRowColor
          filterConfig={useMemo(
            () => ({
              mainFilter: {
                column: "BPMN Process ID",
              },
              filterOptions: {
                "Process Key": "string",
                "BPMN Process ID": "string",
                Version: "value",
                "Deployment Time": "time",
              },
            }),
            [],
          )}
          header={useMemo(
            () => [
              "Process Key",
              "BPMN Process ID",
              "Version",
              "Deployment Time",
            ],
            [],
          )}
          orientation="horizontal"
          navLinkColumn={useMemo(
            () => ({
              "Process Key": (value: string | number) => `/processes/${value}`,
            }),
            [],
          )}
          expandElement={useCallback(
            (id: string | number) => (
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
                      processes
                        ? processes[
                            processes.findIndex(
                              (process) =>
                                process.processKey.toString() === id.toString(),
                            )
                          ]?.instances?.items?.map(
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
            ),
            [processes],
          )}
          content={useMemo(
            () =>
              processes
                ? processes.map(
                    ({
                      processKey,
                      bpmnProcessId,
                      version,
                      deploymentTime,
                    }) => [processKey, bpmnProcessId, version, deploymentTime],
                  )
                : [],
            [processes],
          )}
        />
      </div>
    </div>
  );
}
