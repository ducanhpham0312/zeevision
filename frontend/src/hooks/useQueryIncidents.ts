import { gql, useQuery } from "@apollo/client";
import { queryPollIntervalMs } from "../utils/constants";

interface QueryIncidentsReturnType {
  incidents: IncidentType[];
}

const INCIDENTS_QUERY = () => gql`
  query Incidents {
    incidents {
      incidentKey
      elementId
      instanceKey
      errorType
      errorMessage
      state
      time
    }
  }
`;

export function useQueryIncidents(): QueryIncidentsReturnType {
  const incidentsData = useQuery(INCIDENTS_QUERY(), {
    pollInterval: queryPollIntervalMs,
  });

  return {
    incidents: incidentsData.data?.incidents,
  };
}
