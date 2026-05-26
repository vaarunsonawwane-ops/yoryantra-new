"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type Mode = "date-to-timestamp" | "timestamp-to-date";

export default function ToolClient() {
  const [mode, setMode] = useState<Mode>("date-to-timestamp");
  const [dateInput, setDateInput] = useState("");
  const [timestampInput, setTimestampInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const currentUnix = useMemo(() => Math.floor(Date.now() / 1000), []);

  const useCurrentTime = () => {
    const now = new Date();

    setMode("date-to-timestamp");
    setDateInput(toDatetimeLocalValue(now));
    setTimestampInput("");
    setOutput("");
    setError("");
  };

  const convertDateToTimestamp = () => {
    if (!dateInput.trim()) {
      setError("Please select or enter a date and time.");
      setOutput("");
      return;
    }

    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
      setError("Please enter a valid date and time.");
      setOutput("");
      return;
    }

    const seconds = Math.floor(date.getTime() / 1000);
    const milliseconds = date.getTime();

    setOutput(
      [
        "Unix timestamp generated.",
        "",
        `Input date: ${formatDate(date)}`,
        `Unix timestamp (seconds): ${seconds}`,
        `Unix timestamp (milliseconds): ${milliseconds}`,
        `UTC date: ${date.toUTCString()}`,
        `ISO date: ${date.toISOString()}`,
      ].join("\n")
    );

    setError("");
  };

  const convertTimestampToDate = () => {
    const value = timestampInput.trim();

    if (!value) {
      setError("Please enter a Unix timestamp.");
      setOutput("");
      return;
    }

    if (!/^-?\d+$/.test(value)) {
      setError("Timestamp should contain numbers only.");
      setOutput("");
      return;
    }

    const numericValue = Number(value);

    if (!Number.isSafeInteger(numericValue)) {
      setError("Timestamp value is too large to convert safely.");
      setOutput("");
      return;
    }

    const isMilliseconds = Math.abs(numericValue) > 9999999999;
    const date = new Date(isMilliseconds ? numericValue : numericValue * 1000);

    if (Number.isNaN(date.getTime())) {
      setError("Unable to convert this timestamp.");
      setOutput("");
      return;
    }

    setOutput(
      [
        "Timestamp converted.",
        "",
        `Input timestamp: ${value}`,
        `Detected format: ${isMilliseconds ? "milliseconds" : "seconds"}`,
        `Local date: ${formatDate(date)}`,
        `UTC date: ${date.toUTCString()}`,
        `ISO date: ${date.toISOString()}`,
      ].join("\n")
    );

    setError("");
  };

  const runConversion = () => {
    if (mode === "date-to-timestamp") {
      convertDateToTimestamp();
      return;
    }

    convertTimestampToDate();
  };

  const resetAll = () => {
    setDateInput("");
    setTimestampInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Unix Timestamp Generator"
      description="Generate Unix timestamps, convert dates to epoch time, and convert timestamps back to readable date and time."
    >
      <div className="flex flex-wrap gap-3">
        <button
		  onClick={() => {
			setMode("date-to-timestamp");
			setOutput("");
			setError("");
		  }}
		  className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
			mode === "date-to-timestamp"
			  ? "border-[var(--green)] bg-[var(--green)] text-white"
			  : "border-gray-300 bg-white text-gray-700 hover:border-[var(--green)]"
		  }`}
		>
		  Date to Timestamp
		</button>

		<button
		  onClick={() => {
			setMode("timestamp-to-date");
			setOutput("");
			setError("");
		  }}
		  className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
			mode === "timestamp-to-date"
			  ? "border-[var(--green)] bg-[var(--green)] text-white"
			  : "border-gray-300 bg-white text-gray-700 hover:border-[var(--green)]"
		  }`}
		>
		  Timestamp to Date
		</button>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        Current Unix timestamp:{" "}
        <span className="font-semibold text-gray-900">
          {currentUnix}
        </span>
      </div>

      {mode === "date-to-timestamp" ? (
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Date and Time
          </label>

          <input
            type="datetime-local"
            value={dateInput}
            onChange={(event) => setDateInput(event.target.value)}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />

          <p className="mt-2 text-sm text-gray-500">
            The selected date and time will be converted using your browser timezone.
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Unix Timestamp
          </label>

          <input
            value={timestampInput}
            onChange={(event) => setTimestampInput(event.target.value)}
            placeholder="1716806400"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />

          <p className="mt-2 text-sm text-gray-500">
            Enter a Unix timestamp in seconds or milliseconds.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runConversion} className="yoryantra-btn">
          Convert
        </button>

        <button onClick={useCurrentTime} className="yoryantra-btn-outline">
          Use Current Time
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversion Result
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Timestamp conversion result will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating Unix Timestamps for Dates and Application Data
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Unix timestamps are used in APIs, databases, logs, tokens, cache
            systems, analytics events, and application records. They store time
            as a number, usually in seconds or milliseconds from the Unix epoch.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Unix Timestamp Generator helps you convert dates to Unix time,
            generate epoch timestamps, and convert timestamps back to readable
            date and time values directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Converting Date and Time Values in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select whether you want to convert a date or a timestamp.</li>
            <li>Enter the date, time, or Unix timestamp value.</li>
            <li>
              Click <strong>Convert</strong>.
            </li>
            <li>Review the generated seconds, milliseconds, UTC, and ISO values.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Unix Timestamp Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating timestamps for API request payloads.</li>
            <li>Converting log timestamps into readable dates.</li>
            <li>Checking token expiration or event times.</li>
            <li>Preparing test data with epoch time values.</li>
            <li>Comparing UTC, local, and ISO date formats during debugging.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Timestamp Values
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`1716806400       Unix timestamp in seconds
1716806400000    Unix timestamp in milliseconds
2026-05-27       Date value that can be converted to Unix time`}
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
                A Unix timestamp is a number that represents time counted from
                January 1, 1970 UTC. It is commonly used by systems, APIs, logs,
                and databases.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool support seconds and milliseconds?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool generates both seconds and milliseconds when
                converting dates, and it can detect most timestamp inputs in
                either seconds or milliseconds.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does timezone matter when converting dates?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A selected date and time is interpreted using your browser
                timezone. The output also shows UTC and ISO values so you can
                compare the result clearly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is timestamp conversion processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The timestamp conversion happens directly in your browser.
                Your date and timestamp values are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/timestamp-converter"
              className="yoryantra-btn-outline"
            >
              Timestamp Converter
            </Link>

            <Link
              href="/tools/uuid-generator"
              className="yoryantra-btn-outline"
            >
              UUID Generator
            </Link>

            <Link
              href="/tools/uuid-validator"
              className="yoryantra-btn-outline"
            >
              UUID Validator
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function toDatetimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}
