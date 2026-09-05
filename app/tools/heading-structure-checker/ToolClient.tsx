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
  severity: "info" | "warning";
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
  <h1>Debugging JSON API Responses</h1>
  <p>A short guide for inspecting structured data from an API.</p>

  <h2>Read the response before formatting it</h2>
  <h3>Check the content type</h3>
  <h3>Look for truncated payloads</h3>

  <h2>Format the JSON for inspection</h2>
  <h3>Preserve number and string values</h3>
  <h3>Compare the formatted output with the source</h3>
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

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setError("Clipboard access was blocked. Select the output and copy it manually.");
      setCopied(false);
    }
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
      description="Review HTML heading hierarchy, H1 usage, skipped levels, duplicates, empty headings, and outline structure."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="heading-input" className="block mb-2 text-sm font-medium text-gray-700">
          Page HTML or Heading Content
        </label>

        <textarea
          id="heading-input"
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

            Ignore headings with explicit hidden attributes or inline hidden styles
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

            Review missing or multiple H1 headings
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
          Checks H1 count, empty headings, duplicate text, skipped levels, and
          an optional heading-length heuristic. The score is a local review aid,
          not a Google ranking score or WCAG conformance result.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkHeadings} className="yoryantra-btn shrink-0 whitespace-nowrap">
          Check Headings
        </button>

        <button onClick={copyOutput} className="yoryantra-btn shrink-0 whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline shrink-0 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline shrink-0 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Heuristic score" value={`${result.score}/100`} />
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
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
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
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {result.issues.map((issue, index) => {
            const isWarning = issue.severity === "warning";

            return (
              <div
                key={`${issue.title}-${index}`}
                className={
                  isWarning
                    ? "self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
                    : "self-start rounded-xl border border-gray-200 bg-gray-50 p-4"
                }
              >
                <p
                  className={
                    isWarning
                      ? "text-sm font-semibold text-amber-900"
                      : "text-sm font-semibold text-gray-900"
                  }
                >
                  {issue.title}
                </p>

                <p
                  className={
                    isWarning
                      ? "mt-1 text-sm leading-relaxed text-amber-800"
                      : "mt-1 text-sm leading-relaxed text-gray-600"
                  }
                >
                  {issue.message}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {notes.map((note) => (
            <div
              key={note.title}
              className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4"
            >
              <p className="text-sm font-semibold text-gray-900">
                {note.title}
              </p>

              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {note.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm shrink-0 whitespace-nowrap">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Heading structure output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Heading analysis runs in the browser. Pasted HTML, Markdown, and outlines
        are not sent to Yoryantra for processing.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Read the outline as structure, not as an SEO score
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Heading levels describe how sections relate to one another. They help
            people scan a page and give screen-reader users a fast way to move
            between sections. A sensible hierarchy matters more than forcing a
            particular number of headings.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Google explicitly says there is no magical ideal number or strict
            ordering of headings for Search. The hierarchy checks here are mainly
            an editorial and accessibility review, not a ranking test.
          </p>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              What a skipped level really means
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Moving from H2 directly into H4 can make the hierarchy harder to
              follow because an H3-level section appears to be missing. Moving
              back from a deeper subsection to a higher level is normal when a
              subsection ends.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              H1 count needs context
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              A single descriptive H1 is a clear convention for most pages, but
              multiple H1 elements are not automatically an SEO failure. Review
              whether the main topic and section boundaries remain obvious to
              people and assistive technology.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Three input modes, three different assumptions
          </h2>

          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              <strong className="text-gray-900">HTML:</strong> reads actual
              H1-H6 elements. The hidden-heading option recognizes the
              <code className="mx-1">hidden</code> attribute,
              <code className="mx-1">aria-hidden=&quot;true&quot;</code>, and common
              inline display/visibility styles. It cannot evaluate external
              stylesheets or every runtime visibility rule from pasted source.
            </p>
            <p>
              <strong className="text-gray-900">Markdown:</strong> reads ATX
              headings using one to six hash characters and ignores headings
              inside fenced code blocks.
            </p>
            <p>
              <strong className="text-gray-900">Plain outline:</strong> accepts
              explicit labels such as H2: or infers levels from two-space
              indentation. That inference is a convenience, not a document
              standard.
            </p>
          </div>
        </div>

        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-amber-900">
            Treat length and duplicate warnings as editorial prompts
          </h2>
          <p className="mt-3 text-amber-800 leading-relaxed">
            WCAG and Google do not publish a maximum heading character count.
            The strict, balanced, and relaxed length thresholds are local
            heuristics for spotting headings worth rereading. Repeated wording
            can also be legitimate when the surrounding sections make the
            meaning clear.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Compare the outline with the rendered page
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Pasted source cannot reveal every heading created by client-side
            rendering, component state, CMS transformations, or CSS. When a page
            changes after JavaScript runs, compare the result with the rendered
            DOM and test keyboard or screen-reader heading navigation as well.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Standards and search guidance
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            W3C WAI explains how heading ranks communicate page organization and
            recommends avoiding skipped ranks when opening subsections. Google&apos;s
            SEO Starter Guide recommends headings that help users navigate while
            also noting that Search does not require a perfect semantic order.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://www.w3.org/WAI/tutorials/page-structure/headings/"
              target="_blank"
              rel="noreferrer"
              className="yoryantra-btn-outline whitespace-nowrap"
            >
              W3C WAI headings guidance
            </a>
            <a
              href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide"
              target="_blank"
              rel="noreferrer"
              className="yoryantra-btn-outline whitespace-nowrap"
            >
              Google SEO Starter Guide
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline whitespace-nowrap">
              Meta Tags Checker
            </Link>
            <Link href="/tools/serp-snippet-preview-tool" className="yoryantra-btn-outline whitespace-nowrap">
              SERP Snippet Preview Tool
            </Link>
            <Link href="/tools/structured-data-validator" className="yoryantra-btn-outline whitespace-nowrap">
              Structured Data Validator
            </Link>
            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline whitespace-nowrap">
              Meta Robots Tag Generator
            </Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline whitespace-nowrap">
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
  const sourceHeadingLines = findHtmlHeadingSourceLines(input);

  return headingNodes
    .map((node, sourceIndex) => ({ node, sourceIndex }))
    .filter(({ node }) => !ignoreHiddenHeadings || !isHiddenHeading(node as HTMLElement))
    .map(({ node, sourceIndex }, index) => {
      const level = Number(node.tagName.slice(1));
      const text = normalizeText(node.textContent || "");
      const id = (node as HTMLElement).id || "";
      const line = sourceHeadingLines[sourceIndex] || 0;

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
  const headings: HeadingItem[] = [];
  const lines = input.split(/\r?\n/);
  let fence: { marker: "`" | "~"; length: number } | null = null;

  lines.forEach((line, index) => {
    if (fence) {
      const closingFence = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);

      if (closingFence) {
        const marker = closingFence[1][0] as "`" | "~";
        const length = closingFence[1].length;

        if (fence.marker === marker && length >= fence.length) {
          fence = null;
        }
      }

      return;
    }

    const openingFence = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);

    if (openingFence) {
      const marker = openingFence[1][0] as "`" | "~";
      const info = openingFence[2];

      if (!(marker === "`" && info.includes("`"))) {
        fence = { marker, length: openingFence[1].length };
        return;
      }
    }

    const match = line.match(/^ {0,3}(#{1,6})(?:[ \t]+|$)(.*)$/);

    if (!match) {
      return;
    }

    const level = match[1].length;
    const text = match[2].replace(/[ \t]+#+[ \t]*$/, "").trim();

    headings.push({
      level,
      text,
      id: "",
      order: headings.length + 1,
      line: index + 1,
      length: text.length,
      duplicate: false,
      empty: text.length === 0,
      skippedFromPrevious: false,
    });
  });

  return headings;
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

  if (options.warnMultipleH1 && h1Count === 0) {
    issues.push({
      severity: "warning",
      title: "No H1 found",
      message: "Most pages benefit from a clear top-level heading, but this is a structure review rather than a Google ranking requirement.",
    });
  }

  if (options.warnMultipleH1 && h1Count > 1) {
    issues.push({
      severity: "info",
      title: "Multiple H1 headings",
      message: `${h1Count} H1 headings were found. Review whether the page still has one obvious main topic and understandable section boundaries.`,
    });
  }

  if (emptyHeadings.length > 0) {
    issues.push({
      severity: "warning",
      title: "Empty headings found",
      message: `${emptyHeadings.length} heading${emptyHeadings.length === 1 ? "" : "s"} have no readable text. Empty structural headings can be confusing for assistive technology.`,
    });
  }

  if (options.warnSkippedLevels && skippedLevels.length > 0) {
    issues.push({
      severity: "warning",
      title: "Skipped heading levels",
      message: `${skippedLevels.length} heading${skippedLevels.length === 1 ? "" : "s"} jump into a deeper level, such as H2 directly to H4. Review whether a subsection level is missing.`,
    });
  }

  if (options.warnDuplicateHeadings && duplicateHeadings.length > 0) {
    issues.push({
      severity: "info",
      title: "Repeated heading text",
      message: `${duplicateHeadings.length} heading${duplicateHeadings.length === 1 ? "" : "s"} repeat the same text. Repetition can be legitimate, so check the surrounding sections before changing it.`,
    });
  }

  if (options.warnLongHeadings && longHeadings.length > 0) {
    issues.push({
      severity: "info",
      title: "Long headings worth rereading",
      message: `${longHeadings.length} heading${longHeadings.length === 1 ? "" : "s"} exceed the local ${longLimit}-character review threshold. That threshold is an editorial heuristic, not a Google or WCAG limit.`,
    });
  }

  return issues;
}

function calculateScore(issues: HeadingIssue[]) {
  let score = 100;

  issues.forEach((issue) => {
    score -= issue.severity === "warning" ? 15 : 5;
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
    `Heuristic score: ${result.score}/100`,
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

function findHtmlHeadingSourceLines(input: string) {
  const lines: number[] = [];
  const openingTag = /<h[1-6]\b/gi;
  let match: RegExpExecArray | null;
  let cursor = 0;
  let line = 1;

  while ((match = openingTag.exec(input)) !== null) {
    const between = input.slice(cursor, match.index);
    line += (between.match(/\r\n|\r|\n/g) || []).length;
    lines.push(line);
    cursor = match.index;
  }

  return lines;
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
  const notes: HeadingNote[] = [
    {
      title: "About the heuristic score",
      message:
        "The score only summarizes the selected local checks. It is not a Google ranking score and does not establish WCAG conformance.",
    },
  ];

  if (result.h1Count === 1 && result.issues.length === 0) {
    notes.push({
      title: "No selected review flags",
      message:
        "The pasted outline has one H1 and none of the selected checks produced a flag. Compare it with the rendered page before treating the review as complete.",
    });
  }

  if (result.skippedLevelCount > 0) {
    notes.push({
      title: "Follow the subsection relationship",
      message:
        "A skipped level is worth reviewing when the page moves into a deeper subsection. Moving back to a higher level after a subsection ends is normal.",
    });
  }

  if (result.duplicateCount > 0) {
    notes.push({
      title: "Repeated wording needs context",
      message:
        "Identical heading text can be intentional in repeated components, but distinct wording often makes a long page easier to scan.",
    });
  }

  return notes;
}
