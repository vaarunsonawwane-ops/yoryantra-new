"use client";

import { lazy, Suspense, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Operation = "compare" | "merge" | "patch";

const JsonDiffPanel = lazy(() => import("./_panels/JsonDiffPanel"));
const JsonMergePanel = lazy(() => import("./_panels/JsonMergePanel"));
const JsonPatchPanel = lazy(() => import("./_panels/JsonPatchPanel"));

const descriptions: Record<Operation, string> = {
  compare: "Compare two JSON values and find what changed, including large-number and duplicate-key checks.",
  merge: "Combine JSON values using your own rules for conflicts, nested objects, arrays and nulls.",
  patch: "Generate and verify RFC 6902 JSON Patch operations between the original and modified JSON.",
};

export default function ToolClient() {
  const [operation, setOperation] = useState<Operation>("compare");
  // Shared values remain available while visitors switch between operations.
  const [leftJson, setLeftJson] = useState("");
  const [rightJson, setRightJson] = useState("");
  const sharedInputs = { leftJson, rightJson, setLeftJson, setRightJson };

  return (
    <ToolShell
      title="JSON Diff Checker"
      description="Compare, merge and generate JSON Patch operations from two JSON documents in one place."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-lg font-semibold text-gray-900">JSON operations</h2>
        <div className="mt-4 max-w-lg">
          <YoryantraSelect
            label="What do you want to do?"
            value={operation}
            onChange={(value: string) => setOperation(value as Operation)}
            options={[
              { label: "Compare JSON", value: "compare" },
              { label: "Merge JSON", value: "merge" },
              { label: "Generate JSON Patch", value: "patch" },
            ]}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{descriptions[operation]}</p>
        <p className="mt-2 text-sm text-gray-500">
          Your two JSON inputs stay here when you switch operations. In Merge and Patch, Load Example replaces both inputs.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-gray-600">Loading JSON operation…</p>}>
          {operation === "compare" ? <JsonDiffPanel {...sharedInputs} /> : null}
          {operation === "merge" ? <JsonMergePanel {...sharedInputs} /> : null}
          {operation === "patch" ? <JsonPatchPanel {...sharedInputs} /> : null}
        </Suspense>
      </div>
    </ToolShell>
  );
}
