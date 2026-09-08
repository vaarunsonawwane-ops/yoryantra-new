"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "text" | "url" | "query";
type DecodeMode = "component" | "uri" | "safe";
type OutputMode = "summary" | "decoded" | "table" | "json" | "report";
type Severity = "info" | "warning" | "high";

type EscapeItem = {
  sequence: string;
  index: number;
  hex: string;
  decimal: number | null;
  character: string;
  valid: boolean;
  warning: string;
};

type AnalyzerIssue = {
  severity: Severity;
  title: string;
  message: string;
};

type AnalyzerResult = {
  input: string;
  decoded: string;
  output: string;
  escapes: EscapeItem[];
  issues: AnalyzerIssue[];
  inputLength: number;
  decodedLength: number;
  escapeCount: number;
  invalidEscapeCount: number;
  invalidUtf8RunCount: number;
  plusCount: number;
  reservedEscapeCount: number;
  doubleEncodedCount: number;
};

type AnalyzerNote = {
  title: string;
  message: string;
};

const sampleInput =
  "https://example.com/search?q=caf%C3%A9+menu&redirect=https%3A%2F%2Fyoryantra.com%2Ftools%3Ftag%3Dseo&bad=%E0%A4%A";

const reservedCharacters = new Set([
  ":", "/", "?", "#", "[", "]", "@", "!", "$", "&", "'", "(", ")", "*", "+", ",", ";", "=",
]);

