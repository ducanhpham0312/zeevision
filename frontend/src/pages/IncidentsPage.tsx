import { Table } from "../components/Table";
import { useQueryIncidents } from "../hooks/useQueryIncidents";

export default function IncidentsPage() {
  const { incidents } = useQueryIncidents();
  return (
    <Table
      orientation="horizontal"
      header={["Instance Key", "Incident Key", "Element ID", "State", "Time"]}
      navLinkColumn={{
        "Instance Key": (value: string | number) =>
          `/instances/${value.toString()}`,
      }}
      content={
        incidents
          ? incidents.map(
              ({ instanceKey, incidentKey, elementId, state, time }) => [
                instanceKey,
                incidentKey,
                elementId,
                state,
                time,
              ],
            )
          : []
      }
    />
  );
}
