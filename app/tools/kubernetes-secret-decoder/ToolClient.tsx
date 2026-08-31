"use client";

import { useState } from "react";
import { parseAllDocuments } from "yaml";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type SecretEntry = {
  key: string;
  source: "data" | "stringData";
  encodedValue: string;
  decodedValue: string;
  bytes: number;
  isText: boolean;
  error: string;
};

type SecretResult = {
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
  secretType: string;
  entries: SecretEntry[];
  notes: string[];
};

const sampleSecret = `apiVersion: v1
kind: Secret
metadata:
  name: app-credentials
  namespace: default
type: Opaque
data:
  username: YWRtaW4=
  password: c2VjdXJlLWV4YW1wbGU=
stringData:
  environment: "staging\\nblue"`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SecretResult | null>(null);
  const [error, setError] = useState("");
  const [showEncoded, setShowEncoded] = useState(false);
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const decodeSecret = () => {
    if (!input.trim()) {
      setError("Please paste a Kubernetes Secret YAML document.");
      setResult(null);
      return;
    }

    try {
      setResult(parseKubernetesSecret(input));
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to parse this Kubernetes Secret.");
      setResult(null);
    }
  };

  const loadExample = () => {
    setInput(sampleSecret);
    setShowEncoded(false);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setShowEncoded(false);
    clearResult();
  };

  const copyReport = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(buildReport(result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <ToolShell
      title="Kubernetes Secret Decoder"
      description="Decode standard Base64 values from Kubernetes Secret data, inspect stringData and metadata, and identify malformed or binary values locally in your browser."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Kubernetes Secret YAML</label>
        <textarea
          value={input}
          onChange={(event) => { setInput(event.target.value); clearResult(); }}
          rows={16}
          placeholder={sampleSecret}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <input id="show-encoded" type="checkbox" checked={showEncoded} onChange={(event) => setShowEncoded(event.target.checked)} className="h-4 w-4 accent-[var(--light-gold)]" />
        <label htmlFor="show-encoded">Show original Base64 values beside decoded data</label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={decodeSecret} className="yoryantra-btn">Decode Secret</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
        {result && <button onClick={copyReport} className="yoryantra-btn-outline">{copied ? "Copied" : "Copy Report"}</button>}
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>}

      {result && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Name" value={result.name || "(not set)"} />
            <SummaryCard label="Namespace" value={result.namespace || "default / not set"} />
            <SummaryCard label="Type" value={result.secretType || "Opaque / not set"} />
            <SummaryCard label="Fields" value={result.entries.length.toLocaleString()} />
            <SummaryCard label="API" value={`${result.apiVersion || "?"} ${result.kind || "?"}`} />
          </div>

          <div className="mt-8 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600"><tr><th className="px-4 py-3">Key</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Decoded Value</th>{showEncoded && <th className="px-4 py-3">Encoded Value</th>}<th className="px-4 py-3">Bytes</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {result.entries.map((entry) => (
                  <tr key={`${entry.source}-${entry.key}`}>
                    <td className="px-4 py-3 font-mono font-semibold">{entry.key}</td>
                    <td className="px-4 py-3">{entry.source}</td>
                    <td className="px-4 py-3"><pre className={`max-w-[520px] whitespace-pre-wrap break-words font-mono text-xs ${entry.error ? "text-red-700" : "text-gray-800"}`}>{entry.error || entry.decodedValue}</pre></td>
                    {showEncoded && <td className="px-4 py-3"><code className="block max-w-[360px] break-all text-xs">{entry.encodedValue || "—"}</code></td>}
                    <td className="px-4 py-3">{entry.bytes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.notes.length > 0 && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-semibold text-amber-900">Review notes</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-amber-800">{result.notes.map((note, index) => <li key={index}>{note}</li>)}</ul>
            </div>
          )}
        </>
      )}

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Decoding happens in your browser. Kubernetes Secret values are only Base64-encoded by default, not encrypted by Base64 itself. Avoid pasting production credentials unless you genuinely need to inspect them.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Reading Kubernetes Secret Data Without Misreading YAML</h2>
          <p className="mt-4 leading-relaxed text-gray-600">A Kubernetes Secret normally stores encoded bytes under <code>data</code> and accepts plain strings under <code>stringData</code>. This version uses a real YAML parser rather than stripping quotes manually, so YAML double-quoted escapes, single-quoted scalar rules, block scalars, anchors, comments, and normal YAML parsing behavior are handled before Secret fields are inspected.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Base64 Is an Encoding, Not a Secret-Protection Mechanism</h2>
          <p className="mt-4 leading-relaxed text-gray-600">Anyone who can read the Secret object can normally decode its Base64 data. Kubernetes documents additional protections such as encryption at rest and access controls, but those are cluster configuration concerns; this browser tool does not check them.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Binary Secret Values</h2>
          <p className="mt-4 leading-relaxed text-gray-600">Not every Secret value is UTF-8 text. TLS keys, certificates, keystores, and application blobs can contain arbitrary bytes. When Base64 decoding succeeds but strict UTF-8 decoding does not, the tool reports a hexadecimal preview instead of inventing replacement characters.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">What This Tool Does Not Validate</h2>
          <p className="mt-4 leading-relaxed text-gray-600">The YAML is parsed accurately, but this is not a Kubernetes API-server validator. It does not apply admission rules, verify a Secret type&apos;s required keys, resolve server-side apply behavior, or check RBAC. Paste one YAML document at a time.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Official References</h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <a href="https://kubernetes.io/docs/concepts/configuration/secret/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">Kubernetes Secrets documentation →</a>
            <a href="https://yaml.org/spec/1.2.2/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] hover:underline">YAML 1.2.2 specification →</a>
          </div>
        </div>
        <div><h2 className="text-xl font-semibold text-gray-900">Related Tools</h2><YoryantraRelatedTools currentHref="/tools/kubernetes-secret-decoder" /></div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div><div className="mt-1 break-words font-mono text-sm font-semibold text-gray-900">{value}</div></div>;
}

function parseKubernetesSecret(source: string): SecretResult {
  const documents = parseAllDocuments(source, { uniqueKeys: true });
  const errors = documents.flatMap((document) => document.errors);
  if (errors.length) throw new Error(`Invalid YAML: ${errors[0].message}`);

  const nonEmpty = documents.filter((document) => document.contents !== null);
  if (nonEmpty.length !== 1) throw new Error(`Paste exactly one Kubernetes Secret YAML document. Found ${nonEmpty.length} non-empty documents.`);
  const value = nonEmpty[0].toJS({ maxAliasCount: 100 }) as unknown;
  if (!isRecord(value)) throw new Error("The YAML document must contain a mapping/object at the top level.");

  const apiVersion = scalarString(value.apiVersion);
  const kind = scalarString(value.kind);
  const secretType = scalarString(value.type);
  if (kind && kind.toLowerCase() !== "secret") throw new Error(`This manifest is kind: ${kind}, not kind: Secret.`);

  const metadata = value.metadata === undefined ? {} : requireRecord(value.metadata, "metadata");
  const name = scalarString(metadata.name);
  const namespace = scalarString(metadata.namespace);
  const data = value.data === undefined || value.data === null ? {} : requireRecord(value.data, "data");
  const stringData = value.stringData === undefined || value.stringData === null ? {} : requireRecord(value.stringData, "stringData");
  if (!Object.keys(data).length && !Object.keys(stringData).length) throw new Error("No values were found under data or stringData.");

  const entries: SecretEntry[] = [];
  Object.entries(data).forEach(([key, raw]) => {
    if (typeof raw !== "string") {
      entries.push({ key, source: "data", encodedValue: stringifyScalar(raw), decodedValue: "", bytes: 0, isText: false, error: "Kubernetes Secret data values must be Base64 strings." });
      return;
    }
    try {
      const decoded = decodeBase64Value(raw);
      entries.push({ key, source: "data", encodedValue: raw, decodedValue: decoded.value, bytes: decoded.bytes, isText: decoded.isText, error: "" });
    } catch (err) {
      entries.push({ key, source: "data", encodedValue: raw, decodedValue: "", bytes: 0, isText: false, error: err instanceof Error ? err.message : "Invalid Base64 value." });
    }
  });

  Object.entries(stringData).forEach(([key, raw]) => {
    if (typeof raw !== "string") {
      entries.push({ key, source: "stringData", encodedValue: "", decodedValue: stringifyScalar(raw), bytes: 0, isText: false, error: "Kubernetes Secret stringData values must resolve to strings." });
      return;
    }
    entries.push({ key, source: "stringData", encodedValue: "", decodedValue: raw, bytes: new TextEncoder().encode(raw).length, isText: true, error: "" });
  });

  const notes: string[] = [];
  const dataKeys = new Set(Object.keys(data));
  const duplicates = Object.keys(stringData).filter((key) => dataKeys.has(key));
  if (duplicates.length) notes.push(`The key${duplicates.length === 1 ? "" : "s"} ${duplicates.join(", ")} appear in both data and stringData. Kubernetes uses stringData to merge/replace those values when the Secret is submitted.`);
  if (!kind) notes.push("No kind field was found. A normal Kubernetes Secret manifest uses kind: Secret.");
  if (!apiVersion) notes.push("No apiVersion field was found. Core Kubernetes Secrets normally use apiVersion: v1.");
  if (entries.some((entry) => entry.error)) notes.push("At least one value needs review. Other valid fields are still shown so you can isolate the problem.");
  if (entries.some((entry) => entry.source === "data" && !entry.error && !entry.isText)) notes.push("At least one decoded data value is binary rather than valid UTF-8 text; a hexadecimal preview is shown for that field.");

  return { apiVersion, kind, name, namespace, secretType, entries, notes };
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function requireRecord(value: unknown, field: string) { if (!isRecord(value)) throw new Error(`${field} must be a YAML mapping/object.`); return value; }
function scalarString(value: unknown) { if (value === undefined || value === null) return ""; if (typeof value === "string") return value; if (typeof value === "number" || typeof value === "boolean") return String(value); return ""; }
function stringifyScalar(value: unknown) { if (value === null) return "null"; if (typeof value === "string") return value; try { return JSON.stringify(value); } catch { return String(value); } }

function decodeBase64Value(value: string) {
  const normalized = value.replace(/\s+/g, "");
  if (!normalized) return { value: "", bytes: 0, isText: true };
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.length % 4 !== 0 || /=/.test(normalized.slice(0, -2))) throw new Error("Invalid standard Base64 encoding.");
  let binary = "";
  try { binary = atob(normalized); } catch { throw new Error("Invalid standard Base64 encoding."); }
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  try { return { value: new TextDecoder("utf-8", { fatal: true }).decode(bytes), bytes: bytes.length, isText: true }; }
  catch {
    const preview = Array.from(bytes.slice(0, 96)).map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
    return { value: `[binary data: ${bytes.length} bytes]\nhex: ${preview}${bytes.length > 96 ? " …" : ""}`, bytes: bytes.length, isText: false };
  }
}

function buildReport(result: SecretResult) {
  const lines = [
    "Kubernetes Secret Review",
    "------------------------",
    `apiVersion: ${result.apiVersion || "(missing)"}`,
    `kind: ${result.kind || "(missing)"}`,
    `name: ${result.name || "(missing)"}`,
    `namespace: ${result.namespace || "(not set)"}`,
    `type: ${result.secretType || "(not set)"}`,
    "",
    "Fields:",
    ...result.entries.map((entry) => `- ${entry.key} [${entry.source}]: ${entry.error || entry.decodedValue}`),
  ];
  if (result.notes.length) lines.push("", "Notes:", ...result.notes.map((note) => `- ${note}`));
  return lines.join("\n");
}
