import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryAllEntitiesType {
  loading: boolean;
  processes: {
    totalCount: number;
    processKeyList: Array<string>;
  };
  instances: {
    totalCount: number;
    instanceAndProcessKeyList: Array<{
      instanceKey: string;
      processKey: string;
    }>;
  };
  incidents: {
    totalCount: number;
    incidentAndInstanceKeyList: Array<{
      instanceKey: string;
      incidentKey: string;
    }>;
  };
  // jobs: {
  //   totalCount: number;
  //   jobAndInstanceKeyList: Array<{
  //     instanceKey: string;
  //     jobKey: string;
  //   }>;
  // };
}

const ENTITIES_COUNT_AND_KEY = () => gql`
  query EntitiesCountAndKeys {
    processes {
      totalCount
      items {
        processKey
      }
    }
    instances {
      totalCount
      items {
        instanceKey
        processKey
      }
    }
    incidents {
      totalCount
      items {
        instanceKey
        incidentKey
      }
    }
    # jobs {
    #   totalCount
    #   items {
    #     key
    #     instanceKey
    #   }
    # }
  }
`;

export function useQueryAllEntities(): QueryAllEntitiesType {
  const entitiesData = useQuery(ENTITIES_COUNT_AND_KEY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    processes: {
      totalCount: entitiesData.data?.processes.totalCount,
      processKeyList: entitiesData.data?.processes.items.map(
        (item: { processKey: string }) => item.processKey,
      ),
    },
    instances: {
      totalCount: entitiesData.data?.instances.totalCount,
      instanceAndProcessKeyList: entitiesData.data?.instances.items.map(
        (item: { instanceKey: string; processKey: string }) => item,
      ),
    },
    incidents: {
      totalCount: entitiesData.data?.incidents.totalCount,
      incidentAndInstanceKeyList: entitiesData.data?.incidents.items.map(
        (item: { instanceKey: string; incidentKey: string }) => item,
      ),
    },
    loading: entitiesData.loading,
    // jobs: {
    //   totalCount: entitiesData.data?.jobs.totalCount,
    //   jobAndInstanceKeyList: entitiesData.data?.jobs.items.map(
    //     ({ instanceKey, key }: { instanceKey: string; key: string }) => ({
    //       instanceKey,
    //       jobKey: key,
    //     }),
    //   ),
    // },
  };
}
