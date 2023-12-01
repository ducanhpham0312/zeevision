import { Table } from "../components/Table";
import { useParams } from "react-router-dom";
import { useQuerySingleInstance } from "../hooks/useQuerySingleInstance";
import { ResponsiveBpmnViewer } from "../components/BpmnViewer";
import { ResizableContainer } from "../components/ResizableContainer";
import { Tabs } from "@mui/base/Tabs";
import { TabsList } from "@mui/base/TabsList";
import { TabPanel } from "@mui/base/TabPanel";
import { Tab } from "@mui/base/Tab";

export default function SingleInstancesPage() {
  const params = useParams();
  const { instance } = useQuerySingleInstance(params.id || "");
  const {
    instanceKey,
    version,
    processKey,
    status,
    startTime,
    endTime,
    bpmnResource,
    bpmnProcessId,
    variables,
    jobs,
  } = instance;
  return (
    <div className="flex h-full w-full flex-col gap-3">
      <ResizableContainer direction="vertical">
        <div className="flex h-full">
          <ResizableContainer direction="horizontal">
            <div className="w-full pr-3">
              <Table
                orientation="vertical"
                header={[
                  "Instance Key",
                  "BPMN Process ID",
                  "Version",
                  "Process Key",
                  "Status",
                  "Start Time",
                  "End Time",
                ]}
                content={
                  instance
                    ? [
                        [
                          instanceKey,
                          bpmnProcessId,
                          version,
                          processKey,
                          status,
                          startTime,
                          endTime,
                        ],
                      ]
                    : []
                }
              />
            </div>
          </ResizableContainer>
          <ResponsiveBpmnViewer
            navigated
            className="h-full flex-grow"
            bpmnString={bpmnResource}
          />
        </div>
      </ResizableContainer>
      <Tabs defaultValue={"variables"} className="bg-white">
        <TabsList className="grid w-full grid-cols-2 rounded-lg border-2">
          <Tab
            value={"variables"}
            className={`m-1 w-full rounded-md px-12 py-5 hover:bg-second-accent focus:bg-second-accent/100`}
          >
            Variables
          </Tab>
          <Tab
            value={"jobs"}
            className={`m-1 w-full rounded-md px-12 py-5 hover:bg-second-accent focus:bg-second-accent/100`}
          >
            Jobs
          </Tab>
        </TabsList>
        <TabPanel value={"variables"}>
          <VariablesTable variables={variables} />
        </TabPanel>
        <TabPanel value={"jobs"}>
          <JobsTable jobs={jobs} />
        </TabPanel>
      </Tabs>
    </div>
  );
}
interface VariableListProps {
  variables: VariableType[];
}
function VariablesTable({ variables }: VariableListProps) {
  return (
    <Table
      orientation="horizontal"
      header={["Variable Name", "Variable Value", "Time"]}
      content={
        variables && variables.length > 0
          ? variables.map(({ name, value, time }) => [name, value, time])
          : []
      }
    />
  );
}

interface JobListProps {
  jobs: JobType[];
}
function JobsTable({ jobs }: JobListProps) {
  return (
    <Table
      orientation="horizontal"
      header={[
        "Element ID",
        "Job Key",
        "Job Type",
        "Retries",
        "Job Worker",
        "State",
        "Time",
      ]}
      content={
        jobs
          ? jobs.map(
              ({ elementId, key, type, retries, worker, state, time }) => [
                elementId,
                key,
                type,
                retries,
                worker,
                state,
                time,
              ],
            )
          : []
      }
    />
  );
}
