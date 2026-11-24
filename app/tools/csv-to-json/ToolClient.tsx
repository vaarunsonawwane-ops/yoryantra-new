"use client";

import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import CsvToJsonPanel from "./_panels/CsvToJsonPanel";
import JsonToCsvPanel from "./_panels/JsonToCsvPanel";
import CsvToMarkdownPanel from "./_panels/CsvToMarkdownPanel";
import JsonToMarkdownPanel from "./_panels/JsonToMarkdownPanel";
import CsvEscapePanel from "./_panels/CsvEscapePanel";
import JsonLinesPanel from "./_panels/JsonLinesPanel";
import type { IncomingWorkflowInput, InputFormat, WorkflowOperation } from "./workflow-types";

const tasks: { label: string; value: WorkflowOperation }[] = [
  { value: "csv-to-json", label: "CSV to JSON" },
  { value: "json-to-csv", label: "JSON to CSV" },
  { value: "csv-markdown", label: "CSV to Markdown Table" },
  { value: "json-markdown", label: "JSON to Markdown Table" },
  { value: "escape", label: "CSV Escape Formatter" },
  { value: "json-lines", label: "JSON Lines to JSON" },
];

export default function ToolClient() {
  const [activeTask, setActiveTask] = useState<WorkflowOperation>("csv-to-json");
  const [incoming, setIncoming] = useState<Partial<Record<WorkflowOperation, IncomingWorkflowInput>>>({});
  const sequence = useRef(0);
  const sendTo = (target: WorkflowOperation, value: string, format: InputFormat) => {
    sequence.current += 1;
    setIncoming((current) => ({ ...current, [target]: { value, format, sequence: sequence.current } }));
    setActiveTask(target);
  };
  return (
    <ToolShell layout="plain" title="CSV to JSON Converter" description="Convert CSV and JSON records, build Markdown tables, escape CSV fields and work with JSON Lines.">
      <div className="mb-10">
        <p className="text-sm leading-relaxed text-gray-600">
          Convert CSV to JSON, JSON to CSV, CSV or JSON to Markdown tables, escape CSV fields, or convert JSON Lines to JSON.
        </p>
        <div className="mt-3 w-full max-w-[20rem]">
          <YoryantraSelect variant="task" width="wide" label="What do you want to do?" value={activeTask} onChange={(value) => setActiveTask(value as WorkflowOperation)} options={tasks} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">Your work stays available when you switch operations. Sending a result replaces the receiving operation&apos;s input. Conversion runs in your browser.</p>
      </div>
      <div role="region" aria-label="CSV to JSON" hidden={activeTask !== "csv-to-json"}>
        <CsvToJsonPanel incoming={incoming["csv-to-json"]} onSend={sendTo} />
      </div>
      <div role="region" aria-label="JSON to CSV" hidden={activeTask !== "json-to-csv"}>
        <JsonToCsvPanel incoming={incoming["json-to-csv"]} onSend={sendTo} />
      </div>
      <div role="region" aria-label="CSV to Markdown Table" hidden={activeTask !== "csv-markdown"}>
        <CsvToMarkdownPanel incoming={incoming["csv-markdown"]} onSend={sendTo} />
      </div>
      <div role="region" aria-label="JSON to Markdown Table" hidden={activeTask !== "json-markdown"}>
        <JsonToMarkdownPanel incoming={incoming["json-markdown"]} onSend={sendTo} />
      </div>
      <div role="region" aria-label="CSV Escape Formatter" hidden={activeTask !== "escape"}>
        <CsvEscapePanel incoming={incoming["escape"]} onSend={sendTo} />
      </div>
      <div role="region" aria-label="JSON Lines to JSON" hidden={activeTask !== "json-lines"}>
        <JsonLinesPanel incoming={incoming["json-lines"]} onSend={sendTo} />
      </div>
    </ToolShell>
  );
}
