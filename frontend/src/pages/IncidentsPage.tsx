import { useEffect, useMemo } from "react";
import { Table } from "../components/Table";
import { useQueryIncidents } from "../hooks/useQueryIncidents";
import { useTableStore } from "../contexts/useTableStore";

export default function IncidentsPage() {
  const {
    page,
    limit,
    setLimit,
    setPage,
    resetPagination,
    shouldUseClientPagination,
  } = useTableStore();
  const { incidents, totalCount } = useQueryIncidents(
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
      <Table
        orientation="horizontal"
        header={useMemo(
          () => ["Instance Key", "Incident Key", "Element ID", "State", "Time"],
          [],
        )}
        navLinkColumn={useMemo(
          () => ({
            "Instance Key": (value: string | number) =>
              `/instances/${value.toString()}`,
          }),
          [],
        )}
        useApiPagination={apiPagination}
        apiTotalCount={totalCount}
        filterConfig={useMemo(
          () => ({
            mainFilter: { column: "Incident Key" },
            filterOptions: {
              "Instance Key": "string",
              "Incident Key": "string",
              "Element ID": "string",
              State: "string",
              Time: "time",
            },
          }),
          [],
        )}
        content={useMemo(
          () =>
            incidents
              ? incidents.map(
                  ({ instanceKey, incidentKey, elementId, state, time }) => [
                    instanceKey,
                    incidentKey,
                    elementId,
                    state,
                    time,
                  ],
                )
              : [],
          [incidents],
        )}
      />
    </div>
  );
}
