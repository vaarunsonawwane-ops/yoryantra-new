"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "text" | "url" | "query";
type DecodeMode = "component" | "uri" | "safe";
type OutputMode = "summary" | "decoded" | "table" | "json" | "report";

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
  severity: "info" | "warning" | "high";
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
  plusCount: number;
  reservedEscapeCount: number;
};

type AnalyzerNote = {
  title: string;
  message: string;
};

const sampleInput =
  "https://example.com/search?q=caf%C3%A9%20menu&redirect=https%3A%2F%2Fyoryantra.com%2Ftools%3Ftag%3Dseo&bad=%E0%A4%A";

const reservedCharacters = new Set([
  ":", "/", "?", "#", "[", "]", "@", "!", "$", "&", "'", "(", ")", "*", "+", ",", ";", "=",
]);

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

  const notes = useMemo(() => (result ? getAnalyzerNotes(result) : []), [result]);

  const analyzeEncoding = () => {
    if (!input.trim()) {
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
    setInput(sampleInput);
    setInputMode("url");
    setDecodeMode("safe");
    setOutputMode("summary");
    setTreatPlusAsSpace(false);
    setHighlightReservedEscapes(true);
    setShowUtf8Warnings(true);
    setPreserveInvalidEscapes(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
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
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Percent Encoding Analyzer"
      description="Analyze percent-encoded URL text. Inspect %XX escapes, decode UTF-8 bytes, find malformed percent encoding, compare raw and decoded values, and debug URLs directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URL or Percent-Encoded Text
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
          placeholder={sampleInput}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a URL, query string, redirect target, API parameter, or any text
          containing percent escapes like %20, %2F, or %E2%82%B9.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input Type"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Full URL", value: "url" },
              { label: "Query string", value: "query" },
              { label: "Plain text", value: "text" },
            ]}
          />

          <YoryantraSelect
            label="Decode Mode"
            value={decodeMode}
            onChange={(value) => {
              setDecodeMode(value as DecodeMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Safe decoder", value: "safe" },
              { label: "decodeURIComponent style", value: "component" },
              { label: "decodeURI style", value: "uri" },
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
              { label: "Decoded only", value: "decoded" },
              { label: "Escape table", value: "table" },
              { label: "JSON", value: "json" },
              { label: "Detailed report", value: "report" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={treatPlusAsSpace}
                onChange={(event) => {
                  setTreatPlusAsSpace(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Treat plus signs as spaces for form/query decoding
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={highlightReservedEscapes}
                onChange={(event) => {
                  setHighlightReservedEscapes(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Highlight escaped reserved URL characters
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={showUtf8Warnings}
                onChange={(event) => {
                  setShowUtf8Warnings(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about broken UTF-8 escape sequences
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={preserveInvalidEscapes}
                onChange={(event) => {
                  setPreserveInvalidEscapes(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Preserve invalid percent escapes in safe decoding
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          This analyzer explains percent escapes instead of only decoding them,
          which helps when debugging broken redirects, query strings, and copied URLs.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={analyzeEncoding} className="yoryantra-btn">
          Analyze Percent Encoding
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
          <SummaryCard label="Escapes" value={result.escapeCount.toLocaleString()} />
          <SummaryCard label="Invalid" value={result.invalidEscapeCount.toLocaleString()} />
          <SummaryCard label="Plus Signs" value={result.plusCount.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.escapes.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Percent Escape Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Each percent escape found in the input, with decoded character and
            validity details.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Index</th>
                  <th className="px-4 py-3 font-semibold">Escape</th>
                  <th className="px-4 py-3 font-semibold">Byte</th>
                  <th className="px-4 py-3 font-semibold">Character</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.escapes.slice(0, 120).map((item) => (
                  <tr key={`${item.index}-${item.sequence}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.index}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      {item.sequence}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.decimal === null ? "-" : item.decimal}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {item.character || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.valid ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                      }`}>
                        {item.valid ? "valid" : "invalid"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.warning || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.escapes.length > 120 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 120 escapes. Copy the output for the full result.
            </p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Encoding findings
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
            Percent encoding notes
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
          {output || "Percent encoding analysis output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Percent encoding analysis happens directly in your browser. Your URL or
        text is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Inspecting Percent-Encoding in URLs and Query Strings
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Percent encoding is used in URLs to represent characters that cannot
            safely appear as plain text. A space may become %20, a slash may
            become %2F, and UTF-8 characters can appear as multiple percent
            escapes.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Percent Encoding Analyzer goes beyond a normal URL decoder. It
            shows each percent escape, checks whether it is valid, highlights
            reserved characters, detects malformed sequences, and compares the
            raw value with the decoded output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Percent Encoding Analyzer
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a full URL, query string, redirect URL, or encoded text.</li>
            <li>Choose safe, component-style, or URI-style decoding.</li>
            <li>Turn plus-to-space handling on for form-style query values if needed.</li>
            <li>Review valid and invalid percent escapes in the table.</li>
            <li>Copy the decoded output, report, JSON, or escape table.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Percent Encoding Analyzer Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging broken URLs with malformed percent escapes.</li>
            <li>Checking encoded redirect parameters inside query strings.</li>
            <li>Understanding why %2F, %3A, or %26 changes URL behavior.</li>
            <li>Inspecting UTF-8 characters encoded as multiple %XX bytes.</li>
            <li>Comparing plus signs and spaces in form/query decoding.</li>
            <li>Reviewing copied URLs from browsers, logs, APIs, and analytics tools.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Percent Escapes
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`%20  -> space
%2F  -> /
%3A  -> :
%C3%A9 -> é`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Plus Signs Are Not Always Spaces
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            In application/x-www-form-urlencoded query values, a plus sign is
            often treated as a space. In a normal URL path, however, plus is just
            a plus character. This is why the tool lets you choose whether plus
            signs should be decoded as spaces.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            When debugging API requests or redirect URLs, this difference can
            matter. A value copied from a form body may need different decoding
            than a raw URL path.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is percent encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Percent encoding represents characters in URLs using a percent
                sign followed by two hexadecimal digits, such as %20 for a space.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is a malformed percent escape?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It is a percent sign that is not followed by two valid hexadecimal
                digits, such as %G1 or a trailing % at the end of a string.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is %2F the same as a slash?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It decodes to a slash, but whether it behaves like a path slash
                depends on where and when decoding happens.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should plus signs become spaces?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Only in some form/query decoding contexts. A plus sign in a URL
                path is normally a literal plus sign.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I analyze a URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Analysis happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/url-query-encoder-decoder" className="yoryantra-btn-outline">
              URL Query Encoder Decoder
            </Link>

            <Link href="/tools/url-query-params-parser" className="yoryantra-btn-outline">
              URL Query Params Parser
            </Link>

            <Link href="/tools/data-uri-generator" className="yoryantra-btn-outline">
              Data URI Generator
            </Link>

            <Link href="/tools/punycode-converter" className="yoryantra-btn-outline">
              Punycode Converter
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
  const cleanInput = input.trim();
  const adjustedInput = options.treatPlusAsSpace ? cleanInput.replace(/\+/g, " ") : cleanInput;
  const escapes = extractEscapes(adjustedInput, options.highlightReservedEscapes);
  const issues = getIssues(adjustedInput, escapes, options);
  const decoded = decodeInput(adjustedInput, options);
  const plusCount = (cleanInput.match(/\+/g) || []).length;
  const invalidEscapeCount = escapes.filter((item) => !item.valid).length;
  const reservedEscapeCount = escapes.filter((item) => item.valid && reservedCharacters.has(item.character)).length;
  const output = formatOutput({
    input: cleanInput,
    decoded,
    escapes,
    issues,
    outputMode: options.outputMode,
    inputLength: cleanInput.length,
    decodedLength: decoded.length,
    escapeCount: escapes.length,
    invalidEscapeCount,
    plusCount,
    reservedEscapeCount,
  });

  return {
    input: cleanInput,
    decoded,
    output,
    escapes,
    issues,
    inputLength: cleanInput.length,
    decodedLength: decoded.length,
    escapeCount: escapes.length,
    invalidEscapeCount,
    plusCount,
    reservedEscapeCount,
  };
}

function extractEscapes(input: string, highlightReservedEscapes: boolean): EscapeItem[] {
  const items: EscapeItem[] = [];

  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== "%") {
      continue;
    }

    const sequence = input.slice(index, index + 3);
    const hex = input.slice(index + 1, index + 3);
    const valid = /^[A-Fa-f0-9]{2}$/.test(hex);
    const decimal = valid ? parseInt(hex, 16) : null;
    const character = valid ? String.fromCharCode(decimal || 0) : "";
    let warning = "";

    if (!valid) {
      warning = "Malformed percent escape";
    } else if (highlightReservedEscapes && reservedCharacters.has(character)) {
      warning = "Reserved URL character";
    }

    items.push({
      sequence,
      index,
      hex,
      decimal,
      character: character === " " ? "space" : character,
      valid,
      warning,
    });
  }

  return items;
}

function getIssues(
  input: string,
  escapes: EscapeItem[],
  options: {
    inputMode: InputMode;
    decodeMode: DecodeMode;
    treatPlusAsSpace: boolean;
    showUtf8Warnings: boolean;
  }
): AnalyzerIssue[] {
  const issues: AnalyzerIssue[] = [];
  const invalidEscapes = escapes.filter((item) => !item.valid);
  const reservedEscapes = escapes.filter((item) => item.valid && reservedCharacters.has(item.character));
  const plusCount = (input.match(/\+/g) || []).length;

  if (invalidEscapes.length > 0) {
    issues.push({
      severity: "high",
      title: "Malformed percent escapes found",
      message: `${invalidEscapes.length} percent escape${invalidEscapes.length === 1 ? "" : "s"} are not followed by two valid hexadecimal digits.`,
    });
  }

  if (reservedEscapes.length > 0) {
    issues.push({
      severity: "info",
      title: "Reserved characters are escaped",
      message: `${reservedEscapes.length} escape${reservedEscapes.length === 1 ? "" : "s"} decode to reserved URL characters such as /, :, ?, &, or =.`,
    });
  }

  if (plusCount > 0 && !options.treatPlusAsSpace) {
    issues.push({
      severity: "info",
      title: "Plus signs found",
      message: "Plus signs were kept as plus characters. Enable plus-to-space if this is form/query encoded text.",
    });
  }

  if (options.showUtf8Warnings && looksLikeBrokenUtf8(input)) {
    issues.push({
      severity: "warning",
      title: "Possible incomplete UTF-8 sequence",
      message: "The input appears to contain a partial percent-encoded UTF-8 byte sequence.",
    });
  }

  if (options.decodeMode === "uri") {
    issues.push({
      severity: "info",
      title: "decodeURI-style mode selected",
      message: "decodeURI-style decoding keeps some reserved URL characters escaped compared with component decoding.",
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
) {
  if (options.decodeMode === "component") {
    return decodeURIComponent(input);
  }

  if (options.decodeMode === "uri") {
    return decodeURI(input);
  }

  return safeDecode(input, options.preserveInvalidEscapes);
}

function safeDecode(input: string, preserveInvalidEscapes: boolean) {
  let output = "";
  let byteBuffer: number[] = [];

  const flushBytes = () => {
    if (byteBuffer.length === 0) {
      return;
    }

    output += new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(byteBuffer));
    byteBuffer = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (char === "%" && /^[A-Fa-f0-9]{2}$/.test(input.slice(index + 1, index + 3))) {
      byteBuffer.push(parseInt(input.slice(index + 1, index + 3), 16));
      index += 2;
      continue;
    }

    flushBytes();

    if (char === "%" && !preserveInvalidEscapes) {
      continue;
    }

    output += char;
  }

  flushBytes();

  return output;
}

function looksLikeBrokenUtf8(input: string) {
  const trailing = input.match(/(?:%[A-Fa-f0-9]{2})+$/);

  if (!trailing) {
    return false;
  }

  const bytes = (trailing[0].match(/%[A-Fa-f0-9]{2}/g) || []).map((part) => parseInt(part.slice(1), 16));
  const first = bytes[0];

  if (first === undefined) {
    return false;
  }

  const expected =
    first >= 0xF0 ? 4 :
    first >= 0xE0 ? 3 :
    first >= 0xC0 ? 2 :
    1;

  return bytes.length < expected;
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
  plusCount: number;
  reservedEscapeCount: number;
}) {
  if (result.outputMode === "decoded") {
    return result.decoded;
  }

  if (result.outputMode === "json") {
    return JSON.stringify(
      {
        input: result.input,
        decoded: result.decoded,
        inputLength: result.inputLength,
        decodedLength: result.decodedLength,
        escapeCount: result.escapeCount,
        invalidEscapeCount: result.invalidEscapeCount,
        plusCount: result.plusCount,
        reservedEscapeCount: result.reservedEscapeCount,
        escapes: result.escapes,
        issues: result.issues,
      },
      null,
      2
    );
  }

  if (result.outputMode === "table") {
    return [
      "| Index | Escape | Byte | Character | Status | Note |",
      "| --- | --- | --- | --- | --- | --- |",
      ...result.escapes.map((item) =>
        `| ${item.index} | ${item.sequence} | ${item.decimal === null ? "-" : item.decimal} | ${escapeMarkdown(item.character || "-")} | ${item.valid ? "valid" : "invalid"} | ${escapeMarkdown(item.warning || "-")} |`
      ),
    ].join("\n");
  }

  if (result.outputMode === "report") {
    const issues = result.issues.length
      ? result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
      : ["- No common percent-encoding issues found."];

    return [
      "Percent Encoding Analysis Report",
      "--------------------------------",
      `Input length: ${result.inputLength}`,
      `Decoded length: ${result.decodedLength}`,
      `Percent escapes: ${result.escapeCount}`,
      `Invalid escapes: ${result.invalidEscapeCount}`,
      `Plus signs: ${result.plusCount}`,
      `Reserved escapes: ${result.reservedEscapeCount}`,
      "",
      "Decoded:",
      result.decoded,
      "",
      "Findings:",
      ...issues,
    ].join("\n");
  }

  const issues = result.issues.length
    ? result.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`)
    : ["- No common percent-encoding issues found."];

  return [
    "Percent Encoding Summary",
    "------------------------",
    `Percent escapes: ${result.escapeCount}`,
    `Invalid escapes: ${result.invalidEscapeCount}`,
    `Plus signs: ${result.plusCount}`,
    `Reserved escapes: ${result.reservedEscapeCount}`,
    "",
    "Decoded:",
    result.decoded,
    "",
    "Findings:",
    ...issues,
  ].join("\n");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getAnalyzerNotes(result: AnalyzerResult): AnalyzerNote[] {
  const notes: AnalyzerNote[] = [];

  if (result.invalidEscapeCount > 0) {
    notes.push({
      title: "Malformed escapes need review",
      message:
        "Invalid percent escapes can break strict decoders such as decodeURIComponent.",
    });
  }

  if (result.reservedEscapeCount > 0) {
    notes.push({
      title: "Reserved characters",
      message:
        "Escaped reserved characters may change URL structure after decoding, especially /, ?, &, =, and #.",
    });
  }

  if (result.plusCount > 0) {
    notes.push({
      title: "Plus handling",
      message:
        "Plus signs may represent spaces in form/query encoding, but not in every URL context.",
    });
  }

  return notes;
}
