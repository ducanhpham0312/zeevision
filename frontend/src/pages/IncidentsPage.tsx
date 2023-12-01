import { NavLink } from "react-router-dom";
import { Table } from "../components/Table";
import { useQueryIncidents } from "../hooks/useQueryIncidents";
import { Button } from "../components/Button";

export default function IncidentsPage() {
  const { incidents } = useQueryIncidents();
  return (
    <Table
      orientation="horizontal"
      header={["Instance Key", "Incident Key", "Element ID", "State", "Time"]}
      content={
        incidents
          ? incidents.map(
              ({ instanceKey, incidentKey, elementId, state, time }) => [
                <NavLink to={`/instances/${instanceKey.toString()}`}>
                  <Button variant="secondary">{instanceKey}</Button>
                </NavLink>,
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
