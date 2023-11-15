import { gql, useQuery } from "@apollo/client";
import { Table } from "../components/Table";
export default function InstancesPage() {
  const INSTANCES = gql`
    query Instances {
      instances {
        instanceKey
        processId
        status
        startTime
      }
    }
  `
  const { data } = useQuery(INSTANCES)
  // const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  // const handleOpen = () => setIsPopUpOpen(true);
  // const handleClose = () => setIsPopUpOpen(false);
  return (
    // <>
    //   {/** Temporary test for open Modal. Must be moved to ProcessesPage after issue #94 is completed */}
    //   <Button onClick={handleOpen}>Deploy a Process</Button>
    //   <DeployProcessPopup
    //     isPopUpOpen={isPopUpOpen}
    //     onOpenPopUp={handleOpen}
    //     onClosePopUp={handleClose}
    //   />
    // </>
    <Table 
      orientation="horizontal" 
      header={["Instance Key", "BPMN Process ID", "Status", "Start Time"]}
      content={
        data
          ? data.instances.map(
              ({
                instanceKey,
                processId,
                status,
                startTime,
              }: {
                instanceKey: number;
                processId: string;
                status: string;
                startTime: string;
              }) => [instanceKey,processId, status, startTime]
            )
          : []
      }
    />
  );
}
