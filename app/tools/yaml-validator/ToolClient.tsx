"use client";

import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YamlValidatorPanel from "./_panels/YamlValidatorPanel";
import YamlFormatterPanel from "./_panels/YamlFormatterPanel";
import JsonToYamlPanel from "./_panels/JsonToYamlPanel";
import YamlToJsonPanel from "./_panels/YamlToJsonPanel";
import type { IncomingWorkflowInput, WorkflowOperation } from "./workflow-types";

const tasks: { label: string; value: WorkflowOperation }[] = [
  { value: "validate", label: "Validate YAML" },
  { value: "format", label: "Format YAML" },
  { value: "json-to-yaml", label: "JSON to YAML" },
  { value: "yaml-to-json", label: "YAML to JSON" },
];

export default function ToolClient() {
  const [activeTask, setActiveTask] = useState<WorkflowOperation>("validate");
  const [incoming, setIncoming] = useState<Partial<Record<WorkflowOperation, IncomingWorkflowInput>>>({});
  const sequence = useRef(0);

  const sendTo = (target: WorkflowOperation, value: string) => {
    sequence.current += 1;
    setIncoming((current) => ({
      ...current,
      [target]: { value, sequence: sequence.current },
    }));
    setActiveTask(target);
  };

  return (
    <ToolShell
      title="YAML Validator"
      description="Validate YAML with a strict YAML 1.2 parser, get document-level syntax diagnostics, and separate real parser failures from schema or application-specific configuration rules."
    >
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Choose a YAML task</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Validate YAML, format YAML, convert JSON to YAML, or convert YAML to JSON.
        </p>
        <div className="mt-3 w-full max-w-[20rem]">
          <YoryantraSelect
            label="What do you want to do?"
            value={activeTask}
            onChange={(value: string) => setActiveTask(value as WorkflowOperation)}
            options={tasks}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          After an operation succeeds, use its result in another task without copying it again.
        </p>
      </div>

      {/* Keep panels mounted: inputs, settings, diagnostics, and results survive tab changes. */}
      <div id="yaml-panel-validate" hidden={activeTask !== "validate"}>
        <YamlValidatorPanel incoming={incoming.validate} onSend={sendTo} />
      </div>
      <div id="yaml-panel-format" hidden={activeTask !== "format"}>
        <YamlFormatterPanel incoming={incoming.format} onSend={sendTo} />
      </div>
      <div id="yaml-panel-json-to-yaml" hidden={activeTask !== "json-to-yaml"}>
        <JsonToYamlPanel incoming={incoming["json-to-yaml"]} onSend={sendTo} />
      </div>
      <div id="yaml-panel-yaml-to-json" hidden={activeTask !== "yaml-to-json"}>
        <YamlToJsonPanel incoming={incoming["yaml-to-json"]} onSend={sendTo} />
      </div>
    </ToolShell>
  );
}
