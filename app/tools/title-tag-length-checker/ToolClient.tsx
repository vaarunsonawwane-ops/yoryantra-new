"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "titles" | "pairs" | "html";
type OutputMode = "summary" | "report" | "csv" | "markdown" | "json";
type Severity = "info" | "warning" | "high";

type Finding = {
  severity: Severity;
  title: string;
  message: string;
};

type TitleRow = {
  index: number;
  title: string;
  url: string;
  characters: number;
  words: number;
  targetPhrase: string;
  brandPlacement: string;
  aboveReviewThreshold: boolean;
  generic: boolean;
  findings: Finding[];
};

type Boilerplate = {
  position: "prefix" | "suffix";
  segment: string;
  count: number;
};

type Result = {
  rows: TitleRow[];
  findings: Finding[];
  duplicateGroups: number;
  averageLength: number;
  aboveThresholdCount: number;
  emptyCount: number;
  boilerplate: Boilerplate[];
  output: string;
};

const SAMPLE_TITLES = `Invoice API Reference | Example Docs
Authentication Guide | Example Docs
Webhook Retry Policy | Example Docs
Home
Rate Limit Reference | Example Docs
Rate Limit Reference | Example Docs`;

function normalizeSpace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function parseRows(input: string, mode: InputMode) {
  if (mode === "html") {
    const document = new DOMParser().parseFromString(input, "text/html");
    const titles = Array.from(document.querySelectorAll("title"));

    if (!titles.length) {
      throw new Error(
        "No HTML <title> element was found in the pasted source."
      );
    }

    return titles.map((element, index) => ({
      title: normalizeSpace(element.textContent || ""),
      url: "",
      sourceIndex: index,
    }));
  }

  const lines = input
    .replace(/\r\n?/g, "\n")
    .split("\n");

  while (lines.length && !lines[0].trim()) {
    lines.shift();
  }

  while (lines.length && !lines[lines.length - 1].trim()) {
    lines.pop();
  }

  if (mode === "titles") {
    return lines.map((line, index) => ({
      title: line.trim(),
      url: "",
      sourceIndex: index,
    }));
  }

  const rows: Array<{
    title: string;
    url: string;
    sourceIndex: number;
  }> = [];

  for (let index = 0; index < lines.length; index += 2) {
    rows.push({
      title: (lines[index] || "").trim(),
      url: (lines[index + 1] || "").trim(),
      sourceIndex: index / 2,
    });
  }

  return rows;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function literalMatches(text: string, value: string) {
  if (!value) {
    return [] as number[];
  }

  const expression = new RegExp(escapeRegExp(value), "gi");
  const positions: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = expression.exec(text)) !== null) {
    positions.push(match.index);

    if (!match[0]) {
      expression.lastIndex += 1;
    }
  }

  return positions;
}

function genericTitle(title: string) {
  const normalized =
    title
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  return (
    [
      "home",
      "homepage",
      "home page",
      "profile",
      "page",
      "untitled",
      "welcome",
      "products",
      "services",
      "blog",
      "article",
      "details",
    ].indexOf(normalized) !== -1
  );
}

