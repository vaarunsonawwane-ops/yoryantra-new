"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeText = () => {
    try {
      setOutput(btoa(input));
      setError("");
    } catch {
      setError("Unable to encode text.");
      setOutput("");
    }
  };

  const decodeText = () => {
    try {
      setOutput(atob(input));
      setError("");
    } catch {
      setError("Invalid Base64 string.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Base64 Encoder Decoder"
      description="Encode and decode Base64 text instantly with this free online Base64 Encoder Decoder."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste text or Base64 content here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={encodeText}
          className="yoryantra-btn"
        >
          Encode
        </button>

        <button
          onClick={decodeText}
          className="yoryantra-btn-outline"
        >
          Decode
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output ||
            "Encoded or decoded output will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding Base64 Text Safely
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64 encoding converts text and binary data into a text-safe
            format that can travel through browsers, APIs, email systems,
            authentication headers, JSON payloads, and web applications more
            reliably. Base64 decoding converts encoded values back into readable
            text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During development and debugging workflows, Base64 data often
            appears inside JWT tokens, API payloads, authentication systems,
            configuration values, encoded files, and browser requests. This
            Base64 Encoder Decoder helps quickly convert readable text into
            Base64 format and decode encoded values back into plain text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for API testing, frontend debugging,
            authentication workflows, encoded configuration values, JSON
            payloads, and developer troubleshooting directly inside your
            browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Base64 Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your plain text or Base64 content into the editor.
            </li>

            <li>
              Click <strong>Encode</strong> to convert text into Base64 format.
            </li>

            <li>
              Click <strong>Decode</strong> to convert Base64 back into readable
              text.
            </li>

            <li>
              Copy the final output for use in applications, APIs, or debugging
              workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Encoding text for APIs and data transfer.</li>

            <li>Decoding Base64 strings during debugging.</li>

            <li>Working with encoded authentication values.</li>

            <li>Inspecting JWT token payloads.</li>

            <li>Testing encoded content in web applications.</li>

            <li>Converting readable text into Base64 format.</li>

            <li>Debugging browser requests and JSON payloads.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Base64 Encoding
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Original text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Hello Yoryantra
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Encoded Base64:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
SGVsbG8gWW9yeWFudHJh
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Base64 Encoding Is Used
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Safe text transport:</strong> Base64 helps move binary
                or special data safely through text-based systems.
              </li>

              <li>
                <strong>API compatibility:</strong> APIs often use Base64 for
                encoded payloads and authentication values.
              </li>

              <li>
                <strong>Reliable encoding:</strong> Encoded values avoid issues
                with unsupported characters.
              </li>

              <li>
                <strong>Debugging support:</strong> Developers can inspect and
                decode encoded data more easily.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Base64 encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64 encoding converts text or binary data into a text-based
                format that can safely travel through browsers, APIs, and web
                systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool decode Base64 strings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The decoder converts Base64 encoded values back into
                readable plain text instantly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Base64 encryption?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Base64 is an encoding method, not encryption. Encoded data
                can usually be decoded easily.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is Base64 used in APIs and JWT tokens?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64 helps safely transport structured data inside tokens,
                headers, and API payloads.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Base64 processing handled on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. All Base64 encoding and decoding happen directly inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/base64-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}