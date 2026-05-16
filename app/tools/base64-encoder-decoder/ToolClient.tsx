"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

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
      description="Encode and decode Base64 text instantly with this free online Base64 utility."
    >

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

      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

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
          {output || "Encoded or decoded output will appear here..."}
        </pre>

      </div>

      {/* SEO CONTENT */}
      <div className="mt-10 border-t border-gray-200 pt-8 space-y-10">

        <section>

          <h2 className="text-2xl font-semibold text-gray-900">
            What is Base64 Encoder Decoder?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Base64 Encoder Decoder is a tool that helps encode plain text
            into Base64 format and decode Base64 strings back into readable
            text. It is useful for developers working with APIs,
            authentication, encoded data transfer, debugging workflows,
            and web applications.
          </p>

        </section>

        <section>

          <h2 className="text-2xl font-semibold text-gray-900">
            How to Use Base64 Encoder Decoder
          </h2>

          <div className="mt-4 space-y-3 text-gray-600 leading-relaxed">

            <p>
              1. Paste your plain text or Base64 string into the input box.
            </p>

            <p>
              2. Click Encode to convert text into Base64 format.
            </p>

            <p>
              3. Click Decode to convert Base64 back into readable text.
            </p>

            <p>
              4. Use Copy to quickly copy the output.
            </p>

          </div>

        </section>

        <section>

          <h2 className="text-2xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 space-y-3 text-gray-600 leading-relaxed list-disc pl-6">

            <li>
              Encoding text for APIs and data transfer.
            </li>

            <li>
              Decoding Base64 strings during debugging.
            </li>

            <li>
              Working with encoded authentication data.
            </li>

            <li>
              Testing encoded content in web applications.
            </li>

            <li>
              Quickly converting readable text into Base64 format.
            </li>

          </ul>

        </section>

        <section>

          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">

            <div>

              <h3 className="font-semibold text-gray-900">
                What is Base64 encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64 encoding converts text or binary data into a
                text-based encoded format that can be safely transferred
                across systems.
              </p>

            </div>

            <div>

              <h3 className="font-semibold text-gray-900">
                Can this tool decode Base64 strings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The decoder converts Base64 encoded content back
                into readable plain text instantly.
              </p>

            </div>

            <div>

              <h3 className="font-semibold text-gray-900">
                Is my data stored anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. All encoding and decoding happens directly inside
                your browser. Your data is not uploaded or stored.
              </p>

            </div>

          </div>

        </section>

      </div>

    </ToolShell>
  );
}
