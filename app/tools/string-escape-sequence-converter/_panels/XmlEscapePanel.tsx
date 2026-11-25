"use client";

import { useEffect, useMemo, useState } from "react";
import type { WorkflowPanelProps } from "../workflow-types";
import TransferText from "./TransferText";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "escape" | "unescape" | "inspect" | "normalize";
type QuoteMode = "both" | "double" | "single" | "none";
type OutputMode = "text" | "json" | "markdown" | "csv" | "checklist";
type NewlineMode = "preserve" | "lf" | "crlf";
type XmlVersion = "1.0" | "1.1";

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

export default function XmlEscapePanel({ incoming, onSend }: WorkflowPanelProps) {
  const [input, setInput] = useState("");
  const [actionMode, setActionMode] = useState<ActionMode>("escape");
  const [quoteMode, setQuoteMode] = useState<QuoteMode>("both");
  const [outputMode, setOutputMode] = useState<OutputMode>("text");
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("preserve");
  const [xmlVersion, setXmlVersion] = useState<XmlVersion>("1.0");
  const [trimInput, setTrimInput] = useState(false);
  const [avoidDoubleEscaping, setAvoidDoubleEscaping] = useState(true);
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
      xmlVersion,
      trimInput,
      avoidDoubleEscaping,
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
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The output could not be copied. Select it and copy it manually.");
    }
  };

  const loadExample = () => {
    setInput(sampleInput);
    setActionMode("escape");
    setQuoteMode("both");
    setOutputMode("text");
    setNewlineMode("preserve");
    setXmlVersion("1.0");
    setTrimInput(false);
    setAvoidDoubleEscaping(true);
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
    setXmlVersion("1.0");
    setTrimInput(false);
    setAvoidDoubleEscaping(true);
    setWarnUnescapedAmpersands(true);
    setWarnAngleBrackets(true);
    setWarnUnknownEntities(true);
    setWarnControlCharacters(true);
    clearResult();
  };

  useEffect(() => {
    if (!incoming) return;
    setInput(incoming.value);
    setResult(null); setOutput(""); setError(""); setCopied(false);
  }, [incoming]);

  return (
    <div className="min-w-0">
      <p className="mb-6 leading-relaxed text-gray-600">Escape XML character data or decode valid entity references with explicit XML 1.0 and 1.1 character rules.</p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div>
          <div className="mb-4">
            <label htmlFor="escape-xml-input" className="block text-sm font-semibold text-gray-900">XML Text or Entity Text</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste XML content, RSS text, SVG fragments, SOAP payload values, sitemap text, or already escaped XML entities.
            </p>
          </div>

          <textarea
            id="escape-xml-input"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="w-full min-w-0 min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)] placeholder:text-gray-400 text-gray-900"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
            width="wide"
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
            width="wide"
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
            width="wide"
              label="XML Version"
              value={xmlVersion}
              onChange={(value) => {
                setXmlVersion(value as XmlVersion);
                clearResult();
              }}
              options={[
                { label: "XML 1.0 (default)", value: "1.0" },
                { label: "XML 1.1", value: "1.1" },
              ]}
            />

            <YoryantraSelect
            width="wide"
              label="Output"
              value={outputMode}
              onChange={(value) => {
                const mode = value as OutputMode;
                setOutputMode(mode);
                if (result) {
                  const nextOutput = formatOutput(result, mode, actionMode, xmlVersion);
                  setResult({ ...result, output: nextOutput });
                  setOutput(nextOutput);
                }
                setCopied(false);
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
            width="wide"
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

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimInput} onChange={value => { setTrimInput(value); clearResult(); }} label="Trim outer whitespace" />
          <Toggle checked={avoidDoubleEscaping} onChange={value => { setAvoidDoubleEscaping(value); clearResult(); }} label="Avoid double-escaping existing entities" />
          <Toggle checked={warnUnescapedAmpersands} onChange={value => { setWarnUnescapedAmpersands(value); clearResult(); }} label="Warn about unescaped ampersands" />
          <Toggle checked={warnAngleBrackets} onChange={value => { setWarnAngleBrackets(value); clearResult(); }} label="Warn about angle brackets" />
          <Toggle checked={warnUnknownEntities} onChange={value => { setWarnUnknownEntities(value); clearResult(); }} label="Warn about unknown entities" />
          <Toggle checked={warnControlCharacters} onChange={value => { setWarnControlCharacters(value); clearResult(); }} label="Warn about control characters" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These checks apply to character data and entity references. They do not parse element structure, namespaces, DTD declarations, schemas, or external entities.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processXml}
          className="yoryantra-btn"
        >
          Convert XML Text
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? <p role="alert" className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-red-700">{error}</p> : null}

      {notes.length ? (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((issue, index) => (
              <div
                key={`${issue.title}-${index}`}
                className="min-w-0"
              >
                <p className={`text-sm font-semibold ${issue.severity === "high" ? "text-red-900" : issue.severity === "warning" ? "text-amber-900" : "text-gray-900"}`}>{issue.title}</p>
                <p className={`mt-1 text-sm leading-6 ${issue.severity === "high" ? "text-red-700" : issue.severity === "warning" ? "text-amber-800" : "text-gray-600"}`}>{issue.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 min-w-0">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Output</h3>
            <p className="mt-1 text-sm text-gray-500">Converted XML text or formatted inspection result.</p>
          </div>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!result || output.length === 0}
            className="yoryantra-btn-outline shrink-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy Output"}
          </button>
        </div>

        {result ? (
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
            <StatCard label="Input characters" value={String(result.inputLength)} />
            <StatCard label="Output characters" value={String(result.outputLength)} />
            <StatCard label="Entities found" value={String(result.entityCount)} />
            <StatCard label="XML-sensitive chars" value={String(result.specialCharacterCount)} />
          </div>
        ) : null}

        <pre className="mt-4 max-h-[520px] overflow-auto yoryantra-output min-h-[220px] whitespace-pre-wrap break-words font-mono text-sm leading-6 text-gray-900">
          {result ? (output || "(empty string)") : "Converted XML text or inspection output will appear here."}
        </pre>
      </div>

      {result?.rows.length ? (
        <div className="mt-6">
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

      {(result && !result.issues.some(issue => issue.severity === "high")) ? (
        <TransferText source="xml" value={result.convertedText} onSend={onSend} />
      ) : null}

      <section className="mt-12 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Escape the text value, not an entire XML document</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            In element character data, <code className="rounded bg-gray-100 px-1 py-0.5">&amp;</code> and <code className="rounded bg-gray-100 px-1 py-0.5">&lt;</code> have markup meaning and must be escaped when they are literal text. Quotes matter when they match an attribute delimiter. Escaping a complete XML fragment will also escape its tags, so this page is for text values and entity references rather than structural XML editing.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start text-sm leading-6 text-gray-700">
            <p className="font-semibold text-gray-900">Only five entities are predefined by XML</p>
            <p className="mt-2"><code className="rounded bg-gray-100 px-1 py-0.5">&amp;amp;</code>, <code className="rounded bg-gray-100 px-1 py-0.5">&amp;lt;</code>, <code className="rounded bg-gray-100 px-1 py-0.5">&amp;gt;</code>, <code className="rounded bg-gray-100 px-1 py-0.5">&amp;quot;</code>, and <code className="rounded bg-gray-100 px-1 py-0.5">&amp;apos;</code> are available without a DTD declaration. HTML names such as <code className="rounded bg-gray-100 px-1 py-0.5">&amp;nbsp;</code> are not automatically XML entities.</p>
          </div>
          <div className="self-start text-sm leading-6 text-amber-900">
            <p className="font-semibold">“Avoid double escaping” is deliberately strict</p>
            <p className="mt-2">Only the five predefined names and numeric references that are valid for the selected XML version are preserved. Unknown named references are escaped as text instead of being allowed to produce undeclared entities.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">XML 1.0 and XML 1.1 differ around control characters</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            XML 1.0 rejects most C0 controls even when written as numeric references. XML 1.1 permits references to more control characters, but many of them are restricted and still cannot appear literally. In XML 1.1 mode, restricted numeric references stay encoded when unescaping so the output does not quietly become ill-formed XML text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What normalization can and cannot establish</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Normalize mode decodes references this page can safely interpret, then escapes the resulting character data again. It does not prove that an XML document is well-formed, resolve internal or external DTD entities, validate namespaces, apply a schema, or check an RSS, SOAP, SVG, sitemap, or application-specific vocabulary.
          </p>
        </div>

        <div className="text-sm leading-6 text-gray-700">
          <p className="font-semibold text-gray-900">External entity boundary</p>
          <p className="mt-2">No DTD is fetched and no external entity is resolved here. That does not protect the generated text from XXE or entity-expansion behavior in a separate XML parser that later consumes a full document; configure that parser independently.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Line-ending option is not parser-level XML normalization</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            LF and CRLF options only rewrite pasted CR/LF sequences. XML processors have their own end-of-line normalization rules, and XML 1.1 additionally recognizes NEL and U+2028. This page does not simulate the complete parser normalization stage.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">XML references used for these boundaries</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The <a href="https://www.w3.org/TR/xml/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">XML 1.0 Recommendation</a> defines the five predefined entities, legal characters and character references. <a href="https://www.w3.org/TR/xml11/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">XML 1.1</a> expands the character-reference model while keeping NUL forbidden and restricting direct use of several control ranges.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/xml-escape-unescape" presentation="links" />
          </div>
        </div>
      </section>
    </div>
  );
}

function buildResult(options: {
  input: string;
  actionMode: ActionMode;
  quoteMode: QuoteMode;
  outputMode: OutputMode;
  newlineMode: NewlineMode;
  xmlVersion: XmlVersion;
  trimInput: boolean;
  avoidDoubleEscaping: boolean;
  warnUnescapedAmpersands: boolean;
  warnAngleBrackets: boolean;
  warnUnknownEntities: boolean;
  warnControlCharacters: boolean;
}): Result {
  const prepared = normalizeNewlines(options.trimInput ? options.input.trim() : options.input, options.newlineMode);
  const rows = summarizeEntities(prepared, options.xmlVersion);
  const issues: Issue[] = [];
  const entityCount = rows.reduce((sum, row) => sum + row.count, 0);
  const specialCharacterCount = countSpecialCharacters(prepared);

  const forbiddenLiteral = findForbiddenLiteralCharacters(prepared, options.xmlVersion);
  const restrictedLiteral = options.xmlVersion === "1.1" ? findXml11RestrictedLiteralCharacters(prepared) : [];
  if (options.warnControlCharacters && forbiddenLiteral.length) {
    issues.push({ severity: "high", title: `Characters forbidden by XML ${options.xmlVersion}`, message: `${forbiddenLiteral.length} character${forbiddenLiteral.length === 1 ? "" : "s"} cannot appear in the selected XML version, even as ordinary literal text. XML 1.0 also forbids most of these values as numeric references.` });
  }
  if (options.warnControlCharacters && restrictedLiteral.length) {
    issues.push({
      severity: options.actionMode === "escape" || options.actionMode === "normalize" ? "warning" : "high",
      title: "XML 1.1 restricted controls are present literally",
      message: options.actionMode === "escape" || options.actionMode === "normalize"
        ? `${restrictedLiteral.length} restricted control character${restrictedLiteral.length === 1 ? " will" : "s will"} be emitted as numeric character references.`
        : `${restrictedLiteral.length} restricted control character${restrictedLiteral.length === 1 ? " is" : "s are"} not allowed literally in XML 1.1; keep them as numeric references.`,
    });
  }

  const invalidNumeric = findInvalidNumericReferences(prepared, options.xmlVersion);
  if (invalidNumeric.length) {
    issues.push({ severity: "high", title: "Invalid numeric character references", message: `Found ${invalidNumeric.slice(0, 4).join(", ")}${invalidNumeric.length > 4 ? " and more" : ""}. Those code points are not legal character references in XML ${options.xmlVersion}.` });
  }

  if (options.warnUnescapedAmpersands) {
    const badAmpersands = countBareAmpersands(prepared);
    if (badAmpersands > 0) issues.push({ severity: "warning", title: "Bare ampersands found", message: `${badAmpersands} ampersand${badAmpersands === 1 ? " is" : "s are"} not the start of a syntactic entity or numeric character reference. Literal ampersands in XML character data need &amp;amp;.` });
  }

  if (options.warnAngleBrackets && /[<>]/.test(prepared) && options.actionMode !== "unescape") {
    issues.push({ severity: "info", title: "Markup delimiters are present", message: "Angle brackets may be actual XML markup or literal text. Escaping the whole input will turn tags into text; decide which part is the value before copying." });
  }

  if (options.warnUnknownEntities) {
    const unknown = findUnknownEntities(prepared);
    if (unknown.length) issues.push({ severity: "warning", title: "Named entities are not predefined", message: `Found ${unknown.slice(0, 4).join(", ")}${unknown.length > 4 ? " and more" : ""}. XML only predefines amp, lt, gt, quot and apos; other names require a DTD declaration.` });
  }

  let convertedText = prepared;
  if (options.actionMode === "escape") convertedText = escapeXml(prepared, options);
  else if (options.actionMode === "unescape") convertedText = unescapeXml(prepared, options.xmlVersion);
  else if (options.actionMode === "normalize") convertedText = escapeXml(unescapeXml(prepared, options.xmlVersion), options);

  const result: Result = { output: "", convertedText, rows, issues, inputLength: prepared.length, outputLength: convertedText.length, entityCount, specialCharacterCount };
  return { ...result, output: formatOutput(result, options.outputMode, options.actionMode, options.xmlVersion) };
}

function escapeXml(text: string, options: { quoteMode: QuoteMode; avoidDoubleEscaping: boolean; xmlVersion: XmlVersion }) {
  let output = options.avoidDoubleEscaping ? preserveOnlyValidReferences(text, options.xmlVersion) : text.replace(/&/g, "&amp;");
  output = output.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (options.quoteMode === "both" || options.quoteMode === "double") output = output.replace(/"/g, "&quot;");
  if (options.quoteMode === "both" || options.quoteMode === "single") output = output.replace(/'/g, "&apos;");

  if (options.xmlVersion === "1.1") {
    output = Array.from(output).map((character) => {
      const codePoint = character.codePointAt(0) ?? 0;
      return isXml11Restricted(codePoint) ? `&#x${codePoint.toString(16).toUpperCase()};` : character;
    }).join("");
  }
  return output;
}

function preserveOnlyValidReferences(text: string, version: XmlVersion) {
  return text.replace(/&(#\d+;|#x[0-9a-fA-F]+;|[A-Za-z][A-Za-z0-9_.-]*;)?/g, (match, body: string | undefined) => {
    if (!body) return "&amp;";
    const reference = `&${body}`;
    if (/^&(amp|lt|gt|quot|apos);$/.test(reference)) return reference;
    const value = numericReferenceValue(reference);
    if (/^&#/.test(reference) && value !== null && isXmlCharacter(value, version)) return reference;
    return `&amp;${body}`;
  });
}

function unescapeXml(text: string, version: XmlVersion) {
  return text.replace(/&(#\d+|#x[0-9a-fA-F]+|[A-Za-z][A-Za-z0-9_.-]*);/g, (match, entity: string) => {
    if (!entity.startsWith("#")) return namedEntities[entity] ?? match;
    const value = numericReferenceValue(match);
    if (value === null || !isXmlCharacter(value, version)) return match;
    if (version === "1.1" && isXml11Restricted(value)) return match;
    try { return String.fromCodePoint(value); } catch { return match; }
  });
}

function numericReferenceValue(reference: string): number | null {
  const hex = /^&#x([0-9a-fA-F]+);$/.exec(reference);
  const dec = /^&#(\d+);$/.exec(reference);
  const raw = hex ? Number.parseInt(hex[1], 16) : dec ? Number.parseInt(dec[1], 10) : Number.NaN;
  return Number.isFinite(raw) && raw >= 0 && raw <= 0x10ffff ? raw : null;
}

function isXmlCharacter(value: number, version: XmlVersion) {
  if (version === "1.1") return (value >= 0x1 && value <= 0xd7ff) || (value >= 0xe000 && value <= 0xfffd) || (value >= 0x10000 && value <= 0x10ffff);
  return value === 0x9 || value === 0xa || value === 0xd || (value >= 0x20 && value <= 0xd7ff) || (value >= 0xe000 && value <= 0xfffd) || (value >= 0x10000 && value <= 0x10ffff);
}

function isXml11Restricted(value: number) {
  return (value >= 0x1 && value <= 0x8) || value === 0xb || value === 0xc || (value >= 0xe && value <= 0x1f) || (value >= 0x7f && value <= 0x84) || (value >= 0x86 && value <= 0x9f);
}

function findForbiddenLiteralCharacters(text: string, version: XmlVersion) {
  const invalid: number[] = [];
  for (const character of Array.from(text)) {
    const value = character.codePointAt(0) ?? 0;
    if (!isXmlCharacter(value, version)) invalid.push(value);
  }
  return invalid;
}

function findXml11RestrictedLiteralCharacters(text: string) {
  const restricted: number[] = [];
  for (const character of Array.from(text)) {
    const value = character.codePointAt(0) ?? 0;
    if (isXml11Restricted(value)) restricted.push(value);
  }
  return restricted;
}

function findInvalidNumericReferences(text: string, version: XmlVersion) {
  const refs = text.match(/&#\d+;|&#x[0-9a-fA-F]+;/g) ?? [];
  return refs.filter((reference) => {
    const value = numericReferenceValue(reference);
    return value === null || !isXmlCharacter(value, version);
  });
}

function summarizeEntities(text: string, version: XmlVersion): EntityRow[] {
  const counts = new Map<string, number>();
  const matches = text.match(/&(#\d+|#x[0-9a-fA-F]+|[A-Za-z][A-Za-z0-9_.-]*);/g) ?? [];
  for (const entity of matches) counts.set(entity, (counts.get(entity) ?? 0) + 1);
  return Array.from(counts.entries()).map(([entity, count]) => {
    const value = unescapeXml(entity, version);
    let note = "Decoded by the selected XML rules";
    if (/^&[A-Za-z]/.test(entity) && value === entity) note = "Not one of XML's five predefined entities";
    if (/^&#/.test(entity) && value === entity) note = "Preserved because the reference is invalid or restricted";
    return { entity, value, count, note };
  });
}

function findUnknownEntities(text: string) {
  const matches = text.match(/&([A-Za-z][A-Za-z0-9_.-]*);/g) ?? [];
  return Array.from(new Set(matches.filter((entity) => !Object.prototype.hasOwnProperty.call(namedEntities, entity.slice(1, -1)))));
}

function countBareAmpersands(text: string) { return text.match(/&(?!#\d+;|#x[0-9a-fA-F]+;|[A-Za-z][A-Za-z0-9_.-]*;)/g)?.length ?? 0; }
function countSpecialCharacters(text: string) { return (text.match(/[<>&"']/g) ?? []).length; }

function normalizeNewlines(text: string, mode: NewlineMode) {
  if (mode === "preserve") return text;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return mode === "crlf" ? normalized.replace(/\n/g, "\r\n") : normalized;
}

function formatOutput(result: Result, outputMode: OutputMode, actionMode: ActionMode, xmlVersion: XmlVersion) {
  if (outputMode === "text") return result.convertedText;
  if (outputMode === "json") return JSON.stringify({ action: actionMode, xmlVersion, inputLength: result.inputLength, outputLength: result.outputLength, entityCount: result.entityCount, specialCharacterCount: result.specialCharacterCount, convertedText: result.convertedText, entities: result.rows, issues: result.issues }, null, 2);
  if (outputMode === "markdown") {
    const lines = ["| Entity | Value | Count | Interpretation |", "|---|---|---:|---|"];
    if (result.rows.length) result.rows.forEach((row) => lines.push(`| ${row.entity} | ${row.value.replace(/\|/g, "\\|")} | ${row.count} | ${row.note} |`));
    else lines.push("| None | - | 0 | No entity references found |");
    return lines.join("\n");
  }
  if (outputMode === "csv") {
    const rows = [["entity", "value", "count", "note"], ...result.rows.map((row) => [row.entity, row.value, String(row.count), row.note])];
    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }
  return [
    "# XML Character-Data Review", "",
    `- [ ] XML version checked: ${xmlVersion}`,
    `- [ ] Action reviewed: ${actionMode}`,
    `- [ ] Entity references checked: ${result.entityCount}`,
    `- [ ] XML-sensitive characters checked: ${result.specialCharacterCount}`,
    `- [ ] Findings reviewed: ${result.issues.length}`,
    "- [ ] Result tested inside the actual element or attribute context",
  ].join("\n");
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
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[var(--light-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 break-words text-base font-semibold tabular-nums text-gray-900">{value}</p>
    </div>
  );
}

