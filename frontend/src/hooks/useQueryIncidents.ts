import { gql } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";
import useQueryWithLoading from "./useQueryWithLoading";

interface QueryIncidentsReturnType {
  totalCount: number;
  incidents: IncidentType[];
}

const INCIDENTS_QUERY = () => gql`
  query Incidents($limit: Int!, $offset: Int!) {
    incidents(pagination: { limit: $limit, offset: $offset }) {
      totalCount
      items {
        incidentKey
        elementId
        instanceKey
        errorType
        errorMessage
        state
        time
      }
    }
  }
`;

export function useQueryIncidents(
  page: number,
  limit: number,
): QueryIncidentsReturnType {
  const incidentsData = useQueryWithLoading(INCIDENTS_QUERY(), {
    pollInterval: queryPollIntervalMs,
    variables: {
      offset: page * limit,
      limit,
    },
  });

  return {
    totalCount: incidentsData.data?.incidents.totalCount,
    incidents: incidentsData.data?.incidents.items,
  };
}
