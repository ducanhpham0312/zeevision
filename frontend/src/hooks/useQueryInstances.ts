import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryInstancesReturnType {
  instances: Instance[];
}

const INSTANCES_QUERY = () => gql`
  query Instances {
    instances {
      instanceKey
      process {
        bpmnProcessId
      }
      status
      version
      startTime
    }
  }
`;

export function useQueryInstances(): QueryInstancesReturnType {
  const instancesData = useQuery(INSTANCES_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    instances: instancesData.data?.instances,
  };
}
