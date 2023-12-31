import { Table } from "../components/Table";
import { useParams } from "react-router-dom";
import { useQuerySingleInstance } from "../hooks/useQuerySingleInstance";
import { ResponsiveBpmnViewer } from "../components/BpmnViewer";
import { ResizableContainer } from "../components/ResizableContainer";
import { Tabs } from "@mui/base/Tabs";
import { TabsList } from "@mui/base/TabsList";
import { TabPanel } from "@mui/base/TabPanel";
import { Tab } from "@mui/base/Tab";
import { useMemo } from "react";

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
  const getLatestLogs = useMemo((): { elementId: string; intent: string }[] => {
    const latestLogs: Record<string, string> = {};
    incidents?.items.forEach((incident) => {
      latestLogs[incident.elementId] =
        incident.state === "CREATED" ? "INCIDENT_CREATED" : "INCIDENT_RESOLVED";
    });
    auditLogs?.items.forEach((auditLog) => {
      const { elementId, intent, elementType } = auditLog;
      if (elementType === "PROCESS") return;
      if (!latestLogs[elementId]) latestLogs[elementId] = intent;
    });
    return Object.entries(latestLogs).map(([elementId, intent]) => ({
      elementId,
      intent,
    }));
  }, [incidents, auditLogs]);
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
    <div className="flex h-full w-full flex-col pr-4">
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
            colorOptions={getLatestLogs}
          />
        </div>
      </ResizableContainer>
      <div className="relative flex-grow overflow-auto">
        <div className="absolute h-full w-full pt-5">
          <Tabs defaultValue={0} className="flex h-full flex-col bg-white">
            <TabsList className="mb-4 flex w-full gap-2 border-b-2 border-accent">
              {tabsData.map((tab, index) => (
                <div key={index} className="flex-grow">
                  <Tab
                    value={index}
                    className={`w-full rounded-xl border-2 border-accent py-2 transition-all hover:bg-second-accent hover:shadow-lg focus:bg-second-accent active:bg-accent/20 aria-selected:h-[53px] aria-selected:rounded-b-none aria-selected:bg-accent aria-selected:text-white aria-selected:shadow-lg`}
                  >
                    {tab.label}
                  </Tab>
                </div>
              ))}
            </TabsList>
            {tabsData.map((tab, index) => (
              <TabPanel
                key={`panel-${index}`}
                value={index}
                className="flex-grow overflow-auto"
              >
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
      filterConfig={{
        mainFilter: {
          column: "Variable Name",
        },
        filterOptions: {
          "Variable Name": "string",
          "Variable Value": "string",
          Time: "time",
        },
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
      filterConfig={{
        mainFilter: { column: "Job Key" },
        filterOptions: {
          "Job Key": "string",
          "Job Type": "string",
          Retries: "string",
          Worker: "string",
          State: "string",
          Time: "time",
        },
      }}
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
      filterConfig={{
        mainFilter: { column: "Element ID" },
        filterOptions: {
          "Element ID": "string",
          "Element Type": "string",
          Intent: "string",
          Position: "string",
          Time: "time",
        },
      }}
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
      filterConfig={{
        mainFilter: {
          column: "Incident Key",
        },
        filterOptions: {
          "Element ID": "string",
          "Incident Key": "string",
          "Error Type": "string",
          "Error Message": "string",
          State: "string",
          Time: "time",
        },
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
