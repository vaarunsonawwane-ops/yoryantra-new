"use client";

import { useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "date-to-timestamp" | "timestamp-to-date";
type TimestampUnit = "seconds" | "milliseconds";
type DateInterpretation = "local" | "utc";
type CopyState = "idle" | "copied" | "failed";

const MAX_DATE_MS = 8_640_000_000_000_000;

export default function ToolClient() {
  const [mode, setMode] = useState<Mode>("date-to-timestamp");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [dateInterpretation, setDateInterpretation] =
    useState<DateInterpretation>("local");
  const [timestampInput, setTimestampInput] = useState("");
  const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>("seconds");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const chooseMode = (nextMode: Mode) => {
    setMode(nextMode);
    setOutput("");
    setError("");
    setCopyState("idle");
  };

  const useCurrentTime = () => {
    const now = new Date();
    const value =
      dateInterpretation === "utc"
        ? toUtcDatetimeLocalValue(now)
        : toLocalDatetimeValue(now);
    const [datePart, timePart] = value.split("T");

    setMode("date-to-timestamp");
    setDateInput(datePart);
    setTimeInput(timePart);
    setOutput("");
    setError("");
    setCopyState("idle");
  };

  const runConversion = () => {
    setCopyState("idle");

    try {
      if (mode === "date-to-timestamp") {
        if (!dateInput.trim() || !timeInput.trim()) {
          throw new Error("Enter both the date and time before generating a timestamp.");
        }

        const wallClockInput = `${dateInput.trim()}T${timeInput.trim()}`;
        const date = parseDateTimeInput(wallClockInput, dateInterpretation);
        const milliseconds = date.getTime();
        const seconds = formatUnixSeconds(milliseconds);
        const browserZone = getBrowserTimeZone();

        setOutput(
          [
            `Input: ${dateInput.trim()} ${timeInput.trim()}`,
            `Interpreted as: ${
              dateInterpretation === "utc"
                ? "UTC"
                : `browser local time (${browserZone})`
            }`,
            "",
            `Unix seconds: ${seconds}`,
            `Unix milliseconds: ${milliseconds}`,
            `ISO 8601: ${date.toISOString()}`,
            `UTC: ${date.toUTCString()}`,
            `Browser local: ${formatBrowserLocal(date)}`,
          ].join("\n")
        );
        setError("");
        return;
      }

      if (!timestampInput.trim()) {
        throw new Error("Enter a Unix timestamp before converting it.");
      }

      const milliseconds = parseTimestamp(timestampInput, timestampUnit);
      const date = new Date(milliseconds);

      setOutput(
        [
          `Input timestamp: ${timestampInput}`,
          `Unit: ${timestampUnit}`,
          `Milliseconds used by JavaScript Date: ${milliseconds}`,
          "",
          `ISO 8601: ${date.toISOString()}`,
          `UTC: ${date.toUTCString()}`,
          `Browser local (${getBrowserTimeZone()}): ${formatBrowserLocal(date)}`,
          `Unix seconds: ${formatUnixSeconds(milliseconds)}`,
        ].join("\n")
      );
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The timestamp could not be converted.");
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const resetAll = () => {
    setDateInput("");
    setTimeInput("");
    setTimestampInput("");
    setTimestampUnit("seconds");
    setDateInterpretation("local");
    setOutput("");
    setError("");
    setCopyState("idle");
  };

  return (
    <ToolShell
      title="Unix Timestamp Generator"
      description="Generate Unix seconds or milliseconds from dates and convert explicit epoch units back to readable time."
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Choose a conversion direction</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            aria-pressed={mode === "date-to-timestamp"}
            onClick={() => chooseMode("date-to-timestamp")}
            className={`self-start rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2 ${
              mode === "date-to-timestamp"
                ? "border-[var(--green)] bg-[var(--light-bg)] ring-1 ring-[var(--green)]"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className="block font-semibold text-gray-900">Date to Timestamp</span>
            <span className="mt-2 block text-sm leading-relaxed text-gray-600">
              Interpret a wall-clock date as browser local time or UTC, then produce epoch seconds and milliseconds.
            </span>
          </button>

          <button
            type="button"
            aria-pressed={mode === "timestamp-to-date"}
            onClick={() => chooseMode("timestamp-to-date")}
            className={`self-start rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-[var(--green)] focus:ring-offset-2 ${
              mode === "timestamp-to-date"
                ? "border-[var(--green)] bg-[var(--light-bg)] ring-1 ring-[var(--green)]"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span className="block font-semibold text-gray-900">Timestamp to Date</span>
            <span className="mt-2 block text-sm leading-relaxed text-gray-600">
              Choose seconds or milliseconds explicitly, then view the same instant in ISO, UTC, and browser-local form.
            </span>
          </button>
        </div>
      </div>

      {mode === "date-to-timestamp" ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="block mb-2 text-sm font-medium text-gray-700">Date and Time</span>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="unix-date" className="mb-1.5 block text-xs font-medium text-gray-600">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    id="unix-date"
                    type="text"
                    value={dateInput}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setDateInput(event.target.value);
                      setOutput("");
                      setError("");
                      setCopyState("idle");
                    }}
                    placeholder="2026-09-09"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                  />
                </div>

                <div>
                  <label htmlFor="unix-time" className="mb-1.5 block text-xs font-medium text-gray-600">
                    Time (HH:MM:SS.SSS)
                  </label>
                  <input
                    id="unix-time"
                    type="text"
                    value={timeInput}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setTimeInput(event.target.value);
                      setOutput("");
                      setError("");
                      setCopyState("idle");
                    }}
                    placeholder="18:30:00.000"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                  />
                </div>
              </div>
            </div>

            <YoryantraSelect
              label="Interpret Date As"
              value={dateInterpretation}
              onChange={(value) => {
                setDateInterpretation(value as DateInterpretation);
                setOutput("");
                setError("");
                setCopyState("idle");
              }}
              options={[
                { label: "Browser Local Time", value: "local" },
                { label: "UTC", value: "utc" },
              ]}
            />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Enter a four-digit year and 24-hour time. Seconds and milliseconds are optional; the date and time carry no timezone or UTC offset.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Unix Timestamp</label>
              <input
                value={timestampInput}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setTimestampInput(event.target.value);
                  setOutput("");
                  setError("");
                  setCopyState("idle");
                }}
                placeholder={timestampUnit === "seconds" ? "1716806400" : "1716806400000"}
                inputMode="decimal"
                className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <YoryantraSelect
              label="Timestamp Unit"
              value={timestampUnit}
              onChange={(value) => {
                setTimestampUnit(value as TimestampUnit);
                setOutput("");
                setError("");
                setCopyState("idle");
              }}
              options={[
                { label: "Seconds", value: "seconds" },
                { label: "Milliseconds", value: "milliseconds" },
              ]}
            />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Seconds may include up to three fractional digits. Millisecond input must be a whole number. Negative values represent instants before the Unix epoch.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runConversion} className="yoryantra-btn whitespace-nowrap">
          {mode === "date-to-timestamp" ? "Generate Timestamp" : "Convert Timestamp"}
        </button>
        <button onClick={useCurrentTime} className="yoryantra-btn-outline whitespace-nowrap">Use Current Time</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Conversion Result</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm whitespace-nowrap">
              {copyState === "copied" ? "Copied" : copyState === "failed" ? "Copy Failed" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "The generated timestamp or converted date will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Date and timestamp conversion happens entirely in the browser. No date values are uploaded for processing.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">One instant, several representations</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unix time represents an instant relative to 1970-01-01 00:00:00 UTC.
            JavaScript Date stores time as milliseconds relative to that epoch,
            while many APIs and databases use whole or fractional seconds. UTC,
            ISO 8601, and local calendar text are different representations of
            the same underlying instant.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generator keeps seconds and milliseconds explicit rather than
            guessing from digit count. A ten-digit value is often seconds today,
            but length-based heuristics break for historical dates, far-future
            values, negative timestamps, and test data.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-amber-950">Local wall-clock input has a timezone boundary</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              A wall-clock date-time value carries no timezone. Browser Local
              Time uses the machine's current timezone rules. During daylight
              saving transitions, some wall times do not exist and some occur
              twice; JavaScript chooses an offset for ambiguous repeated times.
              Use UTC when the intended instant is defined in UTC.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900">Negative timestamps are valid</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              Values below zero represent instants before the Unix epoch. They
              are useful for historical dates and test cases, although an
              external API or database may impose a narrower range than
              JavaScript Date.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Milliseconds, fractional seconds, and precision</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript Date works at millisecond precision. Second input accepts
            up to three decimal places so values such as <code>1716806400.125</code>
            map exactly to milliseconds. Extra sub-millisecond precision is not
            accepted because Date would not preserve it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leap seconds and POSIX-style time</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript timestamps follow the conventional Unix/POSIX-style
            model used by web applications and do not represent leap seconds as
            distinct timestamp values. A timestamp should therefore not be
            treated as an astronomical elapsed-second counter across leap-second
            insertions.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References for the time model</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            MDN documents JavaScript Date as milliseconds since the ECMAScript
            epoch and explains its range and local/UTC methods. POSIX defines
            Epoch-related system time conventions used by Unix-like systems.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">MDN Date reference</a>
            <a href="https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html#tag_04_19" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">POSIX seconds since the Epoch</a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/unix-timestamp-generator" /></div>
        </div>
      </section>
    </ToolShell>
  );
}

