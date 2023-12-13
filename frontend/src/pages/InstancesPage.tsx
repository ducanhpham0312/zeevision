import { useEffect, useMemo } from "react";
import { Table } from "../components/Table";
import { useTableStore } from "../contexts/useTableStore";
import { useQueryInstances } from "../hooks/useQueryInstances";

export default function InstancesPage() {
  const {
    page,
    limit,
    shouldUseClientPagination,
    setLimit,
    setPage,
    resetPagination,
  } = useTableStore();
  const { instances, totalCount } = useQueryInstances(
    page,
    limit,
    shouldUseClientPagination,
  );

  useEffect(() => {
    return () => {
      resetPagination();
    };
  }, [resetPagination]);

  return (
    <div className="flex h-full flex-col gap-10 overflow-auto pr-4">
      <Table
        alterRowColor
        useApiPagination={useMemo(
          () => ({
            setLimit,
            setPage,
          }),
          [setLimit, setPage],
        )}
        apiTotalCount={totalCount}
        orientation="horizontal"
        filterConfig={useMemo(
          () => ({
            mainFilter: { column: "Instance Key" },
            filterOptions: {
              "Instance Key": "string",
              "BPMN Process ID": "string",
              Status: "string",
              Version: "value",
              "Start Time": "time",
            },
          }),
          [],
        )}
        header={useMemo(
          () => [
            "Instance Key",
            "BPMN Process ID",
            "Status",
            "Version",
            "Start Time",
          ],
          [],
        )}
        navLinkColumn={useMemo(
          () => ({
            "Instance Key": (value: string | number) => value.toString(),
          }),
          [],
        )}
        content={useMemo(
          () =>
            instances
              ? instances.map(
                  ({
                    instanceKey,
                    process: { bpmnProcessId },
                    status,
                    version,
                    startTime,
                  }) => [
                    instanceKey,
                    bpmnProcessId,
                    status,
                    version,
                    startTime,
                  ],
                )
              : [],
          [instances],
        )}
      />
    </div>
  );
}
