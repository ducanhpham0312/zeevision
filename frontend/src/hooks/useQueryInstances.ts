import { gql } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";
import useQueryWithLoading from "./useQueryWithLoading";

interface QueryInstancesReturnType {
  totalCount: number;
  instances: Instance[];
}

const INSTANCES_QUERY = (shouldUseClientPagination: boolean) =>
  shouldUseClientPagination
    ? gql`
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
      `
    : gql`
        query Instances($limit: Int!, $offset: Int!) {
          instances(pagination: { limit: $limit, offset: $offset }) {
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

export function useQueryInstances(
  page: number,
  limit: number,
  shouldUseClientPagination: boolean,
): QueryInstancesReturnType {
  const instancesData = useQueryWithLoading(
    INSTANCES_QUERY(shouldUseClientPagination),
    {
      pollInterval: queryPollIntervalMs,
      variables: {
        offset: page * limit,
        limit,
      },
    },
  );

  return {
    totalCount: instancesData.data?.instances.totalCount,
    instances: instancesData.data?.instances.items,
  };
}