function parseDateTimeInput(value: string, interpretation: DateInterpretation): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(value);
  if (!match) {
    throw new Error("Enter the date as YYYY-MM-DD and time as HH:MM, optionally adding seconds and milliseconds.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");
  const millisecond = Number((match[7] ?? "0").padEnd(3, "0"));

  const date = new Date(0);
  if (interpretation === "utc") {
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(hour, minute, second, millisecond);
  } else {
    date.setFullYear(year, month - 1, day);
    date.setHours(hour, minute, second, millisecond);
  }

  if (!Number.isFinite(date.getTime()) || Math.abs(date.getTime()) > MAX_DATE_MS) {
    throw new Error("The selected date is outside JavaScript Date's supported range.");
  }

  const parts =
    interpretation === "utc"
      ? [
          date.getUTCFullYear(),
          date.getUTCMonth() + 1,
          date.getUTCDate(),
          date.getUTCHours(),
          date.getUTCMinutes(),
          date.getUTCSeconds(),
          date.getUTCMilliseconds(),
        ]
      : [
          date.getFullYear(),
          date.getMonth() + 1,
          date.getDate(),
          date.getHours(),
          date.getMinutes(),
          date.getSeconds(),
          date.getMilliseconds(),
        ];

  const expected = [year, month, day, hour, minute, second, millisecond];
  if (parts.some((part, index) => part !== expected[index])) {
    throw new Error(
      interpretation === "local"
        ? "That local wall-clock time is not representable exactly in the browser timezone, often because of a daylight-saving transition."
        : "The date and time components are not valid."
    );
  }

  return date;
}

