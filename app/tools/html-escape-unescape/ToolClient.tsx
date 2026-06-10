"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "escape" | "unescape";
type EscapeStyle = "named" | "numeric";

type Result = {
  output: string;
  inputLength: number;
  outputLength: number;
  convertedCount: number;
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
    if (!input.trim()) {
      setError(mode === "escape" ? "Please enter HTML or text to escape." : "Please enter HTML entities to unescape.");
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

      const nextResult: Result = {
        output: nextOutput,
        inputLength: source.length,
        outputLength: nextOutput.length,
        convertedCount: countChangedCharacters(source, nextOutput, mode),
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
      description="Escape HTML online, unescape HTML entities, encode special characters, and decode entity-heavy text for frontend, API, CMS, and content workflows."
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

          <YoryantraSelect
            label="Escape Style"
            value={escapeStyle}
            onChange={(value) => {
              setEscapeStyle(value as EscapeStyle);
              clearResult();
            }}
            options={[
              { label: "Named entities", value: "named" },
              { label: "Numeric entities", value: "numeric" },
            ]}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>

        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={escapeQuotes} onChange={setEscapeQuotes} label="Escape double quotes" />
          <Toggle checked={escapeApostrophes} onChange={setEscapeApostrophes} label="Escape apostrophes" />
          <Toggle checked={trimInput} onChange={setTrimInput} label="Trim outer whitespace before converting" />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Escaping converts characters like &lt;, &gt;, &, quotes, and apostrophes into entities so they can be displayed as text.
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
            <StatCard label="Changed" value={`${result.convertedCount.toLocaleString()} item${result.convertedCount === 1 ? "" : "s"}`} />
          </div>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Escaping HTML Text for Safe Display</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML escaping turns characters like angle brackets, quotes, and ampersands into HTML entities so browsers show them as text instead of reading them as markup. It is useful when you need to display code snippets, user-entered text, CMS content, or raw HTML safely.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML unescaping works in the other direction. It turns entity-heavy text copied from templates, feeds, APIs, databases, CMS fields, or logs back into readable characters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool keeps the flow simple: paste text, choose escape or unescape, convert, and copy the result.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This HTML Escape Unescape Tool Helps</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Showing raw HTML snippets on a page without letting the browser render them.</p>
            <p className="mt-2">Encoding user-facing text before placing it into an HTML context.</p>
            <p className="mt-2">Decoding entity-encoded text copied from CMS fields, templates, feeds, or APIs.</p>
            <p className="mt-2">Debugging content that looks broken because entities are mixed with normal text.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the HTML Escape Unescape Tool</h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text, HTML, or entity-encoded content into the input box.</li>
            <li>Choose <strong>Escape HTML</strong> when markup should be displayed as text.</li>
            <li>Choose <strong>Unescape HTML</strong> when entities should become readable characters.</li>
            <li>Adjust quote and apostrophe options if needed.</li>
            <li>Copy the output for frontend code, CMS content, API debugging, or documentation.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example HTML Escape and Unescape</h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">Before escaping:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">{`<div class="message">Yoryantra & tools</div>`}</pre>

            <p className="mt-4 font-medium text-gray-900">After escaping:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">{`&lt;div class=&quot;message&quot;&gt;Yoryantra &amp; tools&lt;/div&gt;`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">HTML Characters Commonly Escaped</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            These characters often need escaping because browsers may otherwise interpret them as markup, attributes, or entity syntax.
          </p>

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-700">
            <ul className="space-y-3">
              <li><strong>&amp;lt;</strong> represents &lt;</li>
              <li><strong>&amp;gt;</strong> represents &gt;</li>
              <li><strong>&amp;amp;</strong> represents &amp;</li>
              <li><strong>&amp;quot;</strong> represents a double quote</li>
              <li><strong>&amp;#39;</strong> represents an apostrophe</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Escaping Is Not the Same as Full HTML Sanitizing</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Escaping is useful when text should be shown safely as text. Sanitizing is a broader security step that removes or restricts unsafe HTML. If you are accepting untrusted HTML from users, use a proper sanitizing approach in your application.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>

          <div className="mt-5 space-y-6">
            <Faq title="What does HTML escaping do?">
              HTML escaping converts special characters such as &lt;, &gt;, &, quotes, and apostrophes into HTML entities so they can be safely displayed as text.
            </Faq>

            <Faq title="What does HTML unescaping do?">
              HTML unescaping decodes entities like &amp;lt;, &amp;gt;, and &amp;amp; back into readable characters.
            </Faq>

            <Faq title="Is escaping the same as sanitizing HTML?">
              No. Escaping converts special characters into entities. Sanitizing is a broader security process that removes or limits unsafe markup.
            </Faq>

            <Faq title="Can I decode HTML entities online without uploading the text?">
              Yes. Escaping and unescaping happen directly in your browser, so pasted text is not sent to a server.
            </Faq>

            <Faq title="When should I escape HTML?">
              Escape HTML when you want markup-like text to appear as text instead of being interpreted by the browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML escaping often connects with URL encoding, JSON escaping, XML escaping, Unicode text, and frontend debugging workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tools/json-escape-unescape" className="yoryantra-btn-outline">JSON Escape Unescape</Link>
            <Link href="/tools/xml-escape-unescape" className="yoryantra-btn-outline">XML Escape Unescape</Link>
            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">URL Encoder Decoder</Link>
            <Link href="/tools/unicode-encoder-decoder" className="yoryantra-btn-outline">Unicode Encoder Decoder</Link>
            <Link href="/categories/encoding-tools" className="yoryantra-btn-outline">Encoding Tools</Link>
          </div>
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

function countChangedCharacters(input: string, output: string, mode: Mode) {
  if (mode === "escape") {
    return (input.match(/[&<>"']/g) || []).length;
  }

  return (output.match(/[&<>"']/g) || []).length;
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

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
