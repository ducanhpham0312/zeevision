import { useState } from "react";
import { Button } from "../components/Button";
import { NewInstancePopup } from "../components/NewInstancePopup/NewInstancePopup";
import { Table } from "../components/Table";
import { useQueryInstances } from "../hooks/useQueryInstances";

export default function InstancesPage() {
  const { instances } = useQueryInstances();
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleOpen = () => setIsPopUpOpen(true);
  const handleClose = () => setIsPopUpOpen(false);

  return (
    <>
      <NewInstancePopup isPopUpOpen={isPopUpOpen} onClosePopUp={handleClose} />
      <div className="flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <h1>INSTANCES</h1>
          <Button onClick={handleOpen} variant="secondary">
            Create new Instance
          </Button>
        </div>

        <Table
          alterRowColor
          orientation="horizontal"
          header={[
            "Instance Key",
            "BPMN Process ID",
            "Status",
            "Version",
            "Start Time",
          ]}
          content={
            instances
              ? instances.map(
                  ({
                    instanceKey,
                    process: { bpmnProcessId },
                    status,
                    version,
                    startTime,
                  }) => [
                    instanceKey,
                    bpmnProcessId,
                    status,
                    version,
                    startTime,
                  ],
                )
              : []
          }
        />
      </div>
    </>
  );
}
