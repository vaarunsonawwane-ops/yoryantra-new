"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type FieldName =
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

type FieldDefinition = {
  name: FieldName;
  label: string;
  min: number;
  max: number;
  aliases?: Record<string, number>;
};

type ParsedField = {
  source: string;
  description: string;
  values: number[];
};

type ParsedCron = {
  expression: string;
  minute: ParsedField;
  hour: ParsedField;
  dayOfMonth: ParsedField;
  month: ParsedField;
  dayOfWeek: ParsedField;
  summary: string;
  warnings: string[];
  notes: string[];
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
  {
    name: "minute",
    label: "Minute",
    min: 0,
    max: 59,
  },
  {
    name: "hour",
    label: "Hour",
    min: 0,
    max: 23,
  },
  {
    name: "dayOfMonth",
    label: "Day of month",
    min: 1,
    max: 31,
  },
  {
    name: "month",
    label: "Month",
    min: 1,
    max: 12,
    aliases: MONTH_ALIASES,
  },
  {
    name: "dayOfWeek",
    label: "Day of week",
    min: 0,
    max: 7,
    aliases: WEEKDAY_ALIASES,
  },
];

const PRESETS = [
  {
    label: "Every 15 minutes",
    value: "*/15 * * * *",
  },
  {
    label: "Weekdays at 9 AM",
    value: "0 9 * * MON-FRI",
  },
  {
    label: "1st and 15th at 04:30",
    value: "30 4 1,15 * *",
  },
  {
    label: "January–March, first day",
    value: "30 8 1 JAN-MAR *",
  },
];

function hasOwn(
  object: Record<string, number>,
  key: string
) {
  return Object.prototype.hasOwnProperty.call(
    object,
    key
  );
}

function resolveCronValue(
  token: string,
  definition: FieldDefinition
) {
  const upper = token.toUpperCase();
  let value: number | null = null;

  if (
    definition.aliases &&
    hasOwn(definition.aliases, upper)
  ) {
    value = definition.aliases[upper];
  } else if (/^\d+$/.test(token)) {
    value = Number(token);
  }

  if (
    value === null ||
    !Number.isInteger(value) ||
    value < definition.min ||
    value > definition.max
  ) {
    const aliasHint = definition.aliases
      ? ` or one of ${Object.keys(
          definition.aliases
        ).join(", ")}`
      : "";

    throw new Error(
      `${definition.label} value "${token}" is outside ${definition.min}-${definition.max}${aliasHint}.`
    );
  }

  return value;
}

function normalizeSemanticValue(
  value: number,
  definition: FieldDefinition
) {
  if (
    definition.name === "dayOfWeek" &&
    value === 7
  ) {
    return 0;
  }

  return value;
}

function addUniqueValue(
  values: number[],
  value: number,
  definition: FieldDefinition
) {
  const semantic =
    normalizeSemanticValue(
      value,
      definition
    );

  if (
    !values.some(
      (item) =>
        normalizeSemanticValue(
          item,
          definition
        ) === semantic
    )
  ) {
    values.push(value);
  }
}

function expandRange(
  start: number,
  end: number,
  step: number,
  definition: FieldDefinition
) {
  const values: number[] = [];

  for (
    let value = start;
    value <= end;
    value += step
  ) {
    addUniqueValue(
      values,
      value,
      definition
    );
  }

  return values;
}

function describeCronValue(
  value: number,
  definition: FieldDefinition
) {
  if (
    definition.name === "month"
  ) {
    return MONTH_NAMES[value] ||
      String(value);
  }

  if (
    definition.name ===
    "dayOfWeek"
  ) {
    return WEEKDAY_NAMES[value] ||
      String(value);
  }

  if (
    definition.name === "hour"
  ) {
    return `${value} (${formatHour(
      value
    )})`;
  }

  return String(value);
}

function parseSegment(
  segment: string,
  definition: FieldDefinition
) {
  const slashParts =
    segment.split("/");

  if (slashParts.length > 2) {
    throw new Error(
      `${definition.label} segment "${segment}" contains more than one step separator.`
    );
  }

  const base = slashParts[0];
  const stepText =
    slashParts.length === 2
      ? slashParts[1]
      : "";
  let step = 1;

  if (slashParts.length === 2) {
    if (
      !/^\d+$/.test(stepText) ||
      Number(stepText) < 1
    ) {
      throw new Error(
        `${definition.label} step "${stepText}" must be a positive integer.`
      );
    }

    step = Number(stepText);

    if (
      base !== "*" &&
      base.indexOf("-") === -1
    ) {
      throw new Error(
        `${definition.label} segment "${segment}" uses /step on a single value. This parser's portable five-field subset applies steps to * or an explicit range.`
      );
    }
  }

  if (base === "*") {
    const values = expandRange(
      definition.min,
      definition.max,
      step,
      definition
    );

    return {
      values,
      description:
        step === 1
          ? `every allowed ${definition.label.toLowerCase()}`
          : `every ${step} values across the full ${definition.label.toLowerCase()} range, starting at ${definition.min}`,
    };
  }

  const dash = base.indexOf("-");

  if (dash !== -1) {
    if (
      base.indexOf("-", dash + 1) !==
      -1
    ) {
      throw new Error(
        `${definition.label} contains an invalid range "${base}".`
      );
    }

    const startText =
      base.slice(0, dash);
    const endText =
      base.slice(dash + 1);

    if (
      !startText ||
      !endText
    ) {
      throw new Error(
        `${definition.label} contains an incomplete range "${base}".`
      );
    }

    const start =
      resolveCronValue(
        startText,
        definition
      );
    const end =
      resolveCronValue(
        endText,
        definition
      );

    if (start > end) {
      throw new Error(
        `${definition.label} range "${base}" runs backwards. Use an increasing range or split wrap-around values into a list.`
      );
    }

    const values = expandRange(
      start,
      end,
      step,
      definition
    );

    return {
      values,
      description:
        step === 1
          ? `${describeCronValue(
              start,
              definition
            )} through ${describeCronValue(
              end,
              definition
            )}`
          : `${describeCronValue(
              start,
              definition
            )} through ${describeCronValue(
              end,
              definition
            )}, taking every ${step} values`,
    };
  }

  const value =
    resolveCronValue(
      base,
      definition
    );

  return {
    values: [value],
    description:
      describeCronValue(
        value,
        definition
      ),
  };
}

