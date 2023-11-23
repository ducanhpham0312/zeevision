import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

type ProcessType = {
  processKey: number;
  deploymentTime: string;
  bpmnResource: string;
  version: number;
  instances: Instance[];
};

type Instance = {
  instanceKey: number;
  status: string;
  startTime: string;
};

interface QueryProcessDataReturnType {
  process: ProcessType;
}

const SINGLE_PROCESS_QUERY = (id: string) => gql`
    query SingleProcess {
      process(processKey: ${id}) {
        bpmnProcessId
        processKey
        version
        deploymentTime
        bpmnResource
        instances {
          instanceKey
          status
          startTime
        }
      }
    }
  `;

const SINGLE_PROCESS_BPMN_RESOURCE_QUERY = (id: string) => gql`
    query SingleProcess {
      process(processKey: ${id}) {
        bpmnResource
      }
    }
  `;

export function useQueryProcessData(id: string): QueryProcessDataReturnType {
  const processData = useQuery(SINGLE_PROCESS_QUERY(id), {
    pollInterval: queryPollIntervalMs,
  });
  const bpmnData = useQuery(SINGLE_PROCESS_BPMN_RESOURCE_QUERY(id));

  console.log(bpmnData.data?.process?.bpmnResource);

  return {
    process: {
      ...processData.data?.process,
      bpmnResource: atob(bpmnData.data?.process?.bpmnResource || ""),
    },
  };
}
