import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryInstanceReturnType {
  instance: Instance;
}

const SINGLE_INSTANCE_QUERY = (id: string) => gql`
  query SingleInstance {
    instance(instanceKey: ${id}) {
      instanceKey
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
`;

const SINGLE_INSTANCE_BPMN_RESOURCE_QUERY = (id: string) => gql`
  query SingleInstance {
    instance(instanceKey: ${id}) {
      process {
        bpmnResource
        bpmnProcessId
      }
    }
  }
`;

export function useQuerySingleInstance(id: string): QueryInstanceReturnType {
  const instanceData = useQuery(SINGLE_INSTANCE_QUERY(id), {
    pollInterval: queryPollIntervalMs,
  });

  const bpmnData = useQuery(SINGLE_INSTANCE_BPMN_RESOURCE_QUERY(id));
  return {
    instance: {
      ...instanceData.data?.instance,
      bpmnResource: atob(bpmnData.data?.instance?.process?.bpmnResource || ""),
      bpmnProcessId: bpmnData.data?.instance?.process.bpmnProcessId || "",
    },
  };
}
