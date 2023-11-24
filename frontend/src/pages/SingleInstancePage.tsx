import { Table } from "../components/Table";
import { useParams } from "react-router-dom";
import { useQuerySingleInstance } from "../hooks/useQuerySingleInstance";

export default function SingleInstancesPage() {
  const params = useParams();
  const { instance } = useQuerySingleInstance(params.id || "");
  const {
    instanceKey,
    bpmnProcessId,
    version,
    processKey,
    status,
    startTime
  } = instance;
  
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
      </div>
    </div>
  )
}