import { gql } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";
import useQueryWithLoading from "./useQueryWithLoading";

interface QueryProcessesReturnType {
  totalCount: number;
  processes: ProcessType[];
}

const PROCESSES_QUERY = () => gql`
  query Processes($limit: Int!, $offset: Int!) {
    processes(pagination: { limit: $limit, offset: $offset }) {
      totalCount
      items {
        bpmnProcessId
        processKey
        version
        deploymentTime
        instances {
          totalCount
          items {
            version
            instanceKey
            status
            startTime
          }
        }
      }
    }
  }
`;

export function useQueryProcesses(
  page: number,
  limit: number,
): QueryProcessesReturnType {
  const processesData = useQueryWithLoading(PROCESSES_QUERY(), {
    pollInterval: queryPollIntervalMs,
    variables: {
      offset: page * limit,
      limit,
    },
  });

  return {
    totalCount: processesData.data?.processes.totalCount,
    processes: processesData.data?.processes.items,
  };
}