const MAX_INPUT_CHARS = 750_000;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [decodeMode, setDecodeMode] = useState<DecodeMode>("safe");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [treatPlusAsSpace, setTreatPlusAsSpace] = useState(false);
  const [highlightReservedEscapes, setHighlightReservedEscapes] = useState(true);
  const [showUtf8Warnings, setShowUtf8Warnings] = useState(true);
  const [preserveInvalidEscapes, setPreserveInvalidEscapes] = useState(true);
  const [result, setResult] = useState<AnalyzerResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (result ? getAnalyzerNotes(result, inputMode, decodeMode, treatPlusAsSpace) : []),
    [result, inputMode, decodeMode, treatPlusAsSpace]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const analyzeEncoding = () => {
    if (input.length === 0) {
      setError("Please enter a URL, query string, or percent-encoded text.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzePercentEncoding(input, {
        inputMode,
        decodeMode,
        outputMode,
        treatPlusAsSpace,
        highlightReservedEscapes,
        showUtf8Warnings,
        preserveInvalidEscapes,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this percent-encoded input."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
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
    setInputMode("url");
    setDecodeMode("safe");
    setOutputMode("summary");
    setTreatPlusAsSpace(false);
    setHighlightReservedEscapes(true);
    setShowUtf8Warnings(true);
    setPreserveInvalidEscapes(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setInputMode("url");
    setDecodeMode("safe");
    setOutputMode("summary");
    setTreatPlusAsSpace(false);
    setHighlightReservedEscapes(true);
    setShowUtf8Warnings(true);
    setPreserveInvalidEscapes(true);
    clearResult();
  };

  return (
    <ToolShell
      title="Percent Encoding Analyzer"
      description="Trace percent escapes, UTF-8 byte runs, malformed sequences, reserved characters, and query plus semantics."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">URL or percent-encoded text</label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleInput}
          spellCheck={false}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Input is analyzed exactly as pasted, including leading or trailing spaces. Percent escapes are byte values, so a single Unicode character may span several %XX sequences.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Interpretation settings</h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input context"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              clearResult();
            }}
            options={[
              { label: "Full URL", value: "url" },
              { label: "Query string / form value", value: "query" },
              { label: "Plain component text", value: "text" },
            ]}
          />

          <YoryantraSelect
            label="Decode behavior"
            value={decodeMode}
            onChange={(value) => {
              setDecodeMode(value as DecodeMode);
              clearResult();
            }}
            options={[
              { label: "Lossless tolerant decode", value: "safe" },
              { label: "decodeURIComponent semantics", value: "component" },
              { label: "decodeURI semantics", value: "uri" },
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
              { label: "Decoded only", value: "decoded" },
              { label: "Escape table", value: "table" },
              { label: "JSON", value: "json" },
              { label: "Detailed report", value: "report" },
            ]}
          />

          <div className="space-y-3 md:col-span-2">
            <CheckboxRow checked={treatPlusAsSpace} label="Treat plus as space in form/query data" onChange={(checked) => { setTreatPlusAsSpace(checked); clearResult(); }} />
            <CheckboxRow checked={highlightReservedEscapes} label="Flag escapes that decode to RFC 3986 reserved characters" onChange={(checked) => { setHighlightReservedEscapes(checked); clearResult(); }} />
            <CheckboxRow checked={showUtf8Warnings} label="Check percent-byte runs for invalid UTF-8" onChange={(checked) => { setShowUtf8Warnings(checked); clearResult(); }} />
            <CheckboxRow checked={preserveInvalidEscapes} label="Keep malformed percent text in tolerant output" onChange={(checked) => { setPreserveInvalidEscapes(checked); clearResult(); }} />
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          For a full URL, plus-to-space applies only inside the query portion. A literal plus in the path is left alone.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeEncoding} className="yoryantra-btn min-h-11 whitespace-nowrap">Analyze Percent Encoding</button>
        <button onClick={copyOutput} className="yoryantra-btn min-h-11 whitespace-nowrap" disabled={!output}>{copied ? "Copied" : "Copy Output"}</button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-11 whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Percent escapes" value={result.escapeCount.toLocaleString()} />
          <SummaryCard label="Malformed" value={result.invalidEscapeCount.toLocaleString()} />
          <SummaryCard label="Invalid UTF-8 runs" value={result.invalidUtf8RunCount.toLocaleString()} />
          <SummaryCard label="Reserved escapes" value={result.reservedEscapeCount.toLocaleString()} />
        </div>
      )}

      {result && result.escapes.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Percent-byte table</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Each valid %XX triplet represents one byte. Bytes above 0x7F are marked as UTF-8 bytes rather than being mislabelled as standalone characters.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Index</th>
                  <th className="px-4 py-3 font-semibold">Escape</th>
                  <th className="px-4 py-3 font-semibold">Byte</th>
                  <th className="px-4 py-3 font-semibold">Meaning</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {result.escapes.slice(0, 120).map((item) => (
                  <tr key={`${item.index}-${item.sequence}`} className="align-top">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.index}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">{item.sequence}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.decimal === null ? "-" : `0x${item.hex.toUpperCase()} (${item.decimal})`}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.character || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{item.valid ? "valid byte" : "malformed"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.warning || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.escapes.length > 120 && (
            <p className="mt-3 text-sm text-gray-500">Showing the first 120 escapes in the browser table. The selected JSON/table/report output includes the full analysis.</p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {result.issues.map((issue, index) => (
            <IssueCard key={`${issue.title}-${index}`} issue={issue} />
          ))}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Context notes</h3>
          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-11 whitespace-nowrap text-sm">{copied ? "Copied" : "Copy"}</button>
          )}
        </div>
        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">{output || "Percent-encoding analysis output will appear here."}</pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Analysis runs in your browser and does not request the pasted URL. That means redirects, server routing, proxy normalization, framework decoding, and application behavior are not executed or reproduced.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A percent escape represents one byte</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 3986 writes a percent-encoded octet as <strong>%</strong> followed by two hexadecimal digits. ASCII characters fit in one byte, but UTF-8 text often needs several bytes. For example, <code>%C3%A9</code> is one UTF-8 character made from two percent-encoded bytes; treating each byte as an independent character produces misleading mojibake.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The byte table therefore labels non-ASCII octets as UTF-8 bytes and validates consecutive percent-byte runs separately. Tolerant decode preserves invalid UTF-8 escapes rather than inserting replacement characters that could hide corruption.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Component boundaries must be known before reserved bytes are decoded</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Characters such as <strong>/</strong>, <strong>?</strong>, <strong>#</strong>, <strong>&</strong>, and <strong>=</strong> can delimit URL structure. RFC 3986 warns that decoding a reserved character before the URI has been split into its components can turn data into syntax. That is why <code>decodeURI</code> and <code>decodeURIComponent</code> intentionally behave differently.
          </p>
          <div className="mt-4 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
            Decoding a complete URL with component-style rules can expose reserved delimiters such as an encoded slash or ampersand. Analyze the component you actually intend to decode rather than repeatedly decoding the whole URL.
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Plus-to-space is form parsing, not percent decoding</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A literal <strong>+</strong> is not a percent escape. The HTML/URL form-encoding algorithm uses plus as a representation of space when parsing <code>application/x-www-form-urlencoded</code> data. A plus in a path remains a plus. When full-URL mode is selected here, plus-to-space is limited to the query portion so path data is not rewritten accidentally.
          </p>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">Malformed escape</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              A bare percent sign, <code>%G1</code>, or an incomplete triplet is not valid percent encoding. Strict JavaScript URI decoders throw a URIError for malformed syntax.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900">Valid escapes, invalid UTF-8</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              <code>%FF</code> is syntactically a valid percent-encoded byte, but it is not valid standalone UTF-8. URI component decoders can therefore reject input whose %XX syntax looks correct.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Double decoding can change meaning</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <code>%252F</code> becomes <code>%2F</code> after one decode and <code>/</code> after a second. RFC 3986 explicitly cautions against encoding or decoding the same string more than once. Differences between proxies, routers, web frameworks, and application code are a common reason encoded delimiters become security-sensitive.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards behind the analysis</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <a href="https://www.rfc-editor.org/rfc/rfc3986.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 3986</a>{" "}
            defines percent-encoded octets, reserved and unreserved URI characters, and the warning about decoding before component boundaries are known. The living <a href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">WHATWG URL Standard</a>{" "}
            defines browser URL percent-encode sets and the form-urlencoded parser used for modern query/form behavior.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/percent-encoding-analyzer" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function CheckboxRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm font-medium text-gray-900">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--light-gold)]" />
      <span>{label}</span>
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function IssueCard({ issue }: { issue: AnalyzerIssue }) {
  const classes = issue.severity === "high"
    ? "border-red-200 bg-red-50 text-red-800"
    : issue.severity === "warning"
      ? "self-start border-amber-200 bg-amber-50 text-amber-800"
      : "border-gray-200 bg-gray-50 text-gray-600";
  const titleClass = issue.severity === "high"
    ? "text-red-900"
    : issue.severity === "warning"
      ? "text-amber-900"
      : "text-gray-900";

  return (
    <div className={`rounded-xl border p-4 ${classes}`}>
      <p className={`text-sm font-semibold ${titleClass}`}>{issue.title}</p>
      <p className="mt-1 text-sm leading-relaxed">{issue.message}</p>
    </div>
  );
}

