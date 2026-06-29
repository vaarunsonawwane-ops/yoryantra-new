"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [timestamp, setTimestamp] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertTimestamp = () => {
    try {
      const cleanInput = timestamp.trim();

      const unix =
        cleanInput.length > 10
          ? Number(cleanInput) / 1000
          : Number(cleanInput);

      const date = new Date(unix * 1000);

      if (isNaN(date.getTime())) {
        setError("Invalid Unix timestamp.");
        setOutput("");
        return;
      }

      setOutput(
`${date.toUTCString()}

Local Time:
${date.toString()}

ISO Format:
${date.toISOString()}`
      );

      setError("");
    } catch {
      setError("Invalid Unix timestamp.");
      setOutput("");
    }
  };

  const currentTimestamp = () => {
    setTimestamp(
      Math.floor(Date.now() / 1000).toString()
    );

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
      description="Convert Unix timestamps into readable UTC dates instantly with this free online Timestamp Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Unix Timestamp
        </label>

        <input
          type="text"
          value={timestamp}
          onChange={(e) =>
            setTimestamp(e.target.value)
          }
          placeholder="Enter Unix timestamp..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertTimestamp}
          className="yoryantra-btn"
        >
          Convert Timestamp
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
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
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
                navigator.clipboard.writeText(
                  output
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output ||
            "Readable UTC date and time will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting Unix Timestamps Into Readable Dates
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unix timestamps are commonly used in APIs, databases, authentication
            systems, analytics platforms, server logs, backend applications, and
            cloud infrastructure. A Unix timestamp represents the number of
            seconds passed since January 1, 1970 UTC, also known as Unix Epoch
            time.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During debugging and development workflows, raw timestamps are
            difficult to read manually. This Timestamp Converter helps instantly
            convert Unix timestamps into readable UTC dates, local time values,
            and ISO date formats directly inside your browser.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool supports both seconds-based and milliseconds-based
            timestamps, making it useful for JWT debugging, API inspection,
            server monitoring, automation systems, and event tracking workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Timestamp Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter a Unix timestamp into the input field.
            </li>

            <li>
              Click <strong>Convert Timestamp</strong>.
            </li>

            <li>
              Review the readable UTC, local, and ISO date formats.
            </li>

            <li>
              Use <strong>Current Timestamp</strong> to generate the current
              Unix time instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting API timestamps into readable dates.</li>

            <li>Debugging JWT expiration timestamps.</li>

            <li>Reading server logs and analytics events.</li>

            <li>Inspecting Unix timestamps in databases.</li>

            <li>Working with cloud monitoring systems.</li>

            <li>Testing automation workflows and schedulers.</li>

            <li>Converting milliseconds-based timestamps.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Unix Timestamp Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Unix timestamp:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
1715788800
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Converted UTC date:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
Wed, 15 May 2024 00:00:00 GMT
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding Unix Epoch Time
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Unix Timestamp:</strong> Counts seconds from January 1,
                1970 UTC.
              </li>

              <li>
                <strong>Epoch Time:</strong> Another name for Unix time.
              </li>

              <li>
                <strong>Milliseconds:</strong> Some systems store timestamps in
                milliseconds instead of seconds.
              </li>

              <li>
                <strong>UTC:</strong> Unix timestamps are usually based on
                Coordinated Universal Time.
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
                What is a Unix timestamp?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Unix timestamp represents the number of seconds passed since
                January 1, 1970 UTC.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is epoch time?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Epoch time is another name for Unix time and is commonly used in
                APIs, databases, and backend systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this converter support milliseconds?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool automatically detects milliseconds-based Unix
                timestamps.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are timestamps used in APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Timestamps provide a standardized way to track dates and time
                across systems and programming languages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is timestamp conversion processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. All timestamp conversion happens locally inside your
                browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/timestamp-converter" />
        </div>
      </section>
    </ToolShell>
  );
}