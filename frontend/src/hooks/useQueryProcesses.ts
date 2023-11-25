import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryProcessesReturnType {
  processes: ProcessType[];
}

const PROCESSES_QUERY = () => gql`
  query Processes {
    processes {
      bpmnProcessId
      processKey
      deploymentTime
      instances {
        instanceKey
        status
        startTime
      }
    }
  }
`;

export function useQueryProcesses(): QueryProcessesReturnType {
  const processesData = useQuery(PROCESSES_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    processes: processesData.data?.processes,
  };
}
