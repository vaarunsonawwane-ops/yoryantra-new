export type WorkflowOperation = "validate" | "format" | "xml-to-json";

export type IncomingWorkflowInput = {
  value: string;
  sequence: number;
};

export type WorkflowPanelProps = {
  incoming?: IncomingWorkflowInput;
  onSend: (target: WorkflowOperation, value: string) => void;
};
