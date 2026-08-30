"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "escape" | "unescape";
type EscapeStyle = "named" | "numeric";

type Result = {
  output: string;
  inputLength: number;
  outputLength: number;
  convertedCount: number;
  convertedLabel: string;
  mode: Mode;
};

const escapeExample = `<div class="message">Yoryantra & tools</div>`;
const unescapeExample = `&lt;div class=&quot;message&quot;&gt;Yoryantra &amp; tools&lt;/div&gt;`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("escape");
  const [escapeStyle, setEscapeStyle] = useState<EscapeStyle>("named");
  const [escapeQuotes, setEscapeQuotes] = useState(true);
  const [escapeApostrophes, setEscapeApostrophes] = useState(true);
  const [trimInput, setTrimInput] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const placeholder = useMemo(() => (mode === "escape" ? escapeExample : unescapeExample), [mode]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const convertHtml = () => {
    if (input.length === 0) {
      setError(mode === "escape" ? "Please enter HTML or text to escape." : "Please enter HTML entities to unescape.");
      setOutput("");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const source = trimInput ? input.trim() : input;
      if (source.length === 0) {
        setError("The input is empty after trimming outer whitespace.");
        setOutput("");
        setResult(null);
        setCopied(false);
        return;
      }

      const nextOutput =
        mode === "escape"
          ? escapeHtml(source, { escapeStyle, escapeQuotes, escapeApostrophes })
          : unescapeHtml(source);
      const convertedCount =
        mode === "escape"
          ? countEscapedCharacters(source, { escapeQuotes, escapeApostrophes })
          : countDecodedReferences(source);

      const nextResult: Result = {
        output: nextOutput,
        inputLength: source.length,
        outputLength: nextOutput.length,
        convertedCount,
        convertedLabel: mode === "escape" ? "Characters escaped" : "References decoded",
        mode,
      };

      setResult(nextResult);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch {
      setError(mode === "escape" ? "Unable to escape this text." : "Unable to unescape this HTML text.");
      setOutput("");
      setResult(null);
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
    setInput(mode === "escape" ? escapeExample : unescapeExample);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMode("escape");
    setEscapeStyle("named");
    setEscapeQuotes(true);
    setEscapeApostrophes(true);
    setTrimInput(false);
    clearResult();
  };

  return (
    <ToolShell
      title="HTML Escape Unescape"
      description="Escape HTML special characters or decode HTML character references for literal text, debugging, CMS content, APIs, and documentation. Review the output context before using escaped text in application code."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">Input HTML or Text</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste raw HTML, normal text, code snippets, CMS content, API values, or entity-encoded text.
          </p>
        </div>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={placeholder}
          spellCheck={false}
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Conversion Settings</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Mode"
            value={mode}
            onChange={(value) => {
              setMode(value as Mode);
              clearResult();
            }}
            options={[
              { label: "Escape HTML", value: "escape" },
              { label: "Unescape HTML", value: "unescape" },
            ]}
          />

          {mode === "escape" ? (
            <YoryantraSelect
              label="Escape Style"
              value={escapeStyle}
              onChange={(value) => {
                setEscapeStyle(value as EscapeStyle);
                clearResult();
              }}
              options={[
                { label: "Common named references", value: "named" },
                { label: "Decimal numeric references", value: "numeric" },
              ]}
            />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              Unescape mode uses the browser&apos;s HTML character-reference parser, including supported named and numeric references.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {mode === "escape" ? (
            <>
              <Toggle checked={escapeQuotes} onChange={setEscapeQuotes} label="Escape double quotes" />
              <Toggle checked={escapeApostrophes} onChange={setEscapeApostrophes} label="Escape apostrophes" />
            </>
          ) : null}
          <Toggle checked={trimInput} onChange={setTrimInput} label="Trim outer whitespace before converting" />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          {mode === "escape"
            ? "Ampersands and angle brackets are escaped for literal HTML display. Quote options are useful when you are preparing text for a quoted HTML attribute, but output encoding must always match the final context."
            : "Decoding changes character references back to characters. The decoded result may contain markup-looking text, so do not insert untrusted output into innerHTML without an appropriate HTML sanitizer."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={convertHtml} className="yoryantra-btn">
          {mode === "escape" ? "Escape HTML" : "Unescape HTML"}
        </button>

        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Copy the escaped or unescaped result for your code, CMS field, API test, or documentation.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="yoryantra-btn-outline text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Input length" value={`${result.inputLength.toLocaleString()} chars`} />
            <StatCard label="Output length" value={`${result.outputLength.toLocaleString()} chars`} />
            <StatCard label="Mode" value={result.mode === "escape" ? "Escape" : "Unescape"} />
            <StatCard label={result.convertedLabel} value={result.convertedCount.toLocaleString()} />
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">HTML Escaping Is Context-Specific Output Encoding</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML character references let special characters appear as text instead of being parsed as HTML syntax. For example, &amp;lt; represents a literal less-than sign and &amp;amp; represents an ampersand. This is useful for code samples, user-entered text, CMS fields, logs, and other values that should be displayed rather than treated as markup.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The correct encoding depends on where a value will be inserted. HTML text, quoted attributes, JavaScript, CSS, and URLs are different parsing contexts. This tool performs HTML character-reference escaping; it is not a JavaScript, CSS, or URL encoder.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the Escape Options Change</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
            <ul className="space-y-3">
              <li><strong>Ampersand and angle brackets:</strong> escaped by default so markup-looking text can be displayed literally.</li>
              <li><strong>Double quote:</strong> optional because it matters most when a value is placed inside a quoted HTML attribute.</li>
              <li><strong>Apostrophe:</strong> optional for the same reason when single-quoted attributes are involved.</li>
              <li><strong>Named vs numeric:</strong> changes the representation, not the decoded character. Both forms are HTML character references.</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Literal markup-like text:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">{`<div class="message">Yoryantra & tools</div>`}</pre>
            <p className="mt-4 font-medium text-gray-900">Escaped with common references:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">{`&lt;div class=&quot;message&quot;&gt;Yoryantra &amp; tools&lt;/div&gt;`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Unescaping Can Produce Markup-Looking Output</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Unescape mode uses the browser&apos;s HTML character-reference behavior, so named references such as &amp;copy; and numeric references such as &amp;#169; can become their corresponding characters. The output box renders the result as text. If you later pass decoded, untrusted content to an HTML sink such as innerHTML, decoding has not made that content safe.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Escaping Is Not HTML Sanitization</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Escaping is appropriate when untrusted data should remain plain text in a known output context. Sanitization is different: it is used when you intentionally allow some HTML and need to remove or restrict unsafe markup. For user-authored rich HTML, use a maintained sanitizer and keep framework auto-escaping enabled where possible.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser-Local Conversion</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Escaping and unescaping on this page run in your browser. The tool does not send pasted text to an encoding or decoding API.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/html-escape-unescape" />
        </div>
      </section>
    </ToolShell>
  );
}

function escapeHtml(
  value: string,
  options: { escapeStyle: EscapeStyle; escapeQuotes: boolean; escapeApostrophes: boolean }
) {
  return value.replace(/[&<>"']/g, (character) => {
    if (character === "&") return options.escapeStyle === "numeric" ? "&#38;" : "&amp;";
    if (character === "<") return options.escapeStyle === "numeric" ? "&#60;" : "&lt;";
    if (character === ">") return options.escapeStyle === "numeric" ? "&#62;" : "&gt;";
    if (character === '"') return options.escapeQuotes ? (options.escapeStyle === "numeric" ? "&#34;" : "&quot;") : character;
    if (character === "'") return options.escapeApostrophes ? "&#39;" : character;
    return character;
  });
}

function unescapeHtml(value: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function countEscapedCharacters(
  input: string,
  options: { escapeQuotes: boolean; escapeApostrophes: boolean }
) {
  let count = 0;
  for (const character of input) {
    if (character === "&" || character === "<" || character === ">") count += 1;
    else if (character === '"' && options.escapeQuotes) count += 1;
    else if (character === "'" && options.escapeApostrophes) count += 1;
  }
  return count;
}

function countDecodedReferences(input: string) {
  const candidates = input.match(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);?/gi) || [];
  return candidates.reduce((count, candidate) => {
    return count + (unescapeHtml(candidate) !== candidate ? 1 : 0);
  }, 0);
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
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
