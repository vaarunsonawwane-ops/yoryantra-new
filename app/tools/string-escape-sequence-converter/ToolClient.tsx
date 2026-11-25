"use client";
import { useRef, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import { tasks, type IncomingWorkflowInput, type WorkflowOperation } from "./workflow-types";
import StringEscapePanel from "./_panels/StringEscapePanel";
import JsonEscapePanel from "./_panels/JsonEscapePanel";
import HtmlEscapePanel from "./_panels/HtmlEscapePanel";
import XmlEscapePanel from "./_panels/XmlEscapePanel";
const panels = { string: StringEscapePanel, json: JsonEscapePanel, html: HtmlEscapePanel, xml: XmlEscapePanel };
export default function ToolClient() {
  const [active, setActive] = useState<WorkflowOperation>("string");
  const [visited, setVisited] = useState<WorkflowOperation[]>(["string"]);
  const [incoming, setIncoming] = useState<Partial<Record<WorkflowOperation, IncomingWorkflowInput>>>({});
  const sequence = useRef(0);
  const open = (target: WorkflowOperation) => {
    setVisited(previous => previous.includes(target) ? previous : [...previous, target]);
    setActive(target);
  };
  const sendTo = (target: WorkflowOperation, value: string) => {
    sequence.current += 1;
    setIncoming(previous => ({ ...previous, [target]: { value, sequence: sequence.current } }));
    open(target);
  };
  return (
    <ToolShell layout="plain" title="String Escape Sequence Converter" description="Decode, encode, normalize or inspect JavaScript, JSON and C string escapes while keeping control characters, Unicode scalar values, UTF-16 surrogates and syntax-specific edge cases visible.">
      <div className="mb-10">
        <p className="leading-relaxed text-gray-600">Convert string escape sequences, escape or unescape JSON strings, HTML character references and XML entities.</p>
        <div className="mt-3 max-w-80">
          <YoryantraSelect variant="task" width="wide" label="What do you want to do?" value={active} onChange={value => open(value as WorkflowOperation)} options={tasks} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">Processing runs in your browser. Switching operations keeps your work. Sending text replaces the receiving input; choose its escaping context and action before converting.</p>
      </div>
      {tasks.filter(task => visited.includes(task.value)).map(task => {
        const Panel = panels[task.value];
        return <div key={task.value} hidden={active !== task.value} role="region" aria-label={task.label}><Panel incoming={incoming[task.value]} onSend={sendTo} /></div>;
      })}
    </ToolShell>
  );
}
