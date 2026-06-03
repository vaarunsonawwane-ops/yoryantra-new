"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "html" | "markdown" | "plain";
type OutputMode = "summary" | "outline" | "json" | "markdown" | "csv";
type StrictnessMode = "balanced" | "strict" | "relaxed";

type HeadingItem = {
  level: number;
  text: string;
  id: string;
  order: number;
  line: number;
  length: number;
  duplicate: boolean;
  empty: boolean;
  skippedFromPrevious: boolean;
};

type HeadingIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type HeadingResult = {
  headings: HeadingItem[];
  issues: HeadingIssue[];
  output: string;
  h1Count: number;
  totalHeadings: number;
  maxDepth: number;
  skippedLevelCount: number;
  duplicateCount: number;
  emptyCount: number;
  score: number;
};

type HeadingNote = {
  title: string;
  message: string;
};

const sampleHtml = `<main>
  <h1>JSON Formatter Online</h1>
  <p>Format and validate JSON in your browser.</p>

  <h2>Formatting JSON for Cleaner Debugging</h2>
  <h3>Common JSON formatting use cases</h3>
  <h3>Working with copied API responses</h3>

  <h2>How to Use This JSON Formatter</h2>
  <h3>Paste your JSON</h3>
  <h3>Format or validate the input</h3>

  <h2>Frequently Asked Questions</h2>
  <h3>Is my JSON uploaded anywhere?</h3>
</main>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("html");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [strictnessMode, setStrictnessMode] = useState<StrictnessMode>("balanced");
  const [ignoreHiddenHeadings, setIgnoreHiddenHeadings] = useState(true);
  const [warnMultipleH1, setWarnMultipleH1] = useState(true);
  const [warnSkippedLevels, setWarnSkippedLevels] = useState(true);
  const [warnDuplicateHeadings, setWarnDuplicateHeadings] = useState(true);
  const [warnLongHeadings, setWarnLongHeadings] = useState(true);
  const [result, setResult] = useState<HeadingResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getHeadingNotes(result) : []), [result]);

  const checkHeadings = () => {
    if (!input.trim()) {
      setError("Please paste HTML, Markdown, or plain heading text.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzeHeadingStructure(input, {
        inputMode,
        outputMode,
        strictnessMode,
        ignoreHiddenHeadings,
        warnMultipleH1,
        warnSkippedLevels,
        warnDuplicateHeadings,
        warnLongHeadings,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check the heading structure."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleHtml);
    setInputMode("html");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setIgnoreHiddenHeadings(true);
    setWarnMultipleH1(true);
    setWarnSkippedLevels(true);
    setWarnDuplicateHeadings(true);
    setWarnLongHeadings(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setInputMode("html");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setIgnoreHiddenHeadings(true);
    setWarnMultipleH1(true);
    setWarnSkippedLevels(true);
    setWarnDuplicateHeadings(true);
    setWarnLongHeadings(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Heading Structure Checker"
      description="Check HTML heading structure for SEO and readability. Analyze H1, H2, H3, skipped heading levels, duplicate headings, empty headings, and page outline issues directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Page HTML or Heading Content
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleHtml}
          className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste rendered HTML, a copied page section, Markdown headings, or a
          simple outline. The analysis runs locally in your browser.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "HTML", value: "html" },
              { label: "Markdown", value: "markdown" },
              { label: "Plain outline", value: "plain" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Outline", value: "outline" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "markdown" },
              { label: "CSV", value: "csv" },
            ]}
          />

          <YoryantraSelect
            label="Checking Style"
            value={strictnessMode}
            onChange={(value) => {
              setStrictnessMode(value as StrictnessMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Balanced", value: "balanced" },
              { label: "Strict", value: "strict" },
              { label: "Relaxed", value: "relaxed" },
            ]}
          />
<label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={ignoreHiddenHeadings}
              onChange={(event) => {
                setIgnoreHiddenHeadings(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Ignore headings with hidden styles or hidden attributes
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnMultipleH1}
              onChange={(event) => {
                setWarnMultipleH1(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about missing or multiple H1 headings
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnSkippedLevels}
              onChange={(event) => {
                setWarnSkippedLevels(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about skipped heading levels
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnDuplicateHeadings}
              onChange={(event) => {
                setWarnDuplicateHeadings(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about duplicate heading text
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnLongHeadings}
              onChange={(event) => {
                setWarnLongHeadings(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about very long headings
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Checks H1 count, empty headings, duplicate text, skipped levels,
          heading length, and outline depth. A useful heading structure should
          make sense to real users first.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkHeadings} className="yoryantra-btn">
          Check Headings
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
          <SummaryCard label="Score" value={`${result.score}/100`} />
          <SummaryCard label="Headings" value={result.totalHeadings.toLocaleString()} />
          <SummaryCard label="H1 Count" value={result.h1Count.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.headings.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Heading Outline
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            A quick outline of the heading order found in your content.
          </p>

          <div className="mt-4 space-y-2">
            {result.headings.map((heading) => (
              <div
                key={`${heading.order}-${heading.text}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                style={{ marginLeft: `${Math.max(0, heading.level - 1) * 18}px` }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-gray-700">
                    H{heading.level}
                  </span>

                  <span className="text-sm font-semibold text-gray-900">
                    {heading.text || "(empty heading)"}
                  </span>

                  {heading.duplicate && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                      duplicate
                    </span>
                  )}

                  {heading.skippedFromPrevious && (
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                      skipped level
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Line {heading.line} · {heading.length} characters
                  {heading.id ? ` · #${heading.id}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Heading findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            Heading notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Heading structure output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Heading analysis happens directly in your browser. Your HTML or outline
        is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Page Headings for SEO and Readability
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Headings help people understand the structure of a page. They also
            help search engines and assistive technology understand how the page
            is organized. A clear H1, useful H2 sections, and sensible nested
            H3 headings make content easier to scan.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Heading Structure Checker reads pasted HTML, Markdown, or plain
            outlines and reports common issues such as missing H1, multiple H1
            headings, skipped heading levels, duplicate headings, empty headings,
            and overly long headings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing a Page Heading Outline
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste HTML from a page, template, CMS editor, or rendered source.</li>
            <li>Choose HTML, Markdown, or plain outline input.</li>
            <li>Select balanced, strict, or relaxed checking.</li>
            <li>Run the checker and review the heading outline.</li>
            <li>Fix missing H1, skipped levels, duplicate headings, or unclear structure.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Heading Structure Checker Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking whether a page has one clear H1 heading.</li>
            <li>Reviewing H2 and H3 structure before publishing content.</li>
            <li>Finding skipped heading levels like H2 directly to H4.</li>
            <li>Finding duplicate or empty headings in templates.</li>
            <li>Checking generated pages, blog posts, landing pages, and tool pages.</li>
            <li>Preparing cleaner outlines for SEO, accessibility, and readability.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Clean Heading Structure
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`H1: JSON Formatter Online
  H2: Formatting JSON for Cleaner Debugging
    H3: Common JSON formatting use cases
  H2: How to Use This JSON Formatter
    H3: Paste your JSON
    H3: Format or validate the input`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Headings Should Not Be Written Only for Search Engines
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A heading structure is useful when it helps real people understand
            the page. Avoid stuffing keywords into every heading. Instead, use
            headings to describe sections naturally and make the content easier
            to scan.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Search engines can use headings as one signal, but headings are not a
            magic ranking switch. Clean structure, helpful content, internal
            links, fast pages, and a good user experience all matter together.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Heading Structure Checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads page headings and shows the outline, H1 count, skipped
                levels, duplicate headings, empty headings, and other structure
                issues.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should a page have only one H1?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                One clear H1 is still a practical standard for most pages because
                it makes the main topic obvious to people and tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are skipped heading levels bad?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                They can make a page outline harder to follow. A jump from H2 to
                H4 may be confusing unless there is a clear reason.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this check Markdown headings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Choose Markdown input and paste headings written with #,
                ##, ###, and other Markdown heading levels.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my HTML uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Heading analysis happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline">
              Meta Tags Checker
            </Link>

            <Link href="/tools/serp-snippet-preview-tool" className="yoryantra-btn-outline">
              SERP Snippet Preview Tool
            </Link>

            <Link href="/tools/structured-data-validator" className="yoryantra-btn-outline">
              Structured Data Validator
            </Link>

            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline">
              Meta Robots Tag Generator
            </Link>

            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">
              Canonical URL Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function analyzeHeadingStructure(
  input: string,
  options: {
    inputMode: InputMode;
    outputMode: OutputMode;
    strictnessMode: StrictnessMode;
    ignoreHiddenHeadings: boolean;
    warnMultipleH1: boolean;
    warnSkippedLevels: boolean;
    warnDuplicateHeadings: boolean;
    warnLongHeadings: boolean;
  }
): HeadingResult {
  const headings = extractHeadings(input, {
    inputMode: options.inputMode,
    ignoreHiddenHeadings: options.ignoreHiddenHeadings,
  });

  if (headings.length === 0) {
    throw new Error("No headings were found in the input.");
  }

  const withFlags = markHeadingFlags(headings);
  const issues = getHeadingIssues(withFlags, options);
  const h1Count = withFlags.filter((heading) => heading.level === 1).length;
  const skippedLevelCount = withFlags.filter((heading) => heading.skippedFromPrevious).length;
  const duplicateCount = withFlags.filter((heading) => heading.duplicate).length;
  const emptyCount = withFlags.filter((heading) => heading.empty).length;
  const maxDepth = Math.max(...withFlags.map((heading) => heading.level));
  const score = calculateScore(issues);
  const base = {
    headings: withFlags,
    issues,
    h1Count,
    totalHeadings: withFlags.length,
    maxDepth,
    skippedLevelCount,
    duplicateCount,
    emptyCount,
    score,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function extractHeadings(
  input: string,
  options: {
    inputMode: InputMode;
    ignoreHiddenHeadings: boolean;
  }
): HeadingItem[] {
  if (options.inputMode === "markdown") {
    return extractMarkdownHeadings(input);
  }

  if (options.inputMode === "plain") {
    return extractPlainHeadings(input);
  }

  return extractHtmlHeadings(input, options.ignoreHiddenHeadings);
}

function extractHtmlHeadings(input: string, ignoreHiddenHeadings: boolean): HeadingItem[] {
  const parser = new DOMParser();
  const documentValue = parser.parseFromString(input, "text/html");
  const headingNodes = Array.from(documentValue.querySelectorAll("h1,h2,h3,h4,h5,h6"));
  const sourceLines = input.split(/\r?\n/);

  return headingNodes
    .filter((node) => !ignoreHiddenHeadings || !isHiddenHeading(node as HTMLElement))
    .map((node, index) => {
      const level = Number(node.tagName.slice(1));
      const text = normalizeText(node.textContent || "");
      const id = (node as HTMLElement).id || "";
      const line = findLineNumber(sourceLines, node.outerHTML, text);

      return {
        level,
        text,
        id,
        order: index + 1,
        line,
        length: text.length,
        duplicate: false,
        empty: text.length === 0,
        skippedFromPrevious: false,
      };
    });
}

function isHiddenHeading(node: HTMLElement) {
  if (node.hidden || node.getAttribute("aria-hidden") === "true") {
    return true;
  }

  const style = (node.getAttribute("style") || "").toLowerCase();

  return style.includes("display:none") ||
    style.includes("display: none") ||
    style.includes("visibility:hidden") ||
    style.includes("visibility: hidden");
}

function extractMarkdownHeadings(input: string): HeadingItem[] {
  return input
    .split(/\r?\n/)
    .map((line, index) => ({
      line,
      index,
    }))
    .filter(({ line }) => /^#{1,6}\s+/.test(line.trim()))
    .map(({ line, index }, orderIndex) => {
      const trimmed = line.trim();
      const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
      const level = match ? match[1].length : 1;
      const text = normalizeText(match ? match[2].replace(/\s+#+$/, "") : trimmed);

      return {
        level,
        text,
        id: "",
        order: orderIndex + 1,
        line: index + 1,
        length: text.length,
        duplicate: false,
        empty: text.length === 0,
        skippedFromPrevious: false,
      };
    });
}

function extractPlainHeadings(input: string): HeadingItem[] {
  return input
    .split(/\r?\n/)
    .map((line, index) => ({
      line,
      index,
    }))
    .filter(({ line }) => line.trim())
    .map(({ line, index }, orderIndex) => {
      const trimmed = line.trim();
      const explicit = trimmed.match(/^H([1-6])[:.)\s-]+(.+)$/i);
      const markdownLike = trimmed.match(/^(#{1,6})\s+(.+)$/);
      const indentation = line.match(/^\s*/)?.[0].length || 0;
      const inferredLevel = Math.min(6, Math.floor(indentation / 2) + 1);
      const level = explicit ? Number(explicit[1]) : markdownLike ? markdownLike[1].length : inferredLevel;
      const text = normalizeText(explicit ? explicit[2] : markdownLike ? markdownLike[2] : trimmed);

      return {
        level,
        text,
        id: "",
        order: orderIndex + 1,
        line: index + 1,
        length: text.length,
        duplicate: false,
        empty: text.length === 0,
        skippedFromPrevious: false,
      };
    });
}

function markHeadingFlags(headings: HeadingItem[]) {
  const counts = new Map<string, number>();

  headings.forEach((heading) => {
    const key = heading.text.toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return headings.map((heading, index) => {
    const previous = headings[index - 1];
    const skippedFromPrevious = previous ? heading.level - previous.level > 1 : heading.level > 1;

    return {
      ...heading,
      duplicate: heading.text ? (counts.get(heading.text.toLowerCase()) || 0) > 1 : false,
      empty: !heading.text,
      skippedFromPrevious,
    };
  });
}

function getHeadingIssues(
  headings: HeadingItem[],
  options: {
    strictnessMode: StrictnessMode;
    warnMultipleH1: boolean;
    warnSkippedLevels: boolean;
    warnDuplicateHeadings: boolean;
    warnLongHeadings: boolean;
  }
): HeadingIssue[] {
  const issues: HeadingIssue[] = [];
  const h1Count = headings.filter((heading) => heading.level === 1).length;
  const emptyHeadings = headings.filter((heading) => heading.empty);
  const skippedLevels = headings.filter((heading) => heading.skippedFromPrevious);
  const duplicateHeadings = headings.filter((heading) => heading.duplicate);
  const longLimit = options.strictnessMode === "strict" ? 70 : options.strictnessMode === "relaxed" ? 110 : 90;
  const longHeadings = headings.filter((heading) => heading.length > longLimit);
  const maxDepth = Math.max(...headings.map((heading) => heading.level));

  if (options.warnMultipleH1 && h1Count === 0) {
    issues.push({
      severity: "high",
      title: "Missing H1 heading",
      message: "The page should usually have one clear H1 that describes the main topic.",
    });
  }

  if (options.warnMultipleH1 && h1Count > 1) {
    issues.push({
      severity: options.strictnessMode === "relaxed" ? "info" : "warning",
      title: "Multiple H1 headings",
      message: `${h1Count} H1 headings were found. One clear H1 is usually easier to understand.`,
    });
  }

  if (emptyHeadings.length > 0) {
    issues.push({
      severity: "warning",
      title: "Empty headings found",
      message: `${emptyHeadings.length} heading${emptyHeadings.length === 1 ? "" : "s"} have no visible text.`,
    });
  }

  if (options.warnSkippedLevels && skippedLevels.length > 0) {
    issues.push({
      severity: "warning",
      title: "Skipped heading levels",
      message: `${skippedLevels.length} heading${skippedLevels.length === 1 ? "" : "s"} jump over a level, such as H2 directly to H4.`,
    });
  }

  if (options.warnDuplicateHeadings && duplicateHeadings.length > 0) {
    issues.push({
      severity: "info",
      title: "Duplicate heading text",
      message: `${duplicateHeadings.length} heading${duplicateHeadings.length === 1 ? "" : "s"} repeat the same text.`,
    });
  }

  if (options.warnLongHeadings && longHeadings.length > 0) {
    issues.push({
      severity: "info",
      title: "Long headings found",
      message: `${longHeadings.length} heading${longHeadings.length === 1 ? "" : "s"} are longer than ${longLimit} characters.`,
    });
  }

  if (maxDepth >= 5 && options.strictnessMode !== "relaxed") {
    issues.push({
      severity: "info",
      title: "Deep heading structure",
      message: "The outline reaches H5 or H6. Check whether the page structure is becoming too nested.",
    });
  }

  return issues;
}

function calculateScore(issues: HeadingIssue[]) {
  let score = 100;

  issues.forEach((issue) => {
    if (issue.severity === "high") {
      score -= 30;
    } else if (issue.severity === "warning") {
      score -= 15;
    } else {
      score -= 5;
    }
  });

  return Math.max(0, score);
}

function formatOutput(
  result: Omit<HeadingResult, "output">,
  outputMode: OutputMode
) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const rows = [
      ["order", "level", "text", "line", "length", "duplicate", "empty", "skipped_level"],
      ...result.headings.map((heading) => [
        String(heading.order),
        `H${heading.level}`,
        heading.text,
        String(heading.line),
        String(heading.length),
        String(heading.duplicate),
        String(heading.empty),
        String(heading.skippedFromPrevious),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Order | Level | Heading | Line | Notes |",
      "| --- | --- | --- | --- | --- |",
      ...result.headings.map((heading) => {
        const notes = [
          heading.duplicate ? "duplicate" : "",
          heading.empty ? "empty" : "",
          heading.skippedFromPrevious ? "skipped level" : "",
        ].filter(Boolean).join(", ") || "-";

        return `| ${heading.order} | H${heading.level} | ${escapeMarkdown(heading.text || "(empty)")} | ${heading.line} | ${notes} |`;
      }),
    ].join("\n");
  }

  if (outputMode === "outline") {
    return result.headings
      .map((heading) => `${"  ".repeat(Math.max(0, heading.level - 1))}H${heading.level}: ${heading.text || "(empty)"}`)
      .join("\n");
  }

  const issues =
    result.issues.length === 0
      ? ["- No common heading structure issues found."]
      : result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

  return [
    "Heading Structure Summary",
    "-------------------------",
    `Score: ${result.score}/100`,
    `Total headings: ${result.totalHeadings}`,
    `H1 count: ${result.h1Count}`,
    `Max depth: H${result.maxDepth}`,
    `Skipped levels: ${result.skippedLevelCount}`,
    `Duplicate headings: ${result.duplicateCount}`,
    `Empty headings: ${result.emptyCount}`,
    "",
    "Findings:",
    ...issues,
  ].join("\n");
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findLineNumber(lines: string[], outerHTML: string, text: string) {
  const cleanOuter = outerHTML.trim().slice(0, 80);
  const cleanText = text.trim();

  const outerIndex = lines.findIndex((line) => line.includes(cleanOuter));
  if (outerIndex !== -1) {
    return outerIndex + 1;
  }

  const textIndex = lines.findIndex((line) => cleanText && line.includes(cleanText));
  return textIndex === -1 ? 0 : textIndex + 1;
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getHeadingNotes(result: HeadingResult): HeadingNote[] {
  const notes: HeadingNote[] = [];

  if (result.h1Count === 1 && result.issues.length === 0) {
    notes.push({
      title: "Clean heading outline",
      message:
        "The page has one H1 and no common heading structure issues were found.",
    });
  }

  if (result.skippedLevelCount > 0) {
    notes.push({
      title: "Review hierarchy",
      message:
        "Skipped levels can make the outline harder to scan. Check whether each lower heading belongs under the section above it.",
    });
  }

  if (result.duplicateCount > 0) {
    notes.push({
      title: "Duplicate headings",
      message:
        "Repeated heading text can be fine in some layouts, but it may also make the page harder to scan.",
    });
  }

  return notes;
}
