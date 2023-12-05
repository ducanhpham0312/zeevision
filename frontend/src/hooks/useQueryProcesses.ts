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
      version
      deploymentTime
      instances {
        version
        instanceKey
        status
        startTime
      }
    }
  }
`;

export function useQueryProcesses(): QueryProcessesReturnType {
  const processesData = useQuery(PROCESSES_QUERY(), {
    // fetchPolicy: "network-only",
    pollInterval: queryPollIntervalMs,
  });

  return {
    processes: processesData.data?.processes,
  };
}
