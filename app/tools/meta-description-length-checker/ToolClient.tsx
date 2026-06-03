"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type DeviceMode = "desktop" | "mobile";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type DescriptionRow = {
  description: string;
  url: string;
  keyword: string;
  length: number;
  estimatedPixels: number;
  status: "good" | "short" | "long" | "empty";
  score: number;
  issues: Issue[];
};

type Result = {
  rows: DescriptionRow[];
  issues: Issue[];
  output: string;
  totalDescriptions: number;
  goodCount: number;
  shortCount: number;
  longCount: number;
  emptyCount: number;
  duplicateCount: number;
  averageLength: number;
  averageScore: number;
};

const sampleDescriptions = `Check SEO title tag length, truncation risk, keyword placement, brand placement, separators, duplicates, and SERP-style title preview directly in your browser.
Analyze canonical URL tags and URL variants for SEO issues before publishing pages.
Simple online tools for developers and SEO work.
This is a very long meta description example that keeps going with extra wording, repeated phrases, and too many details, so it may be truncated in search results before the important part is fully visible to users.`;

export default function ToolClient() {
  const [descriptions, setDescriptions] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [checkingStyle, setCheckingStyle] = useState<CheckingStyle>("balanced");
  const [oneDescriptionPerLine, setOneDescriptionPerLine] = useState(true);
  const [checkKeywordUsage, setCheckKeywordUsage] = useState(true);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [checkCallToAction, setCheckCallToAction] = useState(true);
  const [checkThinDescriptions, setCheckThinDescriptions] = useState(true);
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

  const checkDescriptions = () => {
    if (!descriptions.trim()) {
      setError("Please enter at least one meta description.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = analyzeDescriptions({
        descriptions,
        targetKeyword,
        pageTitle,
        outputMode,
        deviceMode,
        checkingStyle,
        oneDescriptionPerLine,
        checkKeywordUsage,
        checkDuplicates,
        checkCallToAction,
        checkThinDescriptions,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check these meta descriptions.");
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
    setDescriptions(sampleDescriptions);
    setTargetKeyword("meta description length checker");
    setPageTitle("Meta Description Length Checker");
    setOutputMode("summary");
    setDeviceMode("desktop");
    setCheckingStyle("balanced");
    setOneDescriptionPerLine(true);
    setCheckKeywordUsage(true);
    setCheckDuplicates(true);
    setCheckCallToAction(true);
    setCheckThinDescriptions(true);
    clearResult();
  };

  const resetAll = () => {
    setDescriptions("");
    setTargetKeyword("");
    setPageTitle("");
    setOutputMode("summary");
    setDeviceMode("desktop");
    setCheckingStyle("balanced");
    setOneDescriptionPerLine(true);
    setCheckKeywordUsage(true);
    setCheckDuplicates(true);
    setCheckCallToAction(true);
    setCheckThinDescriptions(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Meta Description Length Checker"
      description="Check meta description length, truncation risk, keyword usage, duplicate descriptions, CTA wording, empty descriptions, and SERP-style snippet preview directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Meta Descriptions
        </label>

        <textarea
          value={descriptions}
          onChange={(event) => {
            setDescriptions(event.target.value);
            clearResult();
          }}
          placeholder={sampleDescriptions}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste one meta description per line, or paste description and URL pairs if you want page context in reports.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Target Keyword
          </label>

          <input
            value={targetKeyword}
            onChange={(event) => {
              setTargetKeyword(event.target.value);
              clearResult();
            }}
            placeholder="meta description length checker"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Optional. Used to check whether the description naturally includes the main topic.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Page Title
          </label>

          <input
            value={pageTitle}
            onChange={(event) => {
              setPageTitle(event.target.value);
              clearResult();
            }}
            placeholder="Meta Description Length Checker"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Optional. Used for the SERP-style preview only.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Preview"
            value={deviceMode}
            onChange={(value) => {
              setDeviceMode(value as DeviceMode);
              clearResult();
            }}
            options={[
              { label: "Desktop", value: "desktop" },
              { label: "Mobile", value: "mobile" },
            ]}
          />

          <YoryantraSelect
            label="Checking Style"
            value={checkingStyle}
            onChange={(value) => {
              setCheckingStyle(value as CheckingStyle);
              clearResult();
            }}
            options={[
              { label: "Balanced", value: "balanced" },
              { label: "Strict", value: "strict" },
              { label: "Relaxed", value: "relaxed" },
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
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
              { label: "CSV", value: "csv" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <CheckboxRow checked={oneDescriptionPerLine} label="Treat each line as one description" onChange={(checked) => { setOneDescriptionPerLine(checked); clearResult(); }} />
            <CheckboxRow checked={checkKeywordUsage} label="Check target keyword usage" onChange={(checked) => { setCheckKeywordUsage(checked); clearResult(); }} />
            <CheckboxRow checked={checkDuplicates} label="Check duplicate descriptions" onChange={(checked) => { setCheckDuplicates(checked); clearResult(); }} />
            <CheckboxRow checked={checkCallToAction} label="Check for action/helpful wording" onChange={(checked) => { setCheckCallToAction(checked); clearResult(); }} />
            <CheckboxRow checked={checkThinDescriptions} label="Warn about thin or generic descriptions" onChange={(checked) => { setCheckThinDescriptions(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Google may rewrite meta descriptions. This checker helps catch common description problems, but it cannot guarantee exact SERP text.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkDescriptions} className="yoryantra-btn">
          Check Meta Descriptions
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Descriptions" value={result.totalDescriptions.toLocaleString()} />
          <SummaryCard label="Good" value={result.goodCount.toLocaleString()} />
          <SummaryCard label="Long" value={result.longCount.toLocaleString()} />
          <SummaryCard label="Average Score" value={`${result.averageScore}/100`} />
        </div>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Description Review</h3>

          <p className="mt-2 text-sm text-gray-500">
            Description length, estimated display width, status, score, and issue count.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Length</th>
                  <th className="px-4 py-3 font-semibold">Pixels</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Issues</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.rows.slice(0, 100).map((row, index) => (
                  <tr key={`${row.description}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[460px] break-words">{row.description || "(empty)"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.length}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.estimatedPixels}</td>
                    <td className="px-4 py-3 text-gray-700">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        row.status === "good"
                          ? "bg-green-50 text-green-700"
                          : row.status === "long"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.score}</td>
                    <td className="px-4 py-3 text-gray-700">{row.issues.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">SERP-Style Preview</h3>

          <div className="mt-4 space-y-4">
            {result.rows.slice(0, 5).map((row, index) => (
              <div key={`${row.description}-preview-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className={`font-medium text-blue-700 ${deviceMode === "mobile" ? "text-base" : "text-lg"}`}>
                  {pageTitle || "Example Page Title"}
                </p>
                <p className="mt-1 text-sm text-green-700">
                  {row.url || "https://example.com/page"}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">
                  {truncateDescription(row.description, deviceMode)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Description findings</h3>

          <div className="mt-3 space-y-3">
            {result.issues.slice(0, 20).map((issue, index) => (
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
          <h3 className="text-sm font-semibold text-blue-900">Meta description guidance</h3>

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

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Meta description check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Meta description checking happens directly in your browser. Your description text is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking Meta Descriptions Before Publishing</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A meta description can influence how people understand your page in search results. It should explain the page clearly, match the search intent, and give users a reason to click without sounding like spam.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Meta Description Length Checker reviews description length, approximate display width, keyword usage, duplicate text, generic wording, action language, and snippet-style preview before you publish or update a page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Meta Description Length Checker</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one meta description per line, or paste a list from your pages.</li>
            <li>Optionally enter a target keyword and page title.</li>
            <li>Choose desktop or mobile preview and a checking style.</li>
            <li>Review length, estimated pixels, description quality issues, and SERP-style preview.</li>
            <li>Copy the summary, report, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Meta Description Issues</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Descriptions that are missing or empty.</li>
            <li>Descriptions that are too short to explain the page.</li>
            <li>Descriptions that are too long and likely to be truncated.</li>
            <li>Duplicate descriptions across many pages.</li>
            <li>Main topic or target keyword missing completely.</li>
            <li>Generic wording like “welcome to our website” that does not describe the page.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Meta Description</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Check meta description length, truncation risk, keyword usage, duplicates, CTA wording, and SERP-style snippet preview directly in your browser.`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why Meta Description Length Is Not an Exact Rule</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Google can rewrite descriptions based on the page content and search query. A description that is technically the right length can still be weak if it does not explain the page or match the user’s intent.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use length as a useful review signal, but write descriptions for real people first: clear, specific, and connected to the page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a meta description length checker do?">
              It checks description text for length, estimated display width, truncation risk, duplicate text, target keyword usage, and common snippet quality issues.
            </Faq>

            <Faq title="What is a good meta description length?">
              Many descriptions work well around 120 to 160 characters, but the best length depends on wording, page intent, and search result display.
            </Faq>

            <Faq title="Can Google rewrite my meta description?">
              Yes. Google may use page content instead of your written description when it thinks another snippet better matches the query.
            </Faq>

            <Faq title="Should every page have a unique description?">
              Yes. Unique descriptions help users understand what each page is about before they click.
            </Faq>

            <Faq title="Is anything uploaded when I check descriptions?">
              No. The check runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/title-tag-length-checker" className="yoryantra-btn-outline">Title Tag Length Checker</Link>
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline">Meta Tags Checker</Link>
            <Link href="/tools/serp-snippet-preview-tool" className="yoryantra-btn-outline">SERP Snippet Preview Tool</Link>
            <Link href="/tools/meta-tags-generator" className="yoryantra-btn-outline">Meta Tags Generator</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">Canonical URL Checker</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[var(--light-gold)]"
      />
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

function Faq({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}

function analyzeDescriptions(options: {
  descriptions: string;
  targetKeyword: string;
  pageTitle: string;
  outputMode: OutputMode;
  deviceMode: DeviceMode;
  checkingStyle: CheckingStyle;
  oneDescriptionPerLine: boolean;
  checkKeywordUsage: boolean;
  checkDuplicates: boolean;
  checkCallToAction: boolean;
  checkThinDescriptions: boolean;
}): Result {
  const rows = parseRows(options.descriptions, options.oneDescriptionPerLine).map((row) => analyzeRow(row, options));
  const duplicateIssues = options.checkDuplicates ? getDuplicateIssues(rows) : [];
  const issues = [...rows.flatMap((row) => row.issues), ...duplicateIssues];
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const totalLength = rows.reduce((sum, row) => sum + row.length, 0);

  const base = {
    rows,
    issues,
    totalDescriptions: rows.length,
    goodCount: rows.filter((row) => row.status === "good").length,
    shortCount: rows.filter((row) => row.status === "short").length,
    longCount: rows.filter((row) => row.status === "long").length,
    emptyCount: rows.filter((row) => row.status === "empty").length,
    duplicateCount: duplicateIssues.length,
    averageLength: rows.length ? Math.round(totalLength / rows.length) : 0,
    averageScore: rows.length ? Math.round(totalScore / rows.length) : 0,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function parseRows(input: string, oneDescriptionPerLine: boolean) {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (oneDescriptionPerLine) {
    return lines.map((line) => ({ description: line, url: "", keyword: "" }));
  }

  const rows: { description: string; url: string; keyword: string }[] = [];

  for (let index = 0; index < lines.length; index += 2) {
    rows.push({
      description: lines[index] || "",
      url: lines[index + 1] || "",
      keyword: "",
    });
  }

  return rows;
}

function analyzeRow(row: { description: string; url: string; keyword: string }, options: {
  targetKeyword: string;
  deviceMode: DeviceMode;
  checkingStyle: CheckingStyle;
  checkKeywordUsage: boolean;
  checkCallToAction: boolean;
  checkThinDescriptions: boolean;
}): DescriptionRow {
  const description = row.description.trim();
  const length = description.length;
  const estimatedPixels = estimatePixels(description);
  const limits = getLimits(options.deviceMode, options.checkingStyle);
  const issues: Issue[] = [];
  let status: DescriptionRow["status"] = "good";

  if (!description) {
    status = "empty";
    issues.push({
      severity: "high",
      title: "Empty description",
      message: "The meta description is empty or missing.",
    });
  } else if (length < limits.minChars) {
    status = "short";
    issues.push({
      severity: "warning",
      title: "Description may be too short",
      message: `This description has ${length} characters. It may not explain the page clearly enough.`,
    });
  } else if (length > limits.maxChars || estimatedPixels > limits.maxPixels) {
    status = "long";
    issues.push({
      severity: "warning",
      title: "Description may be too long",
      message: `This description has ${length} characters and an estimated width of ${estimatedPixels}px. It may be truncated.`,
    });
  }

  if (options.checkKeywordUsage && options.targetKeyword.trim()) {
    const keyword = options.targetKeyword.trim().toLowerCase();
    const index = description.toLowerCase().indexOf(keyword);

    if (index === -1) {
      issues.push({
        severity: "info",
        title: "Target keyword missing",
        message: "The target keyword was not found in the description.",
      });
    } else if (index > 110) {
      issues.push({
        severity: "info",
        title: "Target keyword appears late",
        message: "The target keyword appears late in the description. Important wording is often stronger earlier.",
      });
    }
  }

  if (options.checkCallToAction && description && !hasActionLanguage(description)) {
    issues.push({
      severity: "info",
      title: "Could be more action-focused",
      message: "The description does not include clear action or benefit wording. This is not always required, but it can improve clarity.",
    });
  }

  if (options.checkThinDescriptions && isGenericDescription(description)) {
    issues.push({
      severity: "warning",
      title: "Generic description",
      message: "This description looks generic. Make it more specific to the page content.",
    });
  }

  const score = scoreDescription(issues, status);

  return {
    ...row,
    description,
    length,
    estimatedPixels,
    status,
    score,
    issues,
  };
}

function getLimits(deviceMode: DeviceMode, style: CheckingStyle) {
  const base = deviceMode === "mobile"
    ? { minChars: 70, maxChars: 165, maxPixels: 920 }
    : { minChars: 70, maxChars: 160, maxPixels: 900 };

  if (style === "strict") {
    return {
      minChars: base.minChars + 15,
      maxChars: base.maxChars - 10,
      maxPixels: base.maxPixels - 80,
    };
  }

  if (style === "relaxed") {
    return {
      minChars: base.minChars - 20,
      maxChars: base.maxChars + 20,
      maxPixels: base.maxPixels + 120,
    };
  }

  return base;
}

function estimatePixels(description: string) {
  return Array.from(description).reduce((sum, char) => {
    if (/[A-ZMW]/.test(char)) return sum + 10;
    if (/[ilI.,'!|]/.test(char)) return sum + 4;
    if (/\s/.test(char)) return sum + 4;
    if (/[^\x00-\x7F]/.test(char)) return sum + 11;
    return sum + 7;
  }, 0);
}

function hasActionLanguage(description: string) {
  return /\b(check|learn|find|compare|create|generate|analyze|preview|fix|discover|use|get|review|test|validate|build)\b/i.test(description);
}

function isGenericDescription(description: string) {
  return /^(welcome to|home page|this page|best website|click here|learn more about our|we provide|we offer)/i.test(description) ||
    description.length > 0 && description.split(/\s+/).length < 8;
}

function getDuplicateIssues(rows: DescriptionRow[]) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const key = row.description.toLowerCase().trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([description, count]) => ({
      severity: "warning" as const,
      title: "Duplicate description",
      message: `${count} rows use the same description: ${description}`,
    }));
}

function scoreDescription(issues: Issue[], status: DescriptionRow["status"]) {
  let score = 100;

  if (status === "empty") score -= 70;
  if (status === "short") score -= 18;
  if (status === "long") score -= 18;

  issues.forEach((issue) => {
    if (issue.severity === "high") score -= 25;
    else if (issue.severity === "warning") score -= 10;
    else score -= 4;
  });

  return Math.max(0, score);
}

function truncateDescription(description: string, deviceMode: DeviceMode) {
  const max = deviceMode === "mobile" ? 170 : 160;
  return description.length > max ? `${description.slice(0, max - 1)}…` : description;
}

function formatOutput(result: Omit<Result, "output">, outputMode: OutputMode) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const rows = [
      ["description", "length", "estimatedPixels", "status", "score", "issues"],
      ...result.rows.map((row) => [
        row.description,
        String(row.length),
        String(row.estimatedPixels),
        row.status,
        String(row.score),
        String(row.issues.length),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Description | Length | Pixels | Status | Score | Issues |",
      "| --- | ---: | ---: | --- | ---: | ---: |",
      ...result.rows.map((row) =>
        `| ${escapeMarkdown(row.description || "-")} | ${row.length} | ${row.estimatedPixels} | ${row.status} | ${row.score} | ${row.issues.length} |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.rows
      .map((row, index) => {
        const issues = row.issues.length
          ? row.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
          : ["- No common meta description issues found."];

        return [
          `Description ${index + 1}`,
          "-------------",
          `Text: ${row.description || "(empty)"}`,
          `Length: ${row.length}`,
          `Estimated pixels: ${row.estimatedPixels}`,
          `Status: ${row.status}`,
          `Score: ${row.score}/100`,
          "",
          "Findings:",
          ...issues,
        ].join("\n");
      })
      .join("\n\n");
  }

  const issues = result.issues.length
    ? result.issues.slice(0, 15).map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
    : ["- No common meta description issues found."];

  return [
    "Meta Description Length Summary",
    "-------------------------------",
    `Descriptions checked: ${result.totalDescriptions}`,
    `Good descriptions: ${result.goodCount}`,
    `Short descriptions: ${result.shortCount}`,
    `Long descriptions: ${result.longCount}`,
    `Empty descriptions: ${result.emptyCount}`,
    `Duplicate description groups: ${result.duplicateCount}`,
    `Average length: ${result.averageLength}`,
    `Average score: ${result.averageScore}/100`,
    "",
    "Findings:",
    ...issues,
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.longCount > 0) {
    notes.push({
      title: "Review long descriptions first",
      message: "Long descriptions may be truncated. Keep the clearest benefit and page topic near the beginning.",
    });
  }

  if (result.duplicateCount > 0) {
    notes.push({
      title: "Duplicate descriptions found",
      message: "Unique descriptions help users understand how each page is different before clicking.",
    });
  }

  if (result.averageScore >= 85) {
    notes.push({
      title: "Mostly clean description set",
      message: "The description set looks healthy overall. Review individual warnings before publishing.",
    });
  }

  return notes;
}
