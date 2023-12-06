import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryProcessesReturnType {
  totalCount: number;
  processes: ProcessType[];
}

const PROCESSES_QUERY = () => gql`
  query Processes {
    processes {
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

export function useQueryProcesses(): QueryProcessesReturnType {
  const processesData = useQuery(PROCESSES_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    totalCount: processesData.data?.processes.totalCount,
    processes: processesData.data?.processes.items,
  };
}
