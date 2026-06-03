"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type DeviceMode = "desktop" | "mobile";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type TitleRow = {
  title: string;
  url: string;
  keyword: string;
  brand: string;
  length: number;
  estimatedPixels: number;
  status: "good" | "short" | "long" | "empty";
  score: number;
  issues: Issue[];
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  rows: TitleRow[];
  issues: Issue[];
  output: string;
  totalTitles: number;
  goodCount: number;
  shortCount: number;
  longCount: number;
  emptyCount: number;
  duplicateCount: number;
  averageLength: number;
  averageScore: number;
};

const sampleTitles = `Title Tag Length Checker | Check SEO Title Length Online | Yoryantra
Canonical URL Checker | Check Canonical Tags and URL Variants
Best JSON Formatter Online for Developers
Tools
This is a very long title tag example that will probably be too long for search results because it keeps adding extra wording without a clear reason`;

export default function ToolClient() {
  const [titles, setTitles] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [brandName, setBrandName] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [checkingStyle, setCheckingStyle] = useState<CheckingStyle>("balanced");
  const [oneTitlePerLine, setOneTitlePerLine] = useState(true);
  const [checkKeywordPlacement, setCheckKeywordPlacement] = useState(true);
  const [checkBrandPlacement, setCheckBrandPlacement] = useState(true);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [checkSeparators, setCheckSeparators] = useState(true);
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

  const checkTitles = () => {
    if (!titles.trim()) {
      setError("Please enter at least one title tag.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = analyzeTitles({
        titles,
        targetKeyword,
        brandName,
        outputMode,
        deviceMode,
        checkingStyle,
        oneTitlePerLine,
        checkKeywordPlacement,
        checkBrandPlacement,
        checkDuplicates,
        checkSeparators,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to check these title tags.");
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
    setTitles(sampleTitles);
    setTargetKeyword("title tag length checker");
    setBrandName("Yoryantra");
    setOutputMode("summary");
    setDeviceMode("desktop");
    setCheckingStyle("balanced");
    setOneTitlePerLine(true);
    setCheckKeywordPlacement(true);
    setCheckBrandPlacement(true);
    setCheckDuplicates(true);
    setCheckSeparators(true);
    clearResult();
  };

  const resetAll = () => {
    setTitles("");
    setTargetKeyword("");
    setBrandName("");
    setOutputMode("summary");
    setDeviceMode("desktop");
    setCheckingStyle("balanced");
    setOneTitlePerLine(true);
    setCheckKeywordPlacement(true);
    setCheckBrandPlacement(true);
    setCheckDuplicates(true);
    setCheckSeparators(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Title Tag Length Checker"
      description="Check SEO title tag length, truncation risk, keyword placement, brand placement, separators, duplicates, and SERP-style title preview directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Title Tags
        </label>

        <textarea
          value={titles}
          onChange={(event) => {
            setTitles(event.target.value);
            clearResult();
          }}
          placeholder={sampleTitles}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste one title per line, or paste title and URL pairs if you want to keep page context in reports.
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
            placeholder="title tag length checker"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Optional. Used to check whether the main keyword appears early enough.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Brand or Site Name
          </label>

          <input
            value={brandName}
            onChange={(event) => {
              setBrandName(event.target.value);
              clearResult();
            }}
            placeholder="Yoryantra"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Optional. Used to check brand placement and repeated brand text.
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
            <CheckboxRow checked={oneTitlePerLine} label="Treat each line as one title" onChange={(checked) => { setOneTitlePerLine(checked); clearResult(); }} />
            <CheckboxRow checked={checkKeywordPlacement} label="Check target keyword placement" onChange={(checked) => { setCheckKeywordPlacement(checked); clearResult(); }} />
            <CheckboxRow checked={checkBrandPlacement} label="Check brand placement" onChange={(checked) => { setCheckBrandPlacement(checked); clearResult(); }} />
            <CheckboxRow checked={checkDuplicates} label="Check duplicate titles" onChange={(checked) => { setCheckDuplicates(checked); clearResult(); }} />
            <CheckboxRow checked={checkSeparators} label="Check title separators and repeated separators" onChange={(checked) => { setCheckSeparators(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Google can rewrite titles. This checker helps you catch common title tag problems before publishing, but it cannot guarantee exact SERP display.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkTitles} className="yoryantra-btn">
          Check Title Tags
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
          <SummaryCard label="Titles" value={result.totalTitles.toLocaleString()} />
          <SummaryCard label="Good" value={result.goodCount.toLocaleString()} />
          <SummaryCard label="Long" value={result.longCount.toLocaleString()} />
          <SummaryCard label="Average Score" value={`${result.averageScore}/100`} />
        </div>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Title Review</h3>

          <p className="mt-2 text-sm text-gray-500">
            Title length, estimated display width, status, score, and issue count.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Length</th>
                  <th className="px-4 py-3 font-semibold">Pixels</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Issues</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.rows.slice(0, 100).map((row, index) => (
                  <tr key={`${row.title}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[420px] break-words">{row.title || "(empty)"}</span>
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
              <div key={`${row.title}-preview-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className={`font-medium text-blue-700 ${deviceMode === "mobile" ? "text-base" : "text-lg"}`}>
                  {truncatePreview(row.title, deviceMode)}
                </p>
                <p className="mt-1 text-sm text-green-700">
                  {row.url || "https://example.com/page"}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  This preview is approximate. Google may rewrite or truncate titles differently.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Title findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">SEO title guidance</h3>

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
          {output || "Title tag check output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Title checking happens directly in your browser. Your title text is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking SEO Title Tags Before Publishing</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A page title is one of the strongest on-page signals users see in search results, browser tabs, social previews, and saved bookmarks. A good title should be clear, specific, readable, and not so long that the important part gets hidden.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Title Tag Length Checker helps you review title length, approximate display width, keyword placement, brand placement, duplicate patterns, and common formatting issues before you publish or update pages.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the Title Tag Length Checker</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one title per line, or paste a list of titles from your pages.</li>
            <li>Optionally add a target keyword and brand name.</li>
            <li>Choose desktop or mobile preview and a checking style.</li>
            <li>Review length, estimated pixels, title quality issues, and preview output.</li>
            <li>Copy the summary, report, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Title Tag Issues</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Titles that are too short to explain the page.</li>
            <li>Titles that are too long and likely to be truncated.</li>
            <li>Main keywords missing or placed too late.</li>
            <li>Brand names repeated or placed awkwardly.</li>
            <li>Duplicate titles across multiple pages.</li>
            <li>Repeated separators like ||, --, or excessive pipes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example SEO Title</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Title Tag Length Checker | Check SEO Title Length Online | Yoryantra`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why Title Length Is Only Part of the Check</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            There is no exact character count that guarantees how a title appears in Google. Width, wording, query intent, device type, and Google rewriting can all affect the final search snippet.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use title length as a practical review signal, but also make sure the title is useful to real users and accurately describes the page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does a title tag length checker do?">
              It checks title text for length, estimated display width, truncation risk, keyword placement, brand placement, and common SEO formatting issues.
            </Faq>

            <Faq title="What is a good SEO title length?">
              Many titles work well around 45 to 60 characters, but the best title depends on the page, wording, and search result display width.
            </Faq>

            <Faq title="Can Google rewrite my title?">
              Yes. Google may rewrite titles when it thinks another title better matches the page or search query.
            </Faq>

            <Faq title="Should every page have a unique title?">
              Yes. Unique titles help users and search engines understand the specific purpose of each page.
            </Faq>

            <Faq title="Is anything uploaded when I check titles?">
              No. The check runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline">Meta Tags Checker</Link>
            <Link href="/tools/serp-snippet-preview-tool" className="yoryantra-btn-outline">SERP Snippet Preview Tool</Link>
            <Link href="/tools/meta-tags-generator" className="yoryantra-btn-outline">Meta Tags Generator</Link>
            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline">Meta Robots Tag Generator</Link>
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

function analyzeTitles(options: {
  titles: string;
  targetKeyword: string;
  brandName: string;
  outputMode: OutputMode;
  deviceMode: DeviceMode;
  checkingStyle: CheckingStyle;
  oneTitlePerLine: boolean;
  checkKeywordPlacement: boolean;
  checkBrandPlacement: boolean;
  checkDuplicates: boolean;
  checkSeparators: boolean;
}): Result {
  const rows = parseRows(options.titles, options.oneTitlePerLine).map((row) => analyzeRow(row, options));
  const duplicateIssues = options.checkDuplicates ? getDuplicateIssues(rows) : [];
  const issues = [...rows.flatMap((row) => row.issues), ...duplicateIssues];
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const totalLength = rows.reduce((sum, row) => sum + row.length, 0);

  const base = {
    rows,
    issues,
    totalTitles: rows.length,
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

function parseRows(input: string, oneTitlePerLine: boolean) {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  if (oneTitlePerLine) {
    return lines.map((line) => ({ title: line, url: "", keyword: "", brand: "" }));
  }

  const rows: { title: string; url: string; keyword: string; brand: string }[] = [];

  for (let index = 0; index < lines.length; index += 2) {
    rows.push({
      title: lines[index] || "",
      url: lines[index + 1] || "",
      keyword: "",
      brand: "",
    });
  }

  return rows;
}

function analyzeRow(row: { title: string; url: string; keyword: string; brand: string }, options: {
  targetKeyword: string;
  brandName: string;
  deviceMode: DeviceMode;
  checkingStyle: CheckingStyle;
  checkKeywordPlacement: boolean;
  checkBrandPlacement: boolean;
  checkSeparators: boolean;
}): TitleRow {
  const title = row.title.trim();
  const length = title.length;
  const estimatedPixels = estimatePixels(title);
  const limits = getLimits(options.deviceMode, options.checkingStyle);
  const issues: Issue[] = [];

  let status: TitleRow["status"] = "good";

  if (!title) {
    status = "empty";
    issues.push({
      severity: "high",
      title: "Empty title",
      message: "The title tag is empty or missing.",
    });
  } else if (length < limits.minChars) {
    status = "short";
    issues.push({
      severity: "warning",
      title: "Title may be too short",
      message: `This title has ${length} characters. It may not explain the page clearly enough.`,
    });
  } else if (length > limits.maxChars || estimatedPixels > limits.maxPixels) {
    status = "long";
    issues.push({
      severity: "warning",
      title: "Title may be too long",
      message: `This title has ${length} characters and an estimated width of ${estimatedPixels}px. Important text may be truncated.`,
    });
  }

  if (options.checkKeywordPlacement && options.targetKeyword.trim()) {
    const keyword = options.targetKeyword.trim().toLowerCase();
    const index = title.toLowerCase().indexOf(keyword);

    if (index === -1) {
      issues.push({
        severity: "info",
        title: "Target keyword missing",
        message: "The target keyword was not found in the title.",
      });
    } else if (index > 35) {
      issues.push({
        severity: "info",
        title: "Target keyword appears late",
        message: "The target keyword appears late in the title. Important wording is often stronger near the beginning.",
      });
    }
  }

  if (options.checkBrandPlacement && options.brandName.trim()) {
    const brand = options.brandName.trim().toLowerCase();
    const lower = title.toLowerCase();
    const count = countOccurrences(lower, brand);

    if (count === 0) {
      issues.push({
        severity: "info",
        title: "Brand name missing",
        message: "The brand or site name was not found in the title.",
      });
    } else if (count > 1) {
      issues.push({
        severity: "warning",
        title: "Brand name repeated",
        message: "The brand or site name appears more than once.",
      });
    } else if (lower.indexOf(brand) < 10 && length > 45) {
      issues.push({
        severity: "info",
        title: "Brand appears very early",
        message: "For many pages, the specific topic is more useful at the start than the brand name.",
      });
    }
  }

  if (options.checkSeparators) {
    if (/\|\s*\||--|::|\/\s*\//.test(title)) {
      issues.push({
        severity: "info",
        title: "Repeated separator",
        message: "The title appears to use repeated separators. Simplify the wording if possible.",
      });
    }

    if ((title.match(/\|/g) || []).length > 2) {
      issues.push({
        severity: "info",
        title: "Many pipe separators",
        message: "Too many title sections can make the title feel crowded.",
      });
    }
  }

  const score = scoreTitle(issues, status);

  return {
    ...row,
    title,
    length,
    estimatedPixels,
    status,
    score,
    issues,
  };
}

function getLimits(deviceMode: DeviceMode, style: CheckingStyle) {
  const base = deviceMode === "mobile"
    ? { minChars: 25, maxChars: 62, maxPixels: 620 }
    : { minChars: 25, maxChars: 60, maxPixels: 580 };

  if (style === "strict") {
    return {
      minChars: base.minChars + 5,
      maxChars: base.maxChars - 5,
      maxPixels: base.maxPixels - 50,
    };
  }

  if (style === "relaxed") {
    return {
      minChars: base.minChars - 5,
      maxChars: base.maxChars + 8,
      maxPixels: base.maxPixels + 70,
    };
  }

  return base;
}

function estimatePixels(title: string) {
  return Array.from(title).reduce((sum, char) => {
    if (/[A-ZMW]/.test(char)) return sum + 11;
    if (/[ilI.,'!|]/.test(char)) return sum + 4;
    if (/\s/.test(char)) return sum + 4;
    if (/[^\x00-\x7F]/.test(char)) return sum + 12;
    return sum + 8;
  }, 0);
}

function getDuplicateIssues(rows: TitleRow[]) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const key = row.title.toLowerCase().trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([title, count]) => ({
      severity: "warning" as const,
      title: "Duplicate title",
      message: `${count} rows use the same title: ${title}`,
    }));
}

function scoreTitle(issues: Issue[], status: TitleRow["status"]) {
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

function countOccurrences(text: string, value: string) {
  if (!value) return 0;
  return text.split(value).length - 1;
}

function truncatePreview(title: string, deviceMode: DeviceMode) {
  const max = deviceMode === "mobile" ? 68 : 62;
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

function formatOutput(result: Omit<Result, "output">, outputMode: OutputMode) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const rows = [
      ["title", "length", "estimatedPixels", "status", "score", "issues"],
      ...result.rows.map((row) => [
        row.title,
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
      "| Title | Length | Pixels | Status | Score | Issues |",
      "| --- | ---: | ---: | --- | ---: | ---: |",
      ...result.rows.map((row) =>
        `| ${escapeMarkdown(row.title || "-")} | ${row.length} | ${row.estimatedPixels} | ${row.status} | ${row.score} | ${row.issues.length} |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.rows
      .map((row, index) => {
        const issues = row.issues.length
          ? row.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
          : ["- No common title tag issues found."];

        return [
          `Title ${index + 1}`,
          "-------",
          `Text: ${row.title || "(empty)"}`,
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
    : ["- No common title tag issues found."];

  return [
    "Title Tag Length Summary",
    "------------------------",
    `Titles checked: ${result.totalTitles}`,
    `Good titles: ${result.goodCount}`,
    `Short titles: ${result.shortCount}`,
    `Long titles: ${result.longCount}`,
    `Empty titles: ${result.emptyCount}`,
    `Duplicate title groups: ${result.duplicateCount}`,
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
      title: "Review long titles first",
      message: "Long titles may hide the most useful words in search results. Keep the important phrase near the beginning.",
    });
  }

  if (result.duplicateCount > 0) {
    notes.push({
      title: "Duplicate titles found",
      message: "Unique titles help search engines and users understand how each page is different.",
    });
  }

  if (result.averageScore >= 85) {
    notes.push({
      title: "Mostly clean title set",
      message: "The title set looks healthy overall. Review individual warnings before publishing.",
    });
  }

  return notes;
}
