"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const presets = [
  {
    label: "Every 15 minutes",
    value: "*/15 * * * *",
  },
  {
    label: "Every day at midnight",
    value: "0 0 * * *",
  },
  {
    label: "Every weekday at 9 AM",
    value: "0 9 * * 1-5",
  },
  {
    label: "Every Sunday at 6 AM",
    value: "0 6 * * 0",
  },
];

const monthNames: Record<number, string> = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

const weekdayNames: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

type CronParts = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

export default function ToolClient() {
  const [expression, setExpression] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const previewExpression = useMemo(() => expression.trim(), [expression]);

  const parseExpression = () => {
    const cron = expression.trim();

    if (!cron) {
      setError("Please enter a cron expression to parse.");
      setOutput("");
      return;
    }

    try {
      const result = parseCronExpression(cron);

      setOutput(result);
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to parse this cron expression.";

      setError(message);
      setOutput("");
    }
  };

  const usePreset = (value: string) => {
    setExpression(value);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setExpression("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Cron Expression Parser"
      description="Parse cron expressions, check cron syntax, and understand cron schedules in simple human-readable language."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Cron Expression
        </label>

        <input
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="0 9 * * 1-5"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Enter a standard 5-part cron expression: minute hour day month
          weekday.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseExpression} className="yoryantra-btn">
          Parse Cron
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700">
          Try an example
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => usePreset(preset.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-[var(--light-gold)] hover:text-[var(--light-gold)]"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Schedule
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
          {output ||
            (previewExpression
              ? "Click Parse Cron to understand this schedule."
              : "Cron schedule explanation will appear here.")}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Parsing Cron Expressions Into Human-Readable Schedules
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cron expressions are used to schedule jobs, scripts, reports,
            backups, cleanup tasks, deployments, and server processes. A small
            cron syntax mistake can make a job run too often, at the wrong time,
            or not run when expected.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Cron Expression Parser helps you read cron expressions, check
            cron schedule meaning, and understand the minute, hour, day, month,
            and weekday fields before using them in DevOps tasks or scheduled
            automation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading Cron Syntax Before Using Scheduled Jobs
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a 5-part cron expression into the input field.</li>
            <li>
              Click <strong>Parse Cron</strong>.
            </li>
            <li>Read the human-readable cron schedule explanation.</li>
            <li>Review each cron field before using it in a scheduled job.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Cron Parser Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Understanding cron jobs used on servers.</li>
            <li>Checking backup, cleanup, or report schedules.</li>
            <li>Reviewing CI/CD scheduled jobs before deployment.</li>
            <li>Reading cron expressions copied from configuration files.</li>
            <li>Checking whether a cron schedule runs daily, weekly, or repeatedly.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Cron Expressions
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`*/15 * * * *   Runs every 15 minutes
0 0 * * *      Runs every day at midnight
0 9 * * 1-5    Runs at 9:00 AM, Monday to Friday
0 6 * * 0      Runs at 6:00 AM every Sunday`}
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
                What does a cron expression parser do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A cron expression parser reads a cron expression and explains
                when the scheduled job is expected to run. It helps make cron
                schedules easier to understand before using them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What cron format does this tool support?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool supports the common 5-part cron format: minute, hour,
                day of month, month, and day of week.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I check cron syntax with this tool?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool checks common cron field values, ranges, lists,
                and step values so you can catch basic syntax issues before
                using the schedule.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support advanced cron formats?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This parser is focused on common 5-part cron expressions. Some
                platform-specific cron formats may support extra fields or
                special rules that behave differently.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my cron expression uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The cron parsing happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/cron-expression-parser" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseCronExpression(expression: string) {
  const parts = expression.trim().split(/\s+/);

  if (parts.length !== 5) {
    throw new Error(
      "Cron expression must contain 5 values: minute hour day month weekday."
    );
  }

  const cronParts: CronParts = {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };

  validateCronField(cronParts.minute, "minute", 0, 59);
  validateCronField(cronParts.hour, "hour", 0, 23);
  validateCronField(cronParts.dayOfMonth, "day of month", 1, 31);
  validateCronField(cronParts.month, "month", 1, 12);
  validateCronField(cronParts.dayOfWeek, "weekday", 0, 7);

  const summary = buildSummary(cronParts);

  return [
    `Expression: ${expression}`,
    "",
    `Summary: ${summary}`,
    "",
    `Minute: ${describeField(cronParts.minute, "minute")}`,
    `Hour: ${describeHourField(cronParts.hour)}`,
    `Day of month: ${describeDayOfMonth(cronParts.dayOfMonth)}`,
    `Month: ${describeMonth(cronParts.month)}`,
    `Weekday: ${describeWeekday(cronParts.dayOfWeek)}`,
  ].join("\n");
}

function validateCronField(
  value: string,
  label: string,
  min: number,
  max: number
) {
  if (!value) {
    throw new Error(`Missing ${label} field.`);
  }

  const segments = value.split(",");

  for (const segment of segments) {
    if (!segment) {
      throw new Error(`Invalid ${label} field.`);
    }

    const [rangePart, stepPart] = segment.split("/");

    if (stepPart !== undefined) {
      const step = Number(stepPart);

      if (!Number.isInteger(step) || step < 1) {
        throw new Error(`Invalid step value in ${label} field.`);
      }
    }

    if (rangePart === "*") {
      continue;
    }

    if (rangePart.includes("-")) {
      const [startRaw, endRaw] = rangePart.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);

      if (
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < min ||
        end > max ||
        start > end
      ) {
        throw new Error(`Invalid range in ${label} field.`);
      }

      continue;
    }

    const number = Number(rangePart);

    if (!Number.isInteger(number) || number < min || number > max) {
      throw new Error(`Invalid ${label} value: ${rangePart}.`);
    }
  }
}

