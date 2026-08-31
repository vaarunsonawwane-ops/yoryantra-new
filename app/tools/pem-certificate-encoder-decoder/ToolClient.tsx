"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "parse" | "extract" | "wrap" | "normalize" | "inspect";
type OutputMode = "summary" | "pem" | "base64" | "json" | "markdown" | "csv" | "checklist";
type PemLabel = "CERTIFICATE" | "PUBLIC KEY" | "PRIVATE KEY" | "RSA PRIVATE KEY" | "EC PRIVATE KEY" | "CERTIFICATE REQUEST" | "X509 CRL" | "OPENSSH PRIVATE KEY";
type LineBreakMode = "lf" | "crlf";

type PemBlock = {
  index: number;
  type: string;
  beginLabel: string;
  endLabel: string;
  base64Body: string;
  lineCount: number;
  byteEstimate: number;
  hasMatchingEnd: boolean;
  classification: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  blocks: PemBlock[];
  issues: Issue[];
  inputLength: number;
  blockCount: number;
  base64Length: number;
  byteEstimate: number;
};

const sampleInput = `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAL7uYoryantraExampleOnlyMA0GCSqGSIb3DQEBCwUA
MEUxCzAJBgNVBAYTAklOMRIwEAYDVQQKDAlZb3J5YW50cmExIjAgBgNVBAMMGW95
b3J5YW50cmEuZXhhbXBsZS5sb2NhbDAeFw0yNjA2MDMwMDAwMDBaFw0yNzA2MDMw
MDAwMDBaMEUxCzAJBgNVBAYTAklOMRIwEAYDVQQKDAlZb3J5YW50cmExIjAgBgNV
BAMMGW95b3J5YW50cmEuZXhhbXBsZS5sb2NhbA==
-----END CERTIFICATE-----`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("parse");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [pemLabel, setPemLabel] = useState<PemLabel>("CERTIFICATE");
  const [lineBreakMode, setLineBreakMode] = useState<LineBreakMode>("lf");
  const [trimInput, setTrimInput] = useState(true);
  const [removeBlankLines, setRemoveBlankLines] = useState(true);
  const [uppercaseLabels, setUppercaseLabels] = useState(true);
  const [warnPrivateKeys, setWarnPrivateKeys] = useState(true);
  const [warnInvalidBase64, setWarnInvalidBase64] = useState(true);
  const [warnMismatchedLabels, setWarnMismatchedLabels] = useState(true);
  const [warnMultipleBlocks, setWarnMultipleBlocks] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const processPem = () => {
    if (!input.trim()) {
      setError("Please paste a PEM block or Base64 certificate/key body.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      actionMode,
      outputMode,
      pemLabel,
      lineBreakMode,
      lineLength: 64,
      trimInput,
      removeBlankLines,
      uppercaseLabels,
      warnPrivateKeys,
      warnInvalidBase64,
      warnMismatchedLabels,
      warnMultipleBlocks,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setActionMode("parse");
    setOutputMode("summary");
    setPemLabel("CERTIFICATE");
    setLineBreakMode("lf");
    setTrimInput(true);
    setRemoveBlankLines(true);
    setUppercaseLabels(true);
    setWarnPrivateKeys(true);
    setWarnInvalidBase64(true);
    setWarnMismatchedLabels(true);
    setWarnMultipleBlocks(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("parse");
    setOutputMode("summary");
    setPemLabel("CERTIFICATE");
    setLineBreakMode("lf");
    setTrimInput(true);
    setRemoveBlankLines(true);
    setUppercaseLabels(true);
    setWarnPrivateKeys(true);
    setWarnInvalidBase64(true);
    setWarnMismatchedLabels(true);
    setWarnMultipleBlocks(true);
    clearResult();
  };

  return (
    <ToolShell
      title="PEM Certificate Encoder Decoder"
      description="Decode, encode, parse, and normalize PEM certificates, keys, CSRs, CRLs, and Base64 bodies. Inspect PEM blocks and fix line wrapping locally."
    >
      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">PEM Block or Base64 Body</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a certificate, key, CSR, CRL, certificate chain, or raw Base64 body.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="w-full min-h-[440px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">PEM Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                setActionMode(value as ActionMode);
                clearResult();
              }}
              options={[
                { label: "Parse PEM blocks", value: "parse" },
                { label: "Extract Base64 body", value: "extract" },
                { label: "Base64 body to PEM", value: "wrap" },
                { label: "Normalize PEM formatting", value: "normalize" },
                { label: "Inspect content", value: "inspect" },
              ]}
            />

            <YoryantraSelect
              label="PEM Label"
              value={pemLabel}
              onChange={(value) => {
                setPemLabel(value as PemLabel);
                clearResult();
              }}
              options={[
                { label: "CERTIFICATE", value: "CERTIFICATE" },
                { label: "PUBLIC KEY", value: "PUBLIC KEY" },
                { label: "PRIVATE KEY", value: "PRIVATE KEY" },
                { label: "RSA PRIVATE KEY", value: "RSA PRIVATE KEY" },
                { label: "EC PRIVATE KEY", value: "EC PRIVATE KEY" },
                { label: "CERTIFICATE REQUEST", value: "CERTIFICATE REQUEST" },
                { label: "X509 CRL", value: "X509 CRL" },
                { label: "OPENSSH PRIVATE KEY", value: "OPENSSH PRIVATE KEY" },
              ]}
            />

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Readable summary", value: "summary" },
                { label: "PEM output", value: "pem" },
                { label: "Base64 only", value: "base64" },
                { label: "JSON", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Line Breaks"
              value={lineBreakMode}
              onChange={(value) => {
                setLineBreakMode(value as LineBreakMode);
                clearResult();
              }}
              options={[
                { label: "LF", value: "lf" },
                { label: "CRLF", value: "crlf" },
              ]}
            />

            <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              <p className="text-sm font-medium text-gray-700">PEM shape</p>
              <div className="mt-2 space-y-1 font-mono text-xs text-gray-500">
                <p>-----BEGIN CERTIFICATE-----</p>
                <p>Base64 body wrapped at 64 chars</p>
                <p>-----END CERTIFICATE-----</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={trimInput} label="Trim input before processing" onChange={(checked) => { setTrimInput(checked); clearResult(); }} />
          <CheckboxRow checked={removeBlankLines} label="Remove blank lines from Base64 body" onChange={(checked) => { setRemoveBlankLines(checked); clearResult(); }} />
          <CheckboxRow checked={uppercaseLabels} label="Use uppercase PEM labels" onChange={(checked) => { setUppercaseLabels(checked); clearResult(); }} />
          <CheckboxRow checked={warnPrivateKeys} label="Warn when private key blocks are present" onChange={(checked) => { setWarnPrivateKeys(checked); clearResult(); }} />
          <CheckboxRow checked={warnInvalidBase64} label="Warn about invalid Base64 body characters" onChange={(checked) => { setWarnInvalidBase64(checked); clearResult(); }} />
          <CheckboxRow checked={warnMismatchedLabels} label="Warn about mismatched BEGIN and END labels" onChange={(checked) => { setWarnMismatchedLabels(checked); clearResult(); }} />
          <CheckboxRow checked={warnMultipleBlocks} label="Warn when multiple PEM blocks are detected" onChange={(checked) => { setWarnMultipleBlocks(checked); clearResult(); }} />
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          PEM handling runs locally in your browser. Avoid pasting real private keys unless you need to inspect or reformat them.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={processPem} className="yoryantra-btn">Process PEM</button>
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="PEM Blocks" value={result.blockCount.toLocaleString()} />
          <SummaryCard label="Base64 Length" value={result.base64Length.toLocaleString()} />
          <SummaryCard label="Estimated Bytes" value={result.byteEstimate.toLocaleString()} />
          <SummaryCard label="Findings" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.blocks.length > 0 && (
        <div className="mt-8 min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Detected PEM Blocks</h3>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Base64 Length</th>
                  <th className="px-4 py-3 font-semibold">Lines</th>
                  <th className="px-4 py-3 font-semibold">Bytes</th>
                  <th className="px-4 py-3 font-semibold">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.blocks.map((block) => (
                  <tr key={`${block.index}-${block.type}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{block.index + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{block.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{block.base64Body.length}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{block.lineCount}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{block.byteEstimate}</td>
                    <td className="px-4 py-3 text-gray-700">{block.classification}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">PEM findings</h3>
          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">PEM handling guidance</h3>
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-blue-800">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[340px] whitespace-pre-wrap break-words">
          {output || "PEM output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        This tool processes pasted PEM text locally in your browser. It does not validate certificate chains, verify signatures, contact certificate authorities, or upload keys.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Decode and Encode PEM Certificates and Keys</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            PEM files are commonly used for TLS certificates, public keys, private keys, certificate signing requests, certificate chains, and trust bundles. Each block contains a BEGIN label, a Base64 body, and a matching END label.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This PEM certificate decoder and encoder can parse PEM blocks, extract Base64 content, rebuild PEM text from raw Base64, normalize line wrapping, and identify common certificate or key labels.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">PEM Is a Text Wrapper Around Binary Data</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A PEM block does not make a certificate or key human-readable by itself. The text between the BEGIN and END boundaries is Base64-encoded binary data. The label tells another program what kind of object it should expect, such as a certificate, public key, private key, CSR, or CRL.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool works at that wrapper level: it can extract the Base64 body, rebuild the boundaries, normalize line wrapping, count blocks, and flag obvious formatting problems. It does not parse the ASN.1 fields inside an X.509 certificate or prove that the encoded object is cryptographically valid.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why 64-Character Lines Are Used</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <a href="https://www.rfc-editor.org/rfc/rfc7468.html" target="_blank" rel="noreferrer" className="underline underline-offset-2">RFC 7468</a> requires generators to wrap the Base64 body at exactly 64 characters per line, except for the final shorter line. Parsers are often more tolerant, but producing the standard form avoids needless compatibility problems when a certificate or key moves between command-line tools, servers, CI systems, and configuration files.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Normalize mode therefore writes 64-character lines and matching BEGIN/END labels. You can still choose LF or CRLF line endings because real systems use both newline conventions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A Certificate Chain Is More Than Several PEM Blocks</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Files often contain more than one CERTIFICATE block. That may be a leaf certificate followed by one or more intermediates, but the tool cannot infer or verify the trust path from formatting alone. If you are preparing a chain for a web server, keep the expected order and verify it with certificate-aware tooling before deployment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Private Keys Need Different Handling</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A private-key PEM block is a secret, even though it looks like ordinary Base64 text. Reformatting it does not make it safer. Avoid putting real private keys into screenshots, tickets, shared chat threads, public repositories, or logs. This page runs locally, but the safest workflow is still to use non-production material whenever possible.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Encrypted private keys are also outside this tool’s scope. It can preserve and normalize the wrapper, but it does not decrypt the key or verify that the key matches a certificate.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What to Verify After Formatting</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>The BEGIN and END labels match exactly.</li>
            <li>The selected label matches the object you actually have.</li>
            <li>A certificate is unexpired and valid for the intended hostname or use.</li>
            <li>A chain contains the right intermediates in the order expected by the target system.</li>
            <li>A private key is stored and transferred as a secret.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/pem-certificate-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--light-gold)]" />
      {label}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  pemLabel: PemLabel;
  lineBreakMode: LineBreakMode;
  lineLength: number;
  trimInput: boolean;
  removeBlankLines: boolean;
  uppercaseLabels: boolean;
  warnPrivateKeys: boolean;
  warnInvalidBase64: boolean;
  warnMismatchedLabels: boolean;
  warnMultipleBlocks: boolean;
}): Result {
  const preparedInput = options.trimInput ? options.input.trim() : options.input;
  const blocks = parsePemBlocks(preparedInput, options.removeBlankLines);
  const rawBase64 = cleanBase64Body(preparedInput, options.removeBlankLines);
  const activeBase64 = blocks.length > 0 ? blocks.map((block) => block.base64Body).join("\n") : rawBase64;
  const generatedPem = buildPem(activeBase64, options.pemLabel, options.lineLength, options.lineBreakMode, options.uppercaseLabels);
  const issues = buildIssues(blocks, activeBase64, options);
  const output = formatOutput({
    actionMode: options.actionMode,
    outputMode: options.outputMode,
    blocks,
    activeBase64,
    generatedPem,
    issues,
    input: preparedInput,
  });

  return {
    output,
    blocks,
    issues,
    inputLength: preparedInput.length,
    blockCount: blocks.length,
    base64Length: activeBase64.replace(/\s/g, "").length,
    byteEstimate: blocks.length > 0 ? blocks.reduce((sum, block) => sum + block.byteEstimate, 0) : estimateBytes(activeBase64),
  };
}

function parsePemBlocks(input: string, removeBlankLines: boolean): PemBlock[] {
  const regex = /-----BEGIN ([^\r\n]+?)-----([\s\S]*?)(?:-----END ([^\r\n]+?)-----|$)/g;
  const blocks: PemBlock[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const beginLabel = match[1].trim();
    const endLabel = (match[3] || "").trim();
    const body = match[2] || "";
    const base64Body = cleanBase64Body(body, removeBlankLines);
    const lineCount = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length;

    blocks.push({
      index: blocks.length,
      type: beginLabel,
      beginLabel,
      endLabel,
      base64Body,
      lineCount,
      byteEstimate: estimateBytes(base64Body),
      hasMatchingEnd: Boolean(endLabel && endLabel === beginLabel),
      classification: classifyPem(beginLabel),
    });
  }

  return blocks;
}

function cleanBase64Body(value: string, removeBlankLines: boolean) {
  const withoutPem = value
    .replace(/-----BEGIN [^\r\n]+?-----/g, "")
    .replace(/-----END [^\r\n]+?-----/g, "");
  const lines = withoutPem.split(/\r?\n/).map((line) => line.trim());
  const filtered = removeBlankLines ? lines.filter(Boolean) : lines;
  return filtered.join("").replace(/\s/g, "");
}

function buildPem(base64Body: string, label: PemLabel | string, lineLength: number, lineBreakMode: LineBreakMode, uppercaseLabels: boolean) {
  const clean = base64Body.replace(/\s/g, "");
  const finalLabel = uppercaseLabels ? label.toUpperCase() : label;
  const newline = lineBreakMode === "crlf" ? "\r\n" : "\n";
  const wrapped = wrapBase64(clean, lineLength).join(newline);
  return [`-----BEGIN ${finalLabel}-----`, wrapped, `-----END ${finalLabel}-----`].join(newline);
}

function wrapBase64(value: string, lineLength: number) {
  const lines: string[] = [];
  for (let index = 0; index < value.length; index += lineLength) {
    lines.push(value.slice(index, index + lineLength));
  }
  return lines.length ? lines : [""];
}

function estimateBytes(base64Body: string) {
  const clean = base64Body.replace(/\s/g, "");
  if (!clean) return 0;
  const padding = (clean.match(/=+$/) || [""])[0].length;
  return Math.max(0, Math.floor((clean.length * 3) / 4) - padding);
}

function classifyPem(type: string) {
  if (/PRIVATE KEY/i.test(type)) return "private key";
  if (/PUBLIC KEY/i.test(type)) return "public key";
  if (/CERTIFICATE REQUEST/i.test(type)) return "certificate signing request";
  if (/CERTIFICATE/i.test(type)) return "certificate";
  if (/CRL/i.test(type)) return "certificate revocation list";
  return "PEM block";
}

function getBase64Problem(value: string) {
  const clean = value.replace(/\s/g, "");
  if (!clean) return "";
  if (/[^A-Za-z0-9+/=]/.test(clean)) return "The body contains characters outside the standard Base64 alphabet.";
  if (/=/.test(clean.slice(0, -2))) return "Base64 padding appears before the end of the body.";
  if ((clean.match(/=/g) || []).length > 2) return "Base64 uses more than two padding characters.";
  if (clean.length % 4 === 1) return "The Base64 length cannot be valid because it leaves a one-character remainder.";
  try {
    const padded = clean + "=".repeat((4 - (clean.length % 4)) % 4);
    atob(padded);
  } catch {
    return "The Base64 body could not be decoded by the browser.";
  }
  return "";
}

function buildIssues(blocks: PemBlock[], activeBase64: string, options: {
  warnPrivateKeys: boolean;
  warnInvalidBase64: boolean;
  warnMismatchedLabels: boolean;
  warnMultipleBlocks: boolean;
}) {
  const issues: Issue[] = [];
  const clean = activeBase64.replace(/\s/g, "");

  if (blocks.length === 0) {
    issues.push({
      severity: "info",
      title: "No PEM wrapper detected",
      message: "No BEGIN/END PEM block was found. The input is being treated as a raw Base64 body.",
    });
  }

  if (options.warnPrivateKeys && blocks.some((block) => /PRIVATE KEY/i.test(block.type))) {
    issues.push({
      severity: "high",
      title: "Private key block detected",
      message: "Private keys are sensitive. Avoid pasting real production keys unless you need to reformat or inspect them.",
    });
  }

  const base64Problem = options.warnInvalidBase64 ? getBase64Problem(clean) : "";
  if (base64Problem) {
    issues.push({
      severity: "warning",
      title: "Base64 body needs review",
      message: base64Problem,
    });
  }

  if (options.warnMismatchedLabels) {
    const mismatched = blocks.filter((block) => !block.hasMatchingEnd);
    if (mismatched.length > 0) {
      issues.push({
        severity: "warning",
        title: "Mismatched or missing PEM footer",
        message: `${mismatched.length} PEM block${mismatched.length === 1 ? "" : "s"} have missing or mismatched END labels.`,
      });
    }
  }

  if (options.warnMultipleBlocks && blocks.length > 1) {
    issues.push({
      severity: "info",
      title: "Multiple PEM blocks detected",
      message: "This may be a certificate chain or bundle. Keep block order intact when chain order matters.",
    });
  }

  if (!base64Problem && clean && clean.length % 4 !== 0) {
    issues.push({
      severity: "info",
      title: "Base64 padding is omitted",
      message: "The body length is not divisible by 4. Some decoders accept omitted trailing padding, but check the source if exact round-tripping matters.",
    });
  }

  if (issues.length === 0) {
    issues.push({
      severity: "info",
      title: "PEM content processed",
      message: "No obvious PEM formatting warning was found.",
    });
  }

  return issues;
}

function formatOutput(params: {
  actionMode: ActionMode;
  outputMode: OutputMode;
  blocks: PemBlock[];
  activeBase64: string;
  generatedPem: string;
  issues: Issue[];
  input: string;
}) {
  const { actionMode, outputMode, blocks, activeBase64, generatedPem, issues, input } = params;
  const primary = selectPrimary(actionMode, blocks, activeBase64, generatedPem, input);

  if (outputMode === "pem") {
    if (blocks.length > 0 && actionMode !== "wrap") {
      return blocks
        .map((block) => buildPem(block.base64Body, block.type, 64, "lf", true))
        .join("\n");
    }
    return generatedPem;
  }
  if (outputMode === "base64") return activeBase64;
  if (outputMode === "json") return JSON.stringify({ action: actionMode, blocks, base64Body: activeBase64, generatedPem, issues }, null, 2);

  if (outputMode === "markdown") {
    return [
      "| # | Type | Base64 Length | Lines | Estimated Bytes | Classification |",
      "| --- | --- | ---: | ---: | ---: | --- |",
      ...(blocks.length
        ? blocks.map((block) => `| ${block.index + 1} | ${block.type} | ${block.base64Body.length} | ${block.lineCount} | ${block.byteEstimate} | ${block.classification} |`)
        : [`| 1 | raw Base64 | ${activeBase64.length} | - | ${estimateBytes(activeBase64)} | raw body |`]),
      "",
      "## Findings",
      ...issues.map((issue) => `- **${issue.title}:** ${issue.message}`),
    ].join("\n");
  }

  if (outputMode === "csv") {
    const rows = [
      ["index", "type", "base64_length", "line_count", "estimated_bytes", "classification", "matching_footer"],
      ...(blocks.length
        ? blocks.map((block) => [String(block.index + 1), block.type, String(block.base64Body.length), String(block.lineCount), String(block.byteEstimate), block.classification, block.hasMatchingEnd ? "yes" : "no"])
        : [["1", "raw Base64", String(activeBase64.length), "", String(estimateBytes(activeBase64)), "raw body", ""]]),
    ];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "checklist") {
    return [
      "PEM Review Checklist",
      "--------------------",
      "- [ ] Confirm the PEM type matches the intended use.",
      "- [ ] Confirm BEGIN and END labels match.",
      "- [ ] Confirm private keys are not exposed in tickets, logs, or public repos.",
      "- [ ] Confirm certificate chains keep the correct order.",
      "- [ ] Confirm PEM output uses the line breaks expected by your system.",
      "- [ ] Use proper tools for certificate trust, expiry, signature, and hostname validation.",
      "",
      "Findings:",
      ...issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`),
    ].join("\n");
  }

  return primary;
}

function selectPrimary(actionMode: ActionMode, blocks: PemBlock[], activeBase64: string, generatedPem: string, input: string) {
  if (actionMode === "extract") return activeBase64;
  if (actionMode === "wrap") return generatedPem;
  if (actionMode === "normalize") {
    if (blocks.length === 0) return generatedPem;
    return blocks.map((block) => buildPem(block.base64Body, block.type, 64, "lf", true)).join("\n");
  }
  if (actionMode === "inspect") {
    return [
      "PEM Inspection",
      "--------------",
      `Input length: ${input.length}`,
      `Detected blocks: ${blocks.length}`,
      `Base64 length: ${activeBase64.length}`,
      `Estimated bytes: ${estimateBytes(activeBase64)}`,
      "",
      "Types:",
      ...(blocks.length ? blocks.map((block) => `- ${block.type} (${block.classification})`) : ["- raw Base64 body"]),
    ].join("\n");
  }

  return [
    "PEM Summary",
    "-----------",
    `Detected blocks: ${blocks.length}`,
    `Base64 length: ${activeBase64.length}`,
    `Estimated bytes: ${estimateBytes(activeBase64)}`,
    "",
    "Blocks:",
    ...(blocks.length
      ? blocks.map((block) => `- ${block.type}: ${block.base64Body.length} Base64 chars, ${block.byteEstimate} estimated bytes, ${block.hasMatchingEnd ? "matching footer" : "footer issue"}`)
      : ["- No PEM wrapper found. Input treated as raw Base64."]),
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];
  if (result.blocks.some((block) => /PRIVATE KEY/i.test(block.type))) {
    notes.push({ title: "Private keys are sensitive", message: "Treat private key PEM blocks as secrets. Reformatting them does not make them safe to share." });
  }
  if (result.blockCount > 1) {
    notes.push({ title: "Certificate chains may depend on order", message: "When PEM blocks form a chain or bundle, changing their order can break some certificate workflows." });
  }
  notes.push({ title: "Formatting is not validation", message: "A well-formatted PEM block can still be expired, untrusted, mismatched, or invalid for its intended use." });
  return notes;
}
