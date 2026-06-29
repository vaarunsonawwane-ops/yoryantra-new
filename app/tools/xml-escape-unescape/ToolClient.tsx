"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "escape" | "unescape" | "inspect" | "normalize";
type QuoteMode = "both" | "double" | "single" | "none";
type OutputMode = "text" | "json" | "markdown" | "csv" | "checklist";
type NewlineMode = "preserve" | "lf" | "crlf";

type EntityRow = {
  entity: string;
  value: string;
  count: number;
  note: string;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  convertedText: string;
  rows: EntityRow[];
  issues: Issue[];
  inputLength: number;
  outputLength: number;
  entityCount: number;
  specialCharacterCount: number;
};

const sampleInput = `<title>Yoryantra & Encoding Tools</title>
<url>https://yoryantra.com/tools?category=encoding&sort=latest</url>
<description>Use "safe" XML text for RSS, SOAP, SVG, and sitemap snippets.</description>`;

const namedEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("escape");
  const [quoteMode, setQuoteMode] = useState<QuoteMode>("both");
  const [outputMode, setOutputMode] = useState<OutputMode>("text");
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("preserve");
  const [trimInput, setTrimInput] = useState(false);
  const [avoidDoubleEscaping, setAvoidDoubleEscaping] = useState(true);
  const [escapeQuotes, setEscapeQuotes] = useState(true);
  const [escapeApostrophes, setEscapeApostrophes] = useState(true);
  const [warnUnescapedAmpersands, setWarnUnescapedAmpersands] = useState(true);
  const [warnAngleBrackets, setWarnAngleBrackets] = useState(true);
  const [warnUnknownEntities, setWarnUnknownEntities] = useState(true);
  const [warnControlCharacters, setWarnControlCharacters] = useState(true);
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

  const processXml = () => {
    if (!input.length || (trimInput && !input.trim())) {
      setError("Please paste XML text, entity-encoded text, or a snippet to convert.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      actionMode,
      quoteMode,
      outputMode,
      newlineMode,
      trimInput,
      avoidDoubleEscaping,
      escapeQuotes,
      escapeApostrophes,
      warnUnescapedAmpersands,
      warnAngleBrackets,
      warnUnknownEntities,
      warnControlCharacters,
    });

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setActionMode("escape");
    setQuoteMode("both");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setAvoidDoubleEscaping(true);
    setEscapeQuotes(true);
    setEscapeApostrophes(true);
    setWarnUnescapedAmpersands(true);
    setWarnAngleBrackets(true);
    setWarnUnknownEntities(true);
    setWarnControlCharacters(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setActionMode("escape");
    setQuoteMode("both");
    setOutputMode("text");
    setNewlineMode("preserve");
    setTrimInput(false);
    setAvoidDoubleEscaping(true);
    setEscapeQuotes(true);
    setEscapeApostrophes(true);
    setWarnUnescapedAmpersands(true);
    setWarnAngleBrackets(true);
    setWarnUnknownEntities(true);
    setWarnControlCharacters(true);
    clearResult();
  };

  return (
    <ToolShell
      title="XML Escape Unescape"
      description="Escape XML-sensitive characters, decode XML entities, inspect entity usage, and prepare safer XML text for feeds, APIs, SVG, SOAP, and sitemap snippets."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">XML Text or Entity Text</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste XML content, RSS text, SVG fragments, SOAP payload values, sitemap text, or already escaped XML entities.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                setActionMode(value as ActionMode);
                clearResult();
              }}
              options={[
                { label: "Escape XML text", value: "escape" },
                { label: "Unescape XML entities", value: "unescape" },
                { label: "Inspect XML entities", value: "inspect" },
                { label: "Normalize XML text", value: "normalize" },
              ]}
            />

            <YoryantraSelect
              label="Quote Handling"
              value={quoteMode}
              onChange={(value) => {
                setQuoteMode(value as QuoteMode);
                clearResult();
              }}
              options={[
                { label: "Escape double and single quotes", value: "both" },
                { label: "Escape double quotes only", value: "double" },
                { label: "Escape single quotes only", value: "single" },
                { label: "Do not escape quotes", value: "none" },
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
                { label: "Converted text", value: "text" },
                { label: "JSON report", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Line Breaks"
              value={newlineMode}
              onChange={(value) => {
                setNewlineMode(value as NewlineMode);
                clearResult();
              }}
              options={[
                { label: "Preserve input style", value: "preserve" },
                { label: "Normalize to LF", value: "lf" },
                { label: "Normalize to CRLF", value: "crlf" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimInput} onChange={setTrimInput} label="Trim outer whitespace" />
          <Toggle checked={avoidDoubleEscaping} onChange={setAvoidDoubleEscaping} label="Avoid double-escaping existing entities" />
          <Toggle checked={escapeQuotes} onChange={setEscapeQuotes} label="Escape double quotes" />
          <Toggle checked={escapeApostrophes} onChange={setEscapeApostrophes} label="Escape apostrophes" />
          <Toggle checked={warnUnescapedAmpersands} onChange={setWarnUnescapedAmpersands} label="Warn about unescaped ampersands" />
          <Toggle checked={warnAngleBrackets} onChange={setWarnAngleBrackets} label="Warn about angle brackets" />
          <Toggle checked={warnUnknownEntities} onChange={setWarnUnknownEntities} label="Warn about unknown entities" />
          <Toggle checked={warnControlCharacters} onChange={setWarnControlCharacters} label="Warn about control characters" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These checks help catch common XML text issues without trying to validate a full XML document or schema.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processXml}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert XML Text
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Converted XML text or formatted inspection result.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Input characters" value={String(result.inputLength)} />
            <StatCard label="Output characters" value={String(result.outputLength)} />
            <StatCard label="Entities found" value={String(result.entityCount)} />
            <StatCard label="XML-sensitive chars" value={String(result.specialCharacterCount)} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((issue, index) => (
              <div key={`${issue.title}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result?.rows.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Entity Summary</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Entity</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Count</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.rows.map((row) => (
                  <tr key={row.entity}>
                    <td className="px-4 py-3 font-mono text-gray-900">{row.entity}</td>
                    <td className="px-4 py-3 font-mono">{row.value}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Escaping XML Text for Feeds, APIs, and Markup</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            XML uses a few characters as markup. A plain ampersand, less-than sign, quote, or apostrophe can change how a document is parsed when it appears inside text or attributes. Escaping turns those characters into safe entity references such as <code className="rounded bg-gray-100 px-1 py-0.5">&amp;amp;</code>, <code className="rounded bg-gray-100 px-1 py-0.5">&amp;lt;</code>, and <code className="rounded bg-gray-100 px-1 py-0.5">&amp;quot;</code>.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool is built for quick XML text cleanup when you are working with RSS descriptions, SOAP values, SVG snippets, sitemap text, config values, or XML-like API payloads.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When XML Escaping Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Preparing text values for XML attributes or element content.</p>
            <p className="mt-2">Cleaning copied RSS, Atom, SOAP, SVG, sitemap, or configuration snippets.</p>
            <p className="mt-2">Decoding entity-heavy text back into a readable form for review.</p>
            <p className="mt-2">Checking whether text contains unescaped ampersands, angle brackets, or unknown entities.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the XML Escape Unescape Tool</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste XML text, entity text, RSS content, SVG markup, SOAP values, or a sitemap snippet.</li>
            <li>Choose whether to escape, unescape, inspect, or normalize the text.</li>
            <li>Pick quote handling and output format based on where you will copy the result.</li>
            <li>Use the review notes to catch suspicious entities or XML-sensitive characters.</li>
            <li>Copy the converted output when it matches your target format.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">XML Entity Examples</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <div className="font-medium text-gray-900">Ampersand</div>
              <div className="mt-1 font-mono">Input: Yoryantra & Encoding</div>
              <div className="mt-1 font-mono">Escaped: Yoryantra &amp;amp; Encoding</div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-gray-900">Angle brackets</div>
              <div className="mt-1 font-mono">Input: &lt;title&gt;Tools&lt;/title&gt;</div>
              <div className="mt-1 font-mono">Escaped: &amp;lt;title&amp;gt;Tools&amp;lt;/title&amp;gt;</div>
            </div>
            <div className="mt-4">
              <div className="font-medium text-gray-900">Attribute quotes</div>
              <div className="mt-1 font-mono">Input: title="XML tools"</div>
              <div className="mt-1 font-mono">Escaped: title=&amp;quot;XML tools&amp;quot;</div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does XML escaping do?">
              XML escaping replaces markup-sensitive characters with entity references so text can be placed safely inside XML content or attributes.
            </Faq>
            <Faq title="Is XML escaping the same as HTML escaping?">
              They overlap, but XML is stricter and commonly uses the predefined XML entities for ampersand, less-than, greater-than, quotes, and apostrophes.
            </Faq>
            <Faq title="Does this validate a full XML document?">
              No. It converts and inspects text. It does not validate XML structure, schemas, namespaces, DTDs, or feed correctness.
            </Faq>
            <Faq title="Can this decode numeric XML entities?">
              Yes. It can decode decimal entities such as <code>&amp;#65;</code> and hexadecimal entities such as <code>&amp;#x41;</code> when they are valid.
            </Faq>
            <Faq title="Is anything uploaded while escaping XML text?">
              No. The conversion runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/xml-escape-unescape" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  quoteMode: QuoteMode;
  outputMode: OutputMode;
  newlineMode: NewlineMode;
  trimInput: boolean;
  avoidDoubleEscaping: boolean;
  escapeQuotes: boolean;
  escapeApostrophes: boolean;
  warnUnescapedAmpersands: boolean;
  warnAngleBrackets: boolean;
  warnUnknownEntities: boolean;
  warnControlCharacters: boolean;
}): Result {
  const prepared = normalizeNewlines(options.trimInput ? options.input.trim() : options.input, options.newlineMode);
  const rows = summarizeEntities(prepared);
  const issues: Issue[] = [];
  const entityCount = rows.reduce((sum, row) => sum + row.count, 0);
  const specialCharacterCount = countSpecialCharacters(prepared);

  if (options.warnUnescapedAmpersands) {
    const badAmpersands = prepared.match(/&(?!#\d+;|#x[0-9a-fA-F]+;|[A-Za-z][A-Za-z0-9_.-]*;)/g)?.length ?? 0;
    if (badAmpersands > 0) {
      issues.push({
        severity: "warning",
        title: "Unescaped ampersands found",
        message: `${badAmpersands} ampersand character${badAmpersands === 1 ? "" : "s"} may need to be escaped as &amp;amp; inside XML text.`,
      });
    }
  }

  if (options.warnAngleBrackets && /[<>]/.test(prepared) && options.actionMode !== "unescape") {
    issues.push({
      severity: "info",
      title: "Angle brackets detected",
      message: "Angle brackets may be real XML markup or plain text that needs escaping. Review the result before copying it into a document.",
    });
  }

  if (options.warnUnknownEntities) {
    const unknown = findUnknownEntities(prepared);
    if (unknown.length) {
      issues.push({
        severity: "warning",
        title: "Unknown named entities detected",
        message: `Found ${unknown.slice(0, 4).join(", ")}${unknown.length > 4 ? " and more" : ""}. XML only defines a small set of named entities unless a DTD defines more.`,
      });
    }
  }

  if (options.warnControlCharacters && /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(prepared)) {
    issues.push({
      severity: "high",
      title: "Control characters detected",
      message: "Some control characters are not allowed in normal XML text. Remove or replace them before using the value in production XML.",
    });
  }

  let convertedText = prepared;
  if (options.actionMode === "escape") {
    convertedText = escapeXml(prepared, options);
  } else if (options.actionMode === "unescape") {
    convertedText = unescapeXml(prepared);
  } else if (options.actionMode === "normalize") {
    convertedText = escapeXml(unescapeXml(prepared), options);
  }

  const result: Result = {
    output: "",
    convertedText,
    rows,
    issues,
    inputLength: prepared.length,
    outputLength: convertedText.length,
    entityCount,
    specialCharacterCount,
  };

  return {
    ...result,
    output: formatOutput(result, options.outputMode, options.actionMode),
  };
}

function escapeXml(text: string, options: { quoteMode: QuoteMode; avoidDoubleEscaping: boolean; escapeQuotes: boolean; escapeApostrophes: boolean }) {
  let output = options.avoidDoubleEscaping
    ? text.replace(/&(?!#\d+;|#x[0-9a-fA-F]+;|[A-Za-z][A-Za-z0-9_.-]*;)/g, "&amp;")
    : text.replace(/&/g, "&amp;");

  output = output.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const shouldEscapeDouble = options.escapeQuotes && (options.quoteMode === "both" || options.quoteMode === "double");
  const shouldEscapeSingle = options.escapeApostrophes && (options.quoteMode === "both" || options.quoteMode === "single");

  if (shouldEscapeDouble) output = output.replace(/"/g, "&quot;");
  if (shouldEscapeSingle) output = output.replace(/'/g, "&apos;");

  return output;
}

function unescapeXml(text: string) {
  return text.replace(/&(#\d+|#x[0-9a-fA-F]+|[A-Za-z][A-Za-z0-9_.-]*);/g, (match, entity) => {
    if (entity.startsWith("#x")) {
      const value = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(value) ? safeCodePoint(value, match) : match;
    }
    if (entity.startsWith("#")) {
      const value = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(value) ? safeCodePoint(value, match) : match;
    }
    return namedEntities[entity] ?? match;
  });
}

function safeCodePoint(value: number, fallback: string) {
  try {
    return String.fromCodePoint(value);
  } catch {
    return fallback;
  }
}

function summarizeEntities(text: string): EntityRow[] {
  const counts = new Map<string, number>();
  const matches = text.match(/&(#\d+|#x[0-9a-fA-F]+|[A-Za-z][A-Za-z0-9_.-]*);/g) ?? [];
  for (const entity of matches) counts.set(entity, (counts.get(entity) ?? 0) + 1);

  return Array.from(counts.entries()).map(([entity, count]) => {
    const value = unescapeXml(entity);
    return {
      entity,
      value,
      count,
      note: value === entity ? "Not a predefined XML entity" : "Decoded by this tool",
    };
  });
}

function findUnknownEntities(text: string) {
  const matches = text.match(/&([A-Za-z][A-Za-z0-9_.-]*);/g) ?? [];
  return Array.from(new Set(matches.filter((entity) => !Object.prototype.hasOwnProperty.call(namedEntities, entity.slice(1, -1)))));
}

function countSpecialCharacters(text: string) {
  return (text.match(/[<>&"']/g) ?? []).length;
}

function normalizeNewlines(text: string, mode: NewlineMode) {
  if (mode === "preserve") return text;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return mode === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

function formatOutput(result: Result, outputMode: OutputMode, actionMode: ActionMode) {
  if (outputMode === "text") return result.convertedText;

  if (outputMode === "json") {
    return JSON.stringify(
      {
        action: actionMode,
        inputLength: result.inputLength,
        outputLength: result.outputLength,
        entityCount: result.entityCount,
        specialCharacterCount: result.specialCharacterCount,
        convertedText: result.convertedText,
        entities: result.rows,
        issues: result.issues,
      },
      null,
      2,
    );
  }

  if (outputMode === "markdown") {
    const lines = ["| Entity | Value | Count | Note |", "|---|---|---:|---|"];
    if (result.rows.length) {
      result.rows.forEach((row) => lines.push(`| ${row.entity} | ${row.value.replace(/\|/g, "\\|")} | ${row.count} | ${row.note} |`));
    } else {
      lines.push("| None | - | 0 | No XML entities found |");
    }
    return lines.join("\n");
  }

  if (outputMode === "csv") {
    const rows = [["entity", "value", "count", "note"], ...result.rows.map((row) => [row.entity, row.value, String(row.count), row.note])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  const checklist = [
    "# XML Escaping Checklist",
    "",
    `- [ ] Action reviewed: ${actionMode}`,
    `- [ ] Output length checked: ${result.outputLength} characters`,
    `- [ ] Entity count checked: ${result.entityCount}`,
    `- [ ] XML-sensitive characters checked: ${result.specialCharacterCount}`,
    `- [ ] Warnings reviewed: ${result.issues.length}`,
    "- [ ] Result tested in the target XML/RSS/SOAP/SVG context",
  ];
  return checklist.join("\n");
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];
  if (!result.entityCount) {
    notes.push({
      severity: "info",
      title: "No XML entities found",
      message: "The input does not contain visible XML entity references. Use escape mode if you need to prepare plain text for XML.",
    });
  }
  if (result.outputLength > result.inputLength * 2 && result.inputLength > 100) {
    notes.push({
      severity: "info",
      title: "Output grew noticeably",
      message: "Escaped XML can become longer because characters are replaced with entity references. Check field size limits before using it in compact attributes.",
    });
  }
  return notes;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
      />
      <span>{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