function describeField(value: string, label: string) {
  if (value === "*") {
    return `Every ${label}`;
  }

  if (value.startsWith("*/")) {
    const step = value.slice(2);
    return `Every ${step} ${label}${step === "1" ? "" : "s"}`;
  }

  if (value.includes(",")) {
    return `At ${label} values ${value}`;
  }

  if (value.includes("-")) {
    return `From ${value.replace("-", " to ")}`;
  }

  if (value.includes("/")) {
    const [range, step] = value.split("/");
    return `Every ${step} ${label}${step === "1" ? "" : "s"} within ${range}`;
  }

  return `At ${label} ${value}`;
}

function describeHourField(value: string) {
  if (value === "*") {
    return "Every hour";
  }

  if (value.startsWith("*/")) {
    const step = value.slice(2);
    return `Every ${step} hour${step === "1" ? "" : "s"}`;
  }

  if (value.includes(",")) {
    return `At ${value
      .split(",")
      .map((item) => formatTime(Number(item), 0))
      .join(", ")}`;
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `From ${formatTime(Number(start), 0)} to ${formatTime(Number(end), 0)}`;
  }

  if (value.includes("/")) {
    const [range, step] = value.split("/");
    return `Every ${step} hours within ${range}`;
  }

  return `At ${formatTime(Number(value), 0)}`;
}

function describeDayOfMonth(value: string) {
  if (value === "*") {
    return "Every day of the month";
  }

  if (value.startsWith("*/")) {
    return `Every ${value.slice(2)} days`;
  }

  if (value.includes(",")) {
    return `On days ${value}`;
  }

  if (value.includes("-")) {
    return `From day ${value.replace("-", " to day ")}`;
  }

  return `On day ${value}`;
}

function describeMonth(value: string) {
  if (value === "*") {
    return "Every month";
  }

  if (value.startsWith("*/")) {
    return `Every ${value.slice(2)} months`;
  }

  if (value.includes(",")) {
    return `In ${value
      .split(",")
      .map((item) => monthNames[Number(item)] || item)
      .join(", ")}`;
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `From ${monthNames[Number(start)] || start} to ${
      monthNames[Number(end)] || end
    }`;
  }

  return `In ${monthNames[Number(value)] || value}`;
}

function describeWeekday(value: string) {
  if (value === "*") {
    return "Every day of the week";
  }

  if (value.startsWith("*/")) {
    return `Every ${value.slice(2)} days of the week`;
  }

  if (value.includes(",")) {
    return value
      .split(",")
      .map((item) => weekdayNames[Number(item)] || item)
      .join(", ");
  }

  if (value.includes("-")) {
    const [start, end] = value.split("-");
    return `${weekdayNames[Number(start)] || start} to ${
      weekdayNames[Number(end)] || end
    }`;
  }

  return weekdayNames[Number(value)] || value;
}

function buildSummary(parts: CronParts) {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = parts;

  if (
    minute.startsWith("*/") &&
    hour === "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Runs every ${minute.slice(2)} minutes.`;
  }

  if (
    minute === "0" &&
    hour === "0" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return "Runs every day at midnight.";
  }

  if (
    minute !== "*" &&
    hour !== "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Runs every day at ${formatTime(Number(hour), Number(minute))}.`;
  }

  if (
    minute !== "*" &&
    hour !== "*" &&
    dayOfMonth === "*" &&
    month === "*" &&
    dayOfWeek !== "*"
  ) {
    return `Runs at ${formatTime(Number(hour), Number(minute))}, ${describeWeekday(
      dayOfWeek
    )}.`;
  }

  if (
    minute !== "*" &&
    hour !== "*" &&
    dayOfMonth !== "*" &&
    month === "*" &&
    dayOfWeek === "*"
  ) {
    return `Runs at ${formatTime(Number(hour), Number(minute))} on day ${dayOfMonth} of each month.`;
  }

  return "Runs based on the minute, hour, day, month, and weekday fields shown below.";
}

function formatTime(hour: number, minute: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  const paddedMinute = String(minute).padStart(2, "0");

  return `${normalizedHour}:${paddedMinute} ${suffix}`;
}
