"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "encode" | "decode";
type ReferenceStyle = "named" | "decimal" | "hex";
type EncodeScope = "syntax" | "non-ascii";

type Result = {
  output: string;
  convertedCount: number;
  mode: Mode;
  inputCharacters: number;
  outputCharacters: number;
  warnings: string[];
};

const encodeExample = `<p title="AT&T © 2026">5 < 8 — café</p>`;
const decodeExample = `&lt;p&gt;Price: &euro;25 &amp; tax &#x2014; caf&#233;&lt;/p&gt;`;

const namedReferences: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "\u00a0": "&nbsp;",
  "©": "&copy;",
  "®": "&reg;",
  "€": "&euro;",
  "£": "&pound;",
  "¥": "&yen;",
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [referenceStyle, setReferenceStyle] =
    useState<ReferenceStyle>("named");
  const [encodeScope, setEncodeScope] =
    useState<EncodeScope>("syntax");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const placeholder = useMemo(
    () => (mode === "encode" ? encodeExample : decodeExample),
    [mode]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const convert = () => {
    if (input.length === 0) {
      setError(
        mode === "encode"
          ? "Please enter text or HTML to encode."
          : "Please enter HTML character references to decode."
      );
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = encodeCharacterReferences(
          input,
          referenceStyle,
          encodeScope
        );

        setResult({
          output: encoded.output,
          convertedCount: encoded.convertedCount,
          mode,
          inputCharacters: Array.from(input).length,
          outputCharacters: Array.from(encoded.output).length,
          warnings: buildEncodeWarnings(input, encodeScope),
        });
      } else {
        const output = decodeCharacterReferences(input);

        setResult({
          output,
          convertedCount: countDecodedReferences(input),
          mode,
          inputCharacters: Array.from(input).length,
          outputCharacters: Array.from(output).length,
          warnings: buildDecodeWarnings(input, output),
        });
      }

      setError("");
      setCopied(false);
    } catch {
      setError(
        mode === "encode"
          ? "Unable to encode this text."
          : "Unable to decode these HTML character references."
      );
      setResult(null);
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(mode === "encode" ? encodeExample : decodeExample);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMode("encode");
    setReferenceStyle("named");
    setEncodeScope("syntax");
    clearResult();
  };

  const copyOutput = async () => {
    if (!result?.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The output could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="HTML Encoder Decoder"
      description="Convert text to HTML character references or decode browser-recognized named and numeric references. Choose minimal syntax-focused encoding or represent non-ASCII characters explicitly without confusing entity conversion with HTML sanitization."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            Input
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste plain text, markup-looking text, CMS content, logs, or text
            containing HTML character references.
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Conversion Settings
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Mode"
            value={mode}
            onChange={(value: string) => {
              setMode(value as Mode);
              clearResult();
            }}
            options={[
              { label: "Encode references", value: "encode" },
              { label: "Decode references", value: "decode" },
            ]}
          />

          {mode === "encode" ? (
            <>
              <YoryantraSelect
                label="Reference Format"
                value={referenceStyle}
                onChange={(value: string) => {
                  setReferenceStyle(value as ReferenceStyle);
                  clearResult();
                }}
                options={[
                  { label: "Named where common", value: "named" },
                  { label: "Decimal numeric", value: "decimal" },
                  { label: "Hexadecimal numeric", value: "hex" },
                ]}
              />

              <YoryantraSelect
                label="Characters to Encode"
                value={encodeScope}
                onChange={(value: string) => {
                  setEncodeScope(value as EncodeScope);
                  clearResult();
                }}
                options={[
                  { label: "HTML syntax characters", value: "syntax" },
                  { label: "Syntax + non-ASCII", value: "non-ascii" },
                ]}
              />
            </>
          ) : (
            <div className="md:col-span-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              Decode mode uses the browser&apos;s HTML parser for character
              references. It decodes named and numeric references as text; it
              does not render the decoded output as markup.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={convert} className="yoryantra-btn">
          {mode === "encode"
            ? "Encode HTML References"
            : "Decode HTML References"}
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

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Output
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">
                    {result.mode === "decode"
                      ? "Unknown references remain unchanged. Browser-recognized numeric-reference corrections follow HTML parsing behavior."
                      : "Named mode uses a small set of familiar names and falls back to decimal references when no preferred mapping is configured."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyOutput}
                  className="yoryantra-btn-outline text-sm"
                >
                  {copied ? "Copied" : "Copy Output"}
                </button>
              </div>

              <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
                {result.output}
              </pre>
            </div>

            <div className="space-y-4">
              <StatCard
                label="Mode"
                value={result.mode === "encode" ? "Encode" : "Decode"}
              />
              <StatCard
                label={
                  result.mode === "encode"
                    ? "Characters encoded"
                    : "References decoded"
                }
                value={result.convertedCount.toLocaleString()}
              />
              <StatCard
                label="Input characters"
                value={result.inputCharacters.toLocaleString()}
              />
              <StatCard
                label="Output characters"
                value={result.outputCharacters.toLocaleString()}
              />
            </div>
          </div>

          {result.warnings.length > 0 ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">
                Review notes
              </h3>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-amber-800">
                {result.warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Browser-local conversion
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Character-reference encoding and decoding run in your browser. This
          tool does not send the pasted text to an encoding API. Site-wide
          analytics or advertising scripts, if enabled by the website, are
          separate from this conversion operation.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            HTML Character References Represent Characters, Not Trust
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML supports named character references such as <code>&amp;amp;</code>
            and numeric references such as <code>&amp;#38;</code> or
            <code>&amp;#x26;</code>. They are useful when text needs an explicit
            reference representation, when inspecting CMS/API content, or when
            testing how encoded text is parsed.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Encoding a character does not sanitize surrounding markup. A string
            that decodes to <code>&lt;script&gt;</code> is still markup-looking
            text if another part of an application later inserts it into an HTML
            sink. Keep framework auto-escaping enabled and choose output encoding
            for the final parsing context.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Named, Decimal, and Hexadecimal Forms Decode to Characters
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML has a large standardized named-reference table, while numeric
            references identify a Unicode code point using decimal or
            hexadecimal notation. Named output here intentionally uses only a
            small familiar mapping and falls back to a decimal reference for
            other selected characters. The decoder, by contrast, delegates to
            the browser HTML parser and can recognize the browser&apos;s full
            supported reference table.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Missing Semicolons Can Be Context-Sensitive
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Historical HTML parsing rules allow some named references to be
            recognized without a trailing semicolon. The exact result can
            depend on parser state, especially inside attributes where an
            ambiguous ampersand has additional rules. This page decodes in a
            text-like browser parsing context, so semicolonless input should be
            treated as legacy or diagnostic data rather than a recommended form
            to generate. The encoder always emits a semicolon.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Numeric References Have HTML Error-Recovery Rules
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Numeric references are not a raw way to force any integer into the
            DOM. The HTML parser applies specified error handling for values
            such as null, surrogate code points, out-of-range values, and some
            legacy control-code mappings. That means decoding follows HTML
            parsing semantics rather than simply calling
            <code> String.fromCodePoint()</code> on every number.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Non-ASCII Characters Usually Do Not Need Entity Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Modern HTML is normally served as UTF-8, so characters such as é,
            ₹, or emoji can usually remain directly readable. The non-ASCII
            option is mainly useful for diagnostics, legacy workflows, or
            testing explicit character-reference representations. It iterates
            Unicode code points, so a supplementary-plane character becomes one
            numeric reference rather than two UTF-16 surrogate references.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why This Differs from HTML Escape Unescape
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML Escape Unescape is focused on output encoding and safety
            context. This encoder/decoder is focused on character-reference
            notation itself: choosing named, decimal, or hexadecimal output and
            optionally representing non-ASCII characters. Use the escape tool
            when the primary question is how to display untrusted text safely;
            use this page when the task is inspecting or transforming entity
            notation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Official References
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              <a
                href="https://html.spec.whatwg.org/multipage/named-characters.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                WHATWG HTML Standard — named character references
              </a>
            </p>
            <p>
              <a
                href="https://html.spec.whatwg.org/multipage/parsing.html#character-reference-state"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                WHATWG HTML parsing — character reference state
              </a>
            </p>
            <p>
              <a
                href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                OWASP — Cross Site Scripting Prevention Cheat Sheet
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/html-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}

function encodeCharacterReferences(
  value: string,
  style: ReferenceStyle,
  scope: EncodeScope
) {
  let output = "";
  let convertedCount = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) || 0;
    const isHtmlSyntax =
      character === "&" ||
      character === "<" ||
      character === ">" ||
      character === '"' ||
      character === "'";
    const shouldEncode =
      isHtmlSyntax || (scope === "non-ascii" && codePoint > 0x7f);

    if (!shouldEncode) {
      output += character;
      continue;
    }

    convertedCount += 1;
    output += formatReference(character, codePoint, style);
  }

  return { output, convertedCount };
}

function formatReference(
  character: string,
  codePoint: number,
  style: ReferenceStyle
) {
  if (style === "named" && namedReferences[character]) {
    return namedReferences[character];
  }

  if (style === "hex") {
    return `&#x${codePoint.toString(16).toUpperCase()};`;
  }

  return `&#${codePoint};`;
}

function decodeCharacterReferences(value: string) {
  const textarea = document.createElement("textarea");

  // Literal angle brackets are protected so decoding remains a text
  // transformation rather than interpreting already-present markup.
  textarea.innerHTML = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return textarea.value;
}

function countDecodedReferences(value: string) {
  const candidates =
    value.match(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);?/gi) || [];

  return candidates.reduce((count, candidate) => {
    return count + (decodeCharacterReferences(candidate) !== candidate ? 1 : 0);
  }, 0);
}

function buildEncodeWarnings(value: string, scope: EncodeScope) {
  const warnings: string[] = [];

  if (scope === "non-ascii" && /[^\x00-\x7F]/.test(value)) {
    warnings.push(
      "Non-ASCII characters were represented as character references. Modern UTF-8 HTML normally does not require this transformation."
    );
  }

  const loneSurrogates = countLoneSurrogates(value);

  if (loneSurrogates > 0) {
    warnings.push(
      `${loneSurrogates.toLocaleString()} unpaired UTF-16 surrogate code unit${
        loneSurrogates === 1 ? " was" : "s were"
      } found. Lone surrogates are not portable Unicode scalar values and should be corrected at the source.`
    );
  }

  return warnings;
}

function countLoneSurrogates(value: string) {
  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);

    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = index + 1 < value.length ? value.charCodeAt(index + 1) : -1;

      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        count += 1;
      }
      continue;
    }

    if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      count += 1;
    }
  }

  return count;
}

function buildDecodeWarnings(input: string, output: string) {
  const warnings: string[] = [];
  const candidates =
    input.match(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);?/gi) || [];

  const semicolonless = candidates.filter((candidate) => {
    return (
      !candidate.endsWith(";") &&
      decodeCharacterReferences(candidate) !== candidate
    );
  });

  if (semicolonless.length > 0) {
    warnings.push(
      `${semicolonless.length.toLocaleString()} recognized reference${
        semicolonless.length === 1 ? " omitted" : "s omitted"
      } the trailing semicolon. Historical semicolon omission can be context-sensitive, so generate complete references with semicolons.`
    );
  }

  if (/[<>]/.test(output)) {
    warnings.push(
      "Decoded output contains angle brackets. It is displayed here as text, but decoding does not sanitize markup or make the result safe for innerHTML."
    );
  }

  return warnings;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
