"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "summary" | "report" | "json" | "markdown" | "csv";
type InputMode = "url" | "slug" | "list";
type CheckingStyle = "balanced" | "strict" | "relaxed";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type SlugRow = {
  input: string;
  slug: string;
  cleanedSuggestion: string;
  wordCount: number;
  length: number;
  status: "good" | "short" | "long" | "problem";
  score: number;
  issues: Issue[];
};

type Result = {
  rows: SlugRow[];
  issues: Issue[];
  output: string;
  totalSlugs: number;
  goodCount: number;
  shortCount: number;
  longCount: number;
  problemCount: number;
  averageLength: number;
  averageScore: number;
};

const sampleInput = `https://example.com/blog/Best_SEO_Slug_Analyzer_Tool?utm_source=test
/title-tag-length-checker
meta-description-length-checker
This Is A Blog Post Title With Extra Stop Words And Symbols!!!
/tools//canonical-url-checker/`;

const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "how",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
  "your",
]);

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("list");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [checkingStyle, setCheckingStyle] = useState<CheckingStyle>("balanced");
  const [checkKeyword, setCheckKeyword] = useState(true);
  const [checkStopWords, setCheckStopWords] = useState(true);
  const [checkCase, setCheckCase] = useState(true);
  const [checkSpecialChars, setCheckSpecialChars] = useState(true);
  const [checkDuplicateSeparators, setCheckDuplicateSeparators] = useState(true);
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

  const analyzeSlugs = () => {
    if (!input.trim()) {
      setError("Please enter at least one URL or slug.");
      setResult(null);
      setOutput("");
      return;
    }

    try {
      const next = analyze({
        input,
        targetKeyword,
        inputMode,
        outputMode,
        checkingStyle,
        checkKeyword,
        checkStopWords,
        checkCase,
        checkSpecialChars,
        checkDuplicateSeparators,
      });

      setResult(next);
      setOutput(next.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze these URL slugs.");
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
    setTargetKeyword("seo slug analyzer");
    setInputMode("list");
    setOutputMode("summary");
    setCheckingStyle("balanced");
    setCheckKeyword(true);
    setCheckStopWords(true);
    setCheckCase(true);
    setCheckSpecialChars(true);
    setCheckDuplicateSeparators(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setTargetKeyword("");
    setInputMode("list");
    setOutputMode("summary");
    setCheckingStyle("balanced");
    setCheckKeyword(true);
    setCheckStopWords(true);
    setCheckCase(true);
    setCheckSpecialChars(true);
    setCheckDuplicateSeparators(true);
    clearResult();
  };

  return (
    <ToolShell
      title="SEO Slug Analyzer"
      description="Analyze SEO-friendly URL slugs for length, keywords, hyphens, underscores, uppercase letters, stop words, special characters, duplicate slashes, and clean URL readability."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URLs or Slugs
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleInput}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste full URLs, paths, slugs, or page-title-like text. Each line is analyzed separately.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Target Keyword
        </label>

        <input
          value={targetKeyword}
          onChange={(event) => {
            setTargetKeyword(event.target.value);
            clearResult();
          }}
          placeholder="seo slug analyzer"
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Optional. Used to check whether the slug includes the main topic naturally.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
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
              { label: "Auto / list", value: "list" },
              { label: "Full URL", value: "url" },
              { label: "Slug only", value: "slug" },
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
            <CheckboxRow checked={checkKeyword} label="Check target keyword in slug" onChange={(checked) => { setCheckKeyword(checked); clearResult(); }} />
            <CheckboxRow checked={checkStopWords} label="Warn about too many stop words" onChange={(checked) => { setCheckStopWords(checked); clearResult(); }} />
            <CheckboxRow checked={checkCase} label="Warn about uppercase letters" onChange={(checked) => { setCheckCase(checked); clearResult(); }} />
            <CheckboxRow checked={checkSpecialChars} label="Warn about special characters and underscores" onChange={(checked) => { setCheckSpecialChars(checked); clearResult(); }} />
            <CheckboxRow checked={checkDuplicateSeparators} label="Warn about duplicate slashes or repeated separators" onChange={(checked) => { setCheckDuplicateSeparators(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          A good slug is readable, short enough, lowercase, hyphen-separated, and closely related to the page topic.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeSlugs} className="yoryantra-btn">
          Analyze Slugs
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
          <SummaryCard label="Slugs" value={result.totalSlugs.toLocaleString()} />
          <SummaryCard label="Good" value={result.goodCount.toLocaleString()} />
          <SummaryCard label="Problems" value={result.problemCount.toLocaleString()} />
          <SummaryCard label="Average Score" value={`${result.averageScore}/100`} />
        </div>
      )}

      {result && result.rows.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Slug Review</h3>

          <p className="mt-2 text-sm text-gray-500">
            Slug length, word count, status, score, and suggested clean version.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">Suggestion</th>
                  <th className="px-4 py-3 font-semibold">Words</th>
                  <th className="px-4 py-3 font-semibold">Length</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.rows.slice(0, 100).map((row, index) => (
                  <tr key={`${row.input}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[280px] break-words">{row.slug || "(empty)"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[280px] break-words">{row.cleanedSuggestion || "-"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.wordCount}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{row.length}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Slug findings</h3>

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
          <h3 className="text-sm font-semibold text-blue-900">Slug guidance</h3>

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
          {output || "SEO slug analysis output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Slug analysis happens directly in your browser. Your URLs and slug text are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Checking URL Slugs for Cleaner SEO URLs</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A URL slug should help people understand the page before they click. Clean slugs are usually short, lowercase, hyphen-separated, and connected to the main topic of the page.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SEO Slug Analyzer reviews slugs for length, keyword presence, uppercase letters, underscores, special characters, repeated separators, stop words, duplicate slashes, and readable URL structure.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Using the SEO Slug Analyzer</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a URL, path, slug, or list of slugs.</li>
            <li>Optionally add the target keyword for the page.</li>
            <li>Choose a checking style and output format.</li>
            <li>Review the score, issues, and suggested cleaner slug.</li>
            <li>Copy the summary, report, JSON, Markdown, or CSV output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common SEO Slug Problems</h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Very long slugs that are hard to read or share.</li>
            <li>Underscores instead of hyphens.</li>
            <li>Uppercase letters creating inconsistent URL patterns.</li>
            <li>Special characters, punctuation, or encoded-looking text.</li>
            <li>Duplicate slashes or repeated hyphens.</li>
            <li>Missing the main topic or target keyword completely.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Clean Slug</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`/tools/seo-slug-analyzer`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Slug Quality Is About Clarity</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A slug does not need to include every word from the page title. It should be understandable, stable, and specific enough to represent the page clearly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When changing old URLs, always plan redirects carefully so users and search engines can reach the new clean version.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does an SEO Slug Analyzer do?">
              It checks a URL slug for readability, length, separators, keyword presence, special characters, casing, and clean URL structure.
            </Faq>

            <Faq title="Should slugs use hyphens or underscores?">
              Hyphens are generally preferred because they make words easier to read in URLs.
            </Faq>

            <Faq title="Should I include the keyword in the slug?">
              If it fits naturally, yes. The slug should describe the page clearly without becoming stuffed or too long.
            </Faq>

            <Faq title="Is a shorter slug always better?">
              Not always. A short slug is good, but it still needs to be descriptive enough for users to understand the page.
            </Faq>

            <Faq title="Is anything uploaded when I analyze slugs?">
              No. The analysis runs directly in your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/url-query-params-parser" className="yoryantra-btn-outline">URL Query Params Parser</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">Canonical URL Checker</Link>
            <Link href="/tools/redirect-chain-checker" className="yoryantra-btn-outline">Redirect Chain Checker</Link>
            <Link href="/tools/title-tag-length-checker" className="yoryantra-btn-outline">Title Tag Length Checker</Link>
            <Link href="/tools/meta-description-length-checker" className="yoryantra-btn-outline">Meta Description Length Checker</Link>
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

function analyze(options: {
  input: string;
  targetKeyword: string;
  inputMode: InputMode;
  outputMode: OutputMode;
  checkingStyle: CheckingStyle;
  checkKeyword: boolean;
  checkStopWords: boolean;
  checkCase: boolean;
  checkSpecialChars: boolean;
  checkDuplicateSeparators: boolean;
}): Result {
  const rows = options.input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => analyzeOne(line, options));

  if (rows.length === 0) {
    throw new Error("No URL slugs were found.");
  }

  const issues = rows.flatMap((row) => row.issues);
  const totalLength = rows.reduce((sum, row) => sum + row.length, 0);
  const totalScore = rows.reduce((sum, row) => sum + row.score, 0);
  const base = {
    rows,
    issues,
    totalSlugs: rows.length,
    goodCount: rows.filter((row) => row.status === "good").length,
    shortCount: rows.filter((row) => row.status === "short").length,
    longCount: rows.filter((row) => row.status === "long").length,
    problemCount: rows.filter((row) => row.status === "problem").length,
    averageLength: Math.round(totalLength / rows.length),
    averageScore: Math.round(totalScore / rows.length),
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function analyzeOne(input: string, options: {
  targetKeyword: string;
  inputMode: InputMode;
  checkingStyle: CheckingStyle;
  checkKeyword: boolean;
  checkStopWords: boolean;
  checkCase: boolean;
  checkSpecialChars: boolean;
  checkDuplicateSeparators: boolean;
}): SlugRow {
  const slug = extractSlug(input, options.inputMode);
  const words = slug.split(/[-_\s]+/).filter(Boolean);
  const length = slug.length;
  const limits = getLimits(options.checkingStyle);
  const issues: Issue[] = [];

  let status: SlugRow["status"] = "good";

  if (!slug) {
    status = "problem";
    issues.push({
      severity: "high",
      title: "Empty slug",
      message: "No slug was found in this input.",
    });
  } else if (length < limits.minLength) {
    status = "short";
    issues.push({
      severity: "info",
      title: "Very short slug",
      message: "The slug is very short. This can be fine, but make sure it clearly describes the page.",
    });
  } else if (length > limits.maxLength || words.length > limits.maxWords) {
    status = "long";
    issues.push({
      severity: "warning",
      title: "Long slug",
      message: `This slug has ${length} characters and ${words.length} words. It may be harder to read and share.`,
    });
  }

  if (options.checkKeyword && options.targetKeyword.trim()) {
    const cleanKeyword = makeSlug(options.targetKeyword);
    const cleanSlug = makeSlug(slug);

    if (!cleanSlug.includes(cleanKeyword) && !keywordWordsPresent(cleanSlug, cleanKeyword)) {
      issues.push({
        severity: "info",
        title: "Target keyword not clear",
        message: "The target keyword does not appear clearly in the slug.",
      });
    }
  }

  if (options.checkCase && /[A-Z]/.test(slug)) {
    status = status === "good" ? "problem" : status;
    issues.push({
      severity: "warning",
      title: "Uppercase letters",
      message: "Lowercase slugs are usually cleaner and more consistent.",
    });
  }

  if (options.checkSpecialChars) {
    if (slug.includes("_")) {
      issues.push({
        severity: "warning",
        title: "Underscore found",
        message: "Hyphens are usually preferred over underscores in readable SEO URLs.",
      });
    }

    if (/[^a-zA-Z0-9\-_/]/.test(slug)) {
      status = status === "good" ? "problem" : status;
      issues.push({
        severity: "warning",
        title: "Special characters found",
        message: "Special characters can make URLs harder to read, share, or copy cleanly.",
      });
    }
  }

  if (options.checkDuplicateSeparators) {
    if (/\/\//.test(input) && !/^https?:\/\//i.test(input)) {
      issues.push({
        severity: "warning",
        title: "Duplicate slash",
        message: "The path appears to contain duplicate slashes.",
      });
    }

    if (/--|__/.test(slug)) {
      issues.push({
        severity: "info",
        title: "Repeated separator",
        message: "Repeated separators can make slugs look messy.",
      });
    }
  }

  if (options.checkStopWords) {
    const stopWordCount = words.filter((word) => stopWords.has(word.toLowerCase())).length;

    if (stopWordCount >= 4 || (words.length >= 8 && andRatio(stopWordCount, words.length) > 0.45)) {
      issues.push({
        severity: "info",
        title: "Many stop words",
        message: "The slug contains many small helper words. Shorter, topic-focused slugs are often easier to read.",
      });
    }
  }

  const cleanedSuggestion = makeSlug(slug);
  const score = scoreSlug(issues, status);

  return {
    input,
    slug,
    cleanedSuggestion,
    wordCount: words.length,
    length,
    status,
    score,
    issues,
  };
}

function extractSlug(input: string, mode: InputMode) {
  const trimmed = input.trim();

  if (mode === "slug") {
    return trimmed.replace(/^\/+|\/+$/g, "");
  }

  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || "");
  } catch {
    const noQuery = trimmed.split("?")[0].split("#")[0];
    const parts = noQuery.split("/").filter(Boolean);
    return parts[parts.length - 1] || noQuery;
  }
}

function makeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function keywordWordsPresent(slug: string, keyword: string) {
  const slugWords = new Set(slug.split("-").filter(Boolean));
  const keywordWords = keyword.split("-").filter(Boolean);

  if (keywordWords.length === 0) {
    return true;
  }

  return keywordWords.every((word) => slugWords.has(word));
}

function getLimits(style: CheckingStyle) {
  if (style === "strict") {
    return { minLength: 6, maxLength: 55, maxWords: 6 };
  }

  if (style === "relaxed") {
    return { minLength: 3, maxLength: 85, maxWords: 10 };
  }

  return { minLength: 4, maxLength: 70, maxWords: 8 };
}

function andRatio(a: number, b: number) {
  return b === 0 ? 0 : a / b;
}

function scoreSlug(issues: Issue[], status: SlugRow["status"]) {
  let score = 100;

  if (status === "problem") score -= 30;
  if (status === "long") score -= 18;
  if (status === "short") score -= 6;

  issues.forEach((issue) => {
    if (issue.severity === "high") score -= 25;
    else if (issue.severity === "warning") score -= 10;
    else score -= 4;
  });

  return Math.max(0, score);
}

function formatOutput(result: Omit<Result, "output">, outputMode: OutputMode) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const rows = [
      ["input", "slug", "suggestion", "words", "length", "status", "score", "issues"],
      ...result.rows.map((row) => [
        row.input,
        row.slug,
        row.cleanedSuggestion,
        String(row.wordCount),
        String(row.length),
        row.status,
        String(row.score),
        String(row.issues.length),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Slug | Suggestion | Words | Length | Status | Score |",
      "| --- | --- | ---: | ---: | --- | ---: |",
      ...result.rows.map((row) =>
        `| ${escapeMarkdown(row.slug || "-")} | ${escapeMarkdown(row.cleanedSuggestion || "-")} | ${row.wordCount} | ${row.length} | ${row.status} | ${row.score} |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.rows
      .map((row, index) => {
        const issues = row.issues.length
          ? row.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
          : ["- No common slug issues found."];

        return [
          `Slug ${index + 1}`,
          "------",
          `Input: ${row.input}`,
          `Slug: ${row.slug || "(empty)"}`,
          `Suggestion: ${row.cleanedSuggestion || "-"}`,
          `Words: ${row.wordCount}`,
          `Length: ${row.length}`,
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
    : ["- No common slug issues found."];

  return [
    "SEO Slug Analysis Summary",
    "-------------------------",
    `Slugs checked: ${result.totalSlugs}`,
    `Good slugs: ${result.goodCount}`,
    `Short slugs: ${result.shortCount}`,
    `Long slugs: ${result.longCount}`,
    `Problem slugs: ${result.problemCount}`,
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
      title: "Review long slugs",
      message: "Long slugs can be harder to read and share. Keep the core page topic and remove unnecessary words.",
    });
  }

  if (result.problemCount > 0) {
    notes.push({
      title: "Clean inconsistent slugs",
      message: "Uppercase letters, underscores, repeated separators, and special characters can make URL patterns look messy.",
    });
  }

  if (result.averageScore >= 85) {
    notes.push({
      title: "Mostly clean slug set",
      message: "The slug set looks healthy overall. Review individual warnings before publishing or changing URLs.",
    });
  }

  return notes;
}