function validUrlOrBlank(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function analyzeRow(
  row: {
    title: string;
    url: string;
    sourceIndex: number;
  },
  options: {
    targetPhrase: string;
    brandName: string;
    reviewMaximum: number;
    useReviewMaximum: boolean;
    checkTargetPhrase: boolean;
    checkBrand: boolean;
    checkSeparators: boolean;
  }
): TitleRow {
  const title =
    normalizeSpace(row.title);
  const characters =
    Array.from(title).length;
  const words =
    title
      ? title
          .split(/\s+/)
          .filter(Boolean)
          .length
      : 0;
  const findings: Finding[] = [];
  const generic =
    genericTitle(title);
  const aboveReviewThreshold =
    Boolean(
      title &&
        options.useReviewMaximum &&
        characters >
          options.reviewMaximum
    );

  if (!title) {
    findings.push({
      severity: "high",
      title: "Empty title",
      message:
        "This row has no title text. An HTML document should have a descriptive title element, and an empty title gives both users and search systems little page identity.",
    });
  } else {
    if (generic) {
      findings.push({
        severity: "warning",
        title: "Title is too generic on its own",
        message:
          `${JSON.stringify(
            title
          )} does not explain what distinguishes this page from other pages or results.`,
      });
    }

    if (words === 1 && characters < 18) {
      findings.push({
        severity: "info",
        title: "Very little descriptive context",
        message:
          "A one-word title can be correct for a famous product or brand, but many ordinary pages need more context to identify the specific topic or task.",
      });
    }

    if (aboveReviewThreshold) {
      findings.push({
        severity: "info",
        title: "Above your editing threshold",
        message:
          `This title has ${characters} characters; your local review threshold is ${options.reviewMaximum}. Google does not publish this as a title limit and can truncate or rewrite title links based on available display space.`,
      });
    }

    if (/^\s*[|:;,\-–—]/.test(title)) {
      findings.push({
        severity: "info",
        title: "Title begins with a separator",
        message:
          "A leading separator often indicates missing unique text or a title-template assembly bug.",
      });
    }

    if (/[|:;,\-–—]\s*$/.test(title)) {
      findings.push({
        severity: "info",
        title: "Title ends with a separator",
        message:
          "A trailing separator often indicates missing brand/section text or a title-template assembly bug.",
      });
    }
  }

  if (
    row.url &&
    !validUrlOrBlank(row.url)
  ) {
    findings.push({
      severity: "warning",
      title: "Paired URL is not a valid HTTP(S) URL",
      message:
        `${JSON.stringify(
          row.url
        )} is retained for the report but cannot be treated as a normal page URL.`,
    });
  }

  let targetPhrase = "";
  const wanted =
    options.targetPhrase.trim();

  if (
    options.checkTargetPhrase &&
    wanted &&
    title
  ) {
    const matches = literalMatches(title, wanted);
    const first = matches.length ? matches[0] : -1;
    const count = matches.length;

    if (first === -1) {
      targetPhrase = "not used";
      findings.push({
        severity: "info",
        title: "Optional target phrase is absent",
        message:
          `The exact phrase ${JSON.stringify(
            wanted
          )} is not present. This is not automatically an SEO problem: natural synonyms and a clearer page description can be better than forcing an exact query phrase.`,
      });
    } else {
      targetPhrase =
        first === 0
          ? "starts title"
          : `starts at character ${
              Array.from(
                title.slice(
                  0,
                  first
                )
              ).length + 1
            }`;

      if (count > 1) {
        findings.push({
          severity: "warning",
          title: "Target phrase is repeated",
          message:
            `The exact phrase appears ${count} times. Repetition inside a short title usually reduces readability rather than adding useful context.`,
        });
      }
    }
  }

  let brandPlacement = "";
  const brand =
    options.brandName.trim();

  if (
    options.checkBrand &&
    brand &&
    title
  ) {
    const matches = literalMatches(title, brand);
    const first = matches.length ? matches[0] : -1;
    const count = matches.length;

    if (first === -1) {
      brandPlacement =
        "not present";
    } else {
      brandPlacement =
        first === 0
          ? "starts title"
          : first +
              brand.length ===
            title.length
          ? "ends title"
          : "inside title";

      if (
        title.toLowerCase() ===
        brand.toLowerCase()
      ) {
        findings.push({
          severity: "warning",
          title: "Title is only the brand/site name",
          message:
            "For an internal page, a brand-only title may fail to describe the page-specific topic. The homepage is a possible exception depending on the site.",
        });
      }

      if (count > 1) {
        findings.push({
          severity: "warning",
          title: "Brand name repeated",
          message:
            `The supplied brand/site name appears ${count} times. One useful brand reference is normally enough.`,
        });
      }
    }
  }

  if (
    options.checkSeparators &&
    title
  ) {
    if (
      /\|\s*\||--|::|\/\s*\//.test(
        title
      )
    ) {
      findings.push({
        severity: "info",
        title: "Repeated separator pattern",
        message:
          "The title contains a repeated separator such as ||, --, :: or //. Check whether a template inserted an empty segment.",
      });
    }

    const pipes =
      title.match(/\|/g) || [];

    if (pipes.length > 2) {
      findings.push({
        severity: "info",
        title: "Many pipe-separated segments",
        message:
          "More than two pipe separators can make a title feel assembled from boilerplate rather than written for the page.",
      });
    }
  }

  return {
    index:
      row.sourceIndex,
    title,
    url: row.url,
    characters,
    words,
    targetPhrase,
    brandPlacement,
    aboveReviewThreshold,
    generic,
    findings,
  };
}

