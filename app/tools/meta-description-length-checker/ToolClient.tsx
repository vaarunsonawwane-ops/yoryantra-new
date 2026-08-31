"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type DeviceMode = "desktop" | "mobile";
type CheckingStyle = "balanced" | "strict" | "relaxed";
type Status = "within-review-range" | "brief" | "long" | "empty";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type DescriptionRow = {
  description: string;
  length: number;
  wordCount: number;
  estimatedPixels: number;
  status: Status;
  keywordCount: number;
  issues: Issue[];
};

type Result = {
  rows: DescriptionRow[];
  issues: Issue[];
  output: string;
  totalDescriptions: number;
  withinRangeCount: number;
  briefCount: number;
  longCount: number;
  emptyCount: number;
  duplicateCount: number;
  averageLength: number;
};

const sampleDescriptions = `Extract URLs from XML sitemaps and sitemap indexes, review lastmod values, find image URLs, and export clean lists for technical SEO work.
Compare a page URL with its canonical target and review host, path, query, fragment, and tracking-parameter differences before publishing.
Simple tools for everything.
This is an intentionally long example description with repeated context and extra explanation placed near the end so you can see how a verbose summary may lose its most useful wording when a search result snippet is shortened for the available space.`;

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
        outputMode,
        deviceMode,
        checkingStyle,
        oneDescriptionPerLine,
        checkKeywordUsage,
        checkDuplicates,
        checkThinDescriptions,
      });
      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to review these meta descriptions.");
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
    setTargetKeyword("sitemap");
    setPageTitle("Sitemap URL Extractor");
    setOutputMode("summary");
    setDeviceMode("desktop");
    setCheckingStyle("balanced");
    setOneDescriptionPerLine(true);
    setCheckKeywordUsage(true);
    setCheckDuplicates(true);
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
    setCheckThinDescriptions(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Meta Description Length Checker"
      description="Review meta description length, approximate visual width, duplicate text, target-topic use, generic wording, and illustrative desktop or mobile search-snippet previews."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">Meta Descriptions</label>
        <textarea
          value={descriptions}
          onChange={(event) => {
            setDescriptions(event.target.value);
            clearResult();
          }}
          placeholder={sampleDescriptions}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          With line-by-line mode on, each line is reviewed separately. Blank lines between descriptions are retained as empty rows so missing descriptions are visible in a batch check.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">Target Topic or Phrase</label>
          <input
            value={targetKeyword}
            onChange={(event) => {
              setTargetKeyword(event.target.value);
              clearResult();
            }}
            placeholder="meta description"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm text-gray-500">
            Optional. This is a wording check, not a requirement that an exact keyword must appear in every description.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">Page Title for Preview</label>
          <input
            value={pageTitle}
            onChange={(event) => {
              setPageTitle(event.target.value);
              clearResult();
            }}
            placeholder="Meta Description Length Checker"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm text-gray-500">Optional. Used only in the illustrative snippet preview.</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Review Settings</h3>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Preview"
            value={deviceMode}
            onChange={(value) => {
              setDeviceMode(value as DeviceMode);
              clearResult();
            }}
            options={[
              { label: "Desktop-style", value: "desktop" },
              { label: "Mobile-style", value: "mobile" },
            ]}
          />

          <YoryantraSelect
            label="Review Sensitivity"
            value={checkingStyle}
            onChange={(value) => {
              setCheckingStyle(value as CheckingStyle);
              clearResult();
            }}
            options={[
              { label: "Balanced heuristic", value: "balanced" },
              { label: "Strict heuristic", value: "strict" },
              { label: "Relaxed heuristic", value: "relaxed" },
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

          <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
            <Toggle checked={oneDescriptionPerLine} label="Treat each line as a separate description" onChange={(checked) => { setOneDescriptionPerLine(checked); clearResult(); }} />
            <Toggle checked={checkKeywordUsage} label="Review target-topic usage" onChange={(checked) => { setCheckKeywordUsage(checked); clearResult(); }} />
            <Toggle checked={checkDuplicates} label="Find duplicate descriptions" onChange={(checked) => { setCheckDuplicates(checked); clearResult(); }} />
            <Toggle checked={checkThinDescriptions} label="Flag very brief or generic wording" onChange={(checked) => { setCheckThinDescriptions(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          The length ranges are user-selectable review heuristics, not Google limits. Google says meta descriptions have no fixed length limit and truncates snippets as needed for the available device width.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={checkDescriptions} className="yoryantra-btn">Review Descriptions</button>
        <button type="button" onClick={copyOutput} className="yoryantra-btn" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Descriptions" value={result.totalDescriptions.toLocaleString()} />
          <SummaryCard label="Within Review Range" value={result.withinRangeCount.toLocaleString()} />
          <SummaryCard label="Long / Truncation Risk" value={result.longCount.toLocaleString()} />
          <SummaryCard label="Duplicate Groups" value={result.duplicateCount.toLocaleString()} />
        </div>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Description Review</h3>
          <p className="mt-2 text-sm text-gray-500">Character count, word count, approximate visual width, heuristic status, target-phrase count, and findings.</p>
          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Chars</th>
                  <th className="px-4 py-3 font-semibold">Words</th>
                  <th className="px-4 py-3 font-semibold">Approx px</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Topic Uses</th>
                  <th className="px-4 py-3 font-semibold">Findings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.rows.slice(0, 100).map((row, index) => (
                  <tr key={`${row.description}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800"><span className="block max-w-[430px] break-words">{row.description || "(empty line)"}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.length}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.wordCount}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.estimatedPixels}</td>
                    <td className="px-4 py-3 text-gray-700"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(row.status)}`}>{statusLabel(row.status)}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.keywordCount}</td>
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
          <h3 className="text-lg font-semibold text-gray-900">Illustrative Search Snippet Preview</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            This is a visual drafting aid, not a prediction of Google's exact snippet. Google may use page content instead of the meta description and can show different snippets for different searches.
          </p>
          <div className="mt-4 space-y-4">
            {result.rows.filter((row) => row.description).slice(0, 5).map((row, index) => (
              <div key={`${row.description}-preview-${index}`} className={`rounded-xl border border-gray-200 bg-gray-50 p-4 ${deviceMode === "mobile" ? "max-w-md" : "max-w-2xl"}`}>
                <p className={`font-medium text-blue-700 ${deviceMode === "mobile" ? "text-base" : "text-lg"}`}>{pageTitle || "Example Page Title"}</p>
                <p className="mt-1 text-sm text-green-700">https://example.com/page</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{previewDescription(row.description, checkingStyle, deviceMode)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Description Findings</h3>
          <div className="mt-3 space-y-3">
            {result.issues.slice(0, 24).map((issue, index) => (
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
          <h3 className="text-sm font-semibold text-blue-900">Review Notes</h3>
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
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>
        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">{output || "Meta description review output will appear here."}</pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        The descriptions are analyzed in your browser. The text you paste is not sent to a server by this tool.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Length Is a Review Signal, Not a Google Rule</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google does not publish a fixed maximum length for the meta description element. Search snippets are shortened as needed for the available device width, and the text shown can change by query. That makes a rigid “155 characters is correct” test misleading.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This checker uses practical, selectable length ranges to flag descriptions worth rereading. The approximate pixel value is another comparison aid, not a promise about where a real search result will truncate.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What Matters More Than Hitting a Number</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Accurately summarize the specific page instead of describing the whole website.</li>
            <li>Use distinct descriptions where pages offer meaningfully different content.</li>
            <li>Put useful, page-specific information early enough to survive a shortened snippet.</li>
            <li>Avoid keyword lists and repeated phrases that do not read naturally.</li>
            <li>For large database-driven sites, programmatic descriptions can be appropriate when they remain readable and page-specific.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why the Preview May Not Match Google</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google's primary source for a snippet is the page content itself. It may use the meta description when that description is a better summary, and it may create different snippets for different searches. A preview is therefore best used to edit your wording, not to predict a guaranteed SERP layout.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Batch Review Without Fake SEO Scores</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The output reports measurable or explainable findings—length, duplicate text, empty rows, repeated target phrases, approximate width, and generic wording—rather than assigning an arbitrary SEO score. A description can be short and excellent, or long and still useful, depending on the page and query.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="yoryantra-btn-outline" href="https://developers.google.com/search/docs/appearance/snippet" target="_blank" rel="noreferrer">Google snippet guidance</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/meta-description-length-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
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

function statusClass(status: Status) {
  if (status === "within-review-range") return "bg-green-50 text-green-700";
  if (status === "long") return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
}

function statusLabel(status: Status) {
  if (status === "within-review-range") return "review range";
  if (status === "brief") return "brief";
  if (status === "long") return "long";
  return "empty";
}

function analyzeDescriptions(options: {
  descriptions: string;
  targetKeyword: string;
  outputMode: OutputMode;
  deviceMode: DeviceMode;
  checkingStyle: CheckingStyle;
  oneDescriptionPerLine: boolean;
  checkKeywordUsage: boolean;
  checkDuplicates: boolean;
  checkThinDescriptions: boolean;
}): Result {
  const rows = parseRows(options.descriptions, options.oneDescriptionPerLine).map((description) => analyzeRow(description, options));
  const duplicateIssues = options.checkDuplicates ? getDuplicateIssues(rows) : [];
  const rowIssues = rows.reduce<Issue[]>((all, row) => {
    all.push(...row.issues);
    return all;
  }, []);
  const issues = [...rowIssues, ...duplicateIssues];
  const totalLength = rows.reduce((sum, row) => sum + row.length, 0);

  const base = {
    rows,
    issues,
    totalDescriptions: rows.length,
    withinRangeCount: rows.filter((row) => row.status === "within-review-range").length,
    briefCount: rows.filter((row) => row.status === "brief").length,
    longCount: rows.filter((row) => row.status === "long").length,
    emptyCount: rows.filter((row) => row.status === "empty").length,
    duplicateCount: duplicateIssues.length,
    averageLength: rows.length ? Math.round(totalLength / rows.length) : 0,
  };

  return { ...base, output: formatOutput(base, options.outputMode) };
}

function parseRows(input: string, oneDescriptionPerLine: boolean) {
  if (!oneDescriptionPerLine) {
    return [input.replace(/\s*\r?\n\s*/g, " ").trim()];
  }

  return input.trim().split(/\r?\n/).map((line) => line.trim());
}

function analyzeRow(descriptionInput: string, options: {
  targetKeyword: string;
  deviceMode: DeviceMode;
  checkingStyle: CheckingStyle;
  checkKeywordUsage: boolean;
  checkThinDescriptions: boolean;
}): DescriptionRow {
  const description = descriptionInput.trim();
  const length = Array.from(description).length;
  const wordCount = description ? description.split(/\s+/).filter(Boolean).length : 0;
  const estimatedPixels = estimatePixels(description);
  const limits = getLimits(options.deviceMode, options.checkingStyle);
  const issues: Issue[] = [];
  let status: Status = "within-review-range";

  if (!description) {
    status = "empty";
    issues.push({ severity: "high", title: "Empty description row", message: "This row has no meta description text." });
  } else if (length < limits.minChars) {
    status = "brief";
    issues.push({ severity: "info", title: "Brief description", message: `This description has ${length} characters. Short text is not automatically wrong, but check that it gives enough page-specific information.` });
  } else if (length > limits.maxChars) {
    status = "long";
    issues.push({ severity: "warning", title: "Long description", message: `This description has ${length} characters. It is more likely to be shortened in a search snippet, so keep the most useful information near the beginning.` });
  }

  const keyword = options.targetKeyword.trim().toLowerCase();
  const keywordCount = options.checkKeywordUsage && keyword ? countPhrase(description.toLowerCase(), keyword) : 0;

  if (options.checkKeywordUsage && keyword && description) {
    const index = description.toLowerCase().indexOf(keyword);
    if (index === -1) {
      issues.push({ severity: "info", title: "Target phrase not used", message: "The optional target phrase does not appear verbatim. This is a wording check, not an SEO requirement; synonyms may be completely appropriate." });
    } else if (keywordCount > 2) {
      issues.push({ severity: "warning", title: "Target phrase repeated", message: `The target phrase appears ${keywordCount} times. Repetition can make a short description read like a keyword list rather than a useful summary.` });
    } else if (index > Math.max(100, Math.floor(description.length * 0.7))) {
      issues.push({ severity: "info", title: "Target phrase appears late", message: "The target phrase appears near the end. If it describes the main page topic, consider whether the opening wording communicates that topic clearly enough." });
    }
  }

  if (options.checkThinDescriptions && isGenericDescription(description)) {
    issues.push({ severity: "warning", title: "Very brief or generic wording", message: "This description gives little page-specific information. Add concrete details that distinguish this page from other pages on the site." });
  }

  if (description && estimatedPixels > limits.widthReviewPixels) {
    issues.push({ severity: "info", title: "High approximate visual width", message: `The text measures about ${estimatedPixels}px using this tool's character-width estimate. Treat this as a comparison signal only; real snippets wrap and truncate according to Google's layout.` });
  }

  return { description, length, wordCount, estimatedPixels, status, keywordCount, issues };
}

function getLimits(deviceMode: DeviceMode, style: CheckingStyle) {
  const base = deviceMode === "mobile"
    ? { minChars: 65, maxChars: 160, widthReviewPixels: 900 }
    : { minChars: 70, maxChars: 165, widthReviewPixels: 940 };

  if (style === "strict") return { minChars: base.minChars + 15, maxChars: base.maxChars - 15, widthReviewPixels: base.widthReviewPixels - 90 };
  if (style === "relaxed") return { minChars: Math.max(30, base.minChars - 25), maxChars: base.maxChars + 25, widthReviewPixels: base.widthReviewPixels + 130 };
  return base;
}

function estimatePixels(description: string) {
  return Array.from(description).reduce((sum, char) => {
    if (/[MW@%&]/.test(char)) return sum + 10;
    if (/[A-Z]/.test(char)) return sum + 8;
    if (/[ilI.,'!|:;]/.test(char)) return sum + 4;
    if (/\s/.test(char)) return sum + 4;
    if (/[^\x00-\x7F]/.test(char)) return sum + 10;
    return sum + 7;
  }, 0);
}

function countPhrase(text: string, phrase: string) {
  if (!phrase) return 0;
  let count = 0;
  let from = 0;
  while (from <= text.length) {
    const index = text.indexOf(phrase, from);
    if (index === -1) break;
    count += 1;
    from = index + phrase.length;
  }
  return count;
}

function isGenericDescription(description: string) {
  if (!description) return false;
  const words = description.split(/\s+/).filter(Boolean);
  return words.length < 8 || /^(welcome to|home page|this page|best website|click here|learn more|we provide|we offer)(\b|\s)/i.test(description);
}

function getDuplicateIssues(rows: DescriptionRow[]) {
  const groups = new Map<string, { count: number; sample: string }>();

  rows.forEach((row) => {
    const key = normalizeForDuplicate(row.description);
    if (!key) return;
    const current = groups.get(key);
    groups.set(key, { count: (current?.count || 0) + 1, sample: current?.sample || row.description });
  });

  return Array.from(groups.values())
    .filter((group) => group.count > 1)
    .map((group) => ({
      severity: "warning" as const,
      title: "Duplicate description",
      message: `${group.count} rows use the same description after case and whitespace normalization: ${group.sample}`,
    }));
}

function normalizeForDuplicate(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function previewDescription(description: string, style: CheckingStyle, deviceMode: DeviceMode) {
  const limits = getLimits(deviceMode, style);
  const max = limits.maxChars;
  if (Array.from(description).length <= max) return description;
  return `${Array.from(description).slice(0, Math.max(1, max - 1)).join("")}…`;
}

function formatOutput(result: Omit<Result, "output">, outputMode: OutputMode) {
  if (outputMode === "json") return JSON.stringify(result, null, 2);

  if (outputMode === "csv") {
    const rows = [
      ["description", "characters", "words", "estimated_pixels", "status", "target_phrase_uses", "findings"],
      ...result.rows.map((row) => [row.description, String(row.length), String(row.wordCount), String(row.estimatedPixels), row.status, String(row.keywordCount), String(row.issues.length)]),
    ];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Description | Chars | Words | Approx px | Status | Topic uses | Findings |",
      "| --- | ---: | ---: | ---: | --- | ---: | ---: |",
      ...result.rows.map((row) => `| ${escapeMarkdown(row.description || "(empty)")} | ${row.length} | ${row.wordCount} | ${row.estimatedPixels} | ${statusLabel(row.status)} | ${row.keywordCount} | ${row.issues.length} |`),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.rows.map((row, index) => [
      `Description ${index + 1}`,
      "-------------",
      `Text: ${row.description || "(empty)"}`,
      `Characters: ${row.length}`,
      `Words: ${row.wordCount}`,
      `Approximate width: ${row.estimatedPixels}px`,
      `Status: ${statusLabel(row.status)}`,
      `Target phrase uses: ${row.keywordCount}`,
      "",
      "Findings:",
      ...(row.issues.length ? row.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`) : ["- No selected heuristic findings for this row."]),
    ].join("\n")).join("\n\n");
  }

  const issues = result.issues.length
    ? result.issues.slice(0, 18).map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
    : ["- No selected heuristic findings."];

  return [
    "Meta Description Review Summary",
    "-------------------------------",
    `Descriptions checked: ${result.totalDescriptions}`,
    `Within review range: ${result.withinRangeCount}`,
    `Brief: ${result.briefCount}`,
    `Long: ${result.longCount}`,
    `Empty rows: ${result.emptyCount}`,
    `Duplicate groups: ${result.duplicateCount}`,
    `Average character length: ${result.averageLength}`,
    "",
    "Findings:",
    ...issues,
    "",
    "Reminder: these ranges are editing heuristics, not Google meta-description limits.",
  ].join("\n");
}

function csvEscape(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];
  if (result.longCount > 0) notes.push({ title: "Read the opening first", message: "Long descriptions are more likely to be shortened. Check whether the first sentence or clause still explains the page if later wording disappears." });
  if (result.duplicateCount > 0) notes.push({ title: "Duplicate groups found", message: "Identical descriptions are not automatically a penalty, but page-specific descriptions are more useful when the pages are meaningfully different." });
  if (result.emptyCount > 0) notes.push({ title: "Empty rows retained", message: "Blank lines between pasted descriptions are shown as empty rows in line-by-line mode, which can help when reviewing an exported list with missing descriptions." });
  return notes;
}
