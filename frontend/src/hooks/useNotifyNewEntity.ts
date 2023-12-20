import { useEffect, useState } from "react";
import { useQueryAllEntities } from "./useQueryAllEntities";
import { useUIStore } from "../contexts/useUIStore";

export function useNotifyNewEntity() {
  const { loading, incidents, instances, processes } = useQueryAllEntities();
  const [processKeySet, setProcessKeySet] = useState<Set<string>>();
  const [instanceKeySet, setInstanceKeySet] = useState<Set<string>>();
  const [incidentKeySet, setIncidentKeySet] = useState<Set<string>>();

  const { setSnackbarContent } = useUIStore();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!processKeySet) {
      setProcessKeySet(new Set(processes.processKeyList));
    }
    if (!instanceKeySet) {
      setInstanceKeySet(
        new Set(
          instances.instanceAndProcessKeyList.map((item) => item.instanceKey),
        ),
      );
    }
    if (!processKeySet) {
      setIncidentKeySet(
        new Set(
          incidents.incidentAndInstanceKeyList.map((item) => item.incidentKey),
        ),
      );
    }

    if (!processKeySet || !instanceKeySet || !incidentKeySet) {
      return;
    }

    if (processes.totalCount > processKeySet.size) {
      console.log(processKeySet);
      console.log("new process");
    }
    if (instances.totalCount > instanceKeySet.size) {
      console.log(instanceKeySet);
      console.log("new instance");
      setInstanceKeySet(
        new Set(
          instances.instanceAndProcessKeyList.map((item) => item.instanceKey),
        ),
      );
      setTimeout(
        () =>
          setSnackbarContent({ message: "123", title: "123", type: "error" }),
        0,
      );
    }
    if (incidents.totalCount > incidentKeySet.size) {
      console.log(incidentKeySet);
      console.log("new incident");
    }
  }, [
    loading,
    incidentKeySet,
    incidents,
    instanceKeySet,
    instances,
    processKeySet,
    processes,
    setSnackbarContent,
  ]);

  return;
}
