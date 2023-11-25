import { useState } from "react";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { NavLink } from "react-router-dom";
import { DeployProcessPopup } from "../components/DeployProcessPopup";
import { useQueryProcesses } from "../hooks/useQueryProcesses";

export default function ProcessesPage() {
  const { processes } = useQueryProcesses();

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleOpen = () => setIsPopUpOpen(true);
  const handleClose = () => setIsPopUpOpen(false);

  return (
    <>
      <DeployProcessPopup
        isPopUpOpen={isPopUpOpen}
        onOpenPopUp={handleOpen}
        onClosePopUp={handleClose}
      />
      <div className="flex flex-col gap-10">
        <div className="flex items-center justify-between">
          <h1>PROCESSES</h1>
          <Button onClick={handleOpen} variant="secondary">
            Deploy a Process
          </Button>
        </div>
        <Table
          alterRowColor
          header={["Process Key", "Process ID", "Deployment Time"]}
          orientation="horizontal"
          expandElement={(idx: number) => (
            <div className="flex flex-col gap-4 p-4">
              <p>Process Details:</p>
              <div>
                <Table
                  orientation="horizontal"
                  header={["Instance Key", "Version", "Start Time"]}
                  optionElement={() => <></>}
                  content={
                    processes[idx].instances
                      ? processes[idx].instances.map(
                          ({
                            instanceKey,
                            status,
                            startTime,
                          }: {
                            instanceKey: number;
                            status: string;
                            startTime: string;
                          }) => [instanceKey, status, startTime],
                        )
                      : []
                  }
                />
              </div>
            </div>
          )}
          content={
            processes
              ? (processes.map(
                  ({
                    processKey,
                    bpmnProcessId,
                    deploymentTime,
                  }: {
                    processKey: number;
                    bpmnProcessId: string;
                    deploymentTime: string;
                  }) => [
                    <NavLink to={processKey.toString()}>{processKey}</NavLink>,
                    bpmnProcessId,
                    deploymentTime,
                  ],
                  // the item <NavLink> causes type error
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ) as any)
              : []
          }
        />
      </div>
    </>
  );
}