function normalizedTitle(value: string) {
  return normalizeSpace(
    value.toLowerCase()
  );
}

function duplicateFindings(
  rows: TitleRow[]
) {
  const groups =
    Object.create(
      null
    ) as Record<
      string,
      {
        count: number;
        title: string;
        urls: string[];
      }
    >;

  rows.forEach((row) => {
    const key =
      normalizedTitle(
        row.title
      );

    if (!key) return;

    if (!groups[key]) {
      groups[key] = {
        count: 0,
        title: row.title,
        urls: [],
      };
    }

    groups[key].count += 1;

    if (
      row.url &&
      groups[key].urls.indexOf(
        row.url
      ) === -1
    ) {
      groups[key].urls.push(
        row.url
      );
    }
  });

  return Object.keys(groups)
    .filter(
      (key) =>
        groups[key].count > 1
    )
    .map((key): Finding => ({
      severity: "warning",
      title: "Duplicate title across the batch",
      message:
        `${groups[key].count} rows use the same normalized title ${JSON.stringify(
          groups[key].title
        )}${
          groups[key].urls.length > 1
            ? ` across ${groups[key].urls.length} different paired URLs`
            : ""
        }. Repeated titles make different pages harder to distinguish.`,
    }));
}

function segmentParts(title: string) {
  return title
    .split(/\s+(?:\||-|–|—|:)\s+/)
    .map(normalizeSpace)
    .filter(Boolean);
}

function detectBoilerplate(
  rows: TitleRow[]
) {
  const nonEmpty =
    rows.filter(
      (row) => row.title
    );

  if (nonEmpty.length < 3) {
    return [] as Boilerplate[];
  }

  const prefixCount =
    Object.create(
      null
    ) as Record<
      string,
      number
    >;
  const suffixCount =
    Object.create(
      null
    ) as Record<
      string,
      number
    >;

  nonEmpty.forEach((row) => {
    const parts =
      segmentParts(
        row.title
      );

    if (
      parts.length < 2
    ) {
      return;
    }

    const prefix =
      parts[0]
        .toLowerCase();
    const suffix =
      parts[
        parts.length - 1
      ].toLowerCase();

    prefixCount[prefix] =
      (prefixCount[prefix] ||
        0) + 1;
    suffixCount[suffix] =
      (suffixCount[suffix] ||
        0) + 1;
  });

  const threshold =
    Math.max(
      3,
      Math.ceil(
        nonEmpty.length *
          0.5
      )
    );
  const output: Boilerplate[] = [];

  Object.keys(prefixCount)
    .filter(
      (key) =>
        prefixCount[key] >=
        threshold
    )
    .forEach((key) => {
      output.push({
        position: "prefix",
        segment: key,
        count:
          prefixCount[key],
      });
    });

  Object.keys(suffixCount)
    .filter(
      (key) =>
        suffixCount[key] >=
        threshold
    )
    .forEach((key) => {
      output.push({
        position: "suffix",
        segment: key,
        count:
          suffixCount[key],
      });
    });

  return output;
}

