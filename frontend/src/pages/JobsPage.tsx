import { Table } from "../components/Table";
import { useQueryJobs } from "../hooks/useQueryJobs";

export default function JobsPage() {
  const { jobs } = useQueryJobs();
  return (
    <div className="flex h-full flex-col gap-10 overflow-auto pr-4">
      <h1>JOBS</h1>
      <Table
        alterRowColor
        orientation="horizontal"
        header={[
          "Instance Key",
          "Job Key",
          "Job Type",
          "Retries",
          "Worker",
          "State",
          "Time",
        ]}
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
