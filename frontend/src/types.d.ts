// types.d.ts
declare module "*.bpmn" {
  const content: string;
  export default content;
}

type ProcessType = {
  processKey: number;
  deploymentTime: string;
  bpmnProcessId: string;
  bpmnResource: string;
  version: number;
  instances: Instance[];
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
  variables: VariableType[];
  jobs: JobType[];
};

type VariableType = {
  name: string;
  value: string;
  time: string;
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
