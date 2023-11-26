import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryInstanceReturnType {
  instance: Instance
}

const SINGLE_INSTANCE_QUERY = (id: string) => gql`
  query SingleInstance {
    instance(instanceKey: ${id}) {
      instanceKey
      process {
        bpmnProcessId
        bpmnResource
      }
      version
      processKey
      status
      startTime
      endTime
      variables {
        name
        value
        time
      }
    }
  }
`

// TODO after issue #126: query for instance's bpmnResource. 

export function useQuerySingleInstance(id: string): QueryInstanceReturnType {
  const instanceData = useQuery(SINGLE_INSTANCE_QUERY(id), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    instance: {
      ...instanceData.data?.instance,
    },
  };
}