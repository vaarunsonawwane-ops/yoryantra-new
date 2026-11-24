export type WorkflowOperation = "parse" | "env-json" | "json-env" | "compare";
export type IncomingWorkflowInput = { value: string; side?: "a" | "b"; sequence: number };
export type WorkflowPanelProps = { incoming?: IncomingWorkflowInput; onSend: (target: WorkflowOperation, value: string, side?: "a" | "b") => void };
