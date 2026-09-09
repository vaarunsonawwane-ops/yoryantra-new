"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "date-to-timestamp" | "timestamp-to-date";
type TimestampUnit = "seconds" | "milliseconds";
type DateInterpretation = "local" | "utc";
type CopyState = "idle" | "copied" | "failed";

const MAX_DATE_MS = 8_640_000_000_000_000;

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Choose a conversion direction</h3>
        <div
          className="mt-4 grid gap-4 sm:grid-cols-2"
          role="group"
          aria-label="Timestamp conversion direction"
        >
          <ConversionModeButton
            active={mode === "date-to-timestamp"}
            title="Date to Timestamp"
            description="Interpret a wall-clock date as browser local time or UTC, then produce epoch seconds and milliseconds."
            onClick={() => chooseMode("date-to-timestamp")}
          />

          <ConversionModeButton
            active={mode === "timestamp-to-date"}
            title="Timestamp to Date"
            description="Choose seconds or milliseconds explicitly, then view the same instant in ISO, UTC, and browser-local form."
            onClick={() => chooseMode("timestamp-to-date")}
          />
        </div>
      </div>

      {mode === "date-to-timestamp" ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-3 text-sm font-medium text-gray-700">Date and Time</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <DatePickerField
                label="Date"
                value={dateInput}
                onChange={(value) => {
                  setDateInput(value);
                  setOutput("");
                  setError("");
                  setCopyState("idle");
                }}
              />

              <div>
                <label htmlFor="unix-time" className="mb-2 block text-sm font-medium text-gray-700">
                  Time
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
                  placeholder="HH:MM:SS.SSS"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-h-[54px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
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
            Choose the calendar date and enter 24-hour time. Seconds and milliseconds are optional; the date and time carry no timezone or UTC offset.
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


function ConversionModeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`self-start rounded-xl border border-gray-200 bg-white p-4 text-left transition ${
        active
          ? "shadow-sm ring-2 ring-[var(--green)]"
          : "hover:border-[var(--green)]"
      }`}
    >
      <span className="block text-sm font-semibold text-gray-900">{title}</span>
      <span className="mt-1 block text-sm leading-relaxed text-gray-500">
        {description}
      </span>
    </button>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = parsePickerDate(value);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [openAbove, setOpenAbove] = useState(false);
  const [pickerMode, setPickerMode] = useState<"days" | "months" | "years">("days");
  const [viewDate, setViewDate] = useState<Date>(() => selectedDate || new Date());

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const yearOptions = useMemo(() => buildYearOptions(viewDate), [viewDate]);
  const displayValue = selectedDate ? formatDisplayDate(selectedDate) : "";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;

      if (target instanceof Node && wrapperRef.current && !wrapperRef.current.contains(target)) {
        setOpen(false);
        setPickerMode("days");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }, [value]);

  const openPicker = () => {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const estimatedPickerHeight = 380;
      const bottomSpace = window.innerHeight - rect.bottom;
      const topSpace = rect.top;

      setOpenAbove(bottomSpace < estimatedPickerHeight && topSpace > bottomSpace);
    }

    setOpen((current) => !current);
    setPickerMode("days");
  };

  const moveMonth = (offset: number) => {
    setViewDate((current) => {
      const absoluteMonth = current.getFullYear() * 12 + current.getMonth() + offset;
      const nextYear = Math.floor(absoluteMonth / 12);
      const nextMonth = ((absoluteMonth % 12) + 12) % 12;

      if (nextYear < 0 || nextYear > 9999) return current;
      return makeCalendarDate(nextYear, nextMonth, 1);
    });
    setPickerMode("days");
  };

  const selectMonth = (monthIndex: number) => {
    setViewDate((current) => makeCalendarDate(current.getFullYear(), monthIndex, 1));
    setPickerMode("days");
  };

  const selectYear = (year: number) => {
    setViewDate((current) => makeCalendarDate(year, current.getMonth(), 1));
    setPickerMode("months");
  };

  const selectDate = (date: Date) => {
    onChange(formatDateInputValue(date));
    setViewDate(date);
    setOpen(false);
    setPickerMode("days");
  };

  const clearDate = () => {
    onChange("");
    setOpen(false);
    setPickerMode("days");
  };

  const selectToday = () => {
    selectDate(new Date());
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>

      <button
        type="button"
        onClick={openPicker}
        aria-expanded={open}
        className="flex min-h-[54px] w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-3 text-left text-sm font-mono outline-none transition hover:border-gray-300 focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      >
        <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
          {displayValue || "dd-mm-yyyy"}
        </span>

        <span className="text-[var(--light-gold)]" aria-hidden="true">
          ▪
        </span>
      </button>

      {open && (
        <div
          className={`absolute left-0 z-30 w-[300px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl ${
            openAbove ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="px-1 py-1 text-xl leading-none text-[var(--light-gold)] transition hover:opacity-75"
              aria-label="Previous month"
            >
              ←
            </button>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPickerMode((current) => current === "months" ? "days" : "months")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  pickerMode === "months"
                    ? "bg-[var(--light-gold)]/15 text-[var(--light-gold)]"
                    : "text-gray-900 hover:bg-[var(--light-gold)]/10"
                }`}
              >
                {monthNames[viewDate.getMonth()]}
              </button>

              <button
                type="button"
                onClick={() => setPickerMode((current) => current === "years" ? "days" : "years")}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  pickerMode === "years"
                    ? "bg-[var(--light-gold)]/15 text-[var(--light-gold)]"
                    : "text-gray-900 hover:bg-[var(--light-gold)]/10"
                }`}
              >
                {formatPickerYear(viewDate.getFullYear())}
              </button>
            </div>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="px-1 py-1 text-xl leading-none text-[var(--light-gold)] transition hover:opacity-75"
              aria-label="Next month"
            >
              →
            </button>
          </div>

          {pickerMode === "months" && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {monthNames.map((month, index) => {
                const isSelected = index === viewDate.getMonth();

                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => selectMonth(index)}
                    className={`rounded-lg px-2 py-2 text-sm transition ${
                      isSelected
                        ? "bg-[var(--light-gold)] font-semibold text-white shadow-sm"
                        : "text-gray-800 hover:bg-[var(--light-gold)]/10"
                    }`}
                  >
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {pickerMode === "years" && (
            <div className="mt-4 grid max-h-[260px] grid-cols-4 gap-2 overflow-y-auto pr-1">
              {yearOptions.map((year) => {
                const isSelected = year === viewDate.getFullYear();

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => selectYear(year)}
                    className={`rounded-lg px-2 py-2 text-sm transition ${
                      isSelected
                        ? "bg-[var(--light-gold)] font-semibold text-white shadow-sm"
                        : "text-gray-800 hover:bg-[var(--light-gold)]/10"
                    }`}
                  >
                    {formatPickerYear(year)}
                  </button>
                );
              })}
            </div>
          )}

          {pickerMode === "days" && (
            <>
              <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const isSelected = selectedDate ? isSameDate(day.date, selectedDate) : false;
                  const isToday = isSameDate(day.date, new Date());

                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => selectDate(day.date)}
                      className={`h-9 rounded-lg text-sm transition ${
                        isSelected
                          ? "bg-[var(--light-gold)] font-semibold text-white shadow-sm"
                          : day.inCurrentMonth
                            ? "text-gray-800 hover:bg-[var(--light-gold)]/10 hover:text-gray-900"
                            : "text-gray-400 hover:bg-gray-50"
                      } ${isToday && !isSelected ? "ring-1 ring-[var(--light-gold)]" : ""}`}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={clearDate}
              className="text-sm font-semibold text-gray-900 transition hover:text-[var(--light-gold)]"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={selectToday}
              className="text-sm font-semibold text-gray-900 transition hover:text-[var(--light-gold)]"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function parsePickerDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = makeCalendarDate(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function makeCalendarDate(year: number, monthIndex: number, day: number): Date {
  const date = new Date(0);
  date.setHours(12, 0, 0, 0);
  date.setFullYear(year, monthIndex, day);
  return date;
}

function formatDateInputValue(date: Date): string {
  const year = formatPickerYear(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${formatPickerYear(date.getFullYear())}`;
}

function formatPickerYear(year: number): string {
  return String(year).padStart(4, "0");
}

function isSameDate(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function buildYearOptions(viewDate: Date): number[] {
  const selectedYear = viewDate.getFullYear();
  const start = Math.max(0, selectedYear - 12);
  const end = Math.min(9999, selectedYear + 12);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function buildCalendarDays(viewDate: Date) {
  const firstDay = makeCalendarDate(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = makeCalendarDate(firstDay.getFullYear(), firstDay.getMonth(), 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = makeCalendarDate(start.getFullYear(), start.getMonth(), start.getDate() + index);
    return {
      date,
      key: formatDateInputValue(date),
      inCurrentMonth: date.getMonth() === viewDate.getMonth() && date.getFullYear() === viewDate.getFullYear(),
    };
  });
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
