"use client";

import { lazy, Suspense, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Operation = "validate" | "generate" | "typescript";

const SchemaValidationPanel = lazy(() => import("./_panels/SchemaValidationPanel"));
const SchemaGeneratorPanel = lazy(() => import("./_panels/SchemaGeneratorPanel"));
const SchemaTypescriptPanel = lazy(() => import("./_panels/SchemaTypescriptPanel"));

const OPERATIONS = [
  { label: "Validate JSON against a schema", value: "validate" },
  { label: "Generate schema from JSON", value: "generate" },
  { label: "Convert schema to TypeScript", value: "typescript" },
];

export default function ToolClient() {
  const [operation, setOperation] = useState<Operation>("validate");
  const [sampleInput, setSampleInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");

  // The validator intentionally implements only a Draft 2020-12 subset.
  const schemaDraft = (() => {
    if (!schemaInput.trim()) return "";
    try {
      const parsed: unknown = JSON.parse(schemaInput);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return "";
      const declared = (parsed as Record<string, unknown>).$schema;
      return typeof declared === "string" ? declared : "";
    } catch {
      return "";
    }
  })();
  const otherDraft = Boolean(
    schemaDraft &&
      schemaDraft.replace(/#$/, "") !== "https://json-schema.org/draft/2020-12/schema"
  );

  return (
    <ToolShell
      title="JSON Schema Validator"
      description="Validate JSON against a schema, generate a schema from sample data, or convert a schema to TypeScript in one place."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          Validate JSON against a schema, generate a schema from JSON, or convert a schema to TypeScript.
        </p>
        <div className="mt-3 w-full max-w-[20rem]">
          <YoryantraSelect
            label="What do you want to do?"
            value={operation}
            onChange={(value: string) => setOperation(value as Operation)}
            options={OPERATIONS}
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Your sample JSON and schema stay here when you change operations.
          Generate a schema once, then validate data or create TypeScript without pasting it again.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {schemaInput.trim() && operation !== "validate" ? (
            <button className="yoryantra-btn-outline" type="button" onClick={() => setOperation("validate")}>Validate current schema</button>
          ) : null}
          {schemaInput.trim() && operation !== "typescript" ? (
            <button className="yoryantra-btn-outline" type="button" onClick={() => setOperation("typescript")}>Convert current schema to TypeScript</button>
          ) : null}
          {operation !== "generate" ? (
            <button className="yoryantra-btn-outline" type="button" onClick={() => setOperation("generate")}>Generate schema from JSON</button>
          ) : null}
        </div>
        {otherDraft ? (
          <p className="mt-4 text-sm leading-relaxed text-amber-900">
            This schema declares {schemaDraft}. The validation operation supports only part of Draft 2020-12;
            it will reject other declared drafts. You can still convert this schema to TypeScript.
          </p>
        ) : null}
      </div>
      <div className="mt-7 min-w-0">
        <Suspense fallback={<p className="text-sm text-gray-600">Loading this operation...</p>}>
          {operation === "validate" ? (
            <SchemaValidationPanel
              sampleInput={sampleInput}
              setSampleInput={setSampleInput}
              schemaInput={schemaInput}
              setSchemaInput={setSchemaInput}
            />
          ) : operation === "generate" ? (
            <SchemaGeneratorPanel
              sampleInput={sampleInput}
              setSampleInput={setSampleInput}
              setSchemaInput={setSchemaInput}
            />
          ) : (
            <SchemaTypescriptPanel
              schemaInput={schemaInput}
              setSchemaInput={setSchemaInput}
            />
          )}
        </Suspense>
      </div>
    </ToolShell>
  );
}
