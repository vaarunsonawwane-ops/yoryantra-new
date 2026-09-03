"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "escape" | "unescape";
type EscapeStyle = "named" | "numeric";

type Result = {
  output: string;
  inputLength: number;
  outputLength: number;
  mode: Mode;
  escapeStyle: EscapeStyle;
};

const escapeExample = `<div class="message">Sneha & API docs</div>`;
const unescapeExample = `&lt;div class=&quot;message&quot;&gt;Sneha &amp; API docs&lt;/div&gt;`;

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
    if (input.length === 0 || (trimInput && !input.trim())) {
      setError(
        mode === "escape"
          ? "Enter HTML or text to escape."
          : "Enter text containing HTML character references to decode."
      );
      setOutput("");
      setResult(null);
      setCopied(false);
      return;
    }

    try {
      const source = trimInput ? input.trim() : input;
      const nextOutput =
        mode === "escape"
          ? escapeHtml(source, { escapeStyle, escapeQuotes, escapeApostrophes })
          : unescapeHtml(source);

      setResult({
        output: nextOutput,
        inputLength: source.length,
        outputLength: nextOutput.length,
        mode,
        escapeStyle,
      });
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch {
      setError(
        mode === "escape"
          ? "Unable to escape this text."
          : "Unable to decode this HTML text in the browser."
      );
      setOutput("");
      setResult(null);
      setCopied(false);
    }
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
      description="Escape HTML-sensitive characters or decode HTML character references for code samples, CMS content, templates, API debugging, and frontend work."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            Input HTML or Text
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste raw text or markup to escape, or paste character-reference text to decode.
            The conversion runs in this browser tab.
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
                { label: "Named entities", value: "named" },
                { label: "Decimal numeric entities", value: "numeric" },
              ]}
            />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
              Decode mode uses the browser&apos;s HTML character-reference parsing rules,
              including recognized named and numeric references.
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
            ? "Escape mode targets &, <, >, double quotes, and apostrophes. Ordinary Unicode text is left alone."
            : "Decoding is a single pass. For example, &amp;lt; becomes &lt;, not <, because the outer reference is decoded first."}
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
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto"
        >
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
                  Review the result in the context where you will use it before copying it into production code.
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
            <StatCard
              label="Entity style"
              value={result.mode === "escape" ? (result.escapeStyle === "named" ? "Named" : "Decimal numeric") : "Browser decode"}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          What stays local—and what escaping cannot protect
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          The pasted value is transformed by client-side JavaScript; no application-server request is made with that value. HTML escaping only protects the HTML context it was designed for. URL components, JavaScript, CSS, and intentionally rendered HTML each need their own handling.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What HTML Escaping Actually Changes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML character references let source text represent characters that otherwise have a special role in HTML syntax. The two references most commonly needed in normal HTML text are <code className="font-mono text-sm">&amp;lt;</code> for a literal less-than sign and <code className="font-mono text-sm">&amp;amp;</code> for a literal ampersand. Quotes become especially important when a value is placed inside a quoted HTML attribute.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Replacing every non-ASCII character is usually unnecessary. With a correctly declared UTF-8 document, characters such as ©, é, ₹, or emoji can normally remain as literal Unicode text. Character references earn their place when a character is syntactically significant, difficult to type, or required by the surrounding format.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Named vs Numeric Character References</h2>

          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Character</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Named output</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Numeric output</th>
                  <th className="border-b border-gray-200 px-4 py-3 font-semibold">Why it matters</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <ReferenceRow character={"&"} named={"&amp;"} numeric={"&#38;"} note="Starts character-reference syntax." />
                <ReferenceRow character={"<"} named={"&lt;"} numeric={"&#60;"} note="Can start an HTML tag or markup construct." />
                <ReferenceRow character={">"} named={"&gt;"} numeric={"&#62;"} note="Often encoded for symmetry; it is less frequently required in plain text." />
                <ReferenceRow character={'"'} named={"&quot;"} numeric={"&#34;"} note="Important inside double-quoted attribute values." />
                <ReferenceRow character={"'"} named={"&apos;"} numeric={"&#39;"} note="Important inside single-quoted attribute values." />
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Named mode emits the HTML named references for these five characters, including <code className="font-mono text-xs">&amp;apos;</code>. Numeric mode uses decimal references. Decode mode accepts the much larger set of browser-recognized named and numeric references.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">HTML Context Matters More Than the Word “Escape”</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard title="HTML text between tags">
              Encoding <code className="font-mono text-xs">&amp;</code> and <code className="font-mono text-xs">&lt;</code> prevents text from being interpreted as character-reference syntax or markup. Encoding <code className="font-mono text-xs">&gt;</code> is commonly harmless but is not universally required in ordinary text.
            </InfoCard>
            <InfoCard title="Quoted HTML attributes">
              Keep the attribute value quoted and encode the quote character that delimits it. A generic five-character encoder is helpful for inspection, but application code should use a framework or encoder designed for the exact output context.
            </InfoCard>
            <InfoCard title="JavaScript, CSS, and URLs">
              HTML entity encoding is not the correct general-purpose encoding for inline JavaScript, CSS values, or URL components. Those parsers have different escaping rules.
            </InfoCard>
            <InfoCard title="HTML that must remain markup">
              If users are intentionally allowed to submit formatted HTML, escaping will make the tags visible as text. That case needs an HTML sanitizer and a carefully controlled rendering path instead.
            </InfoCard>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Double Encoding and Single-Pass Decoding</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A common production bug is escaping text that has already been escaped. For example, escaping <code className="font-mono text-sm">&amp;lt;</code> produces <code className="font-mono text-sm">&amp;amp;lt;</code>. A browser then displays <code className="font-mono text-sm">&amp;lt;</code> instead of the intended <code className="font-mono text-sm">&lt;</code>. The fix is usually to identify the correct encoding boundary rather than repeatedly decoding until the text “looks right.”
          </p>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`Raw text:             <strong>Hi</strong>
Escaped once:         &lt;strong&gt;Hi&lt;/strong&gt;
Escaped twice:        &amp;lt;strong&amp;gt;Hi&amp;lt;/strong&amp;gt;
Decode one pass:      &lt;strong&gt;Hi&lt;/strong&gt;`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What Unescape Mode Uses</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unescape mode asks the browser&apos;s HTML parser to interpret character references and returns the resulting text. That means it can decode decimal references such as <code className="font-mono text-sm">&amp;#169;</code>, hexadecimal references such as <code className="font-mono text-sm">&amp;#xA9;</code>, and recognized named references such as <code className="font-mono text-sm">&amp;copy;</code>.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML also retains some legacy named references that browsers accept without a semicolon in limited situations. Do not treat successful decoding as proof that the original source used the clearest or most portable syntax. When you generate HTML yourself, prefer complete references with their terminating semicolon.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Where HTML escaping usually goes wrong</h2>

          <ul className="mt-4 list-disc space-y-3 pl-6 text-gray-600 leading-relaxed">
            <li><strong>Escaping too early:</strong> data is encoded in storage and then encoded again by the rendering layer.</li>
            <li><strong>Escaping for the wrong parser:</strong> HTML encoding is applied to data that will actually be inserted into JavaScript, CSS, or a URL component.</li>
            <li><strong>Turning sanitization into encoding:</strong> rich HTML is escaped, which prevents XSS but also destroys the intended formatting.</li>
            <li><strong>Turning encoding into sanitization:</strong> untrusted HTML is decoded and then inserted with an unsafe HTML sink because the text “looked encoded.”</li>
            <li><strong>Changing whitespace unintentionally:</strong> enable the trim option only when leading and trailing whitespace are not significant to the target format.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The browser rules behind the references
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The exact character-reference grammar and the browser&apos;s longest-match parsing behavior come from the{" "}
            <a
              href="https://html.spec.whatwg.org/multipage/syntax.html#character-references"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              WHATWG HTML syntax
            </a>
            {" "}and its{" "}
            <a
              href="https://html.spec.whatwg.org/multipage/named-characters.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              named-character-reference table
            </a>
            . When the question is security rather than syntax, OWASP&apos;s{" "}
            <a
              href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              XSS Prevention Cheat Sheet
            </a>
            {" "}is the better reference because it separates HTML text, attributes, JavaScript, CSS, URL contexts, sanitization, and unsafe sinks.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When the next problem is not HTML text
          </h2>

          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/html-escape-unescape" />
          </div>
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
    if (character === "&") return options.escapeStyle === "numeric" ? "&#38;" : "&amp;";
    if (character === "<") return options.escapeStyle === "numeric" ? "&#60;" : "&lt;";
    if (character === ">") return options.escapeStyle === "numeric" ? "&#62;" : "&gt;";
    if (character === '"') {
      return options.escapeQuotes
        ? options.escapeStyle === "numeric"
          ? "&#34;"
          : "&quot;"
        : character;
    }
    if (character === "'") {
      return options.escapeApostrophes
        ? options.escapeStyle === "numeric"
          ? "&#39;"
          : "&apos;"
        : character;
    }
    return character;
  });
}

