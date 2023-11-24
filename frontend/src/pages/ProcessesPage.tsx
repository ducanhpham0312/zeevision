import { useState } from "react";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { gql, useQuery } from "@apollo/client";
import { NavLink } from "react-router-dom";
import { DeployProcessPopup } from "../components/DeployProcessPopup";
import { queryPollIntervalMs } from "../utils/constants";
import { DropdownMenuDemo } from "../components/DropdownMenu/test";

export default function ProcessesPage() {
  const PROCESSES = gql`
    query Processes {
      processes {
        bpmnProcessId
        processKey
        deploymentTime
        instances {
          instanceKey
          status
          startTime
        }
      }
    }
  `;
  const { data } = useQuery(PROCESSES, {
    pollInterval: queryPollIntervalMs,
  });

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
                  optionElement={() => <DropdownMenuDemo />}
                  content={
                    data.processes[idx].instances
                      ? data.processes[idx].instances.map(
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
            data
              ? data.processes.map(
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
                )
              : []
          }
        />
      </div>
    </>
  );
}
