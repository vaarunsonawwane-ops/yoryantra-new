"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type EncodeMode = "reserved" | "ascii-safe";

const ENTITY_CANDIDATE = /&(?:#[0-9]+;?|#[xX][0-9a-fA-F]+;?|[A-Za-z][A-Za-z0-9]+;)/g;

function encodeReservedCharacter(character: string): string | null {
  switch (character) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    case "'":
      return "&#39;";
    default:
      return null;
  }
}

function encodeHtml(text: string, mode: EncodeMode): string {
  return Array.from(text)
    .map((character) => {
      const reserved = encodeReservedCharacter(character);
      if (reserved) return reserved;

      if (mode === "ascii-safe") {
        const codePoint = character.codePointAt(0);
        if (typeof codePoint === "number" && codePoint > 0x7f) {
          return `&#x${codePoint.toString(16).toUpperCase()};`;
        }
      }

      return character;
    })
    .join("");
}

function decodeEntityCandidate(candidate: string): string {
  // Decode one character-reference candidate at a time. The candidate pattern
  // cannot contain markup such as '<', so this does not parse arbitrary HTML.
  const textarea = document.createElement("textarea");
  textarea.innerHTML = candidate;
  return textarea.value;
}

function decodeHtmlEntities(text: string): string {
  return text.replace(ENTITY_CANDIDATE, (candidate) => {
    const decoded = decodeEntityCandidate(candidate);
    return decoded === candidate ? candidate : decoded;
  });
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [encodeMode, setEncodeMode] = useState<EncodeMode>("reserved");

  const clearResult = () => {
    setOutput("");
    setError("");
    setCopied(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    clearResult();
  };

  const handleEncode = () => {
    if (input.length === 0) {
      setError("Enter text or HTML before encoding.");
      setOutput("");
      return;
    }

    setOutput(encodeHtml(input, encodeMode));
    setError("");
    setCopied(false);
  };

  const handleDecode = () => {
    if (input.length === 0) {
      setError("Enter text containing HTML character references before decoding.");
      setOutput("");
      return;
    }

    setOutput(decodeHtmlEntities(input));
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setError("The browser could not copy the output. Select it and copy manually.");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopied(false);
    setEncodeMode("reserved");
  };

  return (
    <ToolShell
      title="HTML Encoder Decoder"
      description="Encode reserved HTML characters, convert non-ASCII text to numeric character references when needed, or decode named and numeric HTML character references in your browser."
    >
      <div>
        <label htmlFor="html-entity-input" className="block mb-2 text-sm font-medium text-gray-700">
          Text or HTML
        </label>
        <textarea
          id="html-entity-input"
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder={'Example: <p title="Tom & Jerry">Café ☕</p> or &lt;p&gt;Hello&lt;/p&gt;'}
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => handleInputChange(event.target.value)}
          spellCheck={false}
        />
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
          <span>{input.length.toLocaleString()} characters</span>
          <span>Line breaks are preserved</span>
        </div>
      </div>

      <fieldset className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <legend className="px-1 text-sm font-semibold text-gray-900">Encoding mode</legend>
        <div className="mt-1 grid gap-3 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
            <input
              type="radio"
              name="html-encode-mode"
              value="reserved"
              checked={encodeMode === "reserved"}
              onChange={() => {
                setEncodeMode("reserved");
                clearResult();
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Reserved characters</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                Encodes &amp;, &lt;, &gt;, double quotes, and apostrophes. Normal Unicode text stays readable.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
            <input
              type="radio"
              name="html-encode-mode"
              value="ascii-safe"
              checked={encodeMode === "ascii-safe"}
              onChange={() => {
                setEncodeMode("ascii-safe");
                clearResult();
              }}
              className="mt-1 shrink-0"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Reserved + non-ASCII</span>
              <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                Also converts non-ASCII code points to hexadecimal numeric references such as &#xE9; and &#x1F600;.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={handleEncode} className="yoryantra-btn">
          Encode HTML
        </button>
        <button type="button" onClick={handleDecode} className="yoryantra-btn-outline">
          Decode Entities
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Output</h2>
          {output && (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Encoded or decoded output will appear here..."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h2 className="text-sm font-semibold text-yellow-900">Privacy and security boundary</h2>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          This component transforms the text in your browser and does not send the value to a conversion API. Encoding is not the same as sanitizing untrusted HTML, and decoding an entity does not make its resulting markup safe to insert into a page.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">HTML character references: what the tool actually changes</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML can represent certain characters with character references. A named reference uses a name such as <code>&amp;amp;</code> or <code>&amp;lt;</code>. A decimal numeric reference looks like <code>&amp;#169;</code>, while a hexadecimal numeric reference looks like <code>&amp;#xA9;</code>. Browsers interpret those references as characters when they are allowed by the HTML parsing context.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The default encoder deliberately changes only the small group of characters that commonly need attention when developers want literal markup to appear as text: ampersand, angle brackets, and quotes. The optional ASCII-safe mode also emits numeric references for non-ASCII characters. That second mode is useful for inspecting code points or working with a legacy text pipeline, but modern HTML is Unicode and normally does not require characters such as é, ₹, 日本語, or 😀 to be entity-encoded.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Encoding example</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Input:</p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`<p title="A & B">Café ☕</p>`}</pre>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Reserved-character output:</p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`&lt;p title=&quot;A &amp; B&quot;&gt;Café ☕&lt;/p&gt;`}</pre>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Numeric references</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              In ASCII-safe mode, non-ASCII code points are represented in hexadecimal form. For example, <strong>é</strong> becomes <code>&amp;#xE9;</code> and 😀 becomes <code>&amp;#x1F600;</code>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              The decoder accepts named references as well as decimal and hexadecimal numeric references supported by the browser&apos;s HTML parser. Unknown entity-like text is left unchanged instead of being guessed.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">HTML encoding is context-sensitive</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Escaping a few characters is useful, but secure output handling depends on where the value is inserted. Text between normal HTML elements, a quoted attribute, a URL-valued attribute, inline JavaScript, and inline CSS are different contexts. A transformation that is appropriate for one context is not automatically correct for another.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Situation</th>
                  <th className="px-4 py-3 font-semibold">What matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                <tr>
                  <td className="px-4 py-3">Showing literal markup as text</td>
                  <td className="px-4 py-3">Escape markup-significant characters so tags are displayed rather than interpreted.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Quoted HTML attribute</td>
                  <td className="px-4 py-3">The matching quote and ampersand require particular care; use your framework&apos;s normal attribute escaping.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Untrusted rich HTML</td>
                  <td className="px-4 py-3">Entity encoding alone is not a sanitizer. Use a well-maintained allow-list sanitizer and avoid unsafe DOM sinks.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">JavaScript, CSS, or URL context</td>
                  <td className="px-4 py-3">Use the encoder designed for that context; HTML entity encoding is not a universal escaping mechanism.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common mistakes and edge cases</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Double encoding</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Encoding <code>&amp;lt;</code> again produces <code>&amp;amp;lt;</code>. Decode only when you know a value is entity-encoded, and encode once at the final output boundary rather than repeatedly through every application layer.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Missing semicolons</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                HTML has legacy parsing rules for a limited set of semicolon-less named references, but those forms can be ambiguous beside letters or digits. This tool deliberately targets complete named references ending in a semicolon rather than guessing legacy context-dependent forms.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Apostrophe representations</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                This encoder emits <code>&amp;#39;</code> for an apostrophe. HTML also defines named forms, but numeric output is compact and widely understood. Different valid spellings can decode to the same character.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Unicode does not need “fixing”</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Emoji and multilingual characters are valid Unicode text. Converting them to numeric references changes representation, not meaning, and usually does not solve an incorrect character-encoding declaration or a broken data pipeline.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Practical developer workflows</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Documentation and code examples:</strong> encode literal tags before placing a raw snippet in HTML source.</li>
            <li><strong>CMS debugging:</strong> decode stored entities to see the text a browser will display, then inspect where double encoding entered the pipeline.</li>
            <li><strong>API inspection:</strong> distinguish HTML character references from JSON string escapes such as <code>\n</code> or <code>\u003C</code>; they are different encoding layers.</li>
            <li><strong>Legacy ASCII-only systems:</strong> use numeric references for non-ASCII code points only when the receiving HTML pipeline genuinely requires that representation.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Limitations of this browser tool</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>The encoder is a text transformation, not an HTML sanitizer, templating engine, validator, or Content Security Policy.</li>
            <li>The decoder follows the browser&apos;s HTML character-reference behavior. It does not parse and execute the decoded result as page markup.</li>
            <li>The reserved-character mode encodes five common characters; it does not attempt to rewrite every character that has a named HTML reference.</li>
            <li>ASCII-safe mode operates by Unicode code point, so supplementary characters such as emoji become a single numeric reference rather than UTF-16 surrogate references.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Official references</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            These specifications and security references are useful when deciding how character references should be handled in production code:
          </p>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-gray-600">
            <li>
              <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://html.spec.whatwg.org/multipage/syntax.html#character-references" target="_blank" rel="noreferrer">
                WHATWG HTML — Character references
              </a>
            </li>
            <li>
              <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://html.spec.whatwg.org/multipage/named-characters.html" target="_blank" rel="noreferrer">
                WHATWG HTML — Named character references
              </a>
            </li>
            <li>
              <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" target="_blank" rel="noreferrer">
                OWASP — Cross Site Scripting Prevention Cheat Sheet
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Use related encoding and data tools when the problem belongs to a different layer, such as URL percent-encoding, JSON string escaping, Base64, or general HTML escaping workflows.
          </p>
          <YoryantraRelatedTools currentHref="/tools/html-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}
