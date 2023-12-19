import { useEffect, useState } from "react";
import { useQueryAllEntities } from "../../hooks/useQueryAllEntities";
interface NotifyNewEntityProps {}

export function NotifyNewEntity({}: NotifyNewEntityProps) {
  // const [processKeySet, setProcessKeySet] = useState<Set<string>>(new Set());
  // const [instanceKeySet, setInstanceKeySet] = useState<Set<string>>(new Set());
  // const [incidentKeySet, setIncidentKeySet] = useState<Set<string>>(new Set());
  // const [jobKeySet, setJobKeySet] = useState<Set<string>>(new Set());

  const data = useQueryAllEntities();
  useEffect(() => {
    console.log(data);
  }, [data]);
  return <></>;
}
