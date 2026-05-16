"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [timestamp, setTimestamp] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertTimestamp = () => {
    try {
      const date = new Date(Number(timestamp) * 1000);

      if (isNaN(date.getTime())) {
        setError("Invalid Unix timestamp.");
        setOutput("");
        return;
      }

      setOutput(date.toUTCString());
      setError("");
    } catch {
      setError("Invalid Unix timestamp.");
      setOutput("");
    }
  };

  const currentTimestamp = () => {
    setTimestamp(Math.floor(Date.now() / 1000).toString());
    setError("");
  };

  const resetAll = () => {
    setTimestamp("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Timestamp Converter"
      description="Convert Unix timestamps into readable dates instantly with this free online Unix Timestamp Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Unix Timestamp
        </label>

        <input
          type="text"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          placeholder="Enter Unix timestamp..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertTimestamp}
          className="yoryantra-btn"
        >
          Convert
        </button>

        <button
          onClick={currentTimestamp}
          className="yoryantra-btn-outline"
        >
          Current Timestamp
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
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Converted Date
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

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output || "Converted date and time will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Timestamp Converter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Timestamp Converter helps you convert Unix timestamps into
            readable UTC dates and time values. It is useful when working with
            APIs, databases, server logs, authentication systems, analytics
            platforms, and development tools that use Unix time.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unix timestamps, also called epoch timestamps, represent the number
            of seconds passed since January 1, 1970 UTC. Converting timestamps
            into human-readable dates makes debugging and data analysis much
            easier.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Timestamp Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a Unix timestamp in the input field.</li>
            <li>Click <strong>Convert</strong> to view the readable UTC date.</li>
            <li>Use <strong>Current Timestamp</strong> to generate the current Unix timestamp.</li>
            <li>Copy the converted result if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting API timestamps into readable dates.</li>
            <li>Reading server logs and event records.</li>
            <li>Debugging authentication token expiration times.</li>
            <li>Working with Unix timestamps in databases.</li>
            <li>Checking time values in analytics or automation workflows.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Unix timestamp:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              1715788800
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Converted date:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              Wed, 15 May 2024 00:00:00 GMT
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a Unix timestamp?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Unix timestamp is the number of seconds that have passed since
                January 1, 1970 UTC, commonly known as Unix Epoch time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is epoch time?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Epoch time is another name for Unix time and represents time as
                a continuously increasing number of seconds.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this converter support UTC time?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This tool converts timestamps into readable UTC date and
                time values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Timestamp Converter secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The conversion happens directly in your browser. Your data
                is not uploaded to any server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">
              Regex Tester
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
