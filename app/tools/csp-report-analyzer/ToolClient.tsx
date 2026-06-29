"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "auto" | "json" | "ndjson";
type OutputMode = "summary" | "report" | "table" | "json" | "csv";
type GroupMode = "directive" | "blockedUri" | "documentUri" | "sourceFile";

type CspViolation = {
  documentUri: string;
  blockedUri: string;
  violatedDirective: string;
  effectiveDirective: string;
  originalPolicy: string;
  sourceFile: string;
  referrer: string;
  lineNumber: string;
  columnNumber: string;
  statusCode: string;
  sample: string;
  disposition: string;
  rawType: string;
};

type CspFinding = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type GroupedRow = {
  key: string;
  count: number;
  directives: string[];
  blockedUris: string[];
};

type AnalysisResult = {
  violations: CspViolation[];
  groups: GroupedRow[];
  findings: CspFinding[];
  output: string;
  totalReports: number;
  blockedUriCount: number;
  directiveCount: number;
  highRiskCount: number;
  inlineCount: number;
  evalCount: number;
  dataBlobCount: number;
};

const sampleInput = `[
  {
    "csp-report": {
      "document-uri": "https://example.com/account",
      "referrer": "",
      "violated-directive": "script-src-elem",
      "effective-directive": "script-src-elem",
      "original-policy": "default-src 'self'; script-src 'self'; report-uri /csp-report",
      "blocked-uri": "https://cdn.bad-example.com/tracker.js",
      "source-file": "https://example.com/account",
      "line-number": 42,
      "column-number": 13,
      "status-code": 200,
      "script-sample": ""
    }
  },
  {
    "type": "csp-violation",
    "url": "https://example.com/checkout",
    "body": {
      "documentURL": "https://example.com/checkout",
      "effectiveDirective": "script-src",
      "blockedURL": "inline",
      "sourceFile": "https://example.com/checkout",
      "lineNumber": 18,
      "columnNumber": 5,
      "sample": "onclick attribute"
    }
  },
  {
    "csp-report": {
      "document-uri": "https://example.com/blog",
      "violated-directive": "img-src",
      "effective-directive": "img-src",
      "blocked-uri": "http://images.example-cdn.com/banner.png",
      "source-file": "https://example.com/blog"
    }
  }
]`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("auto");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [groupMode, setGroupMode] = useState<GroupMode>("directive");
  const [redactQueryStrings, setRedactQueryStrings] = useState(true);
  const [includeRawSamples, setIncludeRawSamples] = useState(true);
  const [warnInlineAndEval, setWarnInlineAndEval] = useState(true);
  const [warnInsecureHttp, setWarnInsecureHttp] = useState(true);
  const [warnThirdParty, setWarnThirdParty] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getCspNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const analyzeReports = () => {
    if (!input.trim()) {
      setError("Please paste CSP violation report JSON, a JSON array, or NDJSON report lines.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const nextResult = analyzeCspReports(input, {
        inputMode,
        outputMode,
        groupMode,
        redactQueryStrings,
        includeRawSamples,
        warnInlineAndEval,
        warnInsecureHttp,
        warnThirdParty,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze these CSP reports.");
      setResult(null);
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setInputMode("auto");
    setOutputMode("summary");
    setGroupMode("directive");
    setRedactQueryStrings(true);
    setIncludeRawSamples(true);
    setWarnInlineAndEval(true);
    setWarnInsecureHttp(true);
    setWarnThirdParty(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setInputMode("auto");
    setOutputMode("summary");
    setGroupMode("directive");
    setRedactQueryStrings(true);
    setIncludeRawSamples(true);
    setWarnInlineAndEval(true);
    setWarnInsecureHttp(true);
    setWarnThirdParty(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="CSP Report Analyzer"
      description="Analyze CSP violation reports, parse JSON or NDJSON, group blocked resources, inspect directives, and detect risky Content Security Policy patterns."
    >
      <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          CSP Report JSON
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleInput}
          className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a single CSP report, a JSON array, Report-To style reports, or NDJSON lines from a log export.
        </p>
      </div>

      <div className="mt-6 min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              clearResult();
            }}
            options={[
              { label: "Auto detect", value: "auto" },
              { label: "JSON", value: "json" },
              { label: "NDJSON lines", value: "ndjson" },
            ]}
          />

          <YoryantraSelect
            label="Group By"
            value={groupMode}
            onChange={(value) => {
              setGroupMode(value as GroupMode);
              clearResult();
            }}
            options={[
              { label: "Directive", value: "directive" },
              { label: "Blocked URI", value: "blockedUri" },
              { label: "Document URI", value: "documentUri" },
              { label: "Source file", value: "sourceFile" },
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
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "Markdown table", value: "table" },
              { label: "JSON", value: "json" },
              { label: "CSV", value: "csv" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={redactQueryStrings} label="Redact query strings from URLs" onChange={(checked) => { setRedactQueryStrings(checked); clearResult(); }} />
            <CheckboxRow checked={includeRawSamples} label="Include script samples when available" onChange={(checked) => { setIncludeRawSamples(checked); clearResult(); }} />
            <CheckboxRow checked={warnInlineAndEval} label="Warn about inline script, inline style, and eval violations" onChange={(checked) => { setWarnInlineAndEval(checked); clearResult(); }} />
            <CheckboxRow checked={warnInsecureHttp} label="Warn about insecure http:// blocked resources" onChange={(checked) => { setWarnInsecureHttp(checked); clearResult(); }} />
            <CheckboxRow checked={warnThirdParty} label="Warn about third-party blocked resources" onChange={(checked) => { setWarnThirdParty(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Parses legacy csp-report payloads and newer Report-To style CSP violation reports, then groups the violations for easier debugging.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeReports} className="yoryantra-btn">Analyze CSP Reports</button>
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>}

      {result && (
        <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Reports" value={result.totalReports.toLocaleString()} />
          <SummaryCard label="Directives" value={result.directiveCount.toLocaleString()} />
          <SummaryCard label="Blocked URIs" value={result.blockedUriCount.toLocaleString()} />
          <SummaryCard label="High Risk" value={result.highRiskCount.toLocaleString()} />
        </div>
      )}

      {result && result.groups.length > 0 && (
        <div className="mt-8 min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Grouped Violations</h3>
          <p className="mt-2 text-sm text-gray-500">The most common CSP violations grouped by the selected field.</p>

          <div className="mt-4 min-w-0 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Group</th>
                  <th className="px-4 py-3 font-semibold">Count</th>
                  <th className="px-4 py-3 font-semibold">Directives</th>
                  <th className="px-4 py-3 font-semibold">Blocked URIs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.groups.slice(0, 100).map((group) => (
                  <tr key={group.key}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900"><span className="block max-w-[280px] break-words">{group.key || "(empty)"}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{group.count}</td>
                    <td className="px-4 py-3 text-gray-700"><span className="block max-w-[260px] break-words">{group.directives.slice(0, 5).join(", ") || "-"}</span></td>
                    <td className="px-4 py-3 text-gray-700"><span className="block max-w-[320px] break-words">{group.blockedUris.slice(0, 5).join(", ") || "-"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.findings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">CSP findings</h3>
          <div className="mt-3 space-y-3">
            {result.findings.map((finding, index) => (
              <div key={`${finding.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">{finding.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{finding.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">CSP rollout guidance</h3>
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
          {output && <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>
        <pre className="yoryantra-output min-h-[320px] min-w-0 overflow-auto whitespace-pre-wrap break-all text-sm">
          {output || "CSP report analysis output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        CSP report analysis happens directly in your browser. Your reports, URLs, and script samples are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analyze Content Security Policy Violation Reports</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Content Security Policy reports help you understand what a browser blocked because of your CSP header. They are useful during CSP rollout because they show blocked scripts, styles, images, frames, connections, and inline code before you make a policy stricter.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">This CSP Report Analyzer parses common CSP report JSON and NDJSON formats, groups repeated violations, highlights risky patterns, and creates clean summaries for debugging or policy review.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the CSP Report Analyzer</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a CSP violation report, JSON array, or NDJSON report export.</li>
            <li>Choose whether to group by directive, blocked URI, document URI, or source file.</li>
            <li>Keep query-string redaction enabled if reports may contain private URL parameters.</li>
            <li>Review high-risk findings such as inline script, eval, data/blob URLs, and insecure HTTP resources.</li>
            <li>Copy the summary, detailed report, Markdown table, JSON, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Supported CSP Report Formats</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The analyzer supports a single legacy <span className="font-mono text-gray-800">csp-report</span> object, JSON arrays of reports, newer report objects with a <span className="font-mono text-gray-800">body</span> field, and NDJSON log exports with one JSON object per line.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            It reads fields such as document URI, blocked URI, violated directive, effective directive, source file, line number, column number, status code, disposition, and script sample when available.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common CSP Report Debugging Use Cases</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Finding which third-party scripts or images are blocked most often.</li>
            <li>Checking whether inline scripts or inline styles are still used.</li>
            <li>Spotting insecure http:// resources on HTTPS pages.</li>
            <li>Grouping reports by violated directive before updating a CSP header.</li>
            <li>Reviewing CSP reports before switching from report-only mode to enforcing mode.</li>
            <li>Cleaning report exports before sharing them with a developer or security reviewer.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example CSP Report Fields</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`{
  "csp-report": {
    "document-uri": "https://example.com/account",
    "violated-directive": "script-src-elem",
    "blocked-uri": "https://cdn.example.com/app.js",
    "source-file": "https://example.com/account"
  }
}`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Report-Only CSP vs Enforced CSP</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">A report-only CSP lets browsers send violation reports without actually blocking the resource. This is useful when testing a new policy. An enforced CSP blocks resources that violate the policy, so it should be deployed carefully after reviewing reports.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">When reports look clean and expected resources are allowed intentionally, you can gradually tighten the policy and move from report-only mode to enforcement.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What is a CSP violation report?" text="It is a browser-generated report that describes a resource blocked by a Content Security Policy directive." />
            <Faq title="Can I paste multiple CSP reports at once?" text="Yes. You can paste a JSON array, a reports array, or NDJSON with one report object per line." />
            <Faq title="Can this parse Report-To style CSP reports?" text="Yes. It supports common legacy csp-report payloads and newer report objects with a body field." />
            <Faq title="Why should query strings be redacted?" text="URLs in security reports can sometimes contain tokens, IDs, or private parameters. Redacting query strings makes reports safer to share." />
            <Faq title="Does this update my CSP policy automatically?" text="No. It analyzes reports and highlights patterns. You should review changes before updating a real CSP header." />
            <Faq title="Is anything uploaded when I analyze reports?" text="No. Analysis happens directly in your browser." />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/csp-analyzer" className="yoryantra-btn-outline">CSP Analyzer</Link>
            <Link href="/tools/csp-policy-builder" className="yoryantra-btn-outline">CSP Policy Builder</Link>
            <Link href="/tools/security-headers-scanner" className="yoryantra-btn-outline">Security Headers Scanner</Link>
            <Link href="/tools/security-header-generator" className="yoryantra-btn-outline">Security Header Generator</Link>
            <Link href="/tools/cors-header-checker" className="yoryantra-btn-outline">CORS Header Checker</Link>
          </div>
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

function Faq({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{text}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function analyzeCspReports(
  input: string,
  options: {
    inputMode: InputMode;
    outputMode: OutputMode;
    groupMode: GroupMode;
    redactQueryStrings: boolean;
    includeRawSamples: boolean;
    warnInlineAndEval: boolean;
    warnInsecureHttp: boolean;
    warnThirdParty: boolean;
  }
): AnalysisResult {
  const rawReports = parseReports(input, options.inputMode);
  if (rawReports.length === 0) throw new Error("No CSP reports were found.");
  const violations = rawReports.map((report) => normalizeReport(report, options.redactQueryStrings));
  const groups = groupViolations(violations, options.groupMode);
  const findings = getFindings(violations, options);
  const base = {
    violations,
    groups,
    findings,
    totalReports: violations.length,
    blockedUriCount: uniqueCount(violations.map((item) => item.blockedUri).filter(Boolean)),
    directiveCount: uniqueCount(violations.map((item) => item.effectiveDirective || item.violatedDirective).filter(Boolean)),
    highRiskCount: findings.filter((item) => item.severity === "high").length,
    inlineCount: violations.filter((item) => isInlineBlocked(item.blockedUri)).length,
    evalCount: violations.filter(isEvalLike).length,
    dataBlobCount: violations.filter((item) => isDataOrBlob(item.blockedUri)).length,
  };
  const output = formatOutput(base, options);
  return { ...base, output };
}

function parseReports(input: string, mode: InputMode): unknown[] {
  const trimmed = input.trim();
  if (mode === "ndjson") return parseNdjson(trimmed);
  if (mode === "json") return flattenJsonReports(JSON.parse(trimmed));
  try {
    return flattenJsonReports(JSON.parse(trimmed));
  } catch {
    return parseNdjson(trimmed);
  }
}

function parseNdjson(input: string): unknown[] {
  return input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    try { return JSON.parse(line); } catch { throw new Error(`Invalid JSON on NDJSON line ${index + 1}.`); }
  });
}

function flattenJsonReports(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(flattenJsonReports);
  if (isObject(value) && Array.isArray(value.reports)) return value.reports.flatMap(flattenJsonReports);
  return [value];
}

function normalizeReport(value: unknown, redactQueryStrings: boolean): CspViolation {
  const objectValue = isObject(value) ? value : {};
  const legacy = isObject(objectValue["csp-report"]) ? objectValue["csp-report"] as Record<string, unknown> : null;
  const body = isObject(objectValue.body) ? objectValue.body as Record<string, unknown> : null;
  const source = legacy || body || objectValue;
  const documentUri = readString(source, ["document-uri", "documentURL", "documentUrl", "documentUri", "url"]) || readString(objectValue, ["url"]);
  const blockedUri = readString(source, ["blocked-uri", "blockedURL", "blockedUrl", "blockedURI"]);
  const violatedDirective = readString(source, ["violated-directive", "violatedDirective"]);
  const effectiveDirective = readString(source, ["effective-directive", "effectiveDirective"]) || violatedDirective;
  const originalPolicy = readString(source, ["original-policy", "originalPolicy"]);
  const sourceFile = readString(source, ["source-file", "sourceFile"]);
  const referrer = readString(source, ["referrer"]);
  const lineNumber = readString(source, ["line-number", "lineNumber"]);
  const columnNumber = readString(source, ["column-number", "columnNumber"]);
  const statusCode = readString(source, ["status-code", "statusCode"]);
  const sample = readString(source, ["script-sample", "sample"]);
  const disposition = readString(source, ["disposition"]);
  const rawType = readString(objectValue, ["type"]) || (legacy ? "csp-report" : "unknown");
  return {
    documentUri: cleanUrl(documentUri, redactQueryStrings),
    blockedUri: cleanUrl(blockedUri, redactQueryStrings),
    violatedDirective,
    effectiveDirective,
    originalPolicy,
    sourceFile: cleanUrl(sourceFile, redactQueryStrings),
    referrer: cleanUrl(referrer, redactQueryStrings),
    lineNumber,
    columnNumber,
    statusCode,
    sample,
    disposition,
    rawType,
  };
}

function readString(objectValue: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = objectValue[key];
    if (typeof value === "string" || typeof value === "number") return String(value);
  }
  return "";
}

function cleanUrl(value: string, redactQueryStrings: boolean) {
  if (!value || !redactQueryStrings) return value;
  try {
    const url = new URL(value);
    url.search = url.search ? "?…" : "";
    url.hash = url.hash ? "#…" : "";
    return url.toString();
  } catch {
    return value.replace(/\?.*$/, "?…").replace(/#.*$/, "#…");
  }
}

function groupViolations(violations: CspViolation[], groupMode: GroupMode): GroupedRow[] {
  const map = new Map<string, CspViolation[]>();
  violations.forEach((violation) => {
    const key = getGroupKey(violation, groupMode) || "(empty)";
    map.set(key, [...(map.get(key) || []), violation]);
  });
  return Array.from(map.entries()).map(([key, rows]) => ({
    key,
    count: rows.length,
    directives: uniqueValues(rows.map((row) => row.effectiveDirective || row.violatedDirective).filter(Boolean)),
    blockedUris: uniqueValues(rows.map((row) => row.blockedUri).filter(Boolean)),
  })).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function getGroupKey(violation: CspViolation, groupMode: GroupMode) {
  if (groupMode === "blockedUri") return violation.blockedUri;
  if (groupMode === "documentUri") return violation.documentUri;
  if (groupMode === "sourceFile") return violation.sourceFile;
  return violation.effectiveDirective || violation.violatedDirective;
}

function getFindings(violations: CspViolation[], options: { warnInlineAndEval: boolean; warnInsecureHttp: boolean; warnThirdParty: boolean; }): CspFinding[] {
  const findings: CspFinding[] = [];
  const inlineCount = violations.filter((item) => isInlineBlocked(item.blockedUri)).length;
  const evalCount = violations.filter(isEvalLike).length;
  const httpCount = violations.filter((item) => /^http:\/\//i.test(item.blockedUri)).length;
  const dataBlobCount = violations.filter((item) => isDataOrBlob(item.blockedUri)).length;
  const thirdPartyCount = violations.filter(isLikelyThirdParty).length;
  const missingDirectiveCount = violations.filter((item) => !item.effectiveDirective && !item.violatedDirective).length;

  if (options.warnInlineAndEval && inlineCount > 0) findings.push({ severity: "warning", title: "Inline code blocked", message: `${inlineCount} report${inlineCount === 1 ? "" : "s"} involved inline script or inline style. Review whether inline code can be removed or covered with nonces/hashes.` });
  if (options.warnInlineAndEval && evalCount > 0) findings.push({ severity: "high", title: "Eval-like behavior blocked", message: `${evalCount} report${evalCount === 1 ? "" : "s"} may involve eval, wasm eval, or unsafe dynamic script behavior.` });
  if (options.warnInsecureHttp && httpCount > 0) findings.push({ severity: "high", title: "Insecure HTTP resource blocked", message: `${httpCount} blocked resource${httpCount === 1 ? " uses" : "s use"} http://. Prefer HTTPS resources on secure pages.` });
  if (dataBlobCount > 0) findings.push({ severity: "warning", title: "data: or blob: resource blocked", message: `${dataBlobCount} report${dataBlobCount === 1 ? "" : "s"} involved data: or blob: URLs. Allow these only when truly needed.` });
  if (options.warnThirdParty && thirdPartyCount > 0) findings.push({ severity: "info", title: "Third-party resources blocked", message: `${thirdPartyCount} report${thirdPartyCount === 1 ? "" : "s"} appear to involve third-party resources. Review whether each source is trusted and necessary.` });
  if (missingDirectiveCount > 0) findings.push({ severity: "info", title: "Some reports are missing directive fields", message: `${missingDirectiveCount} report${missingDirectiveCount === 1 ? " is" : "s are"} missing violated/effective directive fields.` });
  if (findings.length === 0) findings.push({ severity: "info", title: "No high-risk CSP patterns found", message: "The pasted reports did not trigger the selected high-risk pattern checks." });
  return findings;
}

function isInlineBlocked(value: string) {
  return /^(inline|eval)$/i.test(value) || value.toLowerCase().includes("inline");
}

function isEvalLike(violation: CspViolation) {
  const combined = `${violation.blockedUri} ${violation.sample} ${violation.violatedDirective} ${violation.effectiveDirective}`.toLowerCase();
  return combined.includes("eval") || combined.includes("unsafe-eval") || combined.includes("wasm-unsafe-eval");
}

function isDataOrBlob(value: string) {
  return /^(data|blob):/i.test(value);
}

function isLikelyThirdParty(violation: CspViolation) {
  const documentHost = getHost(violation.documentUri);
  const blockedHost = getHost(violation.blockedUri);
  return Boolean(documentHost && blockedHost && documentHost !== blockedHost);
}

function getHost(value: string) {
  try { return new URL(value).hostname.replace(/^www\./, ""); } catch { return ""; }
}

function formatOutput(result: Omit<AnalysisResult, "output">, options: { outputMode: OutputMode; includeRawSamples: boolean; }) {
  if (options.outputMode === "json") return JSON.stringify(result, null, 2);
  if (options.outputMode === "csv") {
    const rows = [["documentUri", "blockedUri", "directive", "sourceFile", "line", "column", "sample"], ...result.violations.map((item) => [item.documentUri, item.blockedUri, item.effectiveDirective || item.violatedDirective, item.sourceFile, item.lineNumber, item.columnNumber, options.includeRawSamples ? item.sample : ""] )];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  if (options.outputMode === "table") {
    return ["| Count | Group | Directives | Blocked URIs |", "| ---: | --- | --- | --- |", ...result.groups.map((group) => `| ${group.count} | ${escapeMarkdown(group.key)} | ${escapeMarkdown(group.directives.join(", ") || "-")} | ${escapeMarkdown(group.blockedUris.slice(0, 3).join(", ") || "-")} |`)].join("\n");
  }
  if (options.outputMode === "report") {
    const findings = result.findings.map((finding) => `- [${finding.severity}] ${finding.title}: ${finding.message}`);
    const reports = result.violations.slice(0, 50).map((item, index) => {
      const lines = [`${index + 1}. ${item.effectiveDirective || item.violatedDirective || "unknown directive"}`, `   document: ${item.documentUri || "-"}`, `   blocked: ${item.blockedUri || "-"}`, `   source: ${item.sourceFile || "-"}`];
      if (options.includeRawSamples && item.sample) lines.push(`   sample: ${item.sample}`);
      return lines.join("\n");
    });
    return ["CSP Report Analysis", "-------------------", `Reports: ${result.totalReports}`, `Unique directives: ${result.directiveCount}`, `Unique blocked URIs: ${result.blockedUriCount}`, `High-risk findings: ${result.highRiskCount}`, `Inline violations: ${result.inlineCount}`, `Eval-like violations: ${result.evalCount}`, `data/blob violations: ${result.dataBlobCount}`, "", "Findings:", ...findings, "", "Sample reports:", ...(reports.length ? reports : ["No reports found."])].join("\n");
  }
  const findings = result.findings.map((finding) => `- [${finding.severity}] ${finding.title}: ${finding.message}`);
  const topGroups = result.groups.slice(0, 10).map((group) => `- ${group.key}: ${group.count}`);
  return ["CSP Report Summary", "------------------", `Reports: ${result.totalReports}`, `Unique directives: ${result.directiveCount}`, `Unique blocked URIs: ${result.blockedUriCount}`, `High-risk findings: ${result.highRiskCount}`, `Inline violations: ${result.inlineCount}`, `Eval-like violations: ${result.evalCount}`, `data/blob violations: ${result.dataBlobCount}`, "", "Top groups:", ...(topGroups.length ? topGroups : ["- No groups found."]), "", "Findings:", ...findings].join("\n");
}

function getCspNotes(result: AnalysisResult) {
  const notes: { title: string; message: string }[] = [];
  if (result.highRiskCount > 0) notes.push({ title: "Fix high-risk patterns first", message: "Prioritize insecure HTTP resources, eval-like behavior, and broad inline code problems before tightening enforcement." });
  if (result.inlineCount > 0) notes.push({ title: "Inline reports need careful review", message: "Inline script and style reports can come from app code, third-party widgets, browser extensions, or injected markup." });
  if (result.totalReports > 0) notes.push({ title: "Group before changing policy", message: "Repeated violations are usually more important than one-off noise. Review grouped results before allowing new sources." });
  return notes;
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function uniqueCount(values: string[]) {
  return new Set(values).size;
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
