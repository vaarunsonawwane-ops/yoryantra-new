/** Result transfers are intentional and scoped to a target operation. */
export type WorkflowOperation = "validate" | "format" | "json-to-yaml" | "yaml-to-json";

export type IncomingWorkflowInput = {
  value: string;
  sequence: number;
};

export type WorkflowPanelProps = {
  incoming?: IncomingWorkflowInput;
  onSend: (target: WorkflowOperation, value: string) => void;
};
