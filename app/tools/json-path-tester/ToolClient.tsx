"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import JsonPathPanel from "./_panels/JsonPathPanel";
// Additional operations load only when the visitor selects them.
// This avoids shipping all five tool implementations on first load.
const JsonPointerPanel = dynamic(() => import("./_panels/JsonPointerPanel"));
const JsonKeyPanel = dynamic(() => import("./_panels/JsonKeyPanel"));
const JsonFilterPanel = dynamic(() => import("./_panels/JsonFilterPanel"));
const JsonGroupPanel = dynamic(() => import("./_panels/JsonGroupPanel"));

type Operation = "jsonpath" | "pointer" | "keys" | "filter" | "group";

const OPERATIONS: Array<{label: string; value: Operation}> = [
  { label: "Test JSONPath", value: "jsonpath" },
  { label: "Evaluate JSON Pointer", value: "pointer" },
  { label: "Extract JSON keys", value: "keys" },
  { label: "Filter JSON array", value: "filter" },
  { label: "Group JSON array", value: "group" },
];

/**
 * One JSON source, five complete operations. Once opened, each panel stays
 * mounted (and remembers its options) while inactive panels remain hidden.
 * Editing the source clears stale output in every visited panel.
 */
export default function ToolClient() {
  const [operation, setOperation] = useState<Operation>("jsonpath");
  const [visited, setVisited] = useState<Operation[]>(["jsonpath"]);
  const [json, setJson] = useState("");

  const selectOperation = (value: string) => {
    const next = value as Operation;
    if (!OPERATIONS.some((item) => item.value === next)) return;
    setOperation(next);
    setVisited((previous) => previous.includes(next) ? previous : [...previous, next]);
  };

  const shared = { input: json, setInput: setJson };
  const sharedPath = { jsonInput: json, setJsonInput: setJson };

  return (
    <ToolShell
      title="JSONPath Tester"
      description="Test an RFC 9535 JSONPath subset against JSON and inspect the ordered matched nodes and normalized paths."
    >
      <div className="mb-7 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          Test JSONPath, evaluate JSON Pointer, extract JSON keys, filter JSON arrays, or group JSON arrays.
        </p>
        <div className="mt-3 w-full max-w-[20rem]">
          <YoryantraSelect
            label="What do you want to do?"
            value={operation}
            onChange={selectOperation}
            options={OPERATIONS}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Your JSON stays here when you switch operations. Load Example replaces it for all operations.
        </p>
      </div>

      {visited.includes("jsonpath") && (
        <div className={operation === "jsonpath" ? "" : "hidden"}>
          <JsonPathPanel {...sharedPath} />
        </div>
      )}
      {visited.includes("pointer") && (
        <div className={operation === "pointer" ? "" : "hidden"}>
          <JsonPointerPanel {...sharedPath} />
        </div>
      )}
      {visited.includes("keys") && (
        <div className={operation === "keys" ? "" : "hidden"}>
          <JsonKeyPanel {...shared} />
        </div>
      )}
      {visited.includes("filter") && (
        <div className={operation === "filter" ? "" : "hidden"}>
          <JsonFilterPanel {...shared} />
        </div>
      )}
      {visited.includes("group") && (
        <div className={operation === "group" ? "" : "hidden"}>
          <JsonGroupPanel {...shared} />
        </div>
      )}
    </ToolShell>
  );
}
