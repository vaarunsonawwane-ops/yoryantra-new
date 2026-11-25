"use client";
import { useState } from "react";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import { tasks, type WorkflowOperation, type WorkflowPanelProps } from "../workflow-types";
export default function TransferText({ source, value, onSend }: { source: WorkflowOperation; value: string; onSend: WorkflowPanelProps["onSend"] }) {
  const choices = tasks.filter(task => task.value !== source);
  const [target, setTarget] = useState<WorkflowOperation>(choices[0].value);
  return <div className="mt-6">
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-full max-w-80"><YoryantraSelect width="wide" label="Use converted text in" value={target} onChange={value => setTarget(value as WorkflowOperation)} options={choices} /></div>
      <button type="button" className="yoryantra-btn-outline" onClick={() => onSend(target, value)}>Send text</button>
    </div>
    <p className="mt-2 text-sm text-gray-600">Transfers the converted text, not the inspection report. This replaces the receiving input without automatically converting it.</p>
  </div>;
}
