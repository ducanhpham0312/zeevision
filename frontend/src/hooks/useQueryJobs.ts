import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryJobsReturnType {
  jobs: JobType[];
}

const JOBS_QUERY = () => gql`
  query Jobs {
    jobs {
      key
      type
      instanceKey
      retries
      worker
      state
      time
    }
  }
`;

export function useQueryJobs(): QueryJobsReturnType {
  const jobsData = useQuery(JOBS_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    jobs: jobsData.data?.jobs,
  };
}
