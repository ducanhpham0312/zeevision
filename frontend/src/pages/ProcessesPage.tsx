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
          header={["Process Key", "Process ID", "Version", "Deployment Time"]}
          orientation="horizontal"
          expandElement={(idx: number) => (
            <div className="flex flex-col gap-4 p-4">
              <p>Process Details:</p>
              <div>
                <Table
                  orientation="horizontal"
                  header={["Instance Key", "Status", "Version", "Start Time"]}
                  optionElement={() => <></>}
                  content={
                    processes[idx].instances
                      ? processes[idx].instances.map(
                          ({ instanceKey, status, version, startTime }) => [
                            <NavLink
                              to={`/instances/${instanceKey.toString()}`}
                            >
                              {instanceKey}
                            </NavLink>,
                            status,
                            version,
                            startTime,
                          ],
                        )
                      : []
                  }
                />
              </div>
            </div>
          )}
          content={
            processes
              ? processes.map(
                  ({ processKey, bpmnProcessId, version, deploymentTime }) => [
                    <NavLink to={processKey.toString()}>{processKey}</NavLink>,
                    bpmnProcessId,
                    version,
                    deploymentTime,
                  ],
                )
              : []
          }
        />
      </div>
    </>
  );
}
