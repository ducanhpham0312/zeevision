import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { useUIStore } from "../contexts/useUIStore";
import { gql, useQuery } from "@apollo/client";
import { NavLink } from "react-router-dom";

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
  const { data } = useQuery(PROCESSES, {
    // TODO: make constant and move to centralized place
    pollInterval: 2000,
  });

  const { setSnackbarContent } = useUIStore();

  const handleClick = (type: "success" | "error") => {
    setSnackbarContent({
      title: "This is a test",
      message: "Everything was sent to the desired address.",
      type,
    });
  };

  return (
    <>
      <h1>ProcessesPage</h1>
      <Button variant="primary" onClick={() => handleClick("success")}>
        Test success snackbar
      </Button>
      <Button variant="secondary" onClick={() => handleClick("error")}>
        Test error snackbar
      </Button>

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
                ],
              )
            : []
        }
      />
    </>
  );
}
