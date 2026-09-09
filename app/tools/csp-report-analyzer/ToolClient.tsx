"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "auto" | "json" | "ndjson";
type OutputMode = "summary" | "report" | "json" | "csv";
type GroupMode = "directive" | "blockedUri" | "documentUri" | "sourceFile";
type FindingSeverity = "warning" | "info";

type CspViolation = {
  sourceFormat: "legacy" | "reporting-api" | "body";
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
};

type CspFinding = {
  severity: FindingSeverity;
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
  warningCount: number;
  ignoredReportCount: number;
  enforceCount: number;
  reportOnlyCount: number;
  unknownDispositionCount: number;
};

const sampleInput = `[
  {
    "csp-report": {
      "document-uri": "https://example.com/account?session=redact-me",
      "disposition": "enforce",
      "violated-directive": "script-src-elem",
      "effective-directive": "script-src-elem",
      "original-policy": "default-src 'self'; script-src 'self'; report-uri /csp-report",
      "blocked-uri": "https://cdn.example.net/tracker.js?build=42",
      "source-file": "https://example.com/account",
      "line-number": 42,
      "column-number": 13,
      "status-code": 200
    }
  },
  {
    "type": "csp-violation",
    "url": "https://example.com/checkout",
    "body": {
      "documentURL": "https://example.com/checkout",
      "effectiveDirective": "script-src-attr",
      "blockedURL": "inline",
      "sourceFile": "https://example.com/checkout",
      "lineNumber": 18,
      "columnNumber": 5,
      "sample": "onclick=...",
      "disposition": "report",
      "statusCode": 200,
      "originalPolicy": "default-src 'self'; script-src 'self' 'report-sample'; report-to csp"
    }
  }
]`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("auto");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [groupMode, setGroupMode] = useState<GroupMode>("directive");
  const [redactQueryStrings, setRedactQueryStrings] = useState(true);
  const [includeSamples, setIncludeSamples] = useState(false);
  const [flagInlineEval, setFlagInlineEval] = useState(true);
  const [flagInsecureHttp, setFlagInsecureHttp] = useState(true);
  const [flagCrossOrigin, setFlagCrossOrigin] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(
    () => (result ? result.findings.filter((item) => item.severity === "warning") : []),
    [result]
  );
  const information = useMemo(
    () => (result ? result.findings.filter((item) => item.severity === "info") : []),
    [result]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const analyzeReports = () => {
    if (!input.trim()) {
      setError("Paste a CSP violation report, a JSON array of reports, or NDJSON report lines.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzeCspReports(input, {
        inputMode,
        outputMode,
        groupMode,
        redactQueryStrings,
        includeSamples,
        flagInlineEval,
        flagInsecureHttp,
        flagCrossOrigin,
      });
      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setOutput("");
      setCopied(false);
      setError(caught instanceof Error ? caught.message : "Unable to read these CSP reports.");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The report could not be copied. Select and copy the output manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleInput);
    setInputMode("auto");
    setOutputMode("summary");
    setGroupMode("directive");
    setRedactQueryStrings(true);
    setIncludeSamples(false);
    setFlagInlineEval(true);
    setFlagInsecureHttp(true);
    setFlagCrossOrigin(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setInputMode("auto");
    setOutputMode("summary");
    setGroupMode("directive");
    setRedactQueryStrings(true);
    setIncludeSamples(false);
    setFlagInlineEval(true);
    setFlagInsecureHttp(true);
    setFlagCrossOrigin(true);
    clearResult();
  };

  return (
    <ToolShell
      title="CSP Report Analyzer"
      description="Group CSP violation reports and separate enforced blocks from report-only signals."
    >
      <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Violation report data</label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleInput}
          className="min-h-[390px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Accepts legacy <span className="font-mono">csp-report</span> payloads, Reporting API
          <span className="font-mono"> csp-violation</span> objects, JSON arrays, and one-report-per-line NDJSON.
        </p>
      </div>

      <div className="mt-6 min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">How should the report set be read?</h3>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input format"
            value={inputMode}
            onChange={(value: string) => {
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
            label="Group repeated reports by"
            value={groupMode}
            onChange={(value: string) => {
              setGroupMode(value as GroupMode);
              clearResult();
            }}
            options={[
              { label: "Effective directive", value: "directive" },
              { label: "Blocked URL or keyword", value: "blockedUri" },
              { label: "Document URL", value: "documentUri" },
              { label: "Source file", value: "sourceFile" },
            ]}
          />
          <YoryantraSelect
            label="Copied output"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(value as OutputMode);
              clearResult();
            }}
            options={[
              { label: "Compact summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "CSV", value: "csv" },
            ]}
          />

          <div className="space-y-3 md:col-span-2">
            <CheckboxRow checked={redactQueryStrings} label="Redact query strings and fragments in URL fields" onChange={(checked) => { setRedactQueryStrings(checked); clearResult(); }} />
            <CheckboxRow checked={includeSamples} label="Include script/style samples in copied output" onChange={(checked) => { setIncludeSamples(checked); clearResult(); }} />
            <CheckboxRow checked={flagInlineEval} label="Call out inline and eval-like violations" onChange={(checked) => { setFlagInlineEval(checked); clearResult(); }} />
            <CheckboxRow checked={flagInsecureHttp} label="Call out blocked http:// resources" onChange={(checked) => { setFlagInsecureHttp(checked); clearResult(); }} />
            <CheckboxRow checked={flagCrossOrigin} label="Count blocked resources from another origin" onChange={(checked) => { setFlagCrossOrigin(checked); clearResult(); }} />
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Query redaction applies to known URL fields. Original policy text can still contain an endpoint URL, and samples can contain page content.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeReports} className="yoryantra-btn whitespace-nowrap">Analyze Reports</button>
        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid min-w-0 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard label="Reports" value={String(result.totalReports)} />
          <SummaryCard label="Enforced" value={String(result.enforceCount)} />
          <SummaryCard label="Report-only" value={String(result.reportOnlyCount)} />
          <SummaryCard label="Disposition unknown" value={String(result.unknownDispositionCount)} />
          <SummaryCard label="Non-CSP ignored" value={String(result.ignoredReportCount)} />
          <SummaryCard label="Directives" value={String(result.directiveCount)} />
          <SummaryCard label="Blocked values" value={String(result.blockedUriCount)} />
        </div>
      )}

      {result && result.groups.length > 0 && (
        <div className="mt-8 min-w-0 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Where the reports are clustering</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Repetition is often more actionable than a single event. The table is limited to the first 100 groups.
          </p>
          <div className="mt-4 min-w-0 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Group</th>
                  <th className="px-4 py-3 font-semibold">Count</th>
                  <th className="px-4 py-3 font-semibold">Directives</th>
                  <th className="px-4 py-3 font-semibold">Blocked values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.groups.slice(0, 100).map((group) => (
                  <tr key={group.key}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900"><span className="block max-w-[300px] break-words [overflow-wrap:anywhere]">{group.key}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{group.count}</td>
                    <td className="px-4 py-3 text-gray-700"><span className="block max-w-[260px] break-words [overflow-wrap:anywhere]">{group.directives.slice(0, 5).join(", ") || "—"}</span></td>
                    <td className="px-4 py-3 text-gray-700"><span className="block max-w-[320px] break-words [overflow-wrap:anywhere]">{group.blockedUris.slice(0, 5).join(", ") || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Signals worth checking before changing policy</h3>
          <div className="mt-3 space-y-3">
            {warnings.map((finding) => (
              <div key={finding.title}>
                <p className="text-sm font-semibold text-amber-900">{finding.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-800">{finding.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {information.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Context from this report set</h3>
          <div className="mt-3 space-y-3">
            {information.map((finding) => (
              <div key={finding.title}>
                <p className="text-sm font-semibold text-gray-900">{finding.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{finding.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Copyable analysis</h3>
          {output && <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>
        <pre className="yoryantra-output min-h-[300px] min-w-0 overflow-auto whitespace-pre-wrap break-words text-sm [overflow-wrap:anywhere]">
          {output || "The grouped CSP analysis will appear here."}
        </pre>
      </div>

      <div className="mt-4 self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Parsing stays in the browser. Query redaction is enabled by default, and copied output omits script/style samples unless you turn them on.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A violation report is evidence, not an allowlist request</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A CSP report says that a browser encountered activity outside a policy. With an enforced policy, that activity was blocked. With a report-only policy, the browser reported what would have been blocked. Neither case means the blocked source should automatically be added to the policy.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Extension-injected scripts, stale pages, third-party widgets, experiments, compromised code, and genuine application dependencies can all create reports. Grouping repeated events helps separate a one-off signal from something that deserves investigation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Legacy report-uri and Reporting API payloads are not identical</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Legacy delivery wraps fields inside <span className="font-mono text-gray-800">csp-report</span> and commonly arrives as <span className="font-mono text-gray-800">application/csp-report</span>. Newer Reporting API delivery uses report objects whose type is <span className="font-mono text-gray-800">csp-violation</span>, places CSP fields inside <span className="font-mono text-gray-800">body</span>, and uses <span className="font-mono text-gray-800">application/reports+json</span> for server delivery.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The normalizer accepts both shapes without pretending they contain exactly the same metadata. Missing disposition is left unknown instead of being guessed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The blocked value may be a keyword or a shortened URL</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Values such as <span className="font-mono text-gray-800">inline</span>, <span className="font-mono text-gray-800">eval</span>, <span className="font-mono text-gray-800">data:</span>, or <span className="font-mono text-gray-800">blob:</span> are meaningful CSP signals even though they are not ordinary resource URLs. Browsers can also reduce a cross-origin blocked URL to its origin to avoid leaking path information.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That is why the cross-origin count compares origins only when both the document and blocked values can be parsed as HTTP(S) URLs. It does not label every different hostname as an unsafe third party.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Treat report content as untrusted input</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Violation reports can contain URLs and, when <span className="font-mono text-gray-800">'report-sample'</span> is enabled for the relevant directive, a short sample of inline script, handler, or style content. Report collectors should store and render those fields as untrusted data rather than HTML.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Query-string redaction reduces accidental leakage when sharing an analysis, but it cannot scrub secrets embedded in paths, policy text, custom log fields, or samples. Read the copied output before posting it to an issue tracker or chat.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What to look for before moving from report-only to enforcement</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Repeated violations from application code you actually intend to run.</li>
            <li>Inline code that can be removed or covered with a nonce or hash rather than a broad source.</li>
            <li>HTTP resources that should be upgraded to HTTPS instead of permitted as mixed content.</li>
            <li>Cross-origin dependencies whose ownership, necessity, and failure behavior are understood.</li>
            <li>Important user paths that have been exercised long enough to expose realistic policy gaps.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The specifications behind these fields</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            CSP Level 3 defines the violation body and the difference between enforced and report-only disposition. The Reporting API defines report envelopes, endpoint delivery, and the <span className="font-mono text-gray-800">application/reports+json</span> format. The older <span className="font-mono text-gray-800">report-uri</span> mechanism remains relevant for compatibility even though CSP Level 3 marks that directive deprecated.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            References: <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.w3.org/TR/CSP3/" target="_blank" rel="noreferrer">Content Security Policy Level 3</a> and <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.w3.org/TR/reporting-1/" target="_blank" rel="noreferrer">Reporting API</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/csp-report-analyzer" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
      <input type="checkbox" checked={checked} onChange={(event: { target: { checked: boolean } }) => onChange(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
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
    includeSamples: boolean;
    flagInlineEval: boolean;
    flagInsecureHttp: boolean;
    flagCrossOrigin: boolean;
  }
): AnalysisResult {
  const parsedReports = parseReports(input, options.inputMode);
  const rawReports = parsedReports.cspReports;
  if (rawReports.length === 0) throw new Error("No CSP violation reports were found in this input.");
  if (rawReports.length > 5000) throw new Error("This paste contains more than 5,000 CSP reports. Split it into smaller batches before analyzing it in the browser.");

  const violations = rawReports.map((report, index) => normalizeReport(report, options.redactQueryStrings, index));
  const groups = groupViolations(violations, options.groupMode);
  const findings = getFindings(violations, options);
  const enforceCount = violations.filter((item) => item.disposition.toLowerCase() === "enforce").length;
  const reportOnlyCount = violations.filter((item) => item.disposition.toLowerCase() === "report").length;
  const unknownDispositionCount = violations.length - enforceCount - reportOnlyCount;
  const base = {
    violations,
    groups,
    findings,
    totalReports: violations.length,
    blockedUriCount: uniqueCount(violations.map((item) => item.blockedUri).filter(Boolean)),
    directiveCount: uniqueCount(violations.map((item) => item.effectiveDirective || item.violatedDirective).filter(Boolean)),
    warningCount: findings.filter((item) => item.severity === "warning").length,
    ignoredReportCount: parsedReports.ignoredCount,
    enforceCount,
    reportOnlyCount,
    unknownDispositionCount,
  };
  return { ...base, output: formatOutput(base, options.outputMode, options.includeSamples) };
}

function parseReports(input: string, mode: InputMode) {
  const trimmed = input.trim();
  let allReports: unknown[];
  if (mode === "ndjson") {
    allReports = parseNdjson(trimmed);
  } else if (mode === "json") {
    allReports = flattenJsonReports(JSON.parse(trimmed));
  } else {
    try {
      allReports = flattenJsonReports(JSON.parse(trimmed));
    } catch {
      allReports = parseNdjson(trimmed);
    }
  }
  const cspReports = allReports.filter(isCspCandidate);
  return { cspReports, ignoredCount: allReports.length - cspReports.length };
}

function parseNdjson(input: string): unknown[] {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.map((line, index) => {
    try {
      return JSON.parse(line) as unknown;
    } catch {
      throw new Error(`NDJSON line ${index + 1} is not valid JSON.`);
    }
  });
}

function flattenJsonReports(value: unknown): unknown[] {
  const result: unknown[] = [];
  appendReports(value, result);
  return result;
}

function appendReports(value: unknown, result: unknown[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => appendReports(item, result));
    return;
  }
  if (isObject(value) && Array.isArray(value.reports)) {
    value.reports.forEach((item) => appendReports(item, result));
    return;
  }
  result.push(value);
}

function isCspCandidate(value: unknown) {
  if (!isObject(value)) return false;
  if (isObject(value["csp-report"])) return true;
  if (value.type === "csp-violation") return true;
  return looksLikeCspBody(value);
}

function normalizeReport(value: unknown, redactQueryStrings: boolean, index: number): CspViolation {
  if (!isObject(value)) {
    throw new Error(`Report ${index + 1} is not a JSON object.`);
  }

  let source: Record<string, unknown>;
  let sourceFormat: CspViolation["sourceFormat"];

  if (isObject(value["csp-report"])) {
    source = value["csp-report"] as Record<string, unknown>;
    sourceFormat = "legacy";
  } else if (value.type === "csp-violation" && isObject(value.body)) {
    source = value.body as Record<string, unknown>;
    sourceFormat = "reporting-api";
  } else if (looksLikeCspBody(value)) {
    source = value;
    sourceFormat = "body";
  } else {
    throw new Error(`Report ${index + 1} does not look like a CSP violation report.`);
  }

  const documentUri = readString(source, ["document-uri", "documentURL", "documentUrl", "documentUri"]) || readString(value, ["url"]);
  const blockedUri = readString(source, ["blocked-uri", "blockedURL", "blockedUrl", "blockedURI"]);
  const violatedDirective = readString(source, ["violated-directive", "violatedDirective"]);
  const effectiveDirective = readString(source, ["effective-directive", "effectiveDirective"]) || violatedDirective;

  if (!documentUri && !blockedUri && !effectiveDirective) {
    throw new Error(`Report ${index + 1} is missing the core CSP violation fields.`);
  }

  return {
    sourceFormat,
    documentUri: cleanUrl(documentUri, redactQueryStrings),
    blockedUri: cleanUrl(blockedUri, redactQueryStrings),
    violatedDirective,
    effectiveDirective,
    originalPolicy: readString(source, ["original-policy", "originalPolicy"]),
    sourceFile: cleanUrl(readString(source, ["source-file", "sourceFile"]), redactQueryStrings),
    referrer: cleanUrl(readString(source, ["referrer"]), redactQueryStrings),
    lineNumber: readString(source, ["line-number", "lineNumber"]),
    columnNumber: readString(source, ["column-number", "columnNumber"]),
    statusCode: readString(source, ["status-code", "statusCode"]),
    sample: readString(source, ["script-sample", "sample"]),
    disposition: readString(source, ["disposition"]),
  };
}

function looksLikeCspBody(value: Record<string, unknown>) {
  return ["effectiveDirective", "violated-directive", "blockedURL", "blocked-uri", "documentURL", "document-uri"].some((key) => value[key] !== undefined);
}

function readString(objectValue: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = objectValue[key];
    if (typeof value === "string" || typeof value === "number") return String(value);
  }
  return "";
}

function cleanUrl(value: string, redactQueryStrings: boolean) {
  if (!value || !redactQueryStrings || /^(inline|eval|data:|blob:)/i.test(value)) return value;
  try {
    const url = new URL(value);
    const hadSearch = Boolean(url.search);
    const hadHash = Boolean(url.hash);
    url.search = "";
    url.hash = "";
    return `${url.toString()}${hadSearch ? "?…" : ""}${hadHash ? "#…" : ""}`;
  } catch {
    return value.replace(/\?[^#]*/, "?…").replace(/#.*$/, "#…");
  }
}

function groupViolations(violations: CspViolation[], groupMode: GroupMode): GroupedRow[] {
  const grouped = new Map<string, CspViolation[]>();
  violations.forEach((violation) => {
    const key = getGroupKey(violation, groupMode) || "(missing)";
    const rows = grouped.get(key) || [];
    rows.push(violation);
    grouped.set(key, rows);
  });
  return Array.from(grouped.entries())
    .map(([key, rows]) => ({
      key,
      count: rows.length,
      directives: uniqueValues(rows.map((row) => row.effectiveDirective || row.violatedDirective).filter(Boolean)),
      blockedUris: uniqueValues(rows.map((row) => row.blockedUri).filter(Boolean)),
    }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function getGroupKey(violation: CspViolation, groupMode: GroupMode) {
  if (groupMode === "blockedUri") return violation.blockedUri;
  if (groupMode === "documentUri") return violation.documentUri;
  if (groupMode === "sourceFile") return violation.sourceFile;
  return violation.effectiveDirective || violation.violatedDirective;
}

function getFindings(
  violations: CspViolation[],
  options: { flagInlineEval: boolean; flagInsecureHttp: boolean; flagCrossOrigin: boolean }
): CspFinding[] {
  const findings: CspFinding[] = [];
  const inlineCount = violations.filter((item) => isInlineBlocked(item.blockedUri)).length;
  const evalCount = violations.filter(isEvalLike).length;
  const httpCount = violations.filter((item) => /^http:\/\//i.test(item.blockedUri)).length;
  const crossOriginCount = violations.filter(isCrossOriginHttpResource).length;
  const reportOnlyCount = violations.filter((item) => item.disposition.toLowerCase() === "report").length;
  const missingDispositionCount = violations.filter((item) => !item.disposition).length;
  const reportingApiCount = violations.filter((item) => item.sourceFormat === "reporting-api").length;
  const legacyCount = violations.filter((item) => item.sourceFormat === "legacy").length;

  if (options.flagInlineEval && inlineCount > 0) {
    findings.push({ severity: "warning", title: "Inline code appears in the violations", message: `${inlineCount} report${inlineCount === 1 ? "" : "s"} use an inline blocked value. Confirm whether the code should disappear, receive a nonce/hash, or remain blocked before loosening script or style policy.` });
  }
  if (options.flagInlineEval && evalCount > 0) {
    findings.push({ severity: "warning", title: "Eval-like execution appears in the violations", message: `${evalCount} report${evalCount === 1 ? "" : "s"} mention eval-like behavior. A blocked eval report is evidence that CSP is doing work; it is not a reason by itself to add 'unsafe-eval'.` });
  }
  if (options.flagInsecureHttp && httpCount > 0) {
    findings.push({ severity: "warning", title: "HTTP resources appear in the blocked values", message: `${httpCount} report${httpCount === 1 ? "" : "s"} reference an http:// resource. Prefer correcting the resource URL to HTTPS rather than weakening policy on an HTTPS page.` });
  }
  if (options.flagCrossOrigin && crossOriginCount > 0) {
    findings.push({ severity: "info", title: "Some blocked resources are cross-origin", message: `${crossOriginCount} report${crossOriginCount === 1 ? "" : "s"} contain parseable HTTP(S) document and blocked URLs with different origins. Cross-origin does not automatically mean untrusted or third-party.` });
  }
  if (reportOnlyCount > 0) {
    findings.push({ severity: "info", title: "Report-only signals are present", message: `${reportOnlyCount} report${reportOnlyCount === 1 ? " is" : "s are"} marked disposition=report. Those events describe what would have been blocked, not necessarily what a user actually lost.` });
  }
  if (missingDispositionCount > 0) {
    findings.push({ severity: "info", title: "Some reports do not say whether policy was enforced", message: `${missingDispositionCount} report${missingDispositionCount === 1 ? " lacks" : "s lack"} a disposition field, so enforcement is left unknown instead of inferred.` });
  }
  findings.push({ severity: "info", title: "Payload formats in this paste", message: `Legacy csp-report: ${legacyCount}. Reporting API csp-violation: ${reportingApiCount}. Other CSP body objects: ${violations.length - legacyCount - reportingApiCount}.` });
  return findings;
}

function isInlineBlocked(value: string) {
  return /^inline$/i.test(value) || value.toLowerCase().indexOf("inline") !== -1;
}

function isEvalLike(violation: CspViolation) {
  const combined = `${violation.blockedUri} ${violation.sample}`.toLowerCase();
  return combined.indexOf("eval") !== -1 || combined.indexOf("wasm-unsafe-eval") !== -1;
}

function isCrossOriginHttpResource(violation: CspViolation) {
  const documentOrigin = getHttpOrigin(violation.documentUri);
  const blockedOrigin = getHttpOrigin(violation.blockedUri);
  return Boolean(documentOrigin && blockedOrigin && documentOrigin !== blockedOrigin);
}

function getHttpOrigin(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.origin : "";
  } catch {
    return "";
  }
}

function formatOutput(
  result: Omit<AnalysisResult, "output">,
  outputMode: OutputMode,
  includeSamples: boolean
) {
  if (outputMode === "json") {
    return JSON.stringify({
      summary: {
        reports: result.totalReports,
        enforced: result.enforceCount,
        reportOnly: result.reportOnlyCount,
        dispositionUnknown: result.unknownDispositionCount,
        directives: result.directiveCount,
        blockedValues: result.blockedUriCount,
        warnings: result.warningCount,
        nonCspReportsIgnored: result.ignoredReportCount,
      },
      groups: result.groups,
      violations: result.violations.map((item) => ({ ...item, sample: includeSamples ? item.sample : item.sample ? "[omitted]" : "" })),
      findings: result.findings,
    }, null, 2);
  }

  if (outputMode === "csv") {
    const header = ["format", "disposition", "document", "directive", "blocked", "source", "line", "column", "status", "sample"];
    const rows = result.violations.map((item) => [
      item.sourceFormat,
      item.disposition,
      item.documentUri,
      item.effectiveDirective || item.violatedDirective,
      item.blockedUri,
      item.sourceFile,
      item.lineNumber,
      item.columnNumber,
      item.statusCode,
      includeSamples ? item.sample : item.sample ? "[omitted]" : "",
    ]);
    return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "report") {
    const lines: string[] = [
      "CSP violation report analysis",
      "-----------------------------",
      `Reports: ${result.totalReports}`,
      `Enforced: ${result.enforceCount}`,
      `Report-only: ${result.reportOnlyCount}`,
      `Disposition unknown: ${result.unknownDispositionCount}`,
      `Unique directives: ${result.directiveCount}`,
      `Unique blocked values: ${result.blockedUriCount}`,
      `Non-CSP reports ignored: ${result.ignoredReportCount}`,
      "",
      "Grouped counts:",
    ];
    result.groups.forEach((group) => lines.push(`- ${group.key}: ${group.count}`));
    lines.push("", "Findings:");
    result.findings.forEach((finding) => lines.push(`- [${finding.severity}] ${finding.title}: ${finding.message}`));
    lines.push("", "Reports:");
    result.violations.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.effectiveDirective || item.violatedDirective || "(directive missing)"}`,
        `   disposition: ${item.disposition || "unknown"}`,
        `   document: ${item.documentUri || "(missing)"}`,
        `   blocked: ${item.blockedUri || "(missing)"}`,
        `   source: ${item.sourceFile || "(missing)"}`
      );
      if (includeSamples && item.sample) lines.push(`   sample: ${item.sample}`);
    });
    return lines.join("\n");
  }

  return [
    "CSP violation report summary",
    "----------------------------",
    `Reports: ${result.totalReports}`,
    `Enforced: ${result.enforceCount}`,
    `Report-only: ${result.reportOnlyCount}`,
    `Disposition unknown: ${result.unknownDispositionCount}`,
    `Unique directives: ${result.directiveCount}`,
    `Unique blocked values: ${result.blockedUriCount}`,
    `Warnings: ${result.warningCount}`,
    `Non-CSP reports ignored: ${result.ignoredReportCount}`,
    "",
    "Largest groups:",
    ...result.groups.slice(0, 10).map((group) => `- ${group.key}: ${group.count}`),
  ].join("\n");
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
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
