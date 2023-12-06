import { Table } from "../components/Table";
import { useQueryJobs } from "../hooks/useQueryJobs";

export default function JobsPage() {
  const { jobs } = useQueryJobs();
  return (
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
  );
}
