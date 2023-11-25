import { Table } from "../components/Table";
import { useParams } from "react-router-dom";
import { useQuerySingleInstance } from "../hooks/useQuerySingleInstance";
import { BpmnViewer } from "../components/BpmnViewer";

export default function SingleInstancesPage() {
  const params = useParams();
  const { instance } = useQuerySingleInstance(params.id || "");
  const {
    instanceKey,
    process,
    version,
    processKey,
    status,
    startTime
  } = instance;
  const bpmnProcessId = process ? process.bpmnProcessId : ""
  const bpmnResource = process ? process.bpmnResource : ""
  return (
    <div className="m-[40px]">
      <div className="mb-[40px] flex h-[30vh]">
        <Table
          orientation="vertical"
          header={[
            "Instance Key",
            "BPMN Process ID",
            "Version",
            "Process Key",
            "Status",
            "Start Time"
          ]}
          content={
            instance ? [[instanceKey, bpmnProcessId, version, processKey, status, startTime]] : []
          }
        />
        <BpmnViewer bpmnString={atob(bpmnResource)} />
      </div>
    </div>
  )
}