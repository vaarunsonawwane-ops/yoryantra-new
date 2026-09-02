"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type EncodingMode = "component" | "url" | "form";

function describeEncodingError(action: "encode" | "decode") {
  return action === "encode"
    ? "Unable to encode this input. Check for malformed Unicode characters such as an unpaired surrogate, then try again."
    : "Unable to decode this input. Check that every percent escape uses two hexadecimal digits (for example %20) and that the bytes form valid UTF-8.";
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<EncodingMode>("component");
  const [copyStatus, setCopyStatus] = useState("");

  const clearResultState = () => {
    setError("");
    setCopyStatus("");
  };

  const encodeURL = () => {
    clearResultState();

    if (!input) {
      setOutput("");
      setError("Enter a URL, URL component, query value, or form value to encode.");
      return;
    }

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
    } catch {
      setOutput("");
      setError(describeEncodingError("encode"));
    }
  };

  const decodeURL = () => {
    clearResultState();

    if (!input) {
      setOutput("");
      setError("Enter percent-encoded text to decode.");
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
    } catch {
      setOutput("");
      setError(describeEncodingError("decode"));
    }
  };

  const copyOutput = async () => {
    if (!output) return;

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
    setMode("component");
  };

  return (
    <ToolShell
      title="URL Encoder Decoder"
      description="Percent-encode or decode URL components, complete URLs, and form-style values while keeping the encoding context explicit."
    >
      <div>
        <label
          htmlFor="url-encoding-mode"
          className="block mb-2 text-sm font-medium text-gray-700"
        >
          Encoding context
        </label>

        <select
          id="url-encoding-mode"
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as EncodingMode);
            setOutput("");
            setError("");
            setCopyStatus("");
          }}
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option value="component">URL component / query parameter value</option>
          <option value="url">Complete URL</option>
          <option value="form">Form value (application/x-www-form-urlencoded)</option>
        </select>

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          {mode === "component" &&
            "Best for a single query value, path segment, fragment value, or other data that will be inserted into a URL."}
          {mode === "url" &&
            "Keeps URL syntax delimiters such as :, /, ?, #, and & readable instead of encoding the whole address as one component."}
          {mode === "form" &&
            "Uses form-style encoding where spaces become + and literal plus signs are percent-encoded."}
        </p>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="url-input" className="text-sm font-medium text-gray-700">
            Input
          </label>
          <span className="text-xs text-gray-500">{input.length.toLocaleString()} characters</span>
        </div>

        <textarea
          id="url-input"
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Example: hello world & tea=green"
          value={input}
          spellCheck={false}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
            setError("");
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

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>

          {output && (
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[180px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Encoded or decoded output will appear here..."}
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
          The transformations on this page run in your browser using built-in JavaScript URL encoding APIs. The tool does not send the text to a Yoryantra conversion API. URL encoding is not encryption, access control, or input validation, so encoded secrets are still secrets and untrusted decoded values still need context-appropriate validation.
        </p>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            URL encoding is contextual, not a one-button operation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Percent-encoding represents bytes with a percent sign followed by two hexadecimal digits. A space, for example, is commonly represented as <code>%20</code>. The important detail is that a complete URL and a single value inside that URL do not have the same reserved-character rules. Encoding the wrong scope can either destroy URL structure or leave data characters acting as delimiters.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This tool therefore separates three practical contexts. <strong>URL component</strong> mode uses <code>encodeURIComponent()</code> / <code>decodeURIComponent()</code>. <strong>Complete URL</strong> mode uses <code>encodeURI()</code> / <code>decodeURI()</code>. <strong>Form value</strong> mode follows the common <code>application/x-www-form-urlencoded</code> convention where spaces are represented with <code>+</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Choose the right mode</h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">Input you have</th>
                  <th className="px-4 py-3 font-semibold">Use</th>
                  <th className="px-4 py-3 font-semibold">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3">A search value such as <code>tea & coffee</code></td>
                  <td className="px-4 py-3">URL component</td>
                  <td className="px-4 py-3">The ampersand is data here, so it must not become a query separator.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">A whole address such as <code>https://example.com/a b?q=x</code></td>
                  <td className="px-4 py-3">Complete URL</td>
                  <td className="px-4 py-3">The scheme, slashes, question mark, and other structural delimiters need to remain structural.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">A traditional HTML form field value</td>
                  <td className="px-4 py-3">Form value</td>
                  <td className="px-4 py-3">Form encoding treats spaces as <code>+</code>, which is different from generic component encoding.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Worked examples</h2>
          <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <p className="font-medium text-gray-900">Query value</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`Input:  tea & coffee
Output: tea%20%26%20coffee`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">Unicode component</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`Input:  पुणे
Output: %E0%A4%AA%E0%A5%81%E0%A4%A3%E0%A5%87`}</pre>
            </div>
            <div>
              <p className="font-medium text-gray-900">Form value</p>
              <pre className="mt-2 whitespace-pre-wrap break-words">{`Input:  A+B C
Output: A%2BB+C`}</pre>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common mistakes that cause real bugs</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li><strong>Encoding an entire URL with component rules:</strong> <code>https://</code>, slashes, question marks, and equals signs become encoded data instead of URL syntax.</li>
            <li><strong>Encoding an already encoded value again:</strong> <code>%20</code> becomes <code>%2520</code>. RFC 3986 specifically warns against repeated encoding or decoding of the same string without knowing its state.</li>
            <li><strong>Treating <code>+</code> as a space everywhere:</strong> generic URI decoding does not define plus as space. That convention belongs to form-style query serialization.</li>
            <li><strong>Decoding before parsing a URL into components:</strong> decoding an encoded delimiter such as <code>%2F</code> or <code>%3F</code> too early can change how the URL is interpreted.</li>
            <li><strong>Assuming encoding makes a value safe:</strong> percent-encoding is transport syntax. It does not neutralize SQL, HTML, shell, path traversal, redirect, or authorization risks by itself.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Malformed escapes, UTF-8, and decoding failures</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript decoding functions throw when a percent escape is incomplete (for example <code>%E0%A4</code>) or when the decoded byte sequence is not valid UTF-8. Encoding can also fail for malformed JavaScript strings containing an unpaired UTF-16 surrogate. This tool reports those failures instead of silently returning a partly transformed value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A decoder also cannot tell whether a syntactically valid encoded delimiter was intended as data. If <code>%2F</code> appears inside a path, decoding it to <code>/</code> may change path segmentation. Decode only after you know which URL component you are working with.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Limits of this browser utility</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 leading-relaxed text-gray-600">
            <li>It transforms text; it does not check whether a complete URL resolves, is reachable, or is safe to navigate to.</li>
            <li>Complete URL mode uses JavaScript&apos;s URI functions rather than reconstructing the address through the WHATWG <code>URL</code> parser, so it does not normalize hosts, ports, dot segments, or IDNs.</li>
            <li>Form mode is for a single value, not for parsing a whole multi-parameter query string.</li>
            <li>Percent-encoding does not hide sensitive values. Anyone who sees the encoded URL can decode it.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards and primary references</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            For protocol-level URI syntax, see RFC 3986. For modern browser URL parsing and percent-encode sets, the WHATWG URL Standard is the primary living standard. MDN documents the JavaScript functions used by this page.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://www.rfc-editor.org/rfc/rfc3986" target="_blank" rel="noreferrer">RFC 3986 — URI Generic Syntax</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer">WHATWG URL Standard</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent" target="_blank" rel="noreferrer">MDN — encodeURIComponent()</a></li>
            <li><a className="text-[var(--green)] underline underline-offset-4" href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI" target="_blank" rel="noreferrer">MDN — encodeURI()</a></li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related tools</h2>
          <YoryantraRelatedTools currentHref="/tools/url-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}
