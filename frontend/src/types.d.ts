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
  status: string;
  startTime: string;
  process: ProcessType;
};
