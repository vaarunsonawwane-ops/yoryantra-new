"use client";

import { useState } from "react";
import * as yaml from "js-yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ValidationResult = {
  valid: boolean;
  output: string;
  warnings: string[];
};

function rootType(value: unknown) {
  if (value === null) return "null / empty document";
  if (Array.isArray(value)) return `sequence (${value.length} items)`;
  if (typeof value === "object") return `mapping (${Object.keys(value as Record<string, unknown>).length} keys)`;
  return `${typeof value} scalar`;
}

function countToken(source: string, token: "&" | "*") {
  let count = 0;
  let single = false;
  let double = false;
  let comment = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === "\n") comment = false;
    if (comment) continue;
    if (char === "#" && !single && !double) { comment = true; continue; }
    if (char === "'" && !double) single = !single;
    if (char === '"' && !single && source[i - 1] !== "\\") double = !double;
    if (!single && !double && char === token && /[\s\[\]{},?:-]/.test(source[i - 1] || "\n") && /[A-Za-z0-9_-]/.test(source[i + 1] || "")) count += 1;
  }
  return count;
}

function validateYaml(source: string): ValidationResult {
  if (!source.trim()) return { valid: false, output: "", warnings: ["YAML content is empty."] };

  const documents: unknown[] = [];
  const warnings: string[] = [];
  try {
    yaml.loadAll(source, (document) => documents.push(document));
  } catch (error) {
    const candidate = error as Error & { mark?: { line?: number; column?: number; snippet?: string } };
    const line = typeof candidate.mark?.line === "number" ? candidate.mark.line + 1 : null;
    const column = typeof candidate.mark?.column === "number" ? candidate.mark.column + 1 : null;
    const location = line ? `Line ${line}${column ? `, column ${column}` : ""}: ` : "";
    const snippet = candidate.mark?.snippet ? `\n\n${candidate.mark.snippet}` : "";
    return { valid: false, output: `${location}${candidate.message || "Invalid YAML."}${snippet}`, warnings: [] };
  }

  if (/^%YAML\s+1\.1\s*$/m.test(source)) warnings.push("The stream declares YAML 1.1. This tool uses the parser's current schema behavior; YAML 1.1 scalar resolution can differ from YAML 1.2.");
  if (/^%YAML\s+(?!1\.[12]\b)/m.test(source)) warnings.push("The stream contains a YAML version directive outside 1.1/1.2; verify compatibility with the application that will consume it.");
  if (/\t/.test(source)) warnings.push("Tab characters are present. Tabs may be valid inside some scalar content but should not be used for indentation.");

  const anchors = countToken(source, "&");
  const aliases = countToken(source, "*");
  if (anchors || aliases) warnings.push(`Anchors/aliases detected: ${anchors} anchor token${anchors === 1 ? "" : "s"}, ${aliases} alias token${aliases === 1 ? "" : "s"}. Syntax validity does not prove the resolved data is appropriate for your application.`);

  const lines = [
    "YAML syntax is valid.",
    `Documents: ${documents.length}`,
    "",
    ...documents.map((document, index) => `Document ${index + 1}: ${rootType(document)}`),
  ];
  return { valid: true, output: lines.join("\n"), warnings };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  const validate = () => setResult(validateYaml(input));
  const loadExample = () => {
    const example = `---\napp:\n  name: Yoryantra\n  features:\n    - yaml-validator\n    - devops-tools\n---\nservice:\n  enabled: true\n  retries: 3`;
    setInput(example);
    setResult(validateYaml(example));
  };
  const reset = () => { setInput(""); setResult(null); };

  return (
    <ToolShell title="YAML Validator" description="Validate YAML syntax with a real YAML parser, including multi-document streams and parser line/column diagnostics.">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">YAML input</label>
        <textarea value={input} onChange={(event: { target: { value: string } }) => setInput(event.target.value)} placeholder="app:\n  name: Yoryantra\n  enabled: true" className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition" />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validate} className="yoryantra-btn">Validate YAML</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Multi-Document Example</button>
        <button onClick={reset} className="yoryantra-btn-outline">Reset</button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Validation Result</h3>
          {result?.output && <button onClick={() => navigator.clipboard.writeText(result.output)} className="yoryantra-btn-outline text-sm">Copy</button>}
        </div>
        <pre className={`yoryantra-output overflow-auto text-sm min-h-[200px] whitespace-pre-wrap break-words ${result && !result.valid ? "text-red-700" : ""}`}>{result?.output || "YAML parser diagnostics will appear here."}</pre>
      </div>

      {result?.warnings.length ? <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900"><strong>Notes:</strong><ul className="mt-2 list-disc list-inside space-y-1">{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Syntax Validation Is Different From Configuration Validation</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">This tool parses the YAML stream rather than trying to infer validity from indentation, colons, or quote counts. That means flow collections, block scalars, anchors, aliases, quoted keys, multiple documents, and other legal YAML syntax are handled by a YAML parser.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">A successful parse only means the YAML stream is syntactically loadable. It does not prove that a Kubernetes manifest, GitHub Actions workflow, Docker Compose file, or application configuration satisfies the schema expected by that product.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Duplicate Mapping Keys and YAML Data Rules</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">YAML mappings require unique keys. The parser reports duplicate-key problems instead of silently treating the later entry as authoritative. YAML also supports anchors and aliases, which can represent shared references that do not have an exact equivalent in simpler formats such as JSON.</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">The current YAML specification is YAML 1.2.2. Real-world libraries and applications can use different schemas or compatibility modes, so scalar interpretation such as dates, booleans, and custom tags should be checked against the software that will consume the file.</div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References</h2>
          <ul className="mt-3 list-disc list-inside space-y-2 text-gray-600"><li><a className="underline" href="https://yaml.org/spec/1.2.2/" target="_blank" rel="noreferrer">YAML 1.2.2 specification</a></li><li><a className="underline" href="https://github.com/nodeca/js-yaml" target="_blank" rel="noreferrer">js-yaml parser documentation</a></li></ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">Validation runs in your browser using the bundled parser. The tool does not upload the YAML or fetch schemas from a server.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Explore Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/yaml-validator" />
        </div>
      </section>
    </ToolShell>
  );
}
