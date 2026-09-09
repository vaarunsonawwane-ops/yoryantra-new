"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type TimestampUnit = "seconds" | "milliseconds";

type ConversionResult = {
  input: string;
  unit: TimestampUnit;
  milliseconds: number;
  utc: string;
  iso: string;
  local: string;
};

type ConversionAttempt =
  | { ok: true; result: ConversionResult }
  | { ok: false; error: string };

const MAX_DATE_MS = 8_640_000_000_000_000;
const DECIMAL_NUMBER = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

export default function ToolClient() {
  const [timestamp, setTimestamp] = useState("");
  const [unit, setUnit] = useState<TimestampUnit>("seconds");
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle"
  );

  const browserTimeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "browser local time";
    } catch {
      return "browser local time";
    }
  }, []);

  const unitCaution = useMemo(() => {
    const value = parsePlainNumber(timestamp.trim());
    if (value === null) {
      return "";
    }

    const absolute = Math.abs(value);
    if (unit === "seconds" && absolute >= 100_000_000_000) {
      return "This is unusually large for a seconds-based Unix timestamp. Confirm that the source is not milliseconds.";
    }

    if (unit === "milliseconds" && absolute > 0 && absolute < 100_000_000_000) {
      return "This is unusually small for a modern milliseconds-based timestamp. Confirm that the source is not seconds.";
    }

    return "";
  }, [timestamp, unit]);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopyState("idle");
  };

  const convertTimestamp = () => {
    const attempt = convertUnixTimestamp(timestamp, unit);

    if (!attempt.ok) {
      setError(attempt.error);
      setResult(null);
      return;
    }

    setResult(attempt.result);
    setError("");
    setCopyState("idle");
  };

  const useCurrentTime = () => {
    const now = Date.now();
    setTimestamp(
      unit === "seconds" ? Math.floor(now / 1000).toString() : now.toString()
    );
    setResult(null);
    setError("");
    setCopyState("idle");
  };

  const resetAll = () => {
    setTimestamp("");
    setUnit("seconds");
    setResult(null);
    setError("");
    setCopyState("idle");
  };

  const copyOutput = async () => {
    if (!result) {
      return;
    }

    const output = formatResult(result, browserTimeZone);
    try {
      await navigator.clipboard.writeText(output);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <ToolShell
      title="Timestamp Converter"
      description="Convert Unix seconds or milliseconds into UTC, ISO, and browser-local date representations without guessing units."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Unix Timestamp
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={timestamp}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setTimestamp(event.target.value);
            clearResult();
          }}
          placeholder={unit === "seconds" ? "1715788800" : "1715788800000"}
          className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Negative and fractional values are accepted when they fit JavaScript&apos;s
          representable date range.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Choose the Input Unit</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Seconds and milliseconds can contain similar-looking digits. The converter
          uses the unit you choose instead of inferring it from input length.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <UnitCard
            title="Unix Seconds"
            description="Seconds since the Unix epoch. Common in POSIX tools, APIs, JWT claims, and logs."
            selected={unit === "seconds"}
            onClick={() => {
              setUnit("seconds");
              clearResult();
            }}
          />
          <UnitCard
            title="Unix Milliseconds"
            description="Milliseconds since the same epoch. This is the native timestamp scale used by JavaScript Date."
            selected={unit === "milliseconds"}
            onClick={() => {
              setUnit("milliseconds");
              clearResult();
            }}
          />
        </div>
      </div>

      {unitCaution && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          {unitCaution}
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertTimestamp}
          className="yoryantra-btn whitespace-nowrap"
        >
          Convert Timestamp
        </button>
        <button
          onClick={useCurrentTime}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          Use Current Time
        </button>
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 self-start rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Converted Time</h3>
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copyState === "copied" ? "Copied" : "Copy Result"}
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <OutputCard label="UTC" value={result.utc} />
            <OutputCard label="ISO 8601" value={result.iso} />
            <OutputCard label={`Local time (${browserTimeZone})`} value={result.local} />
            <OutputCard
              label="Normalized epoch milliseconds"
              value={result.milliseconds.toString()}
            />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <p className="font-semibold text-gray-900">Input interpretation</p>
            <p className="mt-1">
              {result.input} was treated as {result.unit}. JavaScript stores the
              resulting <code>Date</code> value at millisecond precision, so smaller
              fractions are discarded when necessary.
            </p>
          </div>

          {copyState === "failed" && (
            <p className="mt-2 text-sm text-red-700">
              The browser blocked clipboard access. Select and copy the result manually.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        <p className="font-semibold text-gray-900">Timezone boundary</p>
        <p className="mt-1">
          A Unix timestamp identifies an instant, not a timezone. UTC and ISO output
          describe that instant in UTC; the local line uses the timezone configured in
          your browser or operating system.
        </p>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Seconds and milliseconds are not interchangeable
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unix time is commonly expressed as seconds since the epoch, while
            JavaScript <code>Date</code> uses milliseconds since the same epoch. A
            value copied from one system can therefore be off by a factor of 1,000 if
            the unit is assumed incorrectly.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This page deliberately asks for the unit. Digit-count heuristics work for
            many present-day values but fail for negative timestamps, fractional
            values, historical data, and sufficiently distant dates.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Dates before 1970 use negative values
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript can represent timestamps before the epoch with negative
            millisecond values. Some external systems have narrower ranges or define
            negative POSIX timestamps differently, so a browser conversion should not
            be treated as proof that another database or runtime accepts the same date.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            JavaScript Date has a finite range
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A JavaScript <code>Date</code> can represent approximately ±100 million
            days around the epoch. Values beyond ±8,640,000,000,000,000 milliseconds
            become invalid, so values beyond that range are rejected before formatting ISO text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading API and JWT timestamps
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            API fields are not guaranteed to share one timestamp unit. JWT NumericDate
            claims such as <code>exp</code>, <code>nbf</code>, and <code>iat</code> are
            defined in seconds by{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc7519#section-2"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              RFC 7519
            </a>
            , while browser and many JavaScript APIs expose milliseconds. Check the
            source specification before converting.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Authoritative references</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            POSIX defines seconds-since-the-Epoch terminology, while ECMAScript&apos;s
            Date model uses milliseconds relative to the Unix epoch.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap04.html#tag_04_19"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              POSIX: Seconds Since the Epoch
            </a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              MDN: JavaScript Date
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/timestamp-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function UnitCard({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`self-start rounded-2xl border bg-white p-5 text-left transition ${
        selected
          ? "border-[var(--green)] ring-1 ring-[var(--green)]"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="block font-semibold text-gray-900">{title}</span>
      <span className="mt-2 block text-sm leading-relaxed text-gray-600">
        {description}
      </span>
    </button>
  );
}

function OutputCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words font-mono text-sm leading-relaxed text-gray-900">
        {value}
      </div>
    </div>
  );
}

function convertUnixTimestamp(input: string, unit: TimestampUnit): ConversionAttempt {
  const cleanInput = input.trim();
  if (!cleanInput) {
    return { ok: false, error: "Enter a Unix timestamp first." };
  }

  const numericValue = parsePlainNumber(cleanInput);
  if (numericValue === null) {
    return {
      ok: false,
      error: "Enter a finite decimal number without date text or other characters.",
    };
  }

  const milliseconds = unit === "seconds" ? numericValue * 1000 : numericValue;
  if (!Number.isFinite(milliseconds) || Math.abs(milliseconds) > MAX_DATE_MS) {
    return {
      ok: false,
      error: "That timestamp is outside the range JavaScript Date can represent.",
    };
  }

  const date = new Date(milliseconds);
  if (Number.isNaN(date.getTime())) {
    return {
      ok: false,
      error: "That timestamp cannot be represented as a valid JavaScript date.",
    };
  }

  return {
    ok: true,
    result: {
      input: cleanInput,
      unit,
      milliseconds: date.getTime(),
      utc: date.toUTCString(),
      iso: date.toISOString(),
      local: date.toString(),
    },
  };
}

function parsePlainNumber(value: string): number | null {
  if (!DECIMAL_NUMBER.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatResult(result: ConversionResult, browserTimeZone: string): string {
  return `Input: ${result.input} (${result.unit})\nUTC: ${result.utc}\nISO 8601: ${result.iso}\nLocal (${browserTimeZone}): ${result.local}\nEpoch milliseconds: ${result.milliseconds}`;
}
