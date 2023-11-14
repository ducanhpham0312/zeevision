import { Button } from "../components/Button";
import { Table } from "../components/Table";
import { useUIStore } from "../contexts/useUIStore";
import { gql, useQuery } from "@apollo/client";

const PROCESSES = gql`
  query Test {
    processes {
      processId
      processKey
    }
  }
`;

export default function ProcessesPage() {
  const { data } = useQuery(PROCESSES);

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
      <Button variant="outlined" onClick={() => handleClick("success")}>
        Test success snackbar
      </Button>
      <Button onClick={() => handleClick("error")}>Test error snackbar</Button>

      <Table
        header={["Process Key", "Process ID"]}
        orientation="horizontal"
        content={
          data
            ? data.processes.map(
                ({
                  processKey,
                  processId,
                }: {
                  processKey: number;
                  processId: number;
                }) => [processKey, processId],
              )
            : []
        }
      />
    </>
  );
}
