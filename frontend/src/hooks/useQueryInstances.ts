import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryProcessesReturnType {
  instances: Instance[];
}

const PROCESSES_QUERY = () => gql`
  query Instances {
    instances {
      instanceKey
      process {
        bpmnProcessId
      }
      status
      startTime
    }
  }
`;

export function useQueryInstances(): QueryProcessesReturnType {
  const instancesData = useQuery(PROCESSES_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    instances: instancesData.data?.instances,
  };
}
