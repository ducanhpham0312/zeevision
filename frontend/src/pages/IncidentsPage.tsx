import { useEffect } from "react";
import { Table } from "../components/Table";
import { useQueryIncidents } from "../hooks/useQueryIncidents";
import { useTableStore } from "../contexts/useTableStore";

export default function IncidentsPage() {
  const { page, limit, setLimit, setPage, resetPagination } = useTableStore();
  const { incidents, totalCount } = useQueryIncidents(page, limit);

  useEffect(() => {
    return () => {
      resetPagination();
    };
  }, [resetPagination]);

  return (
    <div className="flex h-full flex-col gap-10 overflow-auto pr-4">
      <h1>INSTANCES</h1>
      <Table
        orientation="horizontal"
        header={["Instance Key", "Incident Key", "Element ID", "State", "Time"]}
        navLinkColumn={{
          "Instance Key": (value: string | number) =>
            `/instances/${value.toString()}`,
        }}
        useApiPagination={{
          setLimit,
          setPage,
        }}
        apiTotalCount={totalCount}
        content={
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
            : []
        }
      />
    </div>
  );
}
