import { useState } from "react";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
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
      <div className="flex h-full flex-col gap-10 overflow-auto pr-4">
        <div className="flex items-center justify-between">
          <h1>PROCESSES</h1>
          <Button onClick={handleOpen} variant="secondary">
            Deploy a Process
          </Button>
        </div>
        <div className="flex-grow">
          <Table
            alterRowColor
            filterConfig={{
              mainFilter: {
                column: "Process ID",
              },
              filterOptions: {
                "Process Key": "string",
                "Process ID": "string",
                Version: "value",
                "Deployment Time": "time",
              },
            }}
            header={["Process Key", "Process ID", "Version", "Deployment Time"]}
            orientation="horizontal"
            navLinkColumn={{
              "Process Key": (value: string | number) => `/processes/${value}`,
            }}
            expandElement={(idx: number) => (
              <div className="flex flex-col gap-4 p-4">
                <p>Process Details:</p>
                <div>
                  <Table
                    alterRowColor={false}
                    orientation="horizontal"
                    header={["Instance Key", "Status", "Version", "Start Time"]}
                    navLinkColumn={{
                      "Instance Key": (value: string | number) =>
                        `/instances/${value.toString()}`,
                    }}
                    content={
                      processes[idx].instances
                        ? processes[idx].instances.items.map(
                            ({ instanceKey, status, version, startTime }) => [
                              instanceKey,
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
                    ({
                      processKey,
                      bpmnProcessId,
                      version,
                      deploymentTime,
                    }) => [processKey, bpmnProcessId, version, deploymentTime],
                  )
                : []
            }
          />
        </div>
      </div>
    </>
  );
}
