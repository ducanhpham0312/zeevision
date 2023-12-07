import { gql } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";
import useQueryWithLoading from "./useQueryWithLoading";

interface QueryInstancesReturnType {
  totalCount: number;
  instances: Instance[];
}

const INSTANCES_QUERY = () => gql`
  query Instances {
    instances {
      totalCount
      items {
        instanceKey
        process {
          bpmnProcessId
        }
        status
        version
        startTime
      }
    }
  }
`;

export function useQueryInstances(): QueryInstancesReturnType {
  const instancesData = useQueryWithLoading(INSTANCES_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    totalCount: instancesData.data?.instances.totalCount,
    instances: instancesData.data?.instances.items,
  };
}