function parseTimestamp(value: string, unit: TimestampUnit): number {
  const trimmed = value.trim();

  if (unit === "milliseconds") {
    if (!/^[+-]?\d+$/.test(trimmed)) {
      throw new Error("Millisecond timestamps must be whole signed integers.");
    }
  } else if (!/^[+-]?\d+(?:\.\d{1,3})?$/.test(trimmed)) {
    throw new Error("Second timestamps must be signed numbers with no more than three decimal places.");
  }

  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    throw new Error("The timestamp is not a finite number.");
  }

  const milliseconds = unit === "seconds" ? Math.round(numeric * 1000) : numeric;

  if (!Number.isSafeInteger(milliseconds)) {
    throw new Error("The converted millisecond value is outside JavaScript's safe integer range.");
  }

  if (Math.abs(milliseconds) > MAX_DATE_MS) {
    throw new Error("The timestamp is outside JavaScript Date's supported range.");
  }

  return milliseconds;
}

function formatUnixSeconds(milliseconds: number): string {
  if (milliseconds % 1000 === 0) {
    return String(milliseconds / 1000);
  }
  return (milliseconds / 1000).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function toLocalDatetimeValue(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  const millisecond = String(date.getMilliseconds()).padStart(3, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}`;
}

function toUtcDatetimeLocalValue(date: Date): string {
  return date.toISOString().slice(0, 23);
}

function formatBrowserLocal(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "system local timezone";
}
