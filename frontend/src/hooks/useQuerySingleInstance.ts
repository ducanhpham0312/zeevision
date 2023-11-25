import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

type Instance = {
  instanceKey: number;
  process: Process;
  version: number;
  processKey: string;
  status: string;
  startTime: string;
  endTime: string;
}

type Process = {
  processKey: number;
  deploymentTime: string;
  bpmnProcessId: string;
  bpmnResource: string;
  version: number;
  instances: Instance[];
}

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