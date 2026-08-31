"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CronParts = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};

type FieldDefinition = {
  label: string;
  min: number;
  max: number;
  aliases?: Record<string, number>;
};

const MONTH_ALIASES: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
};

const WEEKDAY_ALIASES: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const MONTH_NAMES = [
  "",
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

const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const FIELD_DEFINITIONS: FieldDefinition[] = [
  { label: "Minute", min: 0, max: 59 },
  { label: "Hour", min: 0, max: 23 },
  { label: "Day of month", min: 1, max: 31 },
  { label: "Month", min: 1, max: 12, aliases: MONTH_ALIASES },
  { label: "Day of week", min: 0, max: 7, aliases: WEEKDAY_ALIASES },
];

const presets = [
  { label: "Every 15 minutes", value: "*/15 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Weekdays at 9 AM", value: "0 9 * * MON-FRI" },
  { label: "Jan–Mar, first day", value: "30 8 1 JAN-MAR *" },
];

export default function ToolClient() {
  const [expression, setExpression] = useState("");
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  const trimmed = useMemo(() => expression.trim(), [expression]);

  const parseCron = () => {
    if (!trimmed) {
      setError("Enter a five-field cron expression.");
      setReport("");
      return;
    }

    try {
      setReport(formatCronReport(parseCronExpression(trimmed)));
      setError("");
    } catch (err) {
      setReport("");
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse this cron expression."
      );
    }
  };

  const resetAll = () => {
    setExpression("");
    setReport("");
    setError("");
  };

  return (
    <ToolShell
      title="Cron Expression Parser"
      description="Parse traditional five-field cron expressions with lists, ranges, steps, month names, weekday names, and field-by-field schedule explanations."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Cron expression
        </label>
        <input
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          placeholder="0 9 * * MON-FRI"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Traditional five fields: minute, hour, day of month, month, day of
          week. This parser intentionally does not mix Quartz, AWS, or other
          platform-specific cron grammars into the result.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseCron} className="yoryantra-btn">
          Parse Cron
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-700">Try an example</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => {
                setExpression(preset.value);
                setReport("");
                setError("");
              }}
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

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Schedule
          </h3>
          {report && (
            <button
              onClick={() => navigator.clipboard.writeText(report)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {report ||
            (trimmed
              ? "Click Parse Cron to inspect this expression."
              : "Cron schedule details will appear here.")}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            The Five Fields This Parser Supports
          </h2>
          <div className="mt-5 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[620px] text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="p-3">Field</th>
                  <th className="p-3">Values</th>
                  <th className="p-3">Examples</th>
                </tr>
              </thead>
              <tbody>
                <Row field="Minute" values="0–59" example="*/15, 0, 10-30/5" />
                <Row field="Hour" values="0–23" example="9, 0-23/2" />
                <Row field="Day of month" values="1–31" example="1,15 or *" />
                <Row field="Month" values="1–12 or JAN–DEC" example="JAN-MAR" />
                <Row field="Day of week" values="0–7 or SUN–SAT" example="MON-FRI" />
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Day-of-Month and Day-of-Week Use OR Semantics in Classic Cron
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A common mistake is reading the two day fields as an AND condition.
            In classic crontab behavior, when both fields are restricted, the
            command runs when either day field matches. For example,
            <code> 30 4 1,15 * FRI</code> means 4:30 AM on the first and
            fifteenth of the month, plus every Friday.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Time Zone and Daylight-Saving Behavior Are Outside the Five Fields
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same expression can run at different real-world times depending
            on the cron daemon&apos;s time zone configuration. Daylight-saving
            transitions can also create missing or repeated local times. This
            parser explains expression syntax; it does not simulate a specific
            machine&apos;s cron daemon, CRON_TZ configuration, or DST history.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reference
          </h2>
          <a
            href="https://man7.org/linux/man-pages/man5/crontab.5.html"
            target="_blank"
            rel="noreferrer noopener"
            className="yoryantra-btn-outline mt-4 inline-flex"
          >
            crontab(5) manual
          </a>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/cron-expression-parser" />
        </div>
      </section>
    </ToolShell>
  );
}

function Row({
  field,
  values,
  example,
}: {
  field: string;
  values: string;
  example: string;
}) {
  return (
    <tr className="border-t border-gray-200">
      <td className="p-3 font-medium text-gray-900">{field}</td>
      <td className="p-3">{values}</td>
      <td className="p-3 font-mono text-xs">{example}</td>
    </tr>
  );
}

function parseCronExpression(expression: string) {
  if (expression.startsWith("@")) {
    throw new Error(
      "This parser focuses on traditional five-field expressions. Nicknames such as @daily and @reboot are intentionally not mixed into this grammar."
    );
  }

  const parts = expression.split(/\s+/);
  if (parts.length !== 5) {
    throw new Error(
      "Expected exactly five fields: minute hour day-of-month month day-of-week."
    );
  }

  parts.forEach((part, index) => validateCronField(part, FIELD_DEFINITIONS[index]));

  const cronParts: CronParts = {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };

  return {
    expression,
    parts: cronParts,
    summary: buildSummary(cronParts),
    dayRule:
      cronParts.dayOfMonth !== "*" && cronParts.dayOfWeek !== "*"
        ? "Both day fields are restricted. In classic cron, either day-of-month OR day-of-week matching can trigger the command."
        : "",
  };
}

function validateCronField(value: string, definition: FieldDefinition) {
  if (!value) throw new Error(`${definition.label} is missing.`);

  const segments = value.split(",");
  if (segments.some((segment) => !segment)) {
    throw new Error(`${definition.label} contains an empty list item.`);
  }

  for (const segment of segments) {
    const slashParts = segment.split("/");
    if (slashParts.length > 2) {
      throw new Error(`${definition.label} contains more than one step separator.`);
    }

    const base = slashParts[0];
    const stepRaw = slashParts[1];

    if (stepRaw !== undefined) {
      const step = Number(stepRaw);
      if (!/^\d+$/.test(stepRaw) || !Number.isInteger(step) || step < 1) {
        throw new Error(`${definition.label} has an invalid step value "${stepRaw}".`);
      }
    }

    if (base === "*") continue;

    const dashIndex = base.indexOf("-");
    if (dashIndex >= 0) {
      if (base.indexOf("-", dashIndex + 1) >= 0) {
        throw new Error(`${definition.label} contains an invalid range "${base}".`);
      }

      const startToken = base.slice(0, dashIndex);
      const endToken = base.slice(dashIndex + 1);
      const start = resolveCronValue(startToken, definition);
      const end = resolveCronValue(endToken, definition);

      if (start > end) {
        throw new Error(
          `${definition.label} range "${base}" runs backwards. Use an increasing range or a list.`
        );
      }
      continue;
    }

    resolveCronValue(base, definition);
  }
}

function resolveCronValue(token: string, definition: FieldDefinition) {
  const upper = token.toUpperCase();
  const alias = definition.aliases?.[upper];
  const number = alias !== undefined ? alias : Number(token);

  if (
    (alias === undefined && !/^\d+$/.test(token)) ||
    !Number.isInteger(number) ||
    number < definition.min ||
    number > definition.max
  ) {
    const names = definition.aliases
      ? ` or ${Object.keys(definition.aliases).join("–")}`
      : "";
    throw new Error(
      `${definition.label} value "${token}" is outside ${definition.min}–${definition.max}${names}.`
    );
  }

  return number;
}

function formatCronReport(parsed: {
  expression: string;
  parts: CronParts;
  summary: string;
  dayRule: string;
}) {
  const { parts } = parsed;
  const lines = [
    `Expression: ${parsed.expression}`,
    `Summary: ${parsed.summary}`,
    "",
    `Minute: ${describeField(parts.minute, FIELD_DEFINITIONS[0])}`,
    `Hour: ${describeField(parts.hour, FIELD_DEFINITIONS[1])}`,
    `Day of month: ${describeField(parts.dayOfMonth, FIELD_DEFINITIONS[2])}`,
    `Month: ${describeField(parts.month, FIELD_DEFINITIONS[3])}`,
    `Day of week: ${describeField(parts.dayOfWeek, FIELD_DEFINITIONS[4])}`,
  ];

  if (parsed.dayRule) {
    lines.push("", `Important day rule: ${parsed.dayRule}`);
  }

  lines.push(
    "",
    "Scope: traditional five-field cron syntax. Platform-specific extensions can behave differently."
  );

  return lines.join("\n");
}

function describeField(value: string, definition: FieldDefinition) {
  if (value === "*") return `every ${definition.label.toLowerCase()}`;

  return value
    .split(",")
    .map((segment) => describeSegment(segment, definition))
    .join("; ");
}

function describeSegment(segment: string, definition: FieldDefinition) {
  const slashParts = segment.split("/");
  const base = slashParts[0];
  const step = slashParts[1];

  let baseText: string;

  if (base === "*") {
    baseText = `the full ${definition.label.toLowerCase()} range`;
  } else if (base.includes("-")) {
    const [startRaw, endRaw] = base.split("-");
    baseText = `${displayCronValue(startRaw, definition)} through ${displayCronValue(
      endRaw,
      definition
    )}`;
  } else {
    baseText = displayCronValue(base, definition);
  }

  return step ? `${baseText}, every ${step} values` : baseText;
}

function displayCronValue(token: string, definition: FieldDefinition) {
  const number = resolveCronValue(token, definition);

  if (definition.label === "Month") {
    return MONTH_NAMES[number] || token.toUpperCase();
  }

  if (definition.label === "Day of week") {
    return WEEKDAY_NAMES[number] || token.toUpperCase();
  }

  if (definition.label === "Hour") {
    return `${number} (${formatHour(number)})`;
  }

  return String(number);
}

function buildSummary(parts: CronParts) {
  const minute = singleNumericValue(parts.minute, FIELD_DEFINITIONS[0]);
  const hour = singleNumericValue(parts.hour, FIELD_DEFINITIONS[1]);

  if (
    parts.minute.startsWith("*/") &&
    parts.hour === "*" &&
    parts.dayOfMonth === "*" &&
    parts.month === "*" &&
    parts.dayOfWeek === "*"
  ) {
    return `Every ${parts.minute.slice(2)} minutes.`;
  }

  if (
    minute !== null &&
    hour !== null &&
    parts.dayOfMonth === "*" &&
    parts.month === "*" &&
    parts.dayOfWeek === "*"
  ) {
    return `Every day at ${formatTime(hour, minute)}.`;
  }

  if (
    minute !== null &&
    hour !== null &&
    parts.dayOfMonth === "*" &&
    parts.month === "*" &&
    parts.dayOfWeek !== "*"
  ) {
    return `At ${formatTime(hour, minute)} on ${describeField(
      parts.dayOfWeek,
      FIELD_DEFINITIONS[4]
    )}.`;
  }

  return "Runs when the minute, hour, month, and applicable day rules shown below match.";
}

function singleNumericValue(value: string, definition: FieldDefinition) {
  if (!/^[A-Za-z0-9]+$/.test(value)) return null;
  try {
    return resolveCronValue(value, definition);
  } catch {
    return null;
  }
}

function formatHour(hour: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:00 ${suffix}`;
}

function formatTime(hour: number, minute: number) {
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${normalized}:${String(minute).padStart(2, "0")} ${suffix}`;
}