function parseField(
  source: string,
  definition: FieldDefinition
): ParsedField {
  const value = source
    .trim()
    .toUpperCase();

  if (!value) {
    throw new Error(
      `${definition.label} is empty.`
    );
  }

  if (/[?LW#]/.test(value)) {
    throw new Error(
      `${definition.label} contains ?, L, W, or #. Those tokens belong to Quartz/vendor cron dialects and are outside this traditional five-field subset.`
    );
  }

  if (
    value.indexOf("~") !== -1
  ) {
    throw new Error(
      `${definition.label} contains Cronie random-range syntax (~), which this portability-focused parser intentionally does not interpret.`
    );
  }

  const segments =
    value.split(",");

  if (
    segments.some(
      (segment) => !segment
    )
  ) {
    throw new Error(
      `${definition.label} contains an empty list item.`
    );
  }

  const descriptions: string[] =
    [];
  const values: number[] = [];

  segments.forEach((segment) => {
    const parsed = parseSegment(
      segment,
      definition
    );

    descriptions.push(
      parsed.description
    );

    parsed.values.forEach(
      (item) =>
        addUniqueValue(
          values,
          item,
          definition
        )
    );
  });

  return {
    source: value,
    description:
      descriptions.join("; "),
    values,
  };
}

function formatHour(hour: number) {
  const suffix =
    hour >= 12 ? "PM" : "AM";
  const normalized =
    hour % 12 || 12;

  return `${normalized}:00 ${suffix}`;
}

function formatTime(
  hour: number,
  minute: number
) {
  const suffix =
    hour >= 12 ? "PM" : "AM";
  const normalized =
    hour % 12 || 12;

  return `${normalized}:${String(
    minute
  ).padStart(2, "0")} ${suffix}`;
}

function singleValue(
  field: ParsedField
) {
  return field.values.length === 1
    ? field.values[0]
    : null;
}

function buildSummary(
  minute: ParsedField,
  hour: ParsedField,
  dayOfMonth: ParsedField,
  month: ParsedField,
  dayOfWeek: ParsedField
) {
  const minuteValue =
    singleValue(minute);
  const hourValue =
    singleValue(hour);

  if (
    /^\*\/\d+$/.test(
      minute.source
    ) &&
    minute.values.length > 1 &&
    hour.source === "*" &&
    dayOfMonth.source === "*" &&
    month.source === "*" &&
    dayOfWeek.source === "*"
  ) {
    return `Runs every ${minute.source.slice(
      2
    )} minutes.`;
  }

  if (
    minuteValue !== null &&
    hourValue !== null &&
    dayOfMonth.source === "*" &&
    month.source === "*" &&
    dayOfWeek.source === "*"
  ) {
    return `Runs every day at ${formatTime(
      hourValue,
      minuteValue
    )}.`;
  }

  if (
    minuteValue !== null &&
    hourValue !== null &&
    dayOfMonth.source === "*" &&
    month.source === "*" &&
    dayOfWeek.source !== "*"
  ) {
    return `Runs at ${formatTime(
      hourValue,
      minuteValue
    )} on ${dayOfWeek.description}.`;
  }

  if (
    minuteValue !== null &&
    hourValue !== null &&
    dayOfMonth.source !== "*" &&
    month.source === "*" &&
    dayOfWeek.source === "*"
  ) {
    return `Runs at ${formatTime(
      hourValue,
      minuteValue
    )} on day-of-month rule: ${dayOfMonth.description}.`;
  }

  return "Runs when the minute, hour, month, and applicable day rules shown below match.";
}

function explicitSimpleValues(
  field: ParsedField
) {
  if (
    field.source.indexOf("*") !==
      -1 ||
    field.source.indexOf("/") !==
      -1 ||
    field.source.indexOf("-") !==
      -1
  ) {
    return null;
  }

  return field.values;
}

function impossibleDateWarning(
  dayOfMonth: ParsedField,
  month: ParsedField
) {
  const days =
    explicitSimpleValues(
      dayOfMonth
    );
  const months =
    explicitSimpleValues(month);

  if (!days || !months) {
    return "";
  }

  const maximumDays: Record<
    number,
    number
  > = {
    1: 31,
    2: 29,
    3: 31,
    4: 30,
    5: 31,
    6: 30,
    7: 31,
    8: 31,
    9: 30,
    10: 31,
    11: 30,
    12: 31,
  };

  const possible = days.some(
    (day) =>
      months.some(
        (selectedMonth) =>
          day <=
          maximumDays[
            selectedMonth
          ]
      )
  );

  return possible
    ? ""
    : `The selected day-of-month value${
        days.length === 1 ? "" : "s"
      } cannot occur in the selected month${
        months.length === 1 ? "" : "s"
      }. The expression is syntactically valid but those date combinations never occur.`;
}

function parseCronExpression(
  expression: string
): ParsedCron {
  if (
    expression.charAt(0) === "@"
  ) {
    throw new Error(
      "Nicknames such as @daily and @reboot are not five-field expressions. This parser keeps those implementation conveniences separate from the field grammar."
    );
  }

  const parts =
    expression
      .trim()
      .split(/\s+/);

  if (parts.length !== 5) {
    throw new Error(
      "Expected exactly five fields: minute hour day-of-month month day-of-week."
    );
  }

  const minute = parseField(
    parts[0],
    FIELD_DEFINITIONS[0]
  );
  const hour = parseField(
    parts[1],
    FIELD_DEFINITIONS[1]
  );
  const dayOfMonth = parseField(
    parts[2],
    FIELD_DEFINITIONS[2]
  );
  const month = parseField(
    parts[3],
    FIELD_DEFINITIONS[3]
  );
  const dayOfWeek = parseField(
    parts[4],
    FIELD_DEFINITIONS[4]
  );

  const warnings: string[] = [];
  const notes: string[] = [];

  if (
    dayOfMonth.source !== "*" &&
    dayOfWeek.source !== "*"
  ) {
    warnings.push(
      "Both day fields are restricted. In common Vixie/Cronie-style cron, day-of-month and day-of-week use OR-style matching: the job can run when either day field matches, provided the minute, hour, and month also match."
    );
  }

  const impossible =
    impossibleDateWarning(
      dayOfMonth,
      month
    );

  if (impossible) {
    warnings.push(impossible);
  }

  if (
    dayOfWeek.source.indexOf("0") !==
      -1 &&
    dayOfWeek.source.indexOf("7") !==
      -1
  ) {
    notes.push(
      "The weekday field mentions both 0 and 7. In this traditional cron baseline, both represent Sunday."
    );
  }

  const steppedFields = [
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
  ].filter(
    (field) =>
      field.source.indexOf("/") !==
      -1
  );

  if (steppedFields.length) {
    notes.push(
      "Cron steps advance within the field/range they are attached to. A step does not mean a duration measured from the moment the cron daemon starts."
    );
  }

  notes.push(
    "The five fields contain no timezone. The scheduler's timezone, CRON_TZ support, and daylight-saving behavior determine the real wall-clock execution times."
  );

  notes.push(
    "This parser explains a portable traditional subset. Quartz, AWS EventBridge, GitHub Actions, Kubernetes CronJobs, and other schedulers can impose different field counts or extra rules."
  );

  return {
    expression,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
    summary: buildSummary(
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek
    ),
    warnings,
    notes,
  };
}

function shortValues(
  field: ParsedField,
  definition: FieldDefinition
) {
  if (
    field.values.length >
    24
  ) {
    return `${field.values.length} matching values`;
  }

  return field.values
    .map((value) =>
      describeCronValue(
        value,
        definition
      )
    )
    .join(", ");
}

function formatCronReport(
  parsed: ParsedCron
) {
  const lines = [
    `Expression: ${parsed.expression}`,
    `Summary: ${parsed.summary}`,
    "",
    `Minute: ${parsed.minute.description}`,
    `Hour: ${parsed.hour.description}`,
    `Day of month: ${parsed.dayOfMonth.description}`,
    `Month: ${parsed.month.description}`,
    `Day of week: ${parsed.dayOfWeek.description}`,
    "",
    `Minute matches: ${shortValues(
      parsed.minute,
      FIELD_DEFINITIONS[0]
    )}`,
    `Hour matches: ${shortValues(
      parsed.hour,
      FIELD_DEFINITIONS[1]
    )}`,
    `Day-of-month matches: ${shortValues(
      parsed.dayOfMonth,
      FIELD_DEFINITIONS[2]
    )}`,
    `Month matches: ${shortValues(
      parsed.month,
      FIELD_DEFINITIONS[3]
    )}`,
    `Day-of-week matches: ${shortValues(
      parsed.dayOfWeek,
      FIELD_DEFINITIONS[4]
    )}`,
  ];

  if (parsed.warnings.length) {
    lines.push(
      "",
      "Warnings:",
      ...parsed.warnings.map(
        (warning) =>
          `- ${warning}`
      )
    );
  }

  if (parsed.notes.length) {
    lines.push(
      "",
      "Interpretation notes:",
      ...parsed.notes.map(
        (note) => `- ${note}`
      )
    );
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [expression, setExpression] =
    useState("");
  const [parsed, setParsed] =
    useState<ParsedCron | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const trimmed = useMemo(
    () => expression.trim(),
    [expression]
  );

  const parseCron = () => {
    if (!trimmed) {
      setError(
        "Enter a five-field cron expression."
      );
      setParsed(null);
      return;
    }

    try {
      setParsed(
        parseCronExpression(trimmed)
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setParsed(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to parse this cron expression."
      );
      setCopied(false);
    }
  };

  const loadPreset = (
    value: string
  ) => {
    setExpression(value);
    setParsed(null);
    setError("");
    setCopied(false);
  };

  const copyReport = async () => {
    if (!parsed) return;

    try {
      await navigator.clipboard.writeText(
        formatCronReport(parsed)
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The parsed report could not be copied. Select and copy it manually."
      );
    }
  };

  const resetAll = () => {
    setExpression("");
    setParsed(null);
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Cron Expression Parser"
      description="Read an existing traditional five-field cron expression as matching rules, not just five mysterious tokens, and surface the day-field, date, step, timezone, and dialect assumptions that matter."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Five-field cron expression
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          minute · hour · day of month · month · day of week
        </p>
        <input
          value={expression}
          onChange={(event: {
            target: { value: string };
          }) => {
            setExpression(
              event.target.value
            );
            setParsed(null);
            setError("");
            setCopied(false);
          }}
          placeholder="0 9 * * MON-FRI"
          spellCheck={false}
          className="mt-4 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={parseCron}
          className="yoryantra-btn"
        >
          Parse Cron
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      <div className="mt-7">
        <p className="text-sm font-medium text-gray-700">
          Try an expression
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() =>
                loadPreset(
                  preset.value
                )
              }
              className="yoryantra-btn-outline"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {parsed ? (
        <div className="mt-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {parsed.summary}
                </h3>
                <p className="mt-2 font-mono text-sm text-gray-600">
                  {parsed.expression}
                </p>
              </div>
              <button
                type="button"
                onClick={copyReport}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : "Copy Report"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FieldCard
                label="Minute"
                field={parsed.minute}
                definition={
                  FIELD_DEFINITIONS[0]
                }
              />
              <FieldCard
                label="Hour"
                field={parsed.hour}
                definition={
                  FIELD_DEFINITIONS[1]
                }
              />
              <FieldCard
                label="Day of month"
                field={
                  parsed.dayOfMonth
                }
                definition={
                  FIELD_DEFINITIONS[2]
                }
              />
              <FieldCard
                label="Month"
                field={parsed.month}
                definition={
                  FIELD_DEFINITIONS[3]
                }
              />
              <FieldCard
                label="Day of week"
                field={
                  parsed.dayOfWeek
                }
                definition={
                  FIELD_DEFINITIONS[4]
                }
              />
            </div>
          </div>

          {parsed.warnings.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Schedule review:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {parsed.warnings.map(
                  (warning, index) => (
                    <li
                      key={`${warning}-${index}`}
                    >
                      {warning}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <ul className="list-disc space-y-2 pl-5">
              {parsed.notes.map(
                (note, index) => (
                  <li
                    key={`${note}-${index}`}
                  >
                    {note}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          The schedule meaning, field expansion, warnings, and scope notes will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing happens entirely on the expression in your browser. The tool
        does not contact a cron daemon or simulate your server&apos;s clock.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this parsing operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading Cron Correctly Means Reading Sets, Not Reading It Like a Sentence
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Each cron field describes a set of matching values.{" "}
            <code>0,30</code> means two matching minutes.{" "}
            <code>MON-FRI</code> means a weekday range.{" "}
            <code>*/15</code> means values reached by stepping through that
            field&apos;s full range from its first allowed value.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The daemon compares those sets with the current calendar time. The
            expression is not an interval timer counting fifteen minutes from
            whenever you installed it. That difference explains why a step in
            the hour field resets with the field range instead of remembering
            the previous process run.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            10-30/5 Means “Step Through This Range,” Not “Every Five Minutes Forever”
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In the minute field, <code>10-30/5</code> expands to 10, 15, 20, 25
            and 30. The next hour starts the same rule again.{" "}
            <code>*/5</code> is different because its base is the complete
            minute range, so it matches 0, 5, 10 and so on.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This parser intentionally rejects ambiguous single-value step forms
            such as <code>5/10</code> in its portable subset. If a particular
            scheduler documents an extension you rely on, validate it against
            that scheduler rather than assuming all cron implementations agree.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Day of Month and Day of Week Are the Part Most People Misread
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            In common Vixie/Cronie-style behavior, restricting both day fields
            does not turn them into an AND condition. A schedule such as{" "}
            <code>30 4 1,15 * FRI</code> can run on the first and fifteenth of
            the month and on Fridays when the other fields match.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            That expression may be syntactically perfect and still be wrong for
            someone who intended “Friday only when it is the first or
            fifteenth.” The parser flags the combination because this is a
            semantic mistake, not a syntax mistake.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Some Valid Field Values Can Describe an Impossible Calendar Date
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Day 31 is allowed in the day-of-month field and February is allowed
            in the month field. Put them together and there is no date to
            match. A field-by-field syntax checker cannot discover that from
            range validation alone.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            When month and day are simple explicit lists, Yoryantra performs a
            small cross-field check. February 29 remains possible because a
            five-field expression has no year field and leap years exist.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            0 and 7 Both Mean Sunday in This Cron Family
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Traditional crontab accepts Sunday as either 0 or 7. The parser
            treats those as the same semantic weekday when it expands a field,
            while preserving the original expression so you can see which form
            the author actually used.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The Expression Cannot Tell You Which Time Zone the Machine Uses
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>0 9 * * *</code> says 09:00 according to the clock used by
            the scheduler. It does not contain “India,” “UTC,” or any other
            timezone. Cron implementations and surrounding platforms can add
            timezone configuration outside the five fields.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Daylight-saving transitions add another boundary: some local times
            can be skipped and others can occur twice. A parser can explain the
            field selection but cannot truthfully promise exact future run
            instants without knowing the target scheduler, timezone rules, and
            date range.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            A Five-Field Cron Expression Is Not Automatically Portable to Every “Cron” Product
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Quartz adds fields and tokens such as <code>?</code>,{" "}
            <code>L</code>, <code>W</code>, and <code>#</code>. Cronie has
            extensions such as randomized <code>~</code> ranges. Cloud
            schedulers can have their own field counts and weekday rules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The parser keeps a conservative traditional subset so a successful
            result means something narrower and more useful than “some
            cron-like product might accept this string.”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The crontab Manual Is the Right Reference When a Field Rule Is Disputed
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The Linux{" "}
            <a
              href="https://man7.org/linux/man-pages/man5/crontab.5.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              crontab(5) manual
            </a>{" "}
            documents the five field ranges, names, lists, ranges, steps,
            Sunday numbering, day-field behavior, timezone handling, and
            Cronie-specific extensions. It is included here because those rules
            directly define what this parser is interpreting.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/cron-expression-parser" />
        </div>
      </section>
    </ToolShell>
  );
}

function FieldCard({
  label,
  field,
  definition,
}: {
  label: string;
  field: ParsedField;
  definition: FieldDefinition;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 font-mono text-sm font-semibold text-gray-900">
        {field.source}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        {field.description}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-gray-500">
        {shortValues(
          field,
          definition
        )}
      </p>
    </div>
  );
}
