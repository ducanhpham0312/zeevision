import { Table } from "../components/Table";
import { useParams } from "react-router-dom";
import { ResponsiveBpmnViewer } from "../components/BpmnViewer";
import { useQueryProcessData } from "../hooks/useQueryProcessData";

export default function SingleProcessPage() {
  const params = useParams();
  const { process } = useQueryProcessData(params.id || "");

  const {
    processKey,
    // bpmnProcessId,
    version,
    deploymentTime,
    bpmnResource,
    instances,
  } = process;

  return (
    <div className="m-[40px]">
      <div className="mb-[40px] flex h-[30vh]">
        <div className="w-[30vw]">
          <Table
            orientation="vertical"
            header={["Process Key", "Version", "Deployment Time"]}
            content={process ? [[processKey, version, deploymentTime]] : []}
          />
        </div>
        <div className="h-full w-full border border-black/10">
          <ResponsiveBpmnViewer
            navigated
            classname="h-full w-full"
            bpmnString={bpmnResource}
          />
        </div>
      </div>
      <Table
        orientation="horizontal"
        header={["Instance Key", "Version", "Start Time"]}
        content={
          instances
            ? instances.map(
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
  );
}
