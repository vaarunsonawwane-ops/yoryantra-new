"use client";

import { useState } from "react";
import * as yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ConversionResult = { output: string; warnings: string[]; documentCount: number; error: string };

function hasNonFinite(value: unknown, seen = new Set<object>()): boolean {
  if (typeof value === "number") return !Number.isFinite(value);
  if (!value || typeof value !== "object") return false;
  if (seen.has(value as object)) return false;
  seen.add(value as object);
  if (Array.isArray(value)) return value.some((item) => hasNonFinite(item, seen));
  return Object.keys(value as Record<string, unknown>).some((key) => hasNonFinite((value as Record<string, unknown>)[key], seen));
}

function convertYamlToJson(source: string, indent: number): ConversionResult {
  if (!source.trim()) return { output: "", warnings: [], documentCount: 0, error: "Enter YAML to convert." };
  const documents: unknown[] = [];
  try {
    yaml.loadAll(source, (document) => documents.push(document), { schema: yaml.JSON_SCHEMA });
  } catch (error) {
    const candidate = error as Error & { mark?: { line?: number; column?: number; snippet?: string } };
    const line = typeof candidate.mark?.line === "number" ? candidate.mark.line + 1 : null;
    const column = typeof candidate.mark?.column === "number" ? candidate.mark.column + 1 : null;
    const location = line ? `Line ${line}${column ? `, column ${column}` : ""}: ` : "";
    return { output: "", warnings: [], documentCount: 0, error: `${location}${candidate.message || "Invalid YAML."}` };
  }

  const warnings: string[] = [];
  if (/(?:^|[\s\[\]{},?:-])[&*][A-Za-z0-9_-]+/m.test(source)) warnings.push("YAML anchors and aliases are resolved during loading. JSON cannot preserve anchor names or shared-reference identity; repeated data is serialized as ordinary JSON values.");
  if (/^\s*\?\s+/m.test(source)) warnings.push("An explicit complex mapping key was detected. JSON object keys are strings, so YAML key semantics may not survive conversion exactly.");
  if (/(?:^|[\s\[\]{},?:-])!!?[A-Za-z]/m.test(source)) warnings.push("Explicit YAML tags are present. This converter uses a JSON-compatible schema and may reject tags that do not map to JSON types.");
  if (/^%YAML\s+1\.1\s*$/m.test(source)) warnings.push("The stream declares YAML 1.1, but conversion uses JSON-compatible scalar resolution to avoid turning values such as timestamps into JavaScript-specific types.");
  if (documents.length > 1) warnings.push(`The stream contains ${documents.length} YAML documents. They are returned as one JSON array because a single JSON text has only one top-level value.`);

  const value = documents.length === 1 ? documents[0] : documents;
  if (hasNonFinite(value)) return { output: "", warnings, documentCount: documents.length, error: "The parsed YAML contains a non-finite number, which is not representable in JSON." };

  try {
    return { output: JSON.stringify(value, null, indent), warnings, documentCount: documents.length, error: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to serialize the resolved YAML graph as JSON.";
    return { output: "", warnings, documentCount: documents.length, error: `${message} This can happen when YAML aliases create a circular reference.` };
  }
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const convert = () => setResult(convertYamlToJson(input, indent));
  const loadExample = () => {
    const example = `---\napp:\n  name: Yoryantra\n  enabled: true\n  ports: [80, 443]\n  release_date: 2026-08-30\n---\nenvironment:\n  name: production\n  replicas: 3`;
    setInput(example);
    setResult(convertYamlToJson(example, indent));
  };
  const reset = () => { setInput(""); setIndent(2); setResult(null); };

  return (
    <ToolShell title="YAML to JSON Converter" description="Convert one or more YAML documents to JSON with JSON-compatible scalar handling and warnings for YAML features that JSON cannot preserve.">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">YAML input</label>
        <textarea value={input} onChange={(event: { target: { value: string } }) => setInput(event.target.value)} placeholder="app:\n  name: Yoryantra\n  enabled: true" className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition" />
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">JSON indentation</label>
          <select value={indent} onChange={(event: { target: { value: string } }) => setIndent(Number(event.target.value))} className="rounded-xl border border-gray-300 bg-white p-3 text-sm">
            <option value={2}>2 spaces</option><option value={4}>4 spaces</option>
          </select>
        </div>
        <button onClick={convert} className="yoryantra-btn">Convert to JSON</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Multi-Document Example</button>
        <button onClick={reset} className="yoryantra-btn-outline">Reset</button>
      </div>

      {result?.error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{result.error}</div>}
      {result?.warnings.length ? <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900"><strong>Conversion notes:</strong><ul className="mt-2 list-disc list-inside space-y-1">{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3"><h3 className="text-lg font-semibold text-gray-900">JSON Output</h3>{result?.output && <button onClick={() => navigator.clipboard.writeText(result.output)} className="yoryantra-btn-outline text-sm">Copy</button>}</div>
        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">{result?.output || "Converted JSON will appear here."}</pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">YAML Can Represent More Than JSON</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">JSON has objects with string keys, arrays, strings, finite numbers, booleans, and null. YAML also has tags, anchors and aliases, multiple documents in one stream, and schemas that can resolve plain scalars into application-specific types.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">To make conversion predictable, this tool loads YAML with a JSON-compatible schema. Values such as an unquoted date remain strings instead of being converted into JavaScript Date objects. If the YAML stream contains multiple documents, the output becomes a JSON array containing one value per document.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">What Is Lost During Conversion</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Comments, anchor names, scalar presentation style, and YAML document markers are not represented by JSON.</li>
            <li>Alias identity is not preserved; JSON receives the resolved values.</li>
            <li>Complex/non-string YAML mapping keys do not have a faithful JSON object-key equivalent.</li>
            <li>Custom tags outside the JSON-compatible schema may be rejected rather than silently converted.</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">References</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">See the <a className="underline" href="https://yaml.org/spec/1.2.2/" target="_blank" rel="noreferrer">YAML 1.2.2 specification</a> for the representation model and the <a className="underline" href="https://github.com/nodeca/js-yaml" target="_blank" rel="noreferrer">js-yaml documentation</a> for parser schema behavior.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">Parsing and conversion happen locally in your browser. No YAML content or converted JSON is uploaded by this tool.</p>
        </div>
        <div><h2 className="text-xl font-semibold text-gray-900">Explore Related Tools</h2><YoryantraRelatedTools currentHref="/tools/yaml-to-json-converter" /></div>
      </section>
    </ToolShell>
  );
}
