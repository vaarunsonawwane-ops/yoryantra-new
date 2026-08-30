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
  inputLength: number;
  outputLength: number;
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
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [referenceStyle, setReferenceStyle] = useState<ReferenceStyle>("named");
  const [encodeScope, setEncodeScope] = useState<EncodeScope>("syntax");
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
      setError(mode === "encode" ? "Please enter text or HTML to encode." : "Please enter HTML character references to decode.");
      setResult(null);
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = encodeCharacterReferences(input, referenceStyle, encodeScope);
        setResult({
          output: encoded.output,
          convertedCount: encoded.convertedCount,
          mode,
          inputLength: input.length,
          outputLength: encoded.output.length,
        });
      } else {
        const output = decodeCharacterReferences(input);
        setResult({
          output,
          convertedCount: countDecodedReferences(input),
          mode,
          inputLength: input.length,
          outputLength: output.length,
        });
      }

      setError("");
      setCopied(false);
    } catch {
      setError(mode === "encode" ? "Unable to encode this text." : "Unable to decode these HTML character references.");
      setResult(null);
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
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <ToolShell
      title="HTML Encoder Decoder"
      description="Convert text to HTML character references or decode named and numeric references. Choose minimal HTML-syntax encoding or encode non-ASCII characters for entity-heavy content and debugging."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">Input</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste plain text, HTML snippets, CMS content, or text containing HTML character references.
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
          className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>

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
              Decode mode uses the browser&apos;s HTML character-reference parser, so supported named references and decimal or hexadecimal numeric references are decoded together.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={convert} className="yoryantra-btn">
          {mode === "encode" ? "Encode HTML References" : "Decode HTML References"}
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Unknown named references remain unchanged when decoding.
                </p>
              </div>
              <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {result.output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Mode" value={result.mode === "encode" ? "Encode" : "Decode"} />
            <StatCard label={result.mode === "encode" ? "Characters encoded" : "References decoded"} value={result.convertedCount.toLocaleString()} />
            <StatCard label="Input length" value={`${result.inputLength.toLocaleString()} chars`} />
            <StatCard label="Output length" value={`${result.outputLength.toLocaleString()} chars`} />
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Character References, Not General-Purpose Sanitization</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML supports named references such as &amp;amp; and numeric references such as &amp;#38; or &amp;#x26;. They are useful when text needs an explicit character-reference representation, when inspecting encoded CMS or API content, or when converting non-ASCII characters for compatibility testing.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The default encoding scope converts the characters that commonly participate in HTML syntax: ampersand, angle brackets, and quotes. The non-ASCII option also converts characters above U+007E. This tool does not sanitize HTML and does not make arbitrary markup safe to insert with innerHTML.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why This Differs from HTML Escape Unescape</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML Escape Unescape is aimed at minimal output escaping and context-aware safety guidance. This encoder/decoder is aimed at character-reference conversion: choosing named, decimal, or hexadecimal output and optionally representing non-ASCII characters as references. Use the escape tool when your main question is how to display untrusted text safely in an HTML context; use this tool when you need to inspect or transform entity notation itself.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference Behavior</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li>Named-reference decoding follows the browser&apos;s HTML parser and therefore recognizes the HTML Living Standard&apos;s supported character references.</li>
            <li>Decimal references use forms such as <code>&amp;#169;</code>; hexadecimal references use forms such as <code>&amp;#xA9;</code>.</li>
            <li>Named output uses familiar names where this tool has a clear common mapping and falls back to a decimal reference for other encoded characters.</li>
            <li>Raw tags already present in the input are preserved during decoding rather than rendered in the page.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/html-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}

function encodeCharacterReferences(value: string, style: ReferenceStyle, scope: EncodeScope) {
  let output = "";
  let convertedCount = 0;

  for (const character of value) {
    const codePoint = character.codePointAt(0) || 0;
    const isHtmlSyntax = character === "&" || character === "<" || character === ">" || character === '"' || character === "'";
    const shouldEncode = isHtmlSyntax || (scope === "non-ascii" && codePoint > 0x7f);

    if (!shouldEncode) {
      output += character;
      continue;
    }

    convertedCount += 1;
    output += formatReference(character, codePoint, style);
  }

  return { output, convertedCount };
}

function formatReference(character: string, codePoint: number, style: ReferenceStyle) {
  if (style === "named" && namedReferences[character]) return namedReferences[character];
  if (style === "hex") return `&#x${codePoint.toString(16).toUpperCase()};`;
  return `&#${codePoint};`;
}

function decodeCharacterReferences(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return textarea.value;
}

function countDecodedReferences(value: string) {
  const candidates = value.match(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);?/gi) || [];
  return candidates.reduce((count, candidate) => {
    return count + (decodeCharacterReferences(candidate) !== candidate ? 1 : 0);
  }, 0);
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
