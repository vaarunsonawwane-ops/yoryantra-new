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
const unescapeExample =
  `&lt;div class=&quot;message&quot;&gt;Yoryantra &amp; tools&lt;/div&gt;`;

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

  const placeholder = useMemo(
    () => (mode === "escape" ? escapeExample : unescapeExample),
    [mode]
  );

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const convertHtml = () => {
    if (input.length === 0) {
      setError(
        mode === "escape"
          ? "Please enter HTML or text to escape."
          : "Please enter HTML character references to unescape."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    const source = trimInput ? input.trim() : input;

    if (source.length === 0) {
      setError("The input is empty after trimming outer whitespace.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextOutput =
        mode === "escape"
          ? escapeHtml(source, {
              escapeStyle,
              escapeQuotes,
              escapeApostrophes,
            })
          : unescapeHtml(source);

      const convertedCount =
        mode === "escape"
          ? countEscapedCharacters(source, {
              escapeQuotes,
              escapeApostrophes,
            })
          : countDecodedReferences(source);

      setResult({
        output: nextOutput,
        inputLength: source.length,
        outputLength: nextOutput.length,
        convertedCount,
        convertedLabel:
          mode === "escape" ? "Characters escaped" : "References decoded",
        mode,
      });
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch {
      setError(
        mode === "escape"
          ? "Unable to escape this text."
          : "Unable to decode this HTML character-reference text."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The output could not be copied. Select and copy it manually.");
      setCopied(false);
    }
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
      description="Escape HTML special characters or decode HTML character references for literal text, debugging, CMS content, APIs, and documentation. The tool keeps output encoding separate from HTML sanitization so the result is easier to use safely."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            Input HTML or Text
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste raw markup-looking text, normal text, CMS content, API values,
            or existing HTML character references.
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
        <h3 className="text-lg font-semibold text-gray-900">
          Conversion Settings
        </h3>

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
              Unescape mode uses the browser&apos;s HTML parser for named and
              numeric character references. Historical semicolon-omission
              behavior can vary by parsing context, so generated references on
              this page always include semicolons.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          {mode === "escape" ? (
            <>
              <Toggle
                checked={escapeQuotes}
                onChange={(value) => {
                  setEscapeQuotes(value);
                  clearResult();
                }}
                label="Escape double quotes"
              />
              <Toggle
                checked={escapeApostrophes}
                onChange={(value) => {
                  setEscapeApostrophes(value);
                  clearResult();
                }}
                label="Escape apostrophes"
              />
            </>
          ) : null}

          <Toggle
            checked={trimInput}
            onChange={(value) => {
              setTrimInput(value);
              clearResult();
            }}
            label="Trim outer whitespace before converting"
          />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          {mode === "escape"
            ? "Ampersands and angle brackets are always escaped. Quote options are useful when the value is intended for a quoted HTML attribute, but the correct output encoding still depends on the final parsing context."
            : "Decoding changes character references back into characters. It does not sanitize markup or make untrusted HTML safe to inject into a page."}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={convertHtml} className="yoryantra-btn">
          {mode === "escape" ? "Escape HTML" : "Unescape HTML"}
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
        <div className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Copy the result for code samples, CMS fields, API tests, or
                  documentation after checking that the destination context
                  matches the encoding.
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
            <StatCard
              label="Input length"
              value={`${result.inputLength.toLocaleString()} chars`}
            />
            <StatCard
              label="Output length"
              value={`${result.outputLength.toLocaleString()} chars`}
            />
            <StatCard
              label="Mode"
              value={result.mode === "escape" ? "Escape" : "Unescape"}
            />
            <StatCard
              label={result.convertedLabel}
              value={result.convertedCount.toLocaleString()}
            />
          </div>
        </div>
      ) : null}

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            HTML Escaping Is Context-Specific Output Encoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML character references let special characters appear as data
            instead of being interpreted as HTML syntax. For example,
            &amp;lt; represents a literal less-than sign and &amp;amp;
            represents an ampersand. This is useful for code samples,
            user-entered text, CMS fields, logs, and other values that should
            be displayed literally.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML text, quoted HTML attributes, JavaScript, CSS, and URLs are
            different parsing contexts. Encoding that is appropriate for one
            context is not automatically correct for another. This tool
            performs HTML character-reference encoding; it is not a JavaScript,
            CSS, shell, or URL encoder.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the Escape Options Change
          </h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Ampersand and angle brackets:</strong> escaped by
                default because they are central to HTML markup and character
                references.
              </li>
              <li>
                <strong>Double quote:</strong> useful when a value may appear
                inside a double-quoted HTML attribute.
              </li>
              <li>
                <strong>Apostrophe:</strong> useful when a value may appear
                inside a single-quoted HTML attribute.
              </li>
              <li>
                <strong>Named vs numeric:</strong> changes the representation,
                not the decoded character. Generated references always include
                a semicolon.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Named References and Missing Semicolons
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML supports a large standardized table of named character
            references. Some historical names may be recognized without a
            trailing semicolon in specific parser states, but the HTML
            specification treats many missing-semicolon cases as parse errors
            and the result can depend on whether the text appears in normal
            data or an attribute. Yoryantra therefore emits complete references
            such as &amp;amp; and &amp;quot;.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unescaping Can Produce Markup-Looking Text
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unescape mode uses browser HTML character-reference behavior, so
            references such as &amp;copy; and &amp;#169; can become their
            corresponding characters. The output box itself renders the result
            as text. If decoded untrusted content is later passed to an HTML
            sink such as <code>innerHTML</code>, decoding has not made that
            content safe.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Escaping Is Not the Same as HTML Sanitization
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Output encoding is appropriate when untrusted data should remain
            plain text in a known context. Sanitization is a different task:
            it is used when an application intentionally allows some HTML and
            needs to remove or restrict unsafe markup. Keep framework
            auto-escaping enabled where possible and use a maintained sanitizer
            when rich HTML must be accepted.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Browser-Local Conversion
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The escape and unescape operations run in your browser. This tool
            does not send the pasted text to an encoding or decoding API.
            Site-wide analytics or advertising scripts, if enabled by the
            website, are separate from the conversion operation itself.
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
                href="https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                WHATWG HTML parsing rules — named character reference state
              </a>
            </p>
            <p>
              <a
                href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--green)] underline underline-offset-4"
              >
                OWASP Cross Site Scripting Prevention Cheat Sheet
              </a>
            </p>
          </div>
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
  options: {
    escapeStyle: EscapeStyle;
    escapeQuotes: boolean;
    escapeApostrophes: boolean;
  }
) {
  return value.replace(/[&<>"']/g, (character) => {
    if (character === "&") {
      return options.escapeStyle === "numeric" ? "&#38;" : "&amp;";
    }
    if (character === "<") {
      return options.escapeStyle === "numeric" ? "&#60;" : "&lt;";
    }
    if (character === ">") {
      return options.escapeStyle === "numeric" ? "&#62;" : "&gt;";
    }
    if (character === '"') {
      if (!options.escapeQuotes) return character;
      return options.escapeStyle === "numeric" ? "&#34;" : "&quot;";
    }
    if (character === "'") {
      if (!options.escapeApostrophes) return character;
      return options.escapeStyle === "numeric" ? "&#39;" : "&apos;";
    }
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
    if (character === "&" || character === "<" || character === ">") {
      count += 1;
    } else if (character === '"' && options.escapeQuotes) {
      count += 1;
    } else if (character === "'" && options.escapeApostrophes) {
      count += 1;
    }
  }

  return count;
}

function countDecodedReferences(input: string) {
  const candidates =
    input.match(/&(?:#(?:x[0-9a-f]+|\d+)|[a-z][a-z0-9]+);?/gi) || [];

  return candidates.reduce((count, candidate) => {
    return count + (unescapeHtml(candidate) !== candidate ? 1 : 0);
  }, 0);
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
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
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}
