"use client";

import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import XmlValidatorPanel from "./_panels/XmlValidatorPanel";
import XmlFormatterPanel from "./_panels/XmlFormatterPanel";
import XmlToJsonPanel from "./_panels/XmlToJsonPanel";
import type { IncomingWorkflowInput, WorkflowOperation } from "./workflow-types";

const tasks: { label: string; value: WorkflowOperation }[] = [
  { value: "validate", label: "Validate XML" },
  { value: "format", label: "Format XML" },
  { value: "xml-to-json", label: "XML to JSON" },
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
      title="XML Validator"
      description="Check XML well-formedness and inspect roots, namespaces, declarations, DOCTYPE, attributes, CDATA, and schema hints."
    >
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Choose an XML task</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Validate XML, format XML, or convert XML to JSON.
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
          After a task succeeds, send its result directly to another task.
        </p>
      </div>

      {/* Keep every task mounted so inputs, settings, and results survive switching. */}
      <div id="xml-panel-validate" role="region" aria-label="Validate XML" hidden={activeTask !== "validate"}>
        <XmlValidatorPanel incoming={incoming.validate} onSend={sendTo} />
      </div>
      <div id="xml-panel-format" role="region" aria-label="Format XML" hidden={activeTask !== "format"}>
        <XmlFormatterPanel incoming={incoming.format} onSend={sendTo} />
      </div>
      <div id="xml-panel-xml-to-json" role="region" aria-label="XML to JSON" hidden={activeTask !== "xml-to-json"}>
        <XmlToJsonPanel incoming={incoming["xml-to-json"]} onSend={sendTo} />
      </div>
    </ToolShell>
  );
}
