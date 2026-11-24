"use client";

import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import EnvParserPanel from "./_panels/EnvParserPanel";
import EnvToJsonPanel from "./_panels/EnvToJsonPanel";
import JsonToEnvPanel from "./_panels/JsonToEnvPanel";
import EnvDiffPanel from "./_panels/EnvDiffPanel";
import type { IncomingWorkflowInput, WorkflowOperation } from "./workflow-types";

const tasks: { label: string; value: WorkflowOperation }[] = [
  { label: "Parse .env", value: "parse" },
  { label: "ENV to JSON", value: "env-json" },
  { label: "JSON to ENV", value: "json-env" },
  { label: "Compare environment variables", value: "compare" },
];

export default function ToolClient() {
  const [activeTask, setActiveTask] = useState<WorkflowOperation>("parse");
  const [incoming, setIncoming] = useState<Partial<Record<WorkflowOperation, IncomingWorkflowInput>>>({});
  const sequence = useRef(0);
  const sendTo = (target: WorkflowOperation, value: string, side?: "a" | "b") => {
    sequence.current += 1;
    setIncoming((current) => ({ ...current, [target]: { value, side, sequence: sequence.current } }));
    setActiveTask(target);
  };
  return (
    <ToolShell layout="plain" title=".env File Parser" description="Inspect dotenv assignments, convert ENV and JSON, and compare environment variables.">
      <div className="mb-10">
        <p className="leading-relaxed text-gray-600">Parse .env files, convert ENV to JSON or JSON to ENV, and compare environment variables.</p>
        <div className="mt-3 w-full max-w-[20rem]">
          <YoryantraSelect variant="task" width="wide" label="What do you want to do?" value={activeTask} onChange={(value) => setActiveTask(value as WorkflowOperation)} options={tasks} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-700">Processing runs in your browser. Use sample or redacted values. Masking affects selected previews and reports only; conversion outputs and transfers can contain original values. Switching operations keeps your work. Sending data replaces the receiving input.</p>
      </div>
      <div role="region" aria-label="Parse .env" hidden={activeTask !== "parse"}>
        <EnvParserPanel incoming={incoming.parse} onSend={sendTo} />
      </div>
      <div role="region" aria-label="ENV to JSON" hidden={activeTask !== "env-json"}>
        <EnvToJsonPanel incoming={incoming["env-json"]} onSend={sendTo} />
      </div>
      <div role="region" aria-label="JSON to ENV" hidden={activeTask !== "json-env"}>
        <JsonToEnvPanel incoming={incoming["json-env"]} onSend={sendTo} />
      </div>
      <div role="region" aria-label="Compare environment variables" hidden={activeTask !== "compare"}>
        <EnvDiffPanel incoming={incoming.compare} onSend={sendTo} />
      </div>
    </ToolShell>
  );
}
