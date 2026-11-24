export type WorkflowOperation = "csv-to-json" | "json-to-csv" | "csv-markdown" | "json-markdown" | "escape" | "json-lines";
export type InputFormat = "csv" | "json" | "jsonl";
export type IncomingWorkflowInput = { value: string; format: InputFormat; sequence: number };
export type WorkflowPanelProps = { incoming?: IncomingWorkflowInput; onSend: (target: WorkflowOperation, value: string, format: InputFormat) => void };
