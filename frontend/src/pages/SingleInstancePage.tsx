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
    auditLogs,
    incidents,
  } = instance;
  const getLatestLogs = (): { elementId: string; intent: string }[] => {
    const latestLogs: Record<string, string> = {};
    incidents?.items.forEach((incident) => {
      latestLogs[incident.elementId] =
        incident.state === "CREATED" ? "INCIDENT_CREATED" : "INCIDENT_RESOLVED";
    });
    auditLogs?.items.forEach((auditLog) => {
      const { elementId, intent } = auditLog;
      if (!latestLogs[elementId]) latestLogs[elementId] = intent;
    });
    return Object.entries(latestLogs).map(([elementId, intent]) => ({
      elementId,
      intent,
    }));
  };
  const tabsData = [
    {
      label: "Variables",
      content: <VariablesTable variables={variables?.items} />,
    },
    { label: "Jobs", content: <JobsTable jobs={jobs?.items} /> },
    {
      label: "Audit Logs",
      content: <AuditLogsTable auditLogs={auditLogs?.items} />,
    },
    {
      label: "Incidents",
      content: <IncidentsTable incidents={incidents?.items} />,
    },
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
                  navLinkColumn={{
                    "Process Key": (value: string | number) =>
                      `/processes/${value}`,
                  }}
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
            colorOptions={getLatestLogs()}
          />
        </div>
      </ResizableContainer>
      <div className="relative flex-grow overflow-auto">
        <div className="absolute h-full w-full">
          <Tabs defaultValue={"Variables"} className="bg-white">
            <TabsList className="mb-5 mt-10 grid w-full grid-cols-4 rounded-xl border-2">
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
      </div>
    </div>
  );
}

interface VariableListProps {
  variables: VariableType[];
}
function VariablesTable({ variables }: VariableListProps) {
  return (
    <Table
      alterRowColor
      orientation="horizontal"
      header={["Variable Name", "Variable Value", "Time"]}
      noStyleColumn={{
        "Variable Value": (value: string | number) => value.toString(),
      }}
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
      alterRowColor
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

interface AuditLogListProps {
  auditLogs: AuditLogType[];
}
function AuditLogsTable({ auditLogs }: AuditLogListProps) {
  return (
    <Table
      alterRowColor
      orientation="horizontal"
      header={["Element ID", "Element Type", "Intent", "Position", "Time"]}
      content={
        auditLogs
          ? auditLogs.map(
              ({ elementId, elementType, intent, position, time }) => [
                elementId,
                elementType,
                intent,
                position,
                time,
              ],
            )
          : []
      }
    />
  );
}

interface IncidentListProps {
  incidents: IncidentType[];
}
function IncidentsTable({ incidents }: IncidentListProps) {
  return (
    <Table
      orientation="horizontal"
      header={[
        "Element ID",
        "Incident Key",
        "Error Type",
        "Error Message",
        "State",
        "Time",
      ]}
      noStyleColumn={{
        "Error Message": (value: string | number) => value.toString(),
      }}
      content={
        incidents
          ? incidents.map(
              ({
                elementId,
                incidentKey,
                errorType,
                errorMessage,
                state,
                time,
              }) => [
                elementId,
                incidentKey,
                errorType,
                errorMessage,
                state,
                time,
              ],
            )
          : []
      }
    />
  );
}
