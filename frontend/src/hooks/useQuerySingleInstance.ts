import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

type Instance = {
  instanceKey: number;
  bpmnProcessId: string;
  version: number;
  processKey: string;
  status: string;
  startTime: string;
}

interface QueryInstanceReturnType {
  instance: Instance
}

const SINGLE_INSTANCE_QUERY = (id: string) => gql`
  query SingleInstance {
    instance(instanceKey: ${id}) {
      instanceKey
      bpmnProcessId
      version
      processKey
      status
      startTime
      
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