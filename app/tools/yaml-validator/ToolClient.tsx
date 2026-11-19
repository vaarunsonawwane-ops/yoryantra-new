"use client";

import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YamlValidatorPanel from "./_panels/YamlValidatorPanel";
import YamlFormatterPanel from "./_panels/YamlFormatterPanel";
import JsonToYamlPanel from "./_panels/JsonToYamlPanel";
import YamlToJsonPanel from "./_panels/YamlToJsonPanel";
import type { IncomingWorkflowInput, WorkflowOperation } from "./workflow-types";

const tasks: { id: WorkflowOperation; label: string; detail: string }[] = [
  { id: "validate", label: "Validate YAML", detail: "Check syntax, documents, and parser errors" },
  { id: "format", label: "Format YAML", detail: "Adjust indentation and line width" },
  { id: "json-to-yaml", label: "JSON to YAML", detail: "Convert JSON with formatting choices" },
  { id: "yaml-to-json", label: "YAML to JSON", detail: "Convert documents and review data loss" },
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
        <p className="mt-1 text-sm text-gray-600">
          Validate, format, and convert YAML or JSON here. After an operation succeeds, use its result in another task without copying it again.
        </p>
        <div role="tablist" aria-label="YAML operations" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tasks.map((task) => (
            <button
              type="button"
              role="tab"
              id={`yaml-tab-${task.id}`}
              key={task.id}
              aria-selected={activeTask === task.id}
              aria-controls={`yaml-panel-${task.id}`}
              onClick={() => setActiveTask(task.id)}
              className={`rounded-xl border border-[var(--green)] bg-white p-4 text-left transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)] motion-reduce:transform-none ${
                activeTask === task.id ? "shadow-sm" : ""
              }`}
            >
              <span className="block font-semibold text-gray-900">{task.label}</span>
              <span className="mt-1 block text-xs leading-5 text-gray-600">{task.detail}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Keep panels mounted: inputs, settings, diagnostics, and results survive tab changes. */}
      <div id="yaml-panel-validate" role="tabpanel" aria-labelledby="yaml-tab-validate" hidden={activeTask !== "validate"}>
        <YamlValidatorPanel incoming={incoming.validate} onSend={sendTo} />
      </div>
      <div id="yaml-panel-format" role="tabpanel" aria-labelledby="yaml-tab-format" hidden={activeTask !== "format"}>
        <YamlFormatterPanel incoming={incoming.format} onSend={sendTo} />
      </div>
      <div id="yaml-panel-json-to-yaml" role="tabpanel" aria-labelledby="yaml-tab-json-to-yaml" hidden={activeTask !== "json-to-yaml"}>
        <JsonToYamlPanel incoming={incoming["json-to-yaml"]} onSend={sendTo} />
      </div>
      <div id="yaml-panel-yaml-to-json" role="tabpanel" aria-labelledby="yaml-tab-yaml-to-json" hidden={activeTask !== "yaml-to-json"}>
        <YamlToJsonPanel incoming={incoming["yaml-to-json"]} onSend={sendTo} />
      </div>
    </ToolShell>
  );
}
