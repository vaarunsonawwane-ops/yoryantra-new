"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "single" | "lines" | "html";
type OutputMode = "summary" | "report" | "csv" | "markdown" | "json";
type Status = "empty" | "brief" | "review" | "long";

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Row = {
  description: string;
  characters: number;
  words: number;
  status: Status;
  topicUses: number;
  issues: Issue[];
};

type Result = {
  rows: Row[];
  issues: Issue[];
  globalIssues: Issue[];
  total: number;
  duplicateGroups: number;
  averageLength: number;
  output: string;
};

const SAMPLE =
  "Check canonical URLs, redirects, sitemap consistency and common duplicate-page signals with practical browser-based SEO diagnostics.";

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "�";
    })
    .replace(/&#([0-9]+);/g, (_match, decimal: string) => {
      const codePoint = Number.parseInt(decimal, 10);
      return Number.isFinite(codePoint) && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : "�";
    })
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function htmlAttribute(tag: string, name: string) {
  const quoted = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i")
  );
  if (quoted) return quoted[2];

  const unquoted = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, "i")
  );
  return unquoted ? unquoted[1] : "";
}

type MetaDescriptionEntry = {
  value: string;
  tag: string;
  index: number;
};

function metaDescriptionEntries(input: string) {
  const values: MetaDescriptionEntry[] = [];
  const regex = /<meta\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    const tag = match[0];
    const name = htmlAttribute(tag, "name").toLowerCase();
    if (name !== "description") continue;

    values.push({
      value: decodeEntities(htmlAttribute(tag, "content")),
      tag,
      index: match.index,
    });
  }

  return values;
}

function looksLikeHtmlDocument(input: string) {
  return /<(?:html|head|body)\b/i.test(input);
}

function isInsideHead(input: string, index: number) {
  const before = input.slice(0, index);
  let lastOpen = -1;
  let lastClose = -1;
  let match: RegExpExecArray | null;
  const open = /<head\b[^>]*>/gi;
  const close = /<\/head\s*>/gi;

  while ((match = open.exec(before)) !== null) {
    lastOpen = match.index;
  }
  while ((match = close.exec(before)) !== null) {
    lastClose = match.index;
  }

  return lastOpen !== -1 && lastOpen > lastClose;
}

function extractDescriptions(input: string, mode: InputMode) {
  if (mode === "single") {
    return [input];
  }

  if (mode === "lines") {
    const lines = input.replace(/\r\n?/g, "\n").split("\n");
    while (lines.length && !lines[lines.length - 1].trim()) {
      lines.pop();
    }
    return lines;
  }

  const entries = metaDescriptionEntries(input);
  if (!entries.length) {
    throw new Error(
      'No <meta name="description" content="..."> element was found in the pasted HTML.'
    );
  }

  return entries.map((entry) => entry.value);
}

function countPhrase(text: string, phrase: string) {
  if (!phrase) return 0;
  let count = 0;
  let index = 0;

  while (index <= text.length) {
    const found = text.indexOf(phrase, index);
    if (found === -1) break;
    count += 1;
    index = found + phrase.length;
  }

  return count;
}

function genericWording(value: string) {
  const normalized = value.toLowerCase();
  return (
    /^(welcome to|home page|click here|learn more|we offer|we provide)\b/.test(
      normalized
    ) ||
    /\b(best website|number one|everything you need)\b/.test(normalized)
  );
}

function analyzeRow(
  descriptionInput: string,
  options: {
    topic: string;
    checkTopic: boolean;
    reviewMin: number;
    reviewMax: number;
  }
): Row {
  const description = normalizeSpace(descriptionInput);
  const characters = Array.from(description).length;
  const words = description
    ? description.split(/\s+/).filter(Boolean).length
    : 0;
  const issues: Issue[] = [];
  let status: Status = "review";

  if (!description) {
    status = "empty";
    issues.push({
      severity: "high",
      title: "Empty description",
      message:
        "No description text was found for this row. A page can still appear in search without one because the snippet can come from visible page content.",
    });
  } else if (characters < options.reviewMin) {
    status = "brief";
    issues.push({
      severity: "info",
      title: "Brief description",
      message:
        `${characters} characters is below the selected editing review range. Short descriptions are not invalid; check whether the wording still gives a specific, accurate summary of the page.`,
    });
  } else if (characters > options.reviewMax) {
    status = "long";
    issues.push({
      severity: "warning",
      title: "Long description",
      message:
        `${characters} characters is above the selected editing review range. Search snippets are display-dependent and may be shortened or rewritten, so put the most useful wording early.`,
    });
  }

  if (description && words < 6) {
    issues.push({
      severity: "warning",
      title: "Very little page-specific information",
      message:
        "The description is extremely short in words. That may be intentional, but it leaves little room to distinguish the page from nearby results.",
    });
  }

  if (description && genericWording(description)) {
    issues.push({
      severity: "warning",
      title: "Generic opening",
      message:
        "The wording begins with a generic phrase that could fit many pages. A more specific summary usually helps users understand why this result matches their search.",
    });
  }

  const topic = options.topic.trim().toLowerCase();
  const topicUses =
    options.checkTopic && topic
      ? countPhrase(description.toLowerCase(), topic)
      : 0;

  if (options.checkTopic && topic && description) {
    if (topicUses === 0) {
      issues.push({
        severity: "info",
        title: "Optional topic phrase not used verbatim",
        message:
          "The target phrase is absent. This is not an SEO requirement; synonyms and natural wording can be better than forcing an exact phrase.",
      });
    } else if (topicUses > 2) {
      issues.push({
        severity: "warning",
        title: "Topic phrase repeated",
        message:
          `The exact phrase appears ${topicUses} times in a short description. Repetition can make the snippet read unnaturally.`,
      });
    }
  }

  return {
    description,
    characters,
    words,
    status,
    topicUses,
    issues,
  };
}

