// types.d.ts
declare module "*.bpmn" {
  const content: string;
  export default content;
}

type ProcessResult = {
  totalCount: number;
  items: ProcessType[];
};

type ProcessType = {
  processKey: number;
  deploymentTime: string;
  bpmnProcessId: string;
  bpmnResource: string;
  version: number;
  instances: InstanceResult;
};

type InstanceResult = {
  totalCount: number;
  items: Instance[];
};

// name colision, cannot name this to InstanceType
type Instance = {
  instanceKey: number;
  processKey: string;
  status: string;
  startTime: string;
  endTime: string;
  version: string;
  process: ProcessType;
  bpmnResource: string;
  bpmnProcessId: string;
  variables: VariableResult;
  jobs: JobResult;
  incidents: IncidentResults;
};

type VariableResult = {
  totalCount: number;
  items: VariableType[];
};

type VariableType = {
  name: string;
  value: string;
  time: string;
};

type JobResult = {
  totalCount: number;
  items: JobType[];
};

type JobType = {
  key: number;
  elementId: string;
  instanceKey: number;
  type: string;
  retries: number;
  worker: string;
  state: string;
  time: string;
};

type IncidentResult = {
  totalCount: number;
  items: IncidentType[];
};

type IncidentType = {
  incidentKey: number;
  elementId: string;
  instanceKey: number;
  errorType: string;
  errorMessage: string;
  state: string;
  time: string;
};