function boilerplateFindings(
  boilerplate: Boilerplate[],
  totalRows: number
) {
  return boilerplate.map(
    (item): Finding => ({
      severity: "info",
      title:
        `Common ${item.position} segment`,
      message:
        `${JSON.stringify(
          item.segment
        )} appears as a separated ${item.position} segment in ${item.count} of ${totalRows} titles. Repeated branding/section text can be appropriate; verify that enough page-specific text remains to differentiate each result.`,
    })
  );
}

function csvCell(value: string) {
  return `"${value.replace(
    /"/g,
    '""'
  )}"`;
}

function markdown(value: string) {
  return value
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function formatOutput(
  base: Omit<Result, "output">,
  mode: OutputMode
) {
  if (mode === "json") {
    return JSON.stringify(
      base,
      null,
      2
    );
  }

  if (mode === "csv") {
    return [
      [
        "title",
        "url",
        "characters",
        "words",
        "above_review_threshold",
        "target_phrase",
        "brand",
        "findings",
      ]
        .map(csvCell)
        .join(","),
      ...base.rows.map(
        (row) =>
          [
            row.title,
            row.url,
            String(
              row.characters
            ),
            String(row.words),
            String(
              row.aboveReviewThreshold
            ),
            row.targetPhrase,
            row.brandPlacement,
            String(
              row.findings.length
            ),
          ]
            .map(csvCell)
            .join(",")
      ),
    ].join("\n");
  }

  if (mode === "markdown") {
    return [
      "| Title | URL | Characters | Words | Review threshold | Target phrase | Brand | Findings |",
      "| --- | --- | ---: | ---: | --- | --- | --- | ---: |",
      ...base.rows.map(
        (row) =>
          `| ${markdown(
            row.title || "-"
          )} | ${markdown(
            row.url || "-"
          )} | ${
            row.characters
          } | ${row.words} | ${
            row.aboveReviewThreshold
              ? "above"
              : "not above"
          } | ${markdown(
            row.targetPhrase ||
              "-"
          )} | ${markdown(
            row.brandPlacement ||
              "-"
          )} | ${
            row.findings.length
          } |`
      ),
    ].join("\n");
  }

  if (mode === "report") {
    return base.rows
      .map((row, index) => {
        const findings =
          row.findings.length
            ? row.findings.map(
                (finding) =>
                  `- ${finding.severity.toUpperCase()} — ${finding.title}: ${finding.message}`
              )
            : [
                "- No row-level issue from the selected checks.",
              ];

        return [
          `Title ${
            index + 1
          }`,
          row.title ||
            "(empty)",
          row.url
            ? `URL: ${row.url}`
            : "",
          `Characters: ${row.characters}`,
          `Words: ${row.words}`,
          row.targetPhrase
            ? `Target phrase: ${row.targetPhrase}`
            : "",
          row.brandPlacement
            ? `Brand: ${row.brandPlacement}`
            : "",
          "Findings:",
          ...findings,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");
  }

  return [
    "Title tag review",
    `Titles checked: ${base.rows.length}`,
    `Empty titles: ${base.emptyCount}`,
    `Duplicate groups: ${base.duplicateGroups}`,
    `Above local review threshold: ${base.aboveThresholdCount}`,
    `Average characters: ${base.averageLength}`,
    "",
    "Shared separated boilerplate:",
    ...(base.boilerplate.length
      ? base.boilerplate.map(
          (item) =>
            `- ${item.position}: ${JSON.stringify(
              item.segment
            )} in ${item.count} titles`
        )
      : [
          "- No prefix/suffix segment reached the batch reporting threshold.",
        ]),
    "",
    "Important: character counts and the optional review maximum are editing aids. Google does not publish a fixed title-tag character or pixel limit.",
  ].join("\n");
}

function analyzeTitles(options: {
  input: string;
  inputMode: InputMode;
  outputMode: OutputMode;
  targetPhrase: string;
  brandName: string;
  reviewMaximum: number;
  useReviewMaximum: boolean;
  checkTargetPhrase: boolean;
  checkBrand: boolean;
  checkDuplicates: boolean;
  checkSeparators: boolean;
}) {
  if (
    options.useReviewMaximum &&
    (!Number.isInteger(
      options.reviewMaximum
    ) ||
      options.reviewMaximum <
        1)
  ) {
    throw new Error(
      "Local review maximum must be a positive integer."
    );
  }

  const parsed =
    parseRows(
      options.input,
      options.inputMode
    );

  if (!parsed.length) {
    throw new Error(
      "No title rows were found."
    );
  }

  const rows =
    parsed.map((row) =>
      analyzeRow(
        row,
        options
      )
    );
  const findings: Finding[] =
    [];

  rows.forEach((row) => {
    row.findings.forEach(
      (finding) =>
        findings.push(finding)
    );
  });

  const duplicates =
    options.checkDuplicates
      ? duplicateFindings(
          rows
        )
      : [];

  duplicates.forEach(
    (finding) =>
      findings.push(finding)
  );

  const boilerplate =
    detectBoilerplate(
      rows
    );
  boilerplateFindings(
    boilerplate,
    rows.length
  ).forEach((finding) =>
    findings.push(finding)
  );

  if (
    options.inputMode ===
      "html" &&
    rows.length > 1
  ) {
    findings.push({
      severity: "high",
      title:
        "Multiple title elements found in one pasted HTML document",
      message:
        `${rows.length} <title> elements were extracted. A document should have one document title; multiple elements make the source ambiguous and should be corrected.`,
    });
  }

  const totalLength =
    rows.reduce(
      (sum, row) =>
        sum +
        row.characters,
      0
    );

  const base: Omit<
    Result,
    "output"
  > = {
    rows,
    findings,
    duplicateGroups:
      duplicates.length,
    averageLength:
      rows.length
        ? Math.round(
            totalLength /
              rows.length
          )
        : 0,
    aboveThresholdCount:
      rows.filter(
        (row) =>
          row.aboveReviewThreshold
      ).length,
    emptyCount:
      rows.filter(
        (row) =>
          !row.title
      ).length,
    boilerplate,
  };

  return {
    ...base,
    output: formatOutput(
      base,
      options.outputMode
    ),
  };
}

export default function ToolClient() {
  const [input, setInput] =
    useState("");
  const [inputMode, setInputMode] =
    useState<InputMode>("titles");
  const [outputMode, setOutputMode] =
    useState<OutputMode>("summary");
  const [targetPhrase, setTargetPhrase] =
    useState("");
  const [brandName, setBrandName] =
    useState("");
  const [reviewMaximum, setReviewMaximum] =
    useState(65);
  const [
    useReviewMaximum,
    setUseReviewMaximum,
  ] = useState(true);
  const [
    checkTargetPhrase,
    setCheckTargetPhrase,
  ] = useState(false);
  const [
    checkBrand,
    setCheckBrand,
  ] = useState(false);
  const [
    checkDuplicates,
    setCheckDuplicates,
  ] = useState(true);
  const [
    checkSeparators,
    setCheckSeparators,
  ] = useState(true);
  const [result, setResult] =
    useState<Result | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const highCount =
    useMemo(
      () =>
        result
          ? result.findings.filter(
              (finding) =>
                finding.severity ===
                "high"
            ).length
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
      setError(
        "Enter title tags, title/URL pairs or HTML."
      );
      setResult(null);
      return;
    }

    try {
      setResult(
        analyzeTitles({
          input,
          inputMode,
          outputMode,
          targetPhrase,
          brandName,
          reviewMaximum,
          useReviewMaximum,
          checkTargetPhrase,
          checkBrand,
          checkDuplicates,
          checkSeparators,
        })
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to review these titles."
      );
    }
  };

  const loadExample = () => {
    setInput(
      SAMPLE_TITLES
    );
    setInputMode("titles");
    setOutputMode("summary");
    setTargetPhrase(
      "webhook retry policy"
    );
    setBrandName(
      "Example Docs"
    );
    setReviewMaximum(65);
    setUseReviewMaximum(true);
    setCheckTargetPhrase(true);
    setCheckBrand(true);
    setCheckDuplicates(true);
    setCheckSeparators(true);
    clear();
  };

  const reset = () => {
    setInput("");
    setInputMode("titles");
    setOutputMode("summary");
    setTargetPhrase("");
    setBrandName("");
    setReviewMaximum(65);
    setUseReviewMaximum(true);
    setCheckTargetPhrase(false);
    setCheckBrand(false);
    setCheckDuplicates(true);
    setCheckSeparators(true);
    clear();
  };

  const copy = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setError(
        "The title review could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Title Tag Length Checker"
      description="Count title length, but do not stop there. Audit a batch for empty/generic titles, duplicates, shared boilerplate, repeated branding and optional target phrases while keeping Google's title-link rewriting and lack of a fixed title limit explicit."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <YoryantraSelect
            label="Input"
            value={inputMode}
            onChange={(value: string) => {
              setInputMode(
                value as InputMode
              );
              clear();
            }}
            options={[
              {
                label: "One title per line",
                value: "titles",
              },
              {
                label: "Alternating title + URL lines",
                value: "pairs",
              },
              {
                label: "HTML source (<title>)",
                value: "html",
              },
            ]}
          />

          <YoryantraSelect
            label="Report format"
            value={outputMode}
            onChange={(value: string) => {
              setOutputMode(
                value as OutputMode
              );
              clear();
            }}
            options={[
              {
                label: "Batch summary",
                value: "summary",
              },
              {
                label: "Per-title report",
                value: "report",
              },
              {
                label: "CSV",
                value: "csv",
              },
              {
                label: "Markdown",
                value: "markdown",
              },
              {
                label: "JSON",
                value: "json",
              },
            ]}
          />
        </div>

        <textarea
          value={input}
          onChange={(event: {
            target: { value: string };
          }) => {
            setInput(
              event.target.value
            );
            clear();
          }}
          rows={13}
          placeholder={
            inputMode === "html"
              ? "<html><head><title>Webhook Retry Policy | Example Docs</title></head></html>"
              : SAMPLE_TITLES
          }
          spellCheck={false}
          className="mt-5 w-full rounded-xl border border-gray-300 p-4 text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        {inputMode === "pairs" ? (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Pair mode expects a title on one line and its URL on the next. Repeat
            that two-line pattern for each page.
          </p>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-gray-900">
              Local length review maximum
            </label>
            <input
              type="number"
              min={1}
              value={reviewMaximum}
              onChange={(event: {
                target: {
                  value: string;
                };
              }) => {
                setReviewMaximum(
                  Number(
                    event.target.value
                  )
                );
                clear();
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3"
            />
            <label className="mt-3 flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={
                  useReviewMaximum
                }
                onChange={(event: {
                  target: {
                    checked: boolean;
                  };
                }) => {
                  setUseReviewMaximum(
                    event.target.checked
                  );
                  clear();
                }}
                className="mt-1"
              />
              <span>
                Flag titles above my
                editing threshold
              </span>
            </label>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Optional target phrase
            </label>
            <input
              value={targetPhrase}
              onChange={(event: {
                target: {
                  value: string;
                };
              }) => {
                setTargetPhrase(
                  event.target.value
                );
                clear();
              }}
              placeholder="title tag length checker"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3"
            />
            <label className="mt-3 flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={
                  checkTargetPhrase
                }
                onChange={(event: {
                  target: {
                    checked: boolean;
                  };
                }) => {
                  setCheckTargetPhrase(
                    event.target.checked
                  );
                  clear();
                }}
                className="mt-1"
              />
              <span>
                Review exact phrase
                usage
              </span>
            </label>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-900">
              Optional brand/site name
            </label>
            <input
              value={brandName}
              onChange={(event: {
                target: {
                  value: string;
                };
              }) => {
                setBrandName(
                  event.target.value
                );
                clear();
              }}
              placeholder="Example Docs"
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3"
            />
            <label className="mt-3 flex items-start gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={
                  checkBrand
                }
                onChange={(event: {
                  target: {
                    checked: boolean;
                  };
                }) => {
                  setCheckBrand(
                    event.target.checked
                  );
                  clear();
                }}
                className="mt-1"
              />
              <span>
                Review brand placement
                and repetition
              </span>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Toggle
            checked={checkDuplicates}
            onChange={(value) => {
              setCheckDuplicates(
                value
              );
              clear();
            }}
            title="Check duplicate titles"
            text="Compares normalized text across the entire batch."
          />
          <Toggle
            checked={checkSeparators}
            onChange={(value) => {
              setCheckSeparators(
                value
              );
              clear();
            }}
            title="Check separator/template artifacts"
            text="Looks for empty/repeated segments such as ||, trailing pipes and separator-heavy titles."
          />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          The number above is <strong>your editing threshold</strong>, not
          Google&apos;s. Google does not publish a fixed title character or pixel
          limit; title links can be truncated or generated from other page
          signals.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={run}
          className="yoryantra-btn"
        >
          Audit Title Tags
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Batch Example
        </button>
        <button
          type="button"
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat
              label="Titles"
              value={String(
                result.rows.length
              )}
            />
            <Stat
              label="Average chars"
              value={String(
                result.averageLength
              )}
            />
            <Stat
              label="Above threshold"
              value={String(
                result.aboveThresholdCount
              )}
            />
            <Stat
              label="Duplicate groups"
              value={String(
                result.duplicateGroups
              )}
            />
            <Stat
              label="High findings"
              value={String(
                highCount
              )}
            />
          </div>

          {result.boilerplate.length ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-gray-900">
                Shared title segments
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                This is not automatically a problem. It is a batch-level view
                of repeated prefix/suffix segments so you can see whether
                branding or section boilerplate is crowding out unique page
                wording.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-900">
                {result.boilerplate.map(
                  (item, index) => (
                    <li
                      key={`${item.position}-${item.segment}-${index}`}
                    >
                      {item.position}:{" "}
                      <code>
                        {item.segment}
                      </code>{" "}
                      in {item.count} titles
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            {result.rows.map(
              (row, index) => (
                <div
                  key={`${row.index}-${index}`}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Title {index + 1}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold text-gray-900">
                        {row.title ||
                          "(empty title)"}
                      </h3>
                      {row.url ? (
                        <p className="mt-1 break-all text-xs text-gray-500">
                          {row.url}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-sm text-gray-500">
                      {row.characters} chars ·{" "}
                      {row.words} words
                    </div>
                  </div>

                  {(row.targetPhrase ||
                    row.brandPlacement) ? (
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {row.targetPhrase ? (
                        <Badge
                          text={`Phrase: ${row.targetPhrase}`}
                        />
                      ) : null}
                      {row.brandPlacement ? (
                        <Badge
                          text={`Brand: ${row.brandPlacement}`}
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {row.findings.length ? (
                    <ul className="mt-4 list-disc space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 pl-9 text-sm leading-relaxed text-gray-700">
                      {row.findings.map(
                        (
                          finding,
                          findingIndex
                        ) => (
                          <li
                            key={`${finding.title}-${findingIndex}`}
                          >
                            <strong>
                              {finding.title}:
                            </strong>{" "}
                            {finding.message}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">
                      No row-level issue from the selected checks.
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Batch output
              </h3>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>
            <pre className="yoryantra-output mt-4 min-h-[280px] max-h-[700px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.output}
            </pre>
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Title analysis runs on the text or HTML you paste in your browser. Paired
        URLs are not fetched, live headings are not inspected, and Google is not
        queried. Site-wide analytics or advertising scripts, if enabled, are
        separate from that local analysis.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Length Number Is a Review Aid, Not the Verdict
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Two titles can both contain 55 characters while one precisely
            identifies the page and the other wastes half its space repeating
            brand/category boilerplate. Conversely, a longer technical title
            can be the clearest accurate description of a specific tool or
            document.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Length stays visible without turning an editing threshold into a fake
            pass/fail rule. If you set a local maximum, the finding is labelled
            as your editing cutoff—not as a Google limit.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Google Does Not Promise to Use Your &lt;title&gt; Verbatim
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Google generates title links automatically. Its documented sources
            can include the HTML title element, the main visual title, heading
            elements, <code>og:title</code>, prominent page text, anchor text
            and other signals.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            So a preview that says “this is exactly what Google will show” is
            misleading. Improve the source title, then compare the real page
            signals when Google chooses a different title link.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Bulk Auditing Reveals Problems a Single-Title Counter Cannot See
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The most valuable issue on a 200-page site may not be any one long
            title. It may be 60 category pages sharing the exact same title,
            or every title starting with the same section name before the
            unique subject appears.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Duplicate-title and shared-segment reporting are therefore
            batch-level checks. Common suffixes such as a site name are normal;
            the question is whether the page-specific portion still lets users
            distinguish each result.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Boilerplate Is Useful Until It Overwhelms the Unique Part
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700">
            <div>
              <strong>Useful:</strong>{" "}
              <code>Webhook Retry Policy | Example Docs</code>
            </div>
            <div>
              <strong>Weak differentiation:</strong>{" "}
              <code>Docs | API | Integrations | Webhooks | Example Docs</code>
            </div>
          </div>
          <p className="mt-4 leading-relaxed text-gray-700">
            Branding is not the enemy. Repetition becomes a problem when users
            must scan past several generic segments before discovering what the
            page actually contains.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Exact Target Phrases Are Optional, Not a Pass/Fail SEO Rule
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The optional phrase check is editorial QA—for example, confirming that
            a product name or required topic made it into a generated title.
            A missing phrase is reported as information rather than treated as
            an SEO failure.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Search language is flexible. A natural synonym or clearer wording
            may serve the page better than exact-match repetition.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            HTML Mode Checks the Document Title Itself
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pasting HTML is useful when debugging generated head markup. A browser
            HTML parser reads the <code>&lt;title&gt;</code> elements and resolves
            character references the same way normal HTML parsing does.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Pasted source still cannot show later JavaScript mutations or compare the
            document title with a live H1, <code>og:title</code>, anchor text or
            other page signals. Inspect the rendered page when source and live
            DOM can differ.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Browser HTML parsing is deliberately error-tolerant. Extracting a
            title successfully does not prove the surrounding markup is
            conforming HTML; it only shows what the browser parser recovered
            from the pasted source.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Better Order for Reviewing Titles
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>
              Confirm the title accurately identifies the page before thinking
              about length.
            </li>
            <li>
              Check whether another important page already uses the same title.
            </li>
            <li>
              Remove empty template segments, needless repetition and stale
              boilerplate.
            </li>
            <li>
              Make the unique topic understandable even if the visible title
              link is shortened.
            </li>
            <li>
              Compare the real page title with the H1/main visual title when
              Google rewriting or user confusion is the problem.
            </li>
          </ol>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="Google: Influencing title links"
            href="https://developers.google.com/search/docs/appearance/title-link"
            text="Google's current guidance on descriptive titles, boilerplate, title-link sources, truncation and automated title-link generation."
          />
          <ReferenceCard
            title="WHATWG HTML: the title element"
            href="https://html.spec.whatwg.org/multipage/semantics.html#the-title-element"
            text="The HTML definition of the document title and its role in representing the document in user interfaces."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Check the Rest of the Search Snippet
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/title-tag-length-checker" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  text,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  text: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event: {
          target: {
            checked: boolean;
          };
        }) =>
          onChange(
            event.target.checked
          )
        }
        className="mt-1"
      />
      <span>
        <strong className="text-gray-900">
          {title}
        </strong>
        <span className="mt-1 block text-gray-500">
          {text}
        </span>
      </span>
    </label>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function Badge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
      {text}
    </span>
  );
}

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {text}
      </p>
    </div>
  );
}
