import { useCallback, useEffect, useState } from "react";
import { useQueryAllEntities } from "./useQueryAllEntities";
import { useUIStore } from "../contexts/useUIStore";
import { Button } from "../components/Button";

export function useNotifyNewEntity() {
  const { loading, incidents, instances, processes } = useQueryAllEntities();
  const [processKeySet, setProcessKeySet] = useState<Set<string>>();
  const [instanceKeySet, setInstanceKeySet] = useState<Set<string>>();
  const [incidentKeySet, setIncidentKeySet] = useState<Set<string>>();

  const { setSnackbarContent } = useUIStore();

  const createNewProcessSnackbar = useCallback(
    (processKey: string) => {
      setTimeout(() =>
        setSnackbarContent({
          title: "New Process",
          messageNode: (
            <div>
              <p>New process has been added with the key</p>
              <Button variant="secondary">{processKey}</Button>
            </div>
          ),
          type: "success",
        }),
      );
    },
    [setSnackbarContent],
  );

  const createNewInstanceSnackbar = useCallback(
    (instanceKey: string, processKey: string) => {
      setTimeout(() =>
        setSnackbarContent({
          title: "New Process",
          messageNode: (
            <div>
              <p>
                New instance <Button variant="secondary">{instanceKey}</Button>{" "}
                of process
                <Button variant="secondary">{processKey}</Button>
                has been added with the key
              </p>
            </div>
          ),
          type: "success",
        }),
      );
    },
    [setSnackbarContent],
  );

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
      const newInstances = instances.instanceAndProcessKeyList.filter(
        (item) => !instanceKeySet.has(item.instanceKey),
      )[0];
      createNewInstanceSnackbar(
        newInstances.instanceKey,
        newInstances.processKey,
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
    createNewProcessSnackbar,
    createNewInstanceSnackbar,
  ]);

  return;
}
