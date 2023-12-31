import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";
import useQueryWithLoading from "./useQueryWithLoading";

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
        instances {
          totalCount
          items {
            version
            instanceKey
            status
            startTime
          }
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
  const processData = useQueryWithLoading(SINGLE_PROCESS_QUERY(id), {
    pollInterval: queryPollIntervalMs,
  });
  const bpmnData = useQuery(SINGLE_PROCESS_BPMN_RESOURCE_QUERY(id));

  return {
    process: {
      ...processData.data?.process,
      bpmnResource: atob(bpmnData.data?.process?.bpmnResource || ""),
    },
  };
}
