import { NavLink } from "react-router-dom";
import { Table } from "../components/Table";
import { useQueryJobs } from "../hooks/useQueryJobs";
import { Button } from "../components/Button";

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
      content={
        jobs
          ? jobs.map(
              ({ instanceKey, key, type, retries, worker, state, time }) => [
                <NavLink to={`/instances/${instanceKey.toString()}`}>
                  <Button variant="secondary">{instanceKey}</Button>
                </NavLink>,
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
