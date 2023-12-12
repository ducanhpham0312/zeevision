import { useEffect } from "react";
import { Table } from "../components/Table";
import { useQueryJobs } from "../hooks/useQueryJobs";
import { useTableStore } from "../contexts/useTableStore";

export default function JobsPage() {
  const { page, limit, setLimit, setPage, resetPagination } = useTableStore();
  const { jobs, totalCount } = useQueryJobs(page, limit);

  useEffect(() => {
    return () => {
      resetPagination();
    };
  }, [resetPagination]);

  return (
    <div className="flex h-full flex-col gap-10 overflow-auto pr-4">
      <Table
        alterRowColor
        orientation="horizontal"
        useApiPagination={{
          setLimit,
          setPage,
        }}
        apiTotalCount={totalCount}
        header={[
          "Instance Key",
          "Job Key",
          "Job Type",
          "Retries",
          "Worker",
          "State",
          "Time",
        ]}
        filterConfig={{
          mainFilter: { column: "Job Key" },
          filterOptions: {
            "Job Key": "string",
            "Job Type": "string",
            Retries: "string",
            Worker: "string",
            State: "string",
            Time: "time",
          },
        }}
        navLinkColumn={{
          "Instance Key": (value: string | number) =>
            `/instances/${value.toString()}`,
        }}
        content={
          jobs
            ? jobs.map(
                ({ instanceKey, key, type, retries, worker, state, time }) => [
                  instanceKey,
                  key,
                  type,
                  retries,
                  worker,
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
