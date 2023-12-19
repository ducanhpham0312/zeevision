import { gql } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";
import useQueryWithLoading from "./useQueryWithLoading";

interface QueryJobsReturnType {
  totalCount: number;
  jobs: JobType[];
}

const JOBS_QUERY = (shouldUseClientPagination: boolean) =>
  shouldUseClientPagination
    ? gql`
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
      `
    : gql`
        query Jobs($limit: Int!, $offset: Int!) {
          jobs(pagination: { limit: $limit, offset: $offset }) {
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

export function useQueryJobs(
  page: number,
  limit: number,
  shouldUseClientPagination: boolean,
): QueryJobsReturnType {
  const jobsData = useQueryWithLoading(JOBS_QUERY(shouldUseClientPagination), {
    pollInterval: queryPollIntervalMs,
    variables: {
      offset: page * limit,
      limit,
    },
  });

  return {
    totalCount: jobsData.data?.jobs.totalCount,
    jobs: jobsData.data?.jobs.items,
  };
}