function unescapeHtml(value: string) {
  let output = "";
  let index = 0;

  while (index < value.length) {
    if (value[index] !== "&") {
      output += value[index];
      index += 1;
      continue;
    }

    const decoded = decodeHtmlReferenceAt(value, index);

    if (!decoded) {
      output += "&";
      index += 1;
      continue;
    }

    output += decoded.value;
    index += decoded.length;
  }

  return output;
}

function decodeHtmlReferenceAt(source: string, start: number) {
  const remaining = source.slice(start);
  const numeric = remaining.match(/^&#(?:[xX][0-9A-Fa-f]+|[0-9]+);?/);

  if (numeric) {
    const decoded = decodeSingleHtmlReference(numeric[0]);
    if (decoded !== numeric[0]) {
      return { value: decoded, length: numeric[0].length };
    }
  }

  const named = remaining.match(/^&([A-Za-z][A-Za-z0-9]*)(;?)/);
  if (!named) return null;

  const name = named[1];
  const hasSemicolon = named[2] === ";";

  if (hasSemicolon) {
    const candidate = `&${name};`;
    const decoded = decodeSingleHtmlReference(candidate);
    if (decoded !== candidate) {
      return { value: decoded, length: candidate.length };
    }
  }

  for (let end = name.length; end >= 1; end -= 1) {
    const candidate = `&${name.slice(0, end)}`;
    const decoded = decodeSingleHtmlReference(candidate);

    if (decoded !== candidate) {
      return { value: decoded, length: candidate.length };
    }
  }

  return null;
}

function decodeSingleHtmlReference(reference: string) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = reference;
  return textarea.value;
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
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 shrink-0 h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
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

function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{children}</p>
    </div>
  );
}

function ReferenceRow({
  character,
  named,
  numeric,
  note,
}: {
  character: string;
  named: string;
  numeric: string;
  note: string;
}) {
  return (
    <tr>
      <td className="border-b border-gray-100 px-4 py-3 font-mono text-gray-900">{character}</td>
      <td className="border-b border-gray-100 px-4 py-3 font-mono">{named}</td>
      <td className="border-b border-gray-100 px-4 py-3 font-mono">{numeric}</td>
      <td className="border-b border-gray-100 px-4 py-3">{note}</td>
    </tr>
  );
}