function duplicateIssues(rows: Row[]) {
  const groups: Record<string, number> = Object.create(null);
  rows.forEach((row) => {
    const key = row.description.toLowerCase();
    if (!key) return;
    groups[key] = (groups[key] || 0) + 1;
  });

  const issues: Issue[] = [];
  Object.keys(groups).forEach((key) => {
    if (groups[key] > 1) {
      issues.push({
        severity: "warning",
        title: "Duplicate description",
        message:
          `${groups[key]} rows use the same description after whitespace/case normalization. Duplicate descriptions can make different pages harder to distinguish.`,
      });
    }
  });

  return issues;
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatOutput(
  result: Omit<Result, "output">,
  outputMode: OutputMode
) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const lines = [
      [
        "description",
        "characters",
        "words",
        "status",
        "topic_uses",
        "findings",
      ]
        .map(csvCell)
        .join(","),
    ];

    result.rows.forEach((row) => {
      lines.push(
        [
          row.description,
          String(row.characters),
          String(row.words),
          row.status,
          String(row.topicUses),
          String(row.issues.length),
        ]
          .map(csvCell)
          .join(",")
      );
    });

    return lines.join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Description | Characters | Words | Status | Topic uses | Findings |",
      "| --- | ---: | ---: | --- | ---: | ---: |",
      ...result.rows.map(
        (row) =>
          `| ${row.description.replace(/\|/g, "\\|")} | ${
            row.characters
          } | ${row.words} | ${row.status} | ${row.topicUses} | ${
            row.issues.length
          } |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.rows
      .map((row, index) =>
        [
          `Description ${index + 1}`,
          row.description || "(empty)",
          `Characters: ${row.characters}`,
          `Words: ${row.words}`,
          `Editing status: ${row.status}`,
          `Topic phrase uses: ${row.topicUses}`,
          "Findings:",
          ...(row.issues.length
            ? row.issues.map(
                (issue) =>
                  `- ${issue.severity.toUpperCase()} — ${issue.title}: ${
                    issue.message
                  }`
              )
            : ["- No selected heuristic finding."]),
        ].join("\n")
      )
      .join("\n\n");
  }

  return [
    "Meta description review",
    `Descriptions checked: ${result.total}`,
    `Duplicate groups: ${result.duplicateGroups}`,
    `Average characters: ${result.averageLength}`,
    `Brief: ${result.rows.filter((row) => row.status === "brief").length}`,
    `Within editing range: ${
      result.rows.filter((row) => row.status === "review").length
    }`,
    `Long: ${result.rows.filter((row) => row.status === "long").length}`,
    `Empty: ${result.rows.filter((row) => row.status === "empty").length}`,
    "",
    "Important: the selected range is an editing heuristic, not a Google character limit or ranking threshold.",
  ].join("\n");
}

function analyzeDescriptions(options: {
  input: string;
  inputMode: InputMode;
  outputMode: OutputMode;
  topic: string;
  checkTopic: boolean;
  reviewMin: number;
  reviewMax: number;
}): Result {
  if (
    !Number.isInteger(options.reviewMin) ||
    !Number.isInteger(options.reviewMax) ||
    options.reviewMin < 0 ||
    options.reviewMax < options.reviewMin
  ) {
    throw new Error("Editing review range is invalid.");
  }

  const inputs = extractDescriptions(options.input, options.inputMode);
  const rows = inputs.map((value) =>
    analyzeRow(value, {
      topic: options.topic,
      checkTopic: options.checkTopic,
      reviewMin: options.reviewMin,
      reviewMax: options.reviewMax,
    })
  );

  const duplicate = duplicateIssues(rows);
  const globalIssues = duplicate.slice();

  if (options.inputMode === "html") {
    const entries = metaDescriptionEntries(options.input);

    if (entries.length > 1) {
      globalIssues.push({
        severity: "high",
        title: "Multiple meta descriptions in one HTML document",
        message:
          `${entries.length} meta description elements were found. Keep one clear page description rather than relying on crawler-specific conflict handling.`,
      });
    }

    if (looksLikeHtmlDocument(options.input)) {
      const outsideHead = entries.filter(
        (entry) => !isInsideHead(options.input, entry.index)
      ).length;
      if (outsideHead) {
        globalIssues.push({
          severity: "high",
          title: "Meta description appears outside the head",
          message:
            `${outsideHead} description element${
              outsideHead === 1 ? " is" : "s are"
            } outside the document head. Metadata belongs in a valid head section.`,
        });
      }
    }
  }

  const issues = globalIssues.slice();
  rows.forEach((row) => row.issues.forEach((issue) => issues.push(issue)));

  const nonEmpty = rows.filter((row) => row.description);
  const averageLength = nonEmpty.length
    ? Math.round(
        nonEmpty.reduce((sum, row) => sum + row.characters, 0) /
          nonEmpty.length
      )
    : 0;

  const base: Omit<Result, "output"> = {
    rows,
    issues,
    globalIssues,
    total: rows.length,
    duplicateGroups: duplicate.length,
    averageLength,
  };

  return {
    ...base,
    output: formatOutput(base, options.outputMode),
  };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("single");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [topic, setTopic] = useState("");
  const [checkTopic, setCheckTopic] = useState(false);
  const [reviewMin, setReviewMin] = useState(70);
  const [reviewMax, setReviewMax] = useState(165);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const highCount = useMemo(
    () =>
      result
        ? result.issues.filter((issue) => issue.severity === "high").length
        : 0,
    [result]
  );

  const clear = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const run = () => {
    if (!input.trim()) {
      setError("Enter a meta description, a line list, or HTML to review.");
      setResult(null);
      return;
    }

    try {
      setResult(
        analyzeDescriptions({
          input,
          inputMode,
          outputMode,
          topic,
          checkTopic,
          reviewMin,
          reviewMax,
        })
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to review these descriptions."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE);
    setInputMode("single");
    setOutputMode("summary");
    setTopic("canonical URLs");
    setCheckTopic(true);
    setReviewMin(70);
    setReviewMax(165);
    clear();
  };

  const reset = () => {
    setInput("");
    setInputMode("single");
    setOutputMode("summary");
    setTopic("");
    setCheckTopic(false);
    setReviewMin(70);
    setReviewMax(165);
    clear();
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The output could not be copied. Select and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="Meta Description Length Checker"
      description="Review meta descriptions from plain text, line lists or HTML, including length, duplicate wording, empty values and optional phrase repetition without treating a character count as a Google limit."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <YoryantraSelect
          label="Input format"
          value={inputMode}
          onChange={(value: string) => {
            setInputMode(value as InputMode);
            clear();
          }}
          options={[
            { label: "One description", value: "single" },
            { label: "One description per line", value: "lines" },
            { label: "HTML meta tags", value: "html" },
          ]}
        />
        <YoryantraSelect
          label="Output"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(value as OutputMode);
            clear();
          }}
          options={[
            { label: "Summary", value: "summary" },
            { label: "Detailed report", value: "report" },
            { label: "CSV", value: "csv" },
            { label: "Markdown", value: "markdown" },
            { label: "JSON", value: "json" },
          ]}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Description text or HTML
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clear();
          }}
          placeholder={SAMPLE}
          spellCheck={false}
          className="mt-3 min-h-[280px] w-full rounded-xl border border-gray-300 p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <label className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="text-sm font-medium text-gray-700">Review minimum</span>
          <input
            type="number"
            value={reviewMin}
            onChange={(event: { target: { value: string } }) => {
              setReviewMin(Number(event.target.value));
              clear();
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 p-2"
          />
        </label>
        <label className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="text-sm font-medium text-gray-700">Review maximum</span>
          <input
            type="number"
            value={reviewMax}
            onChange={(event: { target: { value: string } }) => {
              setReviewMax(Number(event.target.value));
              clear();
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 p-2"
          />
        </label>
        <label className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <span className="text-sm font-medium text-gray-700">
            Optional topic phrase
          </span>
          <input
            value={topic}
            onChange={(event: { target: { value: string } }) => {
              setTopic(event.target.value);
              clear();
            }}
            className="mt-2 w-full rounded-lg border border-gray-300 p-2"
          />
          <span className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={checkTopic}
              onChange={(event: { target: { checked: boolean } }) => {
                setCheckTopic(event.target.checked);
                clear();
              }}
            />
            Review verbatim usage
          </span>
        </label>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-500">
        The default 70–165 range is only an editable review window. It is not a
        Google limit, ranking factor or guarantee of how a snippet will render.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={run} className="yoryantra-btn">
          Review Descriptions
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={reset} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Descriptions" value={String(result.total)} />
            <Stat label="Average chars" value={String(result.averageLength)} />
            <Stat label="Duplicate groups" value={String(result.duplicateGroups)} />
            <Stat label="High findings" value={String(highCount)} />
          </div>

          {result.globalIssues.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-900">Page-level findings</h3>
              <div className="mt-4 space-y-3">
                {result.globalIssues.map((issue, index) => (
                  <div
                    key={`${issue.title}-${index}`}
                    className="rounded-xl border border-amber-200 bg-white/60 p-4 text-sm leading-relaxed text-gray-700"
                  >
                    <strong>
                      {issue.severity.toUpperCase()} · {issue.title}
                    </strong>
                    <p className="mt-1">{issue.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {result.rows.map((row, index) => (
              <div
                key={`${index}-${row.description}`}
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex flex-wrap gap-3">
                  <strong>Description {index + 1}</strong>
                  <span className="text-sm text-gray-500">
                    {row.characters} chars · {row.words} words · {row.status}
                  </span>
                </div>
                <p className="mt-3 leading-relaxed text-gray-700">
                  {row.description || "(empty)"}
                </p>
                {row.issues.length ? (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-700">
                    <ul className="list-disc space-y-2 pl-5">
                      {row.issues.map((issue, issueIndex) => (
                        <li key={`${issue.title}-${issueIndex}`}>
                          <strong>{issue.title}:</strong> {issue.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Output</h3>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="yoryantra-output mt-4 min-h-[260px] whitespace-pre-wrap break-words text-sm">
              {result.output}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        The review runs on text pasted into the browser. No Google result is
        fetched, no live result width is measured, and the generated snippet for
        a particular query cannot be predicted here. Site-wide analytics or
        advertising scripts, if enabled, are separate from the text review.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-semibold text-gray-900">
          Meta Descriptions Are Inputs to Snippet Generation, Not Fixed-Width Fields
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Search engines may use your meta description when it helps explain the
          page for a particular query, but they can also select visible page
          text instead. That makes “exactly 155 characters” a poor quality rule.
          The useful question is whether the description is specific, readable
          and front-loads the value that matters if the snippet is shortened.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          There Is No Published Google Meta-Description Character Limit
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Google documents that snippets are generated primarily from page
          content and can sometimes use the meta description. Display length
          depends on the result layout, device, query and wording. Character
          counts remain useful for editing consistency, but they should not be
          presented as a validation rule.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          Character Count Is Not the Same as Rendered Width
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          Two descriptions with the same character count can occupy very
          different widths because letters, punctuation, device size and the
          surrounding result layout differ. A review range is best treated as an
          editing aid, not a pixel-accurate preview.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          More Than One Description Tag Creates an Avoidable Conflict
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          When pasted HTML contains several <code>meta name="description"</code>
          elements, there is no reason to depend on which one a crawler or parser
          happens to use. Keep one description in the document head and fix the
          template that produced the duplicate tags.
        </p>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate Descriptions Are Usually a Content-Differentiation Problem
          </h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            Reusing one generic sentence across many pages may not break HTML,
            but it removes an opportunity to describe what is unique about each
            result. For programmatic sites, a useful description template still
            needs page-specific facts—not merely a changed product/category
            name.
          </p>
        </div>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          Exact Keyword Presence Is Optional
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          An optional phrase count can reveal accidental omission or awkward
          repetition, but missing exact text is not treated as an SEO error.
          Natural synonyms can be clearer, and Google does not require a verbatim
          target phrase in the meta description.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-gray-900">
          Pasted HTML and Live HTML Are Not Always the Same
        </h2>
        <p className="mt-4 leading-relaxed text-gray-600">
          HTML mode finds pasted <code>meta name="description"</code> elements
          and decodes common entities. It cannot tell whether client-side
          JavaScript later changes the tag, whether the server sends different
          HTML to crawlers, or which description appears in an actual result.
        </p>

        <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          See Google Search Central&apos;s{" "}
          <a
            href="https://developers.google.com/search/docs/appearance/snippet"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            snippet documentation
          </a>{" "}
          for how snippets are generated and when a meta description may be
          used.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Check the Rest of the Search Snippet
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/meta-description-length-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}