function analyzePercentEncoding(
  input: string,
  options: {
    inputMode: InputMode;
    decodeMode: DecodeMode;
    outputMode: OutputMode;
    treatPlusAsSpace: boolean;
    highlightReservedEscapes: boolean;
    showUtf8Warnings: boolean;
    preserveInvalidEscapes: boolean;
  }
): AnalyzerResult {
  if (input.length > MAX_INPUT_CHARS) {
    throw new Error(`Input is too large for an interactive browser analysis. Keep it under ${MAX_INPUT_CHARS.toLocaleString()} characters.`);
  }

  const adjustedInput = options.treatPlusAsSpace
    ? applyPlusHandling(input, options.inputMode)
    : input;
  const escapes = extractEscapes(adjustedInput, options.highlightReservedEscapes);
  const invalidUtf8RunCount = countInvalidUtf8Runs(adjustedInput);
  const plusCount = (input.match(/\+/g) || []).length;
  const invalidEscapeCount = escapes.filter((item) => !item.valid).length;
  const reservedEscapeCount = escapes.filter((item) => item.valid && item.decimal !== null && reservedCharacters.has(String.fromCharCode(item.decimal))).length;
  const doubleEncodedCount = (input.match(/%25[A-Fa-f0-9]{2}/g) || []).length;
  const issues = getIssues(input, escapes, invalidUtf8RunCount, doubleEncodedCount, options);
  const decoded = decodeInput(adjustedInput, options);
  const output = formatOutput({
    input,
    decoded,
    escapes,
    issues,
    outputMode: options.outputMode,
    inputLength: input.length,
    decodedLength: decoded.length,
    escapeCount: escapes.length,
    invalidEscapeCount,
    invalidUtf8RunCount,
    plusCount,
    reservedEscapeCount,
    doubleEncodedCount,
  });

  return {
    input,
    decoded,
    output,
    escapes,
    issues,
    inputLength: input.length,
    decodedLength: decoded.length,
    escapeCount: escapes.length,
    invalidEscapeCount,
    invalidUtf8RunCount,
    plusCount,
    reservedEscapeCount,
    doubleEncodedCount,
  };
}

