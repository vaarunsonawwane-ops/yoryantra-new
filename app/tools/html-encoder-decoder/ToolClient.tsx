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
          if (codePoint >= 0xd800 && codePoint <= 0xdfff) {
            throw new Error(
              `U+${codePoint.toString(16).toUpperCase()} is an unpaired UTF-16 surrogate, not a Unicode scalar value. Replace or remove it before generating numeric HTML references.`
            );
          }
          if (codePoint >= 0x80 && codePoint <= 0x9f) {
            throw new Error(
              `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")} is a C1 control character. HTML numeric character-reference parsing has legacy remapping rules in this range, so an ASCII-only numeric reference would not be a reliable round trip.`
            );
          }
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

    try {
      setOutput(encodeHtml(input, encodeMode));
      setError("");
      setCopied(false);
    } catch (encodeError) {
      setOutput("");
      setCopied(false);
      setError(encodeError instanceof Error ? encodeError.message : "Unable to encode this text.");
    }
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

        <pre aria-live="polite" className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Encoded or decoded output will appear here..."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-gray-900">What stays local, and what escaping cannot protect</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Encoding and decoding happen in the browser without sending the entered value to a conversion API. Escaping characters is still different from sanitizing untrusted HTML, and decoded text should not be inserted into an active page as markup unless that destination is handled safely.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Character references change the spelling, not the character</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML can write a character directly or represent it with a character reference. <code>&amp;amp;</code> is a named reference, <code>&amp;#38;</code> is decimal, and <code>&amp;#x26;</code> is hexadecimal; all three can represent an ampersand in an HTML context where character references are recognized. The syntax and parsing rules come from the <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://html.spec.whatwg.org/multipage/syntax.html#character-references" target="_blank" rel="noreferrer">WHATWG HTML character-reference rules</a>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For ordinary modern HTML, readable Unicode is normally preferable to turning every non-ASCII character into a numeric reference. The reserved-character mode focuses on ampersand, angle brackets, quotes, and apostrophes. The ASCII-safe option is mainly for inspecting code points or working with a text pipeline that genuinely requires ASCII-only source.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Literal markup in documentation</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Input:</p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`<p title="A & B">Café ☕</p>`}</pre>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">Reserved-character output:</p>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-white p-3 text-sm text-gray-800">{`&lt;p title=&quot;A &amp; B&quot;&gt;Café ☕&lt;/p&gt;`}</pre>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Numeric references and Unicode</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              In ASCII-safe mode, <strong>é</strong> becomes <code>&amp;#xE9;</code> and 😀 becomes <code>&amp;#x1F600;</code>. Supplementary characters are handled by Unicode code point, so an emoji becomes one numeric reference rather than two UTF-16 surrogate references.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Turning Unicode into references does not repair a wrong charset declaration or corrupted bytes. It only changes how the same character is written in HTML source.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              C1 controls (U+0080–U+009F) and unpaired UTF-16 surrogates are rejected in ASCII-safe mode. HTML has legacy numeric-reference remapping in the C1 range, while surrogate references become the replacement character, so emitting those references would not preserve the original code unit faithfully.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Escape for the place where the value will be inserted</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML text, quoted attributes, URLs, JavaScript, and CSS are different output contexts. Escaping literal markup for a paragraph is not a universal security transformation. Frameworks normally apply the right escaping when values are inserted through ordinary text or attribute bindings; bypassing those protections deserves deliberate review.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-900">
                <tr><th className="px-4 py-3 font-semibold">Destination</th><th className="px-4 py-3 font-semibold">What to keep in mind</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-600">
                <tr><td className="px-4 py-3">Visible HTML text</td><td className="px-4 py-3">Escape markup-significant characters so literal tags remain text.</td></tr>
                <tr><td className="px-4 py-3">Quoted attribute</td><td className="px-4 py-3">The matching quote and ampersand matter; prefer the framework&apos;s normal attribute binding.</td></tr>
                <tr><td className="px-4 py-3">Untrusted rich HTML</td><td className="px-4 py-3">Character escaping alone cannot decide which elements, attributes, or URLs are safe.</td></tr>
                <tr><td className="px-4 py-3">JavaScript, CSS, or URL data</td><td className="px-4 py-3">Apply the rules for that language or URL component rather than HTML entity encoding.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            For untrusted rich HTML, the <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html" target="_blank" rel="noreferrer">OWASP Cross Site Scripting Prevention Cheat Sheet</a> is a better security reference than treating entity encoding as sanitization.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">Missing semicolons can be context-dependent</h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            HTML keeps historical support for a limited set of named references without a final semicolon. Parsing can also differ inside attributes when letters, digits, or an equals sign follow the candidate. The decoder therefore handles complete semicolon-terminated named references and numeric references rather than guessing every legacy named form.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            The <a className="font-medium text-[var(--green)] underline underline-offset-4" href="https://html.spec.whatwg.org/multipage/named-characters.html" target="_blank" rel="noreferrer">WHATWG named-character table</a> shows the supported names, including the small historical subset that can appear without a semicolon in some parsing states.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When encoded text starts looking strange</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Double encoding</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Encoding <code>&amp;lt;</code> again produces <code>&amp;amp;lt;</code>. If a page displays <code>&amp;lt;</code> instead of <code>&lt;</code>, trace which layer encoded an already encoded value rather than adding another decode step blindly.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Different spellings can mean the same character</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                An apostrophe can be written literally or with a numeric/named reference. Comparing raw source strings can therefore show a difference even when the browser displays the same character.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Entity decoding is not JSON unescaping</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                <code>&amp;#10;</code> belongs to HTML character-reference syntax; <code>\n</code> and <code>\u000A</code> belong to JSON/JavaScript string syntax. Decode the layer that actually produced the data.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900">Unknown names stay visible</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                A semicolon-terminated candidate that the browser does not recognize is left unchanged. That makes misspellings easier to spot instead of silently inventing a character.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When the problem belongs to another encoding layer</h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            URL percent-encoding, JSON string escapes, Base64, and HTML character references solve different representation problems. Following the data from its source to its final destination usually makes it clear which layer needs attention.
          </p>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/html-encoder-decoder" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
