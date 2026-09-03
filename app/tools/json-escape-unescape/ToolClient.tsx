"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

function countUnpairedSurrogates(value: string) {
  let count = 0;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = index + 1 < value.length ? value.charCodeAt(index + 1) : -1;

      if (next >= 0xdc00 && next <= 0xdfff) {
        index += 1;
      } else {
        count += 1;
      }

      continue;
    }

    if (code >= 0xdc00 && code <= 0xdfff) {
      count += 1;
    }
  }

  return count;
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [hasResult, setHasResult] = useState(false);

  const clearMessages = () => {
    setError("");
    setNote("");
    setCopyStatus("");
  };

  const escapeJSON = () => {
    clearMessages();

    try {
      const unpaired = countUnpairedSurrogates(input);
      const serialized = JSON.stringify(input);

      setOutput(serialized);
      setHasResult(true);

      if (unpaired) {
        setNote(
          `${unpaired} unpaired UTF-16 surrogate${
            unpaired === 1 ? " was" : "s were"
          } found. Modern JSON.stringify() escapes lone surrogates, but JSON containing them can behave differently across non-JavaScript systems.`
        );
      }
    } catch {
      setOutput("");
      setHasResult(false);
      setError("Unable to create a JSON string literal from this text.");
    }
  };

  const unescapeJSON = () => {
    clearMessages();

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
          "The input is valid JSON, but it is not a JSON string value. Paste one quoted string literal rather than an object, array, number, boolean, or null."
        );
        return;
      }

      setOutput(parsed);
      setHasResult(true);

      const unpaired = countUnpairedSurrogates(parsed);

      if (unpaired) {
        setNote(
          `The decoded value contains ${unpaired} unpaired UTF-16 surrogate${
            unpaired === 1 ? "" : "s"
          }. RFC 8259 notes that JSON texts containing such values can produce unpredictable behavior between implementations.`
        );
      }
    } catch (caught) {
      setOutput("");
      setHasResult(false);
      setError(
        caught instanceof SyntaxError
          ? `Invalid JSON string literal: ${caught.message}`
          : "Unable to decode this JSON string literal."
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
    setNote("");
    setCopyStatus("");
    setHasResult(false);
  };

  return (
    <ToolShell
      title="JSON Escape Unescape"
      description="Turn plain text into one JSON string literal, or decode one quoted JSON string back to its text value without changing the value into another JSON type."
    >
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Escape starts with ordinary text and produces a quoted JSON string literal.
        Unescape starts with one complete quoted JSON string such as
        <code> &quot;hello\\nworld&quot;</code>. Objects and arrays are a different job.
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="json-string-input" className="text-sm font-medium text-gray-700">
            Input
          </label>
          <span className="text-xs text-gray-500">
            {input.length.toLocaleString()} characters
          </span>
        </div>

        <textarea
          id="json-string-input"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setHasResult(false);
            setError("");
            setNote("");
            setCopyStatus("");
          }}
          placeholder={'Plain text to escape, or a JSON string literal such as "line\\nnext"'}
          spellCheck={false}
          className="min-h-[240px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
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

      {error ? (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 overflow-auto rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          {error}
        </div>
      ) : null}

      {note ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-700">
          {note}
        </div>
      ) : null}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Result</h3>
          {hasResult ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          ) : null}
        </div>

        <pre className="yoryantra-output min-h-[180px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {hasResult
            ? output || "(empty string)"
            : "Escaped or unescaped text will appear here..."}
        </pre>

        {copyStatus ? (
          <p aria-live="polite" className="mt-2 text-sm text-gray-600">
            {copyStatus}
          </p>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          JSON escaping is not sanitization
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          Serialization and parsing happen in the browser with
          <code> JSON.stringify()</code> and <code>JSON.parse()</code>. A valid JSON
          string can still contain HTML, SQL, shell text, secrets, or another nested
          data format. Encode or validate again for the destination context rather
          than treating the JSON layer as a security boundary.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A JSON string is a value, not just text with backslashes
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON strings begin and end with double quotation marks. Inside those
            quotes, the quotation mark itself, the backslash, and control characters
            from U+0000 through U+001F need escape syntax. Newline and tab have short
            forms such as <code>\\n</code> and <code>\\t</code>; any 16-bit code unit
            can also be written with <code>\\uXXXX</code> syntax.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Escaping plain text therefore includes the outer quotation marks. That is
            important when the result is going into a JSON property. Removing the
            quotes afterward does not produce the same JSON value; it produces a
            fragment of text whose meaning depends on another layer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quotes, paths, and nested JSON show three different layers
          </h2>
          <div className="mt-4 space-y-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">A quote and a newline</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">{`Plain text:
Sneha said "hello".
Next line

JSON string literal:
"Sneha said \\"hello\\".\\nNext line"`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">A Windows path</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">{`Plain text: C:\\temp\\file.txt
JSON string literal: "C:\\\\temp\\\\file.txt"`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">JSON stored as a string</p>
              <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">{`Original JSON object text:
{"name":"Sneha"}

The same characters stored as one JSON string value:
"{\\"name\\":\\"Sneha\\"}"`}</pre>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            An object and a string containing an object are different data
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>{`{"name":"Sneha"}`}</code> is a JSON object. If those characters
            are escaped as plain text, the result is a JSON string whose value happens
            to look like object syntax. The receiver must parse another JSON layer if
            it genuinely expects nested JSON text.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unescape deliberately rejects objects, arrays, numbers, booleans, and
            <code> null</code>. That keeps a string-decoding operation from quietly
            turning into a general JSON parser. For complete documents, validation
            and formatting belong at the document level instead.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Double escaping may be a bug or a real second serialization layer
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            A newline represented by <code>\\n</code> becomes <code>\\\\n</code>
            when that already-escaped text is serialized again. Sometimes that is
            exactly what a nested message, log envelope, or database field requires.
            Sometimes it means the same value was escaped twice by accident.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            The characters alone cannot tell you which case you have. Follow the data
            across each serialization boundary and count how many times a JSON parser
            will run before the final string is consumed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Unicode normally stays readable, but lone surrogates deserve attention
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Ordinary Unicode characters do not need to be converted to
            <code>\\uXXXX</code>. A JSON text exchanged between systems is normally
            encoded as UTF-8, so text such as <code>पुणे 😀</code> can remain visible
            in the serialized string.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript strings are sequences of UTF-16 code units, which means they
            can contain an isolated high or low surrogate. Modern
            <code> JSON.stringify()</code> serializes lone surrogates with escape
            syntax so the JSON text remains well formed. RFC 8259 nevertheless warns
            that strings containing unpaired surrogates can behave unpredictably
            across implementations, so a notice appears when one is detected.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JSON permits more than JavaScript source and less than many config files
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>JSON strings use double quotes; single-quoted JavaScript strings are not JSON strings.</li>
            <li>Unknown escapes such as <code>\\x41</code> are not JSON string escapes, even though JavaScript source has additional escape forms.</li>
            <li>A solidus may appear as <code>/</code> or <code>\\/</code>; escaping it is optional in JSON.</li>
            <li>Comments and trailing commas belong to other formats or extensions, not standard JSON.</li>
            <li>U+2028 and U+2029 are valid JSON string characters; embedding JSON into another language or HTML context can add separate requirements.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The grammar comes from JSON, while the behavior here comes from JavaScript
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 8259
            </a>{" "}
            defines interoperable JSON syntax and UTF-8 expectations, including the
            warning about unpaired surrogates. The concise syntax definition is also
            published as{" "}
            <a
              href="https://ecma-international.org/publications-and-standards/standards/ecma-404/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              ECMA-404
            </a>
            . The actual escape and unescape operations on this page follow the
            browser&apos;s ECMAScript <code>JSON.stringify()</code> and
            <code> JSON.parse()</code> implementations.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What the JSON layer cannot decide
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>Whether a nested JSON-looking string was intentionally serialized twice.</li>
            <li>Whether a string is safe for HTML, a URL, SQL, a shell, XML, or a filesystem path.</li>
            <li>Whether an object follows a schema or an application&apos;s business rules.</li>
            <li>Whether a secret should have been present in the copied text in the first place.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            When the next layer is JSON itself
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-escape-unescape" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
