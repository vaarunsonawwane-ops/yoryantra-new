"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type EncodingMode = "component" | "url" | "form";

function hasMalformedPercentEscape(value: string) {
  return /%(?![0-9A-Fa-f]{2})/.test(value);
}

function hasPercentEscape(value: string) {
  return /%[0-9A-Fa-f]{2}/.test(value);
}

function describeEncodingError(action: "encode" | "decode") {
  return action === "encode"
    ? "Encoding failed because the JavaScript string contains malformed Unicode, such as an unpaired UTF-16 surrogate."
    : "Decoding failed. Check the percent escapes and make sure the encoded bytes form valid UTF-8.";
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<EncodingMode>("component");
  const [copyStatus, setCopyStatus] = useState("");
  const [hasResult, setHasResult] = useState(false);

  const clearResultState = () => {
    setError("");
    setNote("");
    setCopyStatus("");
  };

  const encodeURL = () => {
    clearResultState();

    try {
      let encoded = "";

      if (mode === "url") {
        encoded = encodeURI(input);
      } else if (mode === "form") {
        const params = new URLSearchParams();
        params.set("value", input);
        encoded = params.toString().slice("value=".length);
      } else {
        encoded = encodeURIComponent(input);
      }

      setOutput(encoded);
      setHasResult(true);

      if (hasPercentEscape(input)) {
        setNote(
          "The input already contains percent-encoded-looking text. Encoding it again changes % to %25, which is correct only when the percent sign itself is data."
        );
      }
    } catch {
      setOutput("");
      setHasResult(false);
      setError(describeEncodingError("encode"));
    }
  };

  const decodeURL = () => {
    clearResultState();

    if (hasMalformedPercentEscape(input)) {
      setOutput("");
      setHasResult(false);
      setError(
        "A percent sign that begins an escape must be followed by exactly two hexadecimal digits, such as %20 or %E2."
      );
      return;
    }

    try {
      let decoded = "";

      if (mode === "url") {
        decoded = decodeURI(input);
      } else if (mode === "form") {
        decoded = decodeURIComponent(input.replace(/\+/g, " "));
      } else {
        decoded = decodeURIComponent(input);
      }

      setOutput(decoded);
      setHasResult(true);
    } catch {
      setOutput("");
      setHasResult(false);
      setError(describeEncodingError("decode"));
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
    setMode("component");
  };

  return (
    <ToolShell
      title="URL Encoder Decoder"
      description="Percent-encode or decode a URL component, a complete URL-shaped string, or one form value without mixing their different delimiter rules."
    >
      <div>
        <label
          htmlFor="url-encoding-mode"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Encoding context
        </label>

        <select
          id="url-encoding-mode"
          value={mode}
          onChange={(event) => {
            setMode(event.target.value as EncodingMode);
            setOutput("");
            setHasResult(false);
            setError("");
            setNote("");
            setCopyStatus("");
          }}
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        >
          <option value="component">URL component / query parameter value</option>
          <option value="url">Complete URL-shaped string</option>
          <option value="form">Form value (application/x-www-form-urlencoded)</option>
        </select>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          {mode === "component" &&
            "Choose this for data that belongs inside one URL component, such as a query value or path segment."}
          {mode === "url" &&
            "Choose this when characters such as :, /, ?, #, and & are already acting as URL syntax and should stay readable."}
          {mode === "form" &&
            "Choose this for one form-style name or value, where a space is serialized as + and a literal + becomes %2B."}
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="url-input" className="text-sm font-medium text-gray-700">
            Input
          </label>
          <span className="text-xs text-gray-500">
            {input.length.toLocaleString()} characters
          </span>
        </div>

        <textarea
          id="url-input"
          className="min-h-[240px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder="Example: tea & coffee + Pune"
          value={input}
          spellCheck={false}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setHasResult(false);
            setError("");
            setNote("");
            setCopyStatus("");
          }}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={encodeURL} className="yoryantra-btn">
          Encode
        </button>
        <button type="button" onClick={decodeURL} className="yoryantra-btn-outline">
          Decode
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
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
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
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
            : "Encoded or decoded output will appear here..."}
        </pre>

        {copyStatus ? (
          <p aria-live="polite" className="mt-2 text-sm text-gray-600">
            {copyStatus}
          </p>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Percent-encoding does not hide a value
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          The transformation happens in the browser with JavaScript&apos;s URI APIs and
          <code> URLSearchParams</code>. Nothing here encrypts a token, password, path,
          or query value. Treat encoded secrets exactly like the original secret, and
          validate decoded data for the place where it will actually be used.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encode the data before it becomes a delimiter
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A URL is made from components, and several characters have structural
            jobs inside those components. An ampersand can separate query fields, a
            slash can separate path segments, and a question mark can begin a query.
            When one of those characters is ordinary data instead, it may need to be
            percent-encoded before the final URL is assembled.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Percent-encoding writes a byte as <code>%HH</code>. For text outside
            ASCII, modern web APIs first encode the characters as UTF-8 and then
            percent-encode the resulting bytes. That is why <code>प</code> becomes
            several <code>%HH</code> sequences rather than one escape.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            The same text changes depending on where it belongs
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Input</th>
                  <th className="px-4 py-3 font-semibold">Context</th>
                  <th className="px-4 py-3 font-semibold">Result / reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3"><code>tea &amp; coffee</code></td>
                  <td className="px-4 py-3">URL component</td>
                  <td className="px-4 py-3"><code>tea%20%26%20coffee</code> — the ampersand is data, not a separator.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code>https://example.com/a b?q=x</code></td>
                  <td className="px-4 py-3">Complete URL-shaped string</td>
                  <td className="px-4 py-3">The scheme and delimiters stay structural while the space is encoded.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3"><code>A+B C</code></td>
                  <td className="px-4 py-3">Form value</td>
                  <td className="px-4 py-3"><code>A%2BB+C</code> — literal plus is escaped and the space becomes <code>+</code>.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A plus sign is only a space in form-style decoding
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Generic URI percent-decoding does not turn <code>+</code> into a space.
            The plus-for-space convention belongs to
            <code> application/x-www-form-urlencoded</code>. That difference matters
            for search terms, signed parameters, identifiers, and any value where a
            literal plus sign carries meaning.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Form mode follows the browser&apos;s <code>URLSearchParams</code> behavior for
            one value. It is not a whole-query parser: repeated names, ordering, and
            blank fields are properties of the complete tuple list, not of a single
            value by itself.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Decode only after the URL has been separated into components
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Decoding <code>%2F</code> to <code>/</code> or <code>%3F</code> to
            <code>?</code> too early can change the structure you thought you were
            inspecting. RFC 3986 explicitly recommends separating components before
            decoding percent-encoded octets that could become delimiters.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700">
            The same caution applies to repeated transformations. If <code>%20</code>
            is already an encoded space, another encoding pass turns it into
            <code>%2520</code>. That may be required by a nested protocol layer, but
            it should be deliberate rather than automatic.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Malformed percent escapes and malformed Unicode fail for different reasons
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A percent escape needs two hexadecimal digits. Even when every escape is
            shaped correctly, decoding can still fail if the resulting byte sequence
            is not valid UTF-8. Encoding has a different failure mode: JavaScript URI
            functions reject an unpaired UTF-16 surrogate because it cannot be turned
            into a Unicode scalar value for UTF-8 encoding.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Those errors are left visible rather than repaired. Guessing at a missing
            byte or malformed character can produce a URL that looks plausible while
            identifying different data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            RFC 3986 and browser URLs describe different layers
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <a
              href="https://www.rfc-editor.org/rfc/rfc3986"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 3986
            </a>{" "}
            explains URI syntax, reserved characters, percent-encoding, and why the
            same string should not be blindly encoded or decoded more than once. The
            modern browser parsing model is defined by the{" "}
            <a
              href="https://url.spec.whatwg.org/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              WHATWG URL Standard
            </a>
            , which also defines <code>application/x-www-form-urlencoded</code> and
            its plus-for-space behavior.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Complete URL mode intentionally uses JavaScript&apos;s <code>encodeURI()</code>
            and <code>decodeURI()</code>. It does not run the string through the
            WHATWG <code>URL</code> parser, so it will not normalize a hostname,
            default port, dot segments, or an internationalized domain name.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What a text transformation cannot decide
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>Whether a complete URL exists, resolves, redirects, or is safe to visit.</li>
            <li>Whether a decoded value is authorized, trusted, or valid for an application.</li>
            <li>Whether an encoded slash should remain data or become a path separator.</li>
            <li>Whether double encoding is accidental or required by another serialization layer.</li>
            <li>Whether URL encoding is the right defense for HTML, SQL, shell, filesystem, or redirect handling.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            After the value is encoded correctly
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/url-encoder-decoder" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