function applyPlusHandling(input: string, inputMode: InputMode): string {
  if (inputMode !== "url") {
    return input.replace(/\+/g, " ");
  }

  const queryStart = input.indexOf("?");
  if (queryStart === -1) return input;
  const fragmentStart = input.indexOf("#", queryStart + 1);
  const end = fragmentStart === -1 ? input.length : fragmentStart;
  return input.slice(0, queryStart + 1) + input.slice(queryStart + 1, end).replace(/\+/g, " ") + input.slice(end);
}

function extractEscapes(input: string, highlightReservedEscapes: boolean): EscapeItem[] {
  const items: EscapeItem[] = [];

  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== "%") continue;

    const sequence = input.slice(index, index + 3);
    const hex = input.slice(index + 1, index + 3);
    const valid = /^[A-Fa-f0-9]{2}$/.test(hex);
    const decimal = valid ? parseInt(hex, 16) : null;
    let character = "";
    let warning = "";

    if (!valid) {
      warning = "Malformed percent escape";
    } else if (decimal !== null && decimal < 0x80) {
      character = describeAsciiByte(decimal);
      if (highlightReservedEscapes && reservedCharacters.has(String.fromCharCode(decimal))) {
        warning = "RFC 3986 reserved character";
      }
    } else {
      character = "UTF-8 byte";
    }

    items.push({ sequence, index, hex, decimal, character, valid, warning });
  }

  return items;
}

