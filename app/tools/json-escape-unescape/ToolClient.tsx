"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [hasResult, setHasResult] = useState(false);

  const escapeJSON = () => {
    setError("");
    setCopyStatus("");

    if (!input) {
      setOutput('""');
      setHasResult(true);
      return;
    }

    try {
      setOutput(JSON.stringify(input));
      setHasResult(true);
    } catch {
      setOutput("");
      setHasResult(false);
      setError("Unable to create a JSON string literal from this text.");
    }
  };

  const unescapeJSON = () => {
    setError("");
    setCopyStatus("");

    if (!input.trim()) {
      setOutput("");
      setHasResult(false);
      setError('Enter a complete JSON string literal, for example "line\\nnext".');
      return;
    }

    try {
      const parsed: unknown = JSON.parse(input);

      if (typeof parsed !== "string") {
        setOutput("");
        setHasResult(false);
        setError(
          "This tool unescapes one JSON string literal, not a JSON object, array, number, boolean, or null. Use the JSON Validator for complete JSON documents."
        );
        return;
      }

      setOutput(parsed);
      setHasResult(true);
    } catch (caught) {
      setOutput("");
      setHasResult(false);
      setError(
        caught instanceof SyntaxError
          ? `Invalid JSON string literal: ${caught.message}`
          : "Unable to unescape this JSON string literal."
      );
    }
  };

  const copyOutput = async () => {
    if (!hasResult) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Copy failed. Select the output and copy it manually.");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setCopyStatus("");
    setHasResult(false);
  };

  return (
    <ToolShell
      title="JSON Escape Unescape"
      description="Turn plain text into a valid JSON string literal, or decode one JSON string literal back to its text value."
    >
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
        <strong>Scope:</strong> this tool works with <em>JSON strings</em>. Escape wraps your text in JSON quotation marks and applies the required backslash escapes. Unescape expects a complete quoted JSON string literal such as <code>&quot;hello\\nworld&quot;</code>.
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="json-string-input" className="text-sm font-medium text-gray-700">
            Input
          </label>
          <span className="text-xs text-gray-500">{input.length.toLocaleString()} characters</span>
        </div>

        <textarea
          id="json-string-input"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
            setHasResult(false);
            setError("");
            setCopyStatus("");
          }}
          placeholder={'Plain text to escape, or a JSON string literal such as "line\\nnext"'}
          spellCheck={false}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={escapeJSON} className="yoryantra-btn">
          Escape as JSON String
        </button>
        <button type="button" onClick={unescapeJSON} className="yoryantra-btn-outline">
          Unescape JSON String
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700 overflow-auto"
        >
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>
          {hasResult && (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[180px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {hasResult ? output || "(empty string)" : "Escaped or unescaped text will appear here..."}
        </pre>

        {copyStatus && (
          <p aria-live="polite" className="mt-2 text-sm text-gray-600">
            {copyStatus}
          </p>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy and security boundary</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Escaping and unescaping on this page uses the browser&apos;s built-in <code>JSON.stringify()</code> and <code>JSON.parse()</code> functions; the text is not sent to a Yoryantra conversion API. JSON escaping is syntax handling, not sanitization. A correctly escaped string can still contain unsafe HTML, SQL, shell commands, secrets, or application data, so validate and encode again for the destination context when required.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What this tool actually escapes</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON has a specific grammar for strings. A JSON string starts and ends with a double quotation mark. Inside it, quotation marks, backslashes, and control characters such as newline, tab, carriage return, backspace, and form feed must be represented with escape sequences. RFC 8259 requires every control character from U+0000 through U+001F to be escaped.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Clicking <strong>Escape as JSON String</strong> takes the textarea&apos;s plain text value and serializes that one value as JSON. That means the result includes the surrounding quotation marks. Clicking <strong>Unescape JSON String</strong> does the inverse, but only if the input parses to a JSON string value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Examples that show the boundary</h2>
          <div className="mt-4 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <div>
              <p className="font-medium text-gray-900">Quotes and a newline</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`Plain text:
She said "hello".
Next line

JSON string literal:
"She said \\"hello\\".\\nNext line"`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">Windows-style path</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`Plain text: C:\\temp\\file.txt
JSON string literal: "C:\\\\temp\\\\file.txt"`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">Unicode</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`Plain text: पुणे 😀
Possible JSON output: "पुणे 😀"`}</pre>
              <p className="mt-2 leading-relaxed">JSON does not require ordinary non-ASCII characters to be converted to <code>\\uXXXX</code> escapes. Literal Unicode is valid when the JSON text is encoded as UTF-8.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON string escaping is not the same as escaping a whole JSON document</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An object such as <code>{`{"name":"Asha"}`}</code> is already a JSON object text. If you paste that object as plain text and escape it here, the tool intentionally creates a <em>string containing the object text</em>: <code>{`"{\\"name\\":\\"Asha\\"}"`}</code>. That is useful when JSON itself must travel inside another JSON string, but it is not the same data type as the original object.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Likewise, unescape rejects an object, array, number, boolean, or <code>null</code>. That guard prevents a common runtime mistake where a parsed object is treated as displayable text. Use a JSON validator or formatter when your input is a complete JSON document rather than one JSON string literal.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common mistakes and double escaping</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Escaping twice:</strong> a backslash created during the first serialization becomes escaped during the second. <code>\\n</code> can become <code>\\\\n</code> depending on the layer.</li>
            <li><strong>Removing the outer quotes blindly:</strong> the quotation marks are part of the JSON string literal grammar. Stripping them may leave content that is no longer valid JSON.</li>
            <li><strong>Confusing JSON with JavaScript source:</strong> JSON is a data format with its own grammar. A JavaScript template literal, single-quoted string, regular expression, or object literal can follow different rules.</li>
            <li><strong>Using JSON escaping for HTML safety:</strong> a JSON string embedded into an HTML or script context may need additional context-specific handling. JSON escaping alone is not a complete XSS defense.</li>
            <li><strong>Assuming <code>\/</code> is mandatory:</strong> JSON permits a slash to be escaped, but ordinary <code>/</code> is also valid. JavaScript&apos;s <code>JSON.stringify()</code> normally leaves it unescaped.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Control characters, Unicode escapes, and surrogate pairs</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON provides short escapes such as <code>\\n</code>, <code>\\t</code>, <code>\\r</code>, <code>\\b</code>, and <code>\\f</code>, plus the general <code>\\uXXXX</code> form. Characters outside the Basic Multilingual Plane can be represented as a pair of UTF-16 surrogate escapes, although modern JSON commonly carries the actual Unicode character directly in UTF-8.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unescaping follows the browser&apos;s JSON parser. Invalid escape names, incomplete <code>\\u</code> sequences, unescaped control characters, missing closing quotes, or other grammar errors are rejected instead of guessed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Practical workflows</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>Preparing a multiline message to place in a JSON configuration value.</li>
            <li>Inspecting a JSON-encoded log field whose content contains visible backslash sequences.</li>
            <li>Creating a nested payload where one system expects an entire JSON document as a string field rather than as an object.</li>
            <li>Checking whether a copied string literal contains valid JSON escapes before inserting it into test data.</li>
            <li>Separating a JSON-layer problem from later HTML, URL, shell, or database escaping requirements.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Limits</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>This page does not validate object schemas, required properties, data types inside an object, or business rules.</li>
            <li>It does not pretty-print an object because its unescape operation is intentionally restricted to one JSON string value.</li>
            <li>It does not convert text to JavaScript, HTML, XML, SQL, shell, CSV, or URL-safe syntax. Those destinations have different escaping rules.</li>
            <li>It cannot tell whether an apparently double-escaped value is accidental or required by a nested serialization layer; that depends on the receiving system.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards and primary references</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer">RFC 8259 — The JavaScript Object Notation (JSON) Data Interchange Format</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://ecma-international.org/publications-and-standards/standards/ecma-404/" target="_blank" rel="noreferrer">ECMA-404 — The JSON Data Interchange Syntax</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify" target="_blank" rel="noreferrer">MDN — JSON.stringify()</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" target="_blank" rel="noreferrer">MDN — JSON.parse()</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related tools</h2>
          <YoryantraRelatedTools currentHref="/tools/json-escape-unescape" />
        </div>
      </section>
    </ToolShell>
  );
}
