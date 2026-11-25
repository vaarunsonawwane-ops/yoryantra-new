export type WorkflowOperation = "string" | "json" | "html" | "xml";
export type IncomingWorkflowInput = { value: string; sequence: number };
export type WorkflowPanelProps = { incoming?: IncomingWorkflowInput; onSend: (target: WorkflowOperation, value: string) => void };
export const tasks: { label: string; value: WorkflowOperation }[] = [
  { label: "String escape sequences", value: "string" },
  { label: "JSON escape / unescape", value: "json" },
  { label: "HTML escape / unescape", value: "html" },
  { label: "XML escape / unescape", value: "xml" },
];