function describeAsciiByte(value: number): string {
  if (value === 0x20) return "space";
  if (value === 0x09) return "tab";
  if (value === 0x0A) return "LF";
  if (value === 0x0D) return "CR";
  if (value < 0x20 || value === 0x7F) return `control 0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
  return String.fromCharCode(value);
}

function getIssues(
  input: string,
  escapes: EscapeItem[],
  invalidUtf8RunCount: number,
  doubleEncodedCount: number,
  options: {
    inputMode: InputMode;
    decodeMode: DecodeMode;
    treatPlusAsSpace: boolean;
    highlightReservedEscapes: boolean;
    showUtf8Warnings: boolean;
    preserveInvalidEscapes: boolean;
  }
): AnalyzerIssue[] {
  const issues: AnalyzerIssue[] = [];
  const invalidEscapes = escapes.filter((item) => !item.valid);
  const reservedEscapes = escapes.filter((item) => item.valid && item.decimal !== null && reservedCharacters.has(String.fromCharCode(item.decimal)));
  const plusCount = (input.match(/\+/g) || []).length;

  if (invalidEscapes.length > 0) {
    issues.push({
      severity: "high",
      title: "Malformed percent escapes",
      message: `${invalidEscapes.length} percent sign${invalidEscapes.length === 1 ? " is" : "s are"} not followed by two hexadecimal digits. Strict URI decoders reject this syntax.`,
    });
  }

  if (options.showUtf8Warnings && invalidUtf8RunCount > 0) {
    issues.push({
      severity: "warning",
      title: "Percent bytes are not valid UTF-8",
      message: `${invalidUtf8RunCount} consecutive percent-byte run${invalidUtf8RunCount === 1 ? "" : "s"} cannot be decoded as valid UTF-8. Tolerant mode preserves those escapes rather than replacing their bytes.`,
    });
  }

  if (options.highlightReservedEscapes && reservedEscapes.length > 0) {
    issues.push({
      severity: "info",
      title: "Reserved URL characters are encoded",
      message: `${reservedEscapes.length} escape${reservedEscapes.length === 1 ? "" : "s"} represent RFC 3986 reserved characters. Decoding them before URL component boundaries are known can change structure.`,
    });
  }

  if (plusCount > 0) {
    issues.push({
      severity: "info",
      title: options.treatPlusAsSpace ? "Plus-to-space handling applied" : "Literal plus signs preserved",
      message: options.treatPlusAsSpace
        ? options.inputMode === "url"
          ? "Only plus signs inside the full URL's query portion were changed to spaces; path and fragment plus signs were preserved."
          : "Plus signs were interpreted using form/query semantics rather than ordinary URL path semantics."
        : "A plus sign is not a percent escape. Enable plus-to-space only when the data follows application/x-www-form-urlencoded query/form rules.",
    });
  }

  if (doubleEncodedCount > 0) {
    issues.push({
      severity: "warning",
      title: "Possible second-stage percent encoding",
      message: `${doubleEncodedCount} sequence${doubleEncodedCount === 1 ? "" : "s"} begin with %25 followed by hex digits, so another decode could expose a new %XX escape. Repeated decoding can change URL meaning and should not be assumed safe.`,
    });
  }

  if (options.inputMode === "url" && options.decodeMode === "component") {
    issues.push({
      severity: "warning",
      title: "Component decoding selected for a full URL",
      message: "decodeURIComponent semantics decode reserved escapes that decodeURI would preserve. That can expose delimiters inside the pasted URL.",
    });
  }

  if (options.decodeMode === "safe" && (invalidEscapes.length > 0 || invalidUtf8RunCount > 0)) {
    issues.push({
      severity: "info",
      title: "Tolerant output stays lossless around invalid data",
      message: options.preserveInvalidEscapes
        ? "Malformed percent text and invalid UTF-8 byte escapes are preserved verbatim so the output does not hide damaged input."
        : "Malformed percent signs are omitted by request, while valid %XX bytes that are not valid UTF-8 remain encoded to avoid replacement-character corruption.",
    });
  }

  return issues;
}

function decodeInput(
  input: string,
  options: {
    decodeMode: DecodeMode;
    preserveInvalidEscapes: boolean;
  }
): string {
  if (options.decodeMode === "component") {
    try {
      return decodeURIComponent(input);
    } catch {
      throw new Error("decodeURIComponent semantics rejected the input because a percent escape is malformed or the escaped bytes are not valid UTF-8.");
    }
  }

  if (options.decodeMode === "uri") {
    try {
      return decodeURI(input);
    } catch {
      throw new Error("decodeURI semantics rejected the input because a percent escape is malformed or the escaped bytes are not valid UTF-8.");
    }
  }

  return safeDecode(input, options.preserveInvalidEscapes);
}

function safeDecode(input: string, preserveInvalidEscapes: boolean): string {
  let output = "";
  let index = 0;

  while (index < input.length) {
    if (input[index] !== "%") {
      output += input[index];
      index += 1;
      continue;
    }

    const hex = input.slice(index + 1, index + 3);
    if (!/^[A-Fa-f0-9]{2}$/.test(hex)) {
      if (preserveInvalidEscapes) output += "%";
      index += 1;
      continue;
    }

    const firstByte = parseInt(hex, 16);
    if (firstByte < 0x80) {
      output += String.fromCharCode(firstByte);
      index += 3;
      continue;
    }

    const expected = utf8SequenceLength(firstByte);
    if (expected === 0) {
      output += input.slice(index, index + 3);
      index += 3;
      continue;
    }

    const bytes: number[] = [firstByte];
    let cursor = index + 3;
    let original = input.slice(index, index + 3);
    let complete = true;

    for (let part = 1; part < expected; part += 1) {
      if (input[cursor] !== "%" || !/^[A-Fa-f0-9]{2}$/.test(input.slice(cursor + 1, cursor + 3))) {
        complete = false;
        break;
      }
      const nextByte = parseInt(input.slice(cursor + 1, cursor + 3), 16);
      if ((nextByte & 0xC0) !== 0x80) {
        complete = false;
        break;
      }
      bytes.push(nextByte);
      original += input.slice(cursor, cursor + 3);
      cursor += 3;
    }

    if (!complete) {
      output += input.slice(index, index + 3);
      index += 3;
      continue;
    }

    try {
      output += new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
      index = cursor;
    } catch {
      output += original;
      index = cursor;
    }
  }

  return output;
}

function utf8SequenceLength(firstByte: number): number {
  if (firstByte >= 0xC2 && firstByte <= 0xDF) return 2;
  if (firstByte >= 0xE0 && firstByte <= 0xEF) return 3;
  if (firstByte >= 0xF0 && firstByte <= 0xF4) return 4;
  return 0;
}

function countInvalidUtf8Runs(input: string): number {
  let count = 0;
  let index = 0;

  while (index < input.length) {
    if (input[index] !== "%" || !/^[A-Fa-f0-9]{2}$/.test(input.slice(index + 1, index + 3))) {
      index += 1;
      continue;
    }

    const bytes: number[] = [];
    let cursor = index;
    while (cursor < input.length && input[cursor] === "%" && /^[A-Fa-f0-9]{2}$/.test(input.slice(cursor + 1, cursor + 3))) {
      bytes.push(parseInt(input.slice(cursor + 1, cursor + 3), 16));
      cursor += 3;
    }

    try {
      new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
    } catch {
      count += 1;
    }
    index = cursor;
  }

  return count;
}

function formatOutput(result: {
  input: string;
  decoded: string;
  escapes: EscapeItem[];
  issues: AnalyzerIssue[];
  outputMode: OutputMode;
  inputLength: number;
  decodedLength: number;
  escapeCount: number;
  invalidEscapeCount: number;
  invalidUtf8RunCount: number;
  plusCount: number;
  reservedEscapeCount: number;
  doubleEncodedCount: number;
}): string {
  if (result.outputMode === "decoded") return result.decoded;

  if (result.outputMode === "json") {
    return JSON.stringify({
      input: result.input,
      decoded: result.decoded,
      inputLength: result.inputLength,
      decodedLength: result.decodedLength,
      escapeCount: result.escapeCount,
      invalidEscapeCount: result.invalidEscapeCount,
      invalidUtf8RunCount: result.invalidUtf8RunCount,
      plusCount: result.plusCount,
      reservedEscapeCount: result.reservedEscapeCount,
      doubleEncodedCount: result.doubleEncodedCount,
      escapes: result.escapes,
      issues: result.issues,
    }, null, 2);
  }

  if (result.outputMode === "table") {
    return [
      "| Index | Escape | Byte | Meaning | Status | Note |",
      "| --- | --- | --- | --- | --- | --- |",
      ...result.escapes.map((item) =>
        `| ${item.index} | ${item.sequence} | ${item.decimal === null ? "-" : `0x${item.hex.toUpperCase()} (${item.decimal})`} | ${escapeMarkdown(item.character || "-")} | ${item.valid ? "valid byte" : "malformed"} | ${escapeMarkdown(item.warning || "-")} |`
      ),
    ].join("\n");
  }

  const issueLines = result.issues.length
    ? result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
    : ["- No structural percent-encoding findings were detected with the selected options."];

  const body = [
    `Input characters: ${result.inputLength}`,
    `Decoded characters: ${result.decodedLength}`,
    `Percent escapes: ${result.escapeCount}`,
    `Malformed escapes: ${result.invalidEscapeCount}`,
    `Invalid UTF-8 runs: ${result.invalidUtf8RunCount}`,
    `Plus signs: ${result.plusCount}`,
    `Reserved escapes: ${result.reservedEscapeCount}`,
    `Possible double-encoded escapes: ${result.doubleEncodedCount}`,
    "",
    "Decoded:",
    result.decoded,
    "",
    "Findings:",
    ...issueLines,
  ];

  if (result.outputMode === "report") {
    return ["Percent-encoding analysis report", "--------------------------------", ...body].join("\n");
  }

  return ["Percent-encoding summary", "------------------------", ...body.slice(2)].join("\n");
}

function escapeMarkdown(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

function getAnalyzerNotes(
  result: AnalyzerResult,
  inputMode: InputMode,
  decodeMode: DecodeMode,
  treatPlusAsSpace: boolean
): AnalyzerNote[] {
  const notes: AnalyzerNote[] = [];

  if (result.escapeCount === 0) {
    notes.push({
      title: "No percent escapes were found",
      message: "The input can still contain URL syntax or plus characters, but there are no %XX byte triplets to inspect.",
    });
  }

  if (inputMode === "url") {
    notes.push({
      title: "Static text analysis only",
      message: "A server, reverse proxy, router, or framework may normalize or decode a URL differently. This page does not send a request or simulate that stack.",
    });
  }

  if (decodeMode === "safe") {
    notes.push({
      title: "Lossless tolerant mode",
      message: "Valid UTF-8 escapes are decoded while malformed or undecodable byte sequences stay visible instead of becoming replacement characters.",
    });
  }

  if (result.plusCount > 0 && !treatPlusAsSpace) {
    notes.push({
      title: "Plus was left literal",
      message: "Enable form/query handling only when the surrounding format defines plus as space.",
    });
  }

  return notes;
}
