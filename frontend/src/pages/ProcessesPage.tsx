import { useState } from "react";
import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { useUIStore } from "../contexts/useUIStore";
import { gql, useQuery } from "@apollo/client";
import { NavLink } from "react-router-dom";
import { DeployProcessPopup } from "../components/DeployProcessPopup";

export default function ProcessesPage() {
  const PROCESSES = gql`
    query Processes {
      processes {
        processId
        processKey
        deploymentTime
      }
    }
  `;
  const { data } = useQuery(PROCESSES);
  const { setSnackbarContent } = useUIStore();

  const handleClick = (type: "success" | "error") => {
    setSnackbarContent({
      title: "This is a test",
      message: "Everything was sent to the desired address.",
      type,
    });
  };
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const handleOpen = () => setIsPopUpOpen(true);
  const handleClose = () => setIsPopUpOpen(false);

  return (
    <>
      <h1>ProcessesPage</h1>
      <Button onClick={() => handleClick("success")}>
        Test success snackbar
      </Button>
      <Button onClick={() => handleClick("error")}>Test error snackbar</Button>
      <>
          <Button onClick={handleOpen}>Deploy a Process</Button>
         <DeployProcessPopup
          isPopUpOpen={isPopUpOpen}
          onOpenPopUp={handleOpen}
          onClosePopUp={handleClose}
        />
      </>
      <Table
        header={["Process Key", "Process ID", "Deployment Time"]}
        orientation="horizontal"
        content={
          data
            ? data.processes.map(
                ({
                  processKey,
                  processId,
                  deploymentTime,
                }: {
                  processKey: number;
                  processId: number;
                  deploymentTime: string;
                }) => [
                  <NavLink to={processKey.toString()}>{processKey}</NavLink>,
                  processId,
                  deploymentTime,
                ]
              )
            : []
        }
      />
    </>
  );
}
