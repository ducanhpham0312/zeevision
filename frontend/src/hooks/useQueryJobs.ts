import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryJobsReturnType {
  totalCount: number;
  jobs: JobType[];
}

const JOBS_QUERY = () => gql`
  query Jobs {
    jobs {
      totalCount
      items {
        key
        type
        instanceKey
        retries
        worker
        state
        time
      }
    }
  }
`;

export function useQueryJobs(): QueryJobsReturnType {
  const jobsData = useQuery(JOBS_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    totalCount: jobsData.data?.jobs.totalCount,
    jobs: jobsData.data?.jobs.items,
  };
}
