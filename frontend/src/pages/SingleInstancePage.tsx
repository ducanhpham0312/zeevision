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

  const tabsData = [
    { label: "Variables", content: <VariablesTable variables={variables} /> },
    { label: "Jobs", content: <JobsTable jobs={jobs} /> },
  ];
  return (
    <div className="flex h-full w-full flex-col">
      <ResizableContainer direction="vertical">
        <div className="flex h-full">
          <ResizableContainer direction="horizontal">
            <div className="w-full overflow-hidden">
              <div className="min-w-[400px] pr-3">
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
            </div>
          </ResizableContainer>
          <ResponsiveBpmnViewer
            control
            navigated
            className="h-full flex-grow overflow-hidden"
            bpmnString={bpmnResource}
          />
        </div>
      </ResizableContainer>
      <Tabs defaultValue={"Variables"} className="bg-white">
        <TabsList className="mb-5 mt-10 grid w-full grid-cols-2 rounded-xl border-2">
          {tabsData.map((tab, index) => (
            <Tab
              key={index}
              value={tab.label}
              className={`m-1 rounded-xl py-2 hover:bg-second-accent focus:bg-second-accent/100`}
            >
              {tab.label}
            </Tab>
          ))}
        </TabsList>
        {tabsData.map((tab, index) => (
          <TabPanel key={index} value={tab.label}>
            {tab.content}
          </TabPanel>
        ))}
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
