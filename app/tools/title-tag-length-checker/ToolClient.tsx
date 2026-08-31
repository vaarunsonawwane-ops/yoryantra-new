"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type DeviceMode = "desktop" | "mobile";
type InputMode = "titles" | "pairs";
type DisplayStatus = "empty" | "within-preview" | "wide";

type Finding = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type TitleRow = {
  title: string;
  url: string;
  length: number;
  estimatedPixels: number;
  displayStatus: DisplayStatus;
  targetPhrase: string;
  brandPlacement: string;
  findings: Finding[];
};

type Result = {
  rows: TitleRow[];
  findings: Finding[];
  output: string;
  totalTitles: number;
  withinPreviewCount: number;
  wideCount: number;
  emptyCount: number;
  duplicateGroups: number;
  averageLength: number;
};

const sampleTitles = `Title Tag Length Checker | Preview SEO Titles | Yoryantra
Canonical URL Checker | Diagnose Canonical URL Differences
Home
JSON Formatter | Format and Validate JSON | Yoryantra
JSON Formatter | Format and Validate JSON | Yoryantra`;

export default function ToolClient() {
  const [titles, setTitles] = useState("");
  const [targetPhrase, setTargetPhrase] = useState("");
  const [brandName, setBrandName] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [inputMode, setInputMode] = useState<InputMode>("titles");
  const [checkTargetPhrase, setCheckTargetPhrase] = useState(true);
  const [checkBrand, setCheckBrand] = useState(true);
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
        targetPhrase,
        brandName,
        outputMode,
        deviceMode,
        inputMode,
        checkTargetPhrase,
        checkBrand,
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
    setTargetPhrase("title tag length checker");
    setBrandName("Yoryantra");
    setOutputMode("summary");
    setDeviceMode("desktop");
    setInputMode("titles");
    setCheckTargetPhrase(true);
    setCheckBrand(true);
    setCheckDuplicates(true);
    setCheckSeparators(true);
    clearResult();
  };

  const resetAll = () => {
    setTitles("");
    setTargetPhrase("");
    setBrandName("");
    setOutputMode("summary");
    setDeviceMode("desktop");
    setInputMode("titles");
    setCheckTargetPhrase(true);
    setCheckBrand(true);
    setCheckDuplicates(true);
    setCheckSeparators(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Title Tag Length Checker"
      description="Review title tag text, estimated display width, duplicate titles, target phrase and brand placement, separators, and SERP-style previews without treating a character count as a Google rule."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Title Tags</label>
        <textarea
          value={titles}
          onChange={(event: { target: { value: string } }) => {
            setTitles(event.target.value);
            clearResult();
          }}
          placeholder={sampleTitles}
          className="min-h-[330px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Use one title per line, or switch to title + URL pairs if you want each report row to retain page context. Internal blank title rows are preserved.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">Target Phrase</label>
          <input
            value={targetPhrase}
            onChange={(event: { target: { value: string } }) => {
              setTargetPhrase(event.target.value);
              clearResult();
            }}
            placeholder="title tag length checker"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Optional. The checker reports whether the phrase is missing, where it starts, and whether the exact phrase is repeated. It does not assign a ranking score.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">Brand or Site Name</label>
          <input
            value={brandName}
            onChange={(event: { target: { value: string } }) => {
              setBrandName(event.target.value);
              clearResult();
            }}
            placeholder="Yoryantra"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Optional. Brand presence is informational; repetition is flagged because repeated boilerplate can make titles less useful.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Preview"
            value={deviceMode}
            onChange={(value: string) => {
              setDeviceMode(value as DeviceMode);
              clearResult();
            }}
            options={[
              { label: "Desktop", value: "desktop" },
              { label: "Mobile", value: "mobile" },
            ]}
          />

          <YoryantraSelect
            label="Input layout"
            value={inputMode}
            onChange={(value: string) => {
              setInputMode(value as InputMode);
              clearResult();
            }}
            options={[
              { label: "One title per line", value: "titles" },
              { label: "Title + URL pairs", value: "pairs" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value: string) => {
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
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={checkTargetPhrase} label="Check target phrase" onChange={(checked) => { setCheckTargetPhrase(checked); clearResult(); }} />
          <CheckboxRow checked={checkBrand} label="Check brand presence and repetition" onChange={(checked) => { setCheckBrand(checked); clearResult(); }} />
          <CheckboxRow checked={checkDuplicates} label="Check exact duplicate titles" onChange={(checked) => { setCheckDuplicates(checked); clearResult(); }} />
          <CheckboxRow checked={checkSeparators} label="Check repeated separators" onChange={(checked) => { setCheckSeparators(checked); clearResult(); }} />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Display width is an approximation for review, not a Google limit. Google can truncate title links to fit the device and may generate a different title link from headings, prominent page text, og:title, anchor text, and other sources.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkTitles} className="yoryantra-btn">Check Title Tags</button>
        <button onClick={copyOutput} disabled={!output} className="yoryantra-btn-outline">{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {result && (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Titles" value={String(result.totalTitles)} />
            <SummaryCard label="Within preview estimate" value={String(result.withinPreviewCount)} />
            <SummaryCard label="Wide" value={String(result.wideCount)} />
            <SummaryCard label="Empty" value={String(result.emptyCount)} />
            <SummaryCard label="Duplicate groups" value={String(result.duplicateGroups)} />
          </div>

          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Title Review</h3>
                <p className="mt-1 text-sm text-gray-500">Length is informational. “Wide” only means the estimated rendered width exceeds this preview’s working viewport.</p>
              </div>
              <p className="text-sm text-gray-500">Average length: {result.averageLength} characters</p>
            </div>

            <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Length</th>
                    <th className="px-4 py-3 font-semibold">Est. width</th>
                    <th className="px-4 py-3 font-semibold">Preview</th>
                    <th className="px-4 py-3 font-semibold">Target phrase</th>
                    <th className="px-4 py-3 font-semibold">Brand</th>
                    <th className="px-4 py-3 font-semibold">Findings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.rows.slice(0, 100).map((row, index) => (
                    <tr key={`${row.title}-${index}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-800"><span className="block max-w-[420px] break-words">{row.title || "(empty)"}</span></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.length}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.estimatedPixels}px</td>
                      <td className="px-4 py-3"><StatusBadge status={row.displayStatus} /></td>
                      <td className="px-4 py-3 text-xs text-gray-700">{row.targetPhrase || "—"}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{row.brandPlacement || "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{row.findings.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">SERP-Style Preview</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">This preview is deliberately approximate. It cannot predict the title link Google will choose for a query.</p>
          <div className="mt-4 space-y-4">
            {result.rows.slice(0, 5).map((row, index) => (
              <div key={`${row.title}-preview-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className={`font-medium text-blue-700 ${deviceMode === "mobile" ? "text-base" : "text-lg"}`}>{truncatePreview(row.title, deviceMode)}</p>
                <p className="mt-1 text-sm text-green-700">{row.url || "https://example.com/page"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.findings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Findings</h3>
          <div className="mt-3 space-y-3">
            {result.findings.slice(0, 25).map((finding, index) => (
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
          <h3 className="text-sm font-semibold text-blue-900">Review notes</h3>
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
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>}
        </div>
        <pre className="yoryantra-output min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">{output || "Title tag review output will appear here."}</pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Title analysis runs entirely in your browser. This tool does not fetch the pages or upload your title list.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">There Is No Fixed Google Title-Length Limit</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The HTML title element does not have a Google character limit. Google recommends descriptive, concise titles and truncates title links when needed to fit the device. That means a 60-character rule is a workflow heuristic, not a search requirement.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This checker therefore keeps character count and estimated width visible without converting them into an SEO score. “Wide” means the browser estimate is wider than this preview’s working viewport; it does not mean the page is penalized or that Google will definitely truncate at that point.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Google May Show a Different Title Link</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google can build a title link from the title element, the main visual title, headings such as H1, og:title, other prominent page text, anchor text, links pointing to the page, and WebSite structured data. A title checker can review the text you provide, but it cannot reproduce that full search system or predict a query-specific rewrite.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What Is Worth Checking in a Batch</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-gray-600">
            <li><strong>Empty or vague titles:</strong> generic labels such as “Home” or “Profile” tell users very little about a page.</li>
            <li><strong>Exact duplicates:</strong> repeated titles make it harder to distinguish pages in a result set.</li>
            <li><strong>Repeated boilerplate:</strong> concise branding is useful, but repeating the same phrase or brand several times adds noise.</li>
            <li><strong>Target phrase:</strong> if you supply one, this tool reports whether it is present and where it starts; it does not treat a character position as a ranking rule.</li>
            <li><strong>Display width:</strong> use the preview estimate to notice titles whose important wording may be pushed out of view.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Use the Page Itself as the Final Check</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The title should accurately describe the page and use the same language and writing system as the main content. If the visible H1 says something materially different from the title element, or if the title is stale, Google may choose another source for the title link.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For the current guidance, see Google Search Central’s documentation on influencing title links. The checker’s preview and findings are intentionally narrower than Google’s full title-link generation system.
          </p>
          <a
            href="https://developers.google.com/search/docs/appearance/title-link"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex text-sm font-semibold text-[var(--green)] underline underline-offset-4"
          >
            Google Search Central: Influencing title links
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/title-tag-length-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
      <input type="checkbox" checked={checked} onChange={(event: { target: { checked: boolean } }) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--light-gold)]" />
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

function StatusBadge({ status }: { status: DisplayStatus }) {
  const className = status === "within-preview"
    ? "bg-green-50 text-green-700"
    : status === "wide"
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700";

  const label = status === "within-preview" ? "within estimate" : status;
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${className}`}>{label}</span>;
}

function analyzeTitles(options: {
  titles: string;
  targetPhrase: string;
  brandName: string;
  outputMode: OutputMode;
  deviceMode: DeviceMode;
  inputMode: InputMode;
  checkTargetPhrase: boolean;
  checkBrand: boolean;
  checkDuplicates: boolean;
  checkSeparators: boolean;
}): Result {
  const parsedRows = parseRows(options.titles, options.inputMode);

  if (parsedRows.length === 0) {
    throw new Error("No title rows were found in the input.");
  }

  const rows = parsedRows.map((row) => analyzeRow(row, options));
  const duplicateFindings = options.checkDuplicates ? getDuplicateFindings(rows) : [];
  const rowFindings: Finding[] = [];
  rows.forEach((row) => {
    rowFindings.push(...row.findings);
  });
  const findings = [...rowFindings, ...duplicateFindings];
  const totalLength = rows.reduce((sum, row) => sum + row.length, 0);

  const base = {
    rows,
    findings,
    totalTitles: rows.length,
    withinPreviewCount: rows.filter((row) => row.displayStatus === "within-preview").length,
    wideCount: rows.filter((row) => row.displayStatus === "wide").length,
    emptyCount: rows.filter((row) => row.displayStatus === "empty").length,
    duplicateGroups: duplicateFindings.length,
    averageLength: rows.length ? Math.round(totalLength / rows.length) : 0,
  };

  return {
    ...base,
    output: formatOutput(base, options.outputMode),
  };
}

function parseRows(input: string, inputMode: InputMode) {
  const normalized = input.replace(/\r\n?/g, "\n");
  const rawLines = normalized.split("\n");

  while (rawLines.length > 0 && rawLines[0].trim() === "") rawLines.shift();
  while (rawLines.length > 0 && rawLines[rawLines.length - 1].trim() === "") rawLines.pop();

  if (inputMode === "titles") {
    return rawLines.map((line) => ({ title: line.trim(), url: "" }));
  }

  const rows: { title: string; url: string }[] = [];
  for (let index = 0; index < rawLines.length; index += 2) {
    rows.push({
      title: (rawLines[index] ?? "").trim(),
      url: (rawLines[index + 1] ?? "").trim(),
    });
  }

  return rows;
}

function analyzeRow(row: { title: string; url: string }, options: {
  targetPhrase: string;
  brandName: string;
  deviceMode: DeviceMode;
  checkTargetPhrase: boolean;
  checkBrand: boolean;
  checkSeparators: boolean;
}): TitleRow {
  const title = row.title.trim();
  const length = Array.from(title).length;
  const estimatedPixels = estimatePixels(title, options.deviceMode);
  const previewWidth = getPreviewWidth(options.deviceMode);
  const findings: Finding[] = [];

  let displayStatus: DisplayStatus = title ? (estimatedPixels > previewWidth ? "wide" : "within-preview") : "empty";

  if (!title) {
    findings.push({
      severity: "high",
      title: "Empty title",
      message: "This row has no title text. Every indexable HTML page should have a descriptive title element.",
    });
  } else {
    const normalizedTitle = title.toLowerCase().replace(/\s+/g, " ").trim();
    if (["home", "profile", "page", "untitled", "welcome"].includes(normalizedTitle)) {
      findings.push({
        severity: "warning",
        title: "Very generic title",
        message: `${JSON.stringify(title)} is too vague to distinguish the page on its own. Use text that describes this page specifically.`,
      });
    }

    if (estimatedPixels > previewWidth) {
      findings.push({
        severity: "info",
        title: "Wide in this preview",
        message: `Estimated rendered width is ${estimatedPixels}px against this ${options.deviceMode} preview's ${previewWidth}px working width. Google does not publish a fixed pixel or character limit.`,
      });
    }
  }

  let targetPhrase = "";
  const wantedPhrase = options.targetPhrase.trim();
  if (options.checkTargetPhrase && wantedPhrase && title) {
    const lowerTitle = title.toLocaleLowerCase();
    const lowerPhrase = wantedPhrase.toLocaleLowerCase();
    const firstIndex = lowerTitle.indexOf(lowerPhrase);
    const count = countOccurrences(lowerTitle, lowerPhrase);

    if (firstIndex === -1) {
      targetPhrase = "missing";
      findings.push({ severity: "info", title: "Target phrase not found", message: `The supplied target phrase ${JSON.stringify(wantedPhrase)} is not present in this title.` });
    } else {
      targetPhrase = firstIndex === 0 ? "starts title" : `starts at char ${Array.from(title.slice(0, firstIndex)).length + 1}`;
      if (count > 1) {
        findings.push({ severity: "warning", title: "Target phrase repeated", message: `The exact target phrase appears ${count} times. Repetition can make a title look stuffed or redundant.` });
      }
    }
  }

  let brandPlacement = "";
  const brand = options.brandName.trim();
  if (options.checkBrand && brand && title) {
    const lowerTitle = title.toLocaleLowerCase();
    const lowerBrand = brand.toLocaleLowerCase();
    const firstIndex = lowerTitle.indexOf(lowerBrand);
    const count = countOccurrences(lowerTitle, lowerBrand);

    if (firstIndex === -1) {
      brandPlacement = "not present";
    } else {
      brandPlacement = firstIndex === 0 ? "starts title" : `starts at char ${Array.from(title.slice(0, firstIndex)).length + 1}`;
      if (count > 1) {
        findings.push({ severity: "warning", title: "Brand repeated", message: `The brand or site name appears ${count} times in this title. One concise brand reference is usually easier to read.` });
      }
    }
  }

  if (options.checkSeparators && title) {
    if (/\|\s*\||--|::|\/\s*\//.test(title)) {
      findings.push({ severity: "info", title: "Repeated separator", message: "The title contains a repeated separator such as ||, --, ::, or //. Check whether that is intentional." });
    }

    if ((title.match(/\|/g) ?? []).length > 2) {
      findings.push({ severity: "info", title: "Many pipe separators", message: "This title has more than two pipe separators. Multiple title segments can make the result harder to scan." });
    }
  }

  return {
    title,
    url: row.url,
    length,
    estimatedPixels,
    displayStatus,
    targetPhrase,
    brandPlacement,
    findings,
  };
}

function getDuplicateFindings(rows: TitleRow[]): Finding[] {
  const groups = new Map<string, { title: string; count: number }>();

  rows.forEach((row) => {
    const key = row.title.toLocaleLowerCase().replace(/\s+/g, " ").trim();
    if (!key) return;
    const existing = groups.get(key);
    groups.set(key, existing ? { ...existing, count: existing.count + 1 } : { title: row.title, count: 1 });
  });

  return Array.from(groups.values())
    .filter((group) => group.count > 1)
    .map((group) => ({
      severity: "warning" as const,
      title: "Duplicate title",
      message: `${group.count} rows use the same normalized title: ${group.title}`,
    }));
}

function getPreviewWidth(deviceMode: DeviceMode) {
  return deviceMode === "mobile" ? 600 : 580;
}

function estimatePixels(title: string, deviceMode: DeviceMode) {
  if (!title) return 0;

  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (context) {
      context.font = deviceMode === "mobile" ? "16px Arial, sans-serif" : "20px Arial, sans-serif";
      return Math.round(context.measureText(title).width);
    }
  }

  return Math.round(Array.from(title).reduce((sum, character) => {
    if (/[A-ZMW]/.test(character)) return sum + 11;
    if (/[ilI.,'!|]/.test(character)) return sum + 4;
    if (/\s/.test(character)) return sum + 5;
    if (/[^\x00-\x7F]/.test(character)) return sum + 12;
    return sum + 8;
  }, 0));
}

function truncatePreview(title: string, deviceMode: DeviceMode) {
  if (!title) return "(empty title)";
  const limit = getPreviewWidth(deviceMode);
  if (estimatePixels(title, deviceMode) <= limit) return title;

  const characters = Array.from(title);
  let low = 0;
  let high = characters.length;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const candidate = `${characters.slice(0, middle).join("")}…`;
    if (estimatePixels(candidate, deviceMode) <= limit) low = middle;
    else high = middle - 1;
  }

  return `${characters.slice(0, Math.max(1, low)).join("")}…`;
}

function countOccurrences(text: string, value: string) {
  if (!value) return 0;
  let count = 0;
  let position = 0;

  while (position <= text.length) {
    const found = text.indexOf(value, position);
    if (found === -1) break;
    count += 1;
    position = found + Math.max(1, value.length);
  }

  return count;
}

function formatOutput(result: Omit<Result, "output">, outputMode: OutputMode) {
  if (outputMode === "json") return JSON.stringify(result, null, 2);

  if (outputMode === "csv") {
    const rows = [
      ["title", "url", "length", "estimatedPixels", "preview", "targetPhrase", "brand", "findings"],
      ...result.rows.map((row) => [
        row.title,
        row.url,
        String(row.length),
        String(row.estimatedPixels),
        row.displayStatus,
        row.targetPhrase,
        row.brandPlacement,
        String(row.findings.length),
      ]),
    ];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Title | Length | Est. px | Preview | Target phrase | Brand | Findings |",
      "| --- | ---: | ---: | --- | --- | --- | ---: |",
      ...result.rows.map((row) => `| ${escapeMarkdown(row.title || "-")} | ${row.length} | ${row.estimatedPixels} | ${row.displayStatus} | ${escapeMarkdown(row.targetPhrase || "-")} | ${escapeMarkdown(row.brandPlacement || "-")} | ${row.findings.length} |`),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.rows.map((row, index) => {
      const findings = row.findings.length
        ? row.findings.map((finding) => `- [${finding.severity}] ${finding.title}: ${finding.message}`)
        : ["- No selected checks produced a finding."];

      return [
        `Title ${index + 1}`,
        "-------",
        `Text: ${row.title || "(empty)"}`,
        row.url ? `URL: ${row.url}` : "",
        `Characters: ${row.length}`,
        `Estimated width: ${row.estimatedPixels}px`,
        `Preview: ${row.displayStatus}`,
        row.targetPhrase ? `Target phrase: ${row.targetPhrase}` : "",
        row.brandPlacement ? `Brand: ${row.brandPlacement}` : "",
        "",
        "Findings:",
        ...findings,
      ].filter(Boolean).join("\n");
    }).join("\n\n");
  }

  const findings = result.findings.length
    ? result.findings.slice(0, 20).map((finding) => `- [${finding.severity}] ${finding.title}: ${finding.message}`)
    : ["- No selected checks produced a finding."];

  return [
    "Title Tag Review Summary",
    "------------------------",
    `Titles checked: ${result.totalTitles}`,
    `Within preview estimate: ${result.withinPreviewCount}`,
    `Wide in preview estimate: ${result.wideCount}`,
    `Empty titles: ${result.emptyCount}`,
    `Duplicate title groups: ${result.duplicateGroups}`,
    `Average title length: ${result.averageLength} characters`,
    "",
    "Note: Google does not publish a fixed title character limit. Preview width is a local estimate, not a ranking score.",
    "",
    "Findings:",
    ...findings,
  ].join("\n");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n");
}

function getNotes(result: Result) {
  const notes: { title: string; message: string }[] = [];

  if (result.wideCount > 0) {
    notes.push({
      title: "Put important wording early",
      message: "Some titles are wide in this preview. If Google truncates them, words near the end are more likely to disappear from view.",
    });
  }

  if (result.duplicateGroups > 0) {
    notes.push({
      title: "Duplicate titles need page context",
      message: "If the pages are genuinely different, revise the title text so users can distinguish them. If they are duplicates, also review canonicalization and indexing signals.",
    });
  }

  if (result.emptyCount > 0) {
    notes.push({
      title: "Fix empty titles first",
      message: "An empty title gives search engines and browser users less direct information about the page.",
    });
  }

  return notes;
}
