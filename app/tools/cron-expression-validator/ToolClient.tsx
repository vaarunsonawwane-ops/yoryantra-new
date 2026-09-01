"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type IssueLevel =
  | "Error"
  | "Warning"
  | "Note";

type CronIssue = {
  level: IssueLevel;
  message: string;
};

type FieldDefinition = {
  name: string;
  shortName: string;
  min: number;
  max: number;
  aliases: Record<
    string,
    number
  >;
};

type FieldResult = {
  name: string;
  shortName: string;
  source: string;
  valid: boolean;
  restricted: boolean;
  values: number[];
  displayValues: string[];
  meaning: string;
  errors: string[];
};

type CronReport = {
  valid: boolean;
  expression: string;
  fields: FieldResult[];
  issues: CronIssue[];
  frequencyLabel: string;
  dialect: string;
};

const SAMPLE_CRON =
  "*/15 9-17 * * MON-FRI";

const FIELD_DEFINITIONS: FieldDefinition[] =
  [
    {
      name: "Minute",
      shortName: "minute",
      min: 0,
      max: 59,
      aliases: {},
    },
    {
      name: "Hour",
      shortName: "hour",
      min: 0,
      max: 23,
      aliases: {},
    },
    {
      name:
        "Day of month",
      shortName:
        "day-of-month",
      min: 1,
      max: 31,
      aliases: {},
    },
    {
      name: "Month",
      shortName: "month",
      min: 1,
      max: 12,
      aliases: {
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
      },
    },
    {
      name:
        "Day of week",
      shortName:
        "day-of-week",
      min: 0,
      max: 7,
      aliases: {
        SUN: 0,
        MON: 1,
        TUE: 2,
        WED: 3,
        THU: 4,
        FRI: 5,
        SAT: 6,
      },
    },
  ];

const PRESETS = [
  {
    label:
      "Every 15 min, weekdays",
    value:
      "*/15 9-17 * * MON-FRI",
  },
  {
    label:
      "Daily at midnight",
    value: "0 0 * * *",
  },
  {
    label:
      "Sunday 02:30",
    value: "30 2 * * SUN",
  },
  {
    label:
      "First day monthly",
    value: "0 8 1 * *",
  },
  {
    label:
      "DOM + DOW restricted",
    value: "0 9 15 * MON",
  },
];

function uniqueNumbers(
  values: number[]
) {
  const result: number[] =
    [];

  values.forEach(
    (value) => {
      if (
        result.indexOf(
          value
        ) === -1
      ) {
        result.push(value);
      }
    }
  );

  return result.sort(
    (a, b) => a - b
  );
}

function parseCronValue(
  value: string,
  definition: FieldDefinition
) {
  const upper =
    value.toUpperCase();

  if (
    Object.prototype.hasOwnProperty.call(
      definition.aliases,
      upper
    )
  ) {
    return definition
      .aliases[upper];
  }

  if (
    !/^\d+$/.test(value)
  ) {
    return null;
  }

  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(
      parsed
    )
  ) {
    return null;
  }

  return parsed;
}

function normalizedValue(
  value: number,
  definition: FieldDefinition
) {
  if (
    definition.shortName ===
      "day-of-week" &&
    value === 7
  ) {
    return 0;
  }

  return value;
}

function addRange(
  output: number[],
  start: number,
  end: number,
  step: number,
  definition: FieldDefinition
) {
  for (
    let value = start;
    value <= end;
    value += step
  ) {
    output.push(
      normalizedValue(
        value,
        definition
      )
    );
  }
}

function parseFieldPart(
  part: string,
  definition: FieldDefinition
) {
  const errors: string[] =
    [];
  const values: number[] =
    [];
  const slashParts =
    part.split("/");

  if (
    slashParts.length > 2
  ) {
    return {
      values,
      errors: [
        `Too many "/" separators in "${part}".`,
      ],
    };
  }

  const base =
    slashParts[0];
  let step = 1;

  if (
    slashParts.length === 2
  ) {
    const stepText =
      slashParts[1];

    if (
      !/^\d+$/.test(
        stepText
      )
    ) {
      errors.push(
        `Step "${stepText}" in "${part}" must be a positive integer.`
      );
      return {
        values,
        errors,
      };
    }

    step =
      Number(stepText);

    if (
      !Number.isSafeInteger(
        step
      ) ||
      step <= 0
    ) {
      errors.push(
        `Step in "${part}" must be greater than zero.`
      );
      return {
        values,
        errors,
      };
    }

    if (
      base !== "*" &&
      base.indexOf("-") ===
        -1
    ) {
      errors.push(
        `Single-value step "${part}" is outside this portable five-field subset. Use */${step} or a range such as ${definition.min}-${definition.max}/${step}.`
      );
      return {
        values,
        errors,
      };
    }
  }

  if (base === "*") {
    addRange(
      values,
      definition.min,
      definition.max,
      step,
      definition
    );

    return {
      values,
      errors,
    };
  }

  if (
    base.indexOf("-") !==
    -1
  ) {
    const rangeParts =
      base.split("-");

    if (
      rangeParts.length !==
        2 ||
      !rangeParts[0] ||
      !rangeParts[1]
    ) {
      errors.push(
        `Range "${base}" is malformed.`
      );
      return {
        values,
        errors,
      };
    }

    const start =
      parseCronValue(
        rangeParts[0],
        definition
      );
    const end =
      parseCronValue(
        rangeParts[1],
        definition
      );

    if (
      start === null ||
      end === null
    ) {
      errors.push(
        `Range "${base}" contains a value that is not valid for ${definition.name.toLowerCase()}.`
      );
      return {
        values,
        errors,
      };
    }

    if (
      start <
        definition.min ||
      start >
        definition.max ||
      end <
        definition.min ||
      end >
        definition.max
    ) {
      errors.push(
        `Range "${base}" must stay between ${definition.min} and ${definition.max}.`
      );
      return {
        values,
        errors,
      };
    }

    if (start > end) {
      errors.push(
        `Range "${base}" runs backward. This portable subset does not treat ranges as wrapping across the field boundary.`
      );
      return {
        values,
        errors,
      };
    }

    addRange(
      values,
      start,
      end,
      step,
      definition
    );

    return {
      values,
      errors,
    };
  }

  const parsed =
    parseCronValue(
      base,
      definition
    );

  if (parsed === null) {
    errors.push(
      `"${base}" is not a valid ${definition.name.toLowerCase()} value or supported three-letter alias.`
    );
    return {
      values,
      errors,
    };
  }

  if (
    parsed <
      definition.min ||
    parsed >
      definition.max
  ) {
    errors.push(
      `${definition.name} value ${base} is outside ${definition.min}-${definition.max}.`
    );
    return {
      values,
      errors,
    };
  }

  values.push(
    normalizedValue(
      parsed,
      definition
    )
  );

  return {
    values,
    errors,
  };
}

function displayCronValue(
  value: number,
  definition: FieldDefinition
) {
  if (
    definition.shortName ===
    "month"
  ) {
    const names = [
      "",
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    return `${value} (${names[value]})`;
  }

  if (
    definition.shortName ===
    "day-of-week"
  ) {
    const names = [
      "SUN",
      "MON",
      "TUE",
      "WED",
      "THU",
      "FRI",
      "SAT",
    ];

    return `${value} (${names[value]})`;
  }

  return String(value);
}

function fieldMeaning(
  source: string,
  values: number[],
  definition: FieldDefinition
) {
  if (source === "*") {
    return `Every allowed ${definition.name.toLowerCase()} value.`;
  }

  if (
    source.indexOf("*/") ===
    0
  ) {
    return `Stepped wildcard: ${values.length} ${definition.name.toLowerCase()} value${
      values.length === 1
        ? ""
        : "s"
    } selected.`;
  }

  if (
    source.indexOf(",") !==
    -1
  ) {
    return `List selection: ${values.length} distinct ${definition.name.toLowerCase()} value${
      values.length === 1
        ? ""
        : "s"
    }.`;
  }

  if (
    source.indexOf("-") !==
    -1
  ) {
    return `Range selection: ${values.length} ${definition.name.toLowerCase()} value${
      values.length === 1
        ? ""
        : "s"
    }.`;
  }

  return `One ${definition.name.toLowerCase()} value is selected.`;
}

function validateField(
  source: string,
  definition: FieldDefinition
): FieldResult {
  const errors: string[] =
    [];
  let values: number[] = [];

  if (!source) {
    errors.push(
      `${definition.name} field is empty.`
    );
  } else {
    const parts =
      source.split(",");

    parts.forEach(
      (part) => {
        const trimmed =
          part.trim();

        if (!trimmed) {
          errors.push(
            `${definition.name} contains an empty list item.`
          );
          return;
        }

        const result =
          parseFieldPart(
            trimmed,
            definition
          );

        result.errors.forEach(
          (error) =>
            errors.push(error)
        );
        values =
          values.concat(
            result.values
          );
      }
    );
  }

  values =
    uniqueNumbers(values);

  return {
    name:
      definition.name,
    shortName:
      definition.shortName,
    source,
    valid:
      errors.length === 0,
    restricted:
      source !== "*",
    values,
    displayValues:
      values.map(
        (value) =>
          displayCronValue(
            value,
            definition
          )
      ),
    meaning:
      errors.length
        ? "Invalid field"
        : fieldMeaning(
            source,
            values,
            definition
          ),
    errors,
  };
}

function daysInMonth(
  month: number
) {
  if (month === 2) {
    return 29;
  }

  if (
    [
      4,
      6,
      9,
      11,
    ].indexOf(month) !==
    -1
  ) {
    return 30;
  }

  return 31;
}

function summarizeFrequency(
  fields: FieldResult[]
) {
  if (
    fields.length !== 5 ||
    fields.some(
      (field) =>
        !field.valid
    )
  ) {
    return "Unavailable";
  }

  const minute =
    fields[0];
  const hour =
    fields[1];
  const dom =
    fields[2];
  const month =
    fields[3];
  const dow =
    fields[4];

  if (
    minute.values.length ===
      60 &&
    hour.values.length ===
      24 &&
    !dom.restricted &&
    !month.restricted &&
    !dow.restricted
  ) {
    return "Every minute";
  }

  if (
    minute.values.length ===
      1 &&
    hour.values.length ===
      24 &&
    !dom.restricted &&
    !month.restricted &&
    !dow.restricted
  ) {
    return `Hourly at minute ${minute.values[0]}`;
  }

  if (
    minute.values.length ===
      1 &&
    hour.values.length ===
      1 &&
    !dom.restricted &&
    !month.restricted &&
    !dow.restricted
  ) {
    return `Daily at ${String(
      hour.values[0]
    ).padStart(
      2,
      "0"
    )}:${String(
      minute.values[0]
    ).padStart(
      2,
      "0"
    )}`;
  }

  return "See field selections and scheduler semantics";
}

function inspectImpossibleDates(
  fields: FieldResult[],
  issues: CronIssue[]
) {
  const dom =
    fields[2];
  const month =
    fields[3];
  const dow =
    fields[4];

  if (
    !dom.valid ||
    !month.valid ||
    !dom.restricted ||
    !month.restricted
  ) {
    return;
  }

  const impossibleDays =
    dom.values.filter(
      (day) =>
        month.values.every(
          (monthValue) =>
            day >
            daysInMonth(
              monthValue
            )
        )
    );

  if (
    impossibleDays.length
  ) {
    issues.push({
      level: "Warning",
      message:
        `Day-of-month value${
          impossibleDays.length ===
          1
            ? ""
            : "s"
        } ${impossibleDays.join(
          ", "
        )} cannot occur in any selected month. ${
          dow.restricted
            ? "Traditional cron may still run on matching day-of-week values because its two day fields use OR-like matching when both are restricted."
            : "With an unrestricted day-of-week field, those day/month combinations will never match."
        }`,
    });
  }
}

function validateCronExpression(
  rawExpression: string
): CronReport {
  const expression =
    rawExpression.trim();
  const issues: CronIssue[] =
    [];

  if (!expression) {
    throw new Error(
      "Enter a cron expression to validate."
    );
  }

  if (
    expression.charAt(0) ===
    "@"
  ) {
    return {
      valid: false,
      expression,
      fields: [],
      issues: [
        {
          level: "Error",
          message:
            "Cron macros such as @daily, @hourly, @reboot, and @weekly are outside this five-field validator. Macro support is scheduler-specific.",
        },
      ],
      frequencyLabel:
        "Unavailable",
      dialect:
        "Portable five-field subset",
    };
  }

  if (
    /[?#~]/.test(
      expression
    ) ||
    /\bL\b/i.test(
      expression
    ) ||
    /\bLW\b/i.test(
      expression
    ) ||
    /\d+[LW]\b/i.test(
      expression
    )
  ) {
    issues.push({
      level: "Error",
      message:
        "The expression contains a Quartz/vendor/Cronie-only token such as ?, L, W, #, or ~. Those extensions are outside this portable five-field subset.",
    });
  }

  const parts =
    expression
      .split(/\s+/)
      .filter(Boolean);

  if (parts.length !== 5) {
    issues.push({
      level: "Error",
      message:
        `Expected exactly 5 fields (minute hour day-of-month month day-of-week), but found ${parts.length}. Six/seven-field formats usually add seconds/year and belong to other cron dialects.`,
    });

    return {
      valid: false,
      expression,
      fields: [],
      issues,
      frequencyLabel:
        "Unavailable",
      dialect:
        "Portable five-field subset",
    };
  }

  const fields =
    parts.map(
      (part, index) =>
        validateField(
          part,
          FIELD_DEFINITIONS[
            index
          ]
        )
    );

  fields.forEach(
    (field) => {
      field.errors.forEach(
        (message) =>
          issues.push({
            level:
              "Error",
            message:
              `${field.name}: ${message}`,
          })
      );
    }
  );

  if (
    issues.some(
      (item) =>
        item.level ===
        "Error"
    )
  ) {
    return {
      valid: false,
      expression,
      fields,
      issues,
      frequencyLabel:
        "Unavailable",
      dialect:
        "Portable five-field subset",
    };
  }

  const minute =
    fields[0];
  const hour =
    fields[1];
  const dom =
    fields[2];
  const month =
    fields[3];
  const dow =
    fields[4];

  if (
    minute.values.length ===
      60 &&
    hour.values.length ===
      24
  ) {
    issues.push({
      level: "Warning",
      message:
        "Minute and hour both cover their full ranges. On every matching calendar day this job can run once per minute; confirm the command is safe, idempotent enough, and cannot overlap unexpectedly.",
    });
  }

  const domOrRestricted =
    dom.source.charAt(0) !==
    "*";
  const dowOrRestricted =
    dow.source.charAt(0) !==
    "*";

  if (
    domOrRestricted &&
    dowOrRestricted
  ) {
    issues.push({
      level: "Warning",
      message:
        "Both day-of-month and day-of-week are restricted. Traditional Vixie/Cronie-style cron treats these day conditions as OR-like: a matching day-of-month OR matching day-of-week can trigger the job. Other schedulers can differ, so verify the target platform.",
    });
  }

  if (
    month.restricted &&
    !dom.restricted &&
    !dow.restricted
  ) {
    issues.push({
      level: "Note",
      message:
        "Only the month calendar field is restricted. The job can run on every day of each selected month at the selected hour/minute values.",
    });
  }

  inspectImpossibleDates(
    fields,
    issues
  );

  if (
    parts[4].indexOf("7") !==
      -1
  ) {
    issues.push({
      level: "Note",
      message:
        "Day-of-week 7 is normalized to Sunday (0) by this traditional-cron subset. Some scheduler dialects document a narrower day-of-week range, so check the target system.",
    });
  }

  issues.push({
    level: "Note",
    message:
      "Cron schedules are evaluated in a timezone chosen by the scheduler/service. DST transitions can create missing local times or repeated local times; syntax validation cannot predict that behavior without the exact scheduler timezone and implementation.",
  });

  return {
    valid: true,
    expression,
    fields,
    issues,
    frequencyLabel:
      summarizeFrequency(
        fields
      ),
    dialect:
      "Portable Unix-style 5-field subset",
  };
}

function formatCronReport(
  report: CronReport
) {
  const errorCount =
    report.issues.filter(
      (item) =>
        item.level ===
        "Error"
    ).length;
  const warningCount =
    report.issues.filter(
      (item) =>
        item.level ===
        "Warning"
    ).length;
  const noteCount =
    report.issues.filter(
      (item) =>
        item.level ===
        "Note"
    ).length;
  const lines = [
    "Cron expression validation",
    `Expression: ${report.expression}`,
    `Status: ${
      report.valid
        ? "Accepted by this portable subset"
        : "Invalid for this portable subset"
    }`,
    `Dialect: ${report.dialect}`,
    `Frequency summary: ${report.frequencyLabel}`,
    `Errors: ${errorCount}`,
    `Warnings: ${warningCount}`,
    `Notes: ${noteCount}`,
  ];

  if (
    report.fields.length
  ) {
    lines.push(
      "",
      "Fields:"
    );

    report.fields.forEach(
      (field, index) => {
        lines.push(
          `${index + 1}. ${field.name}: ${field.source}`,
          `   Status: ${
            field.valid
              ? "Valid"
              : "Invalid"
          }`,
          `   Meaning: ${field.meaning}`
        );

        if (
          field.values.length
        ) {
          const preview =
            field.displayValues
              .slice(0, 20)
              .join(", ");

          lines.push(
            `   Selected values: ${preview}${
              field
                .displayValues
                .length > 20
                ? ` … (${field.displayValues.length} total)`
                : ""
            }`
          );
        }
      }
    );
  }

  lines.push(
    "",
    "Review:"
  );

  if (
    report.issues.length
  ) {
    report.issues.forEach(
      (item, index) => {
        lines.push(
          `${index + 1}. ${item.level}: ${item.message}`
        );
      }
    );
  } else {
    lines.push(
      "No additional issue from this validator."
    );
  }

  lines.push(
    "",
    "Boundary: validate the expression again in the exact scheduler that will execute it, especially when seconds, year fields, macros, ?, L, W, #, randomization, timezone settings, or cloud/vendor extensions are involved."
  );

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] =
    useState(SAMPLE_CRON);
  const [report, setReport] =
    useState<CronReport | null>(
      null
    );
  const [error, setError] =
    useState("");
  const [copied, setCopied] =
    useState(false);

  const clearResult = () => {
    setReport(null);
    setError("");
    setCopied(false);
  };

  const validate = () => {
    try {
      setReport(
        validateCronExpression(
          input
        )
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setReport(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to validate this cron expression."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_CRON);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  const copyReport = async () => {
    if (!report) return;

    try {
      await navigator.clipboard.writeText(
        formatCronReport(
          report
        )
      );
      setCopied(true);
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The cron report could not be copied. Select and copy it manually."
      );
    }
  };

  const errorCount =
    report
      ? report.issues.filter(
          (item) =>
            item.level ===
            "Error"
        ).length
      : 0;
  const warningCount =
    report
      ? report.issues.filter(
          (item) =>
            item.level ===
            "Warning"
        ).length
      : 0;

  return (
    <ToolShell
      title="Cron Expression Validator"
      description="Validate a deliberate five-field Unix-style cron subset and inspect each field's selected values, day-field interaction, impossible calendar combinations, high-frequency schedules, and scheduler boundaries instead of treating every cron dialect as interchangeable."
    >
      <div>
        <label className="block text-sm font-semibold text-gray-900">
          Five-field cron expression
        </label>
        <input
          value={input}
          onChange={(event: {
            target: {
              value: string;
            };
          }) => {
            setInput(
              event.target.value
            );
            clearResult();
          }}
          placeholder={SAMPLE_CRON}
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Field order: <code>minute hour day-of-month month day-of-week</code>.
          Supported here: <code>*</code>, lists, forward ranges, steps on a
          wildcard/range, month aliases JAN–DEC, and weekday aliases SUN–SAT.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {PRESETS.map(
          (preset) => (
            <button
              key={
                preset.value
              }
              type="button"
              onClick={() => {
                setInput(
                  preset.value
                );
                clearResult();
              }}
              className="yoryantra-btn-outline"
            >
              {preset.label}
            </button>
          )
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={validate}
          className="yoryantra-btn"
        >
          Validate Cron
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {report ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              label="Status"
              value={
                report.valid
                  ? "Accepted"
                  : "Invalid"
              }
            />
            <Stat
              label="Errors"
              value={String(
                errorCount
              )}
            />
            <Stat
              label="Warnings"
              value={String(
                warningCount
              )}
            />
            <Stat
              label="Schedule shape"
              value={
                report.frequencyLabel
              }
            />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Field interpretation
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Selected values are expanded by this validator&apos;s portable
                  subset so range/list/step mistakes are visible.
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

            {report.fields.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {report.fields.map(
                  (field) => (
                    <div
                      key={
                        field.shortName
                      }
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {field.name}
                        </span>
                        <code className="rounded bg-white px-2 py-1 text-xs text-gray-700">
                          {field.source}
                        </code>
                        <span
                          className={`text-xs font-semibold ${
                            field.valid
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {field.valid
                            ? "valid"
                            : "invalid"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {field.meaning}
                      </p>

                      {field.displayValues
                        .length ? (
                        <p className="mt-3 break-words text-xs leading-relaxed text-gray-500">
                          {field.displayValues
                            .slice(
                              0,
                              24
                            )
                            .join(
                              ", "
                            )}
                          {field
                            .displayValues
                            .length > 24
                            ? ` … (${field.displayValues.length} total)`
                            : ""}
                        </p>
                      ) : null}

                      {field.errors.length ? (
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs leading-relaxed text-red-700">
                          {field.errors.map(
                            (
                              fieldError,
                              index
                            ) => (
                              <li
                                key={`${fieldError}-${index}`}
                              >
                                {fieldError}
                              </li>
                            )
                          )}
                        </ul>
                      ) : null}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-600">
                Five fields could not be parsed.
              </p>
            )}
          </div>

          {report.issues.length ? (
            <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
              <strong>
                Schedule review:
              </strong>
              <ul className="mt-2 list-disc space-y-2 pl-5">
                {report.issues.map(
                  (item, index) => (
                    <li
                      key={`${item.message}-${index}`}
                    >
                      <strong>
                        {item.level}:
                      </strong>{" "}
                      {item.message}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <strong>
              Dialect tested:
            </strong>{" "}
            {report.dialect}. This is intentionally narrower than “anything
            called cron.”
          </div>
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[280px] overflow-auto whitespace-pre-wrap break-words text-sm">
          Field validation, selected-value expansion, day-field interaction and
          scheduler-boundary notes will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Cron parsing runs on the expression in your browser. This tool does not
        schedule a task, read a system crontab, or know the production
        scheduler&apos;s timezone, DST policy, environment variables, command,
        locking or missed-run behavior. Site-wide analytics or advertising
        scripts, if enabled, are separate from validation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Syntactically Valid Cron Expression Can Still Schedule the Wrong Work
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cron validation starts with field grammar, but production failures
            often happen one layer later. A schedule can be syntactically
            accepted and still run sixty times more often than intended, use the
            scheduler&apos;s unexpected timezone, collide with a previous run, or
            depend on a day-of-month/day-of-week rule the author remembered
            incorrectly.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That is why this page expands the selected field values and reports
            schedule semantics instead of stopping at “five fields found.”
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Day-of-Month and Day-of-Week Are the Cron Trap Worth Memorizing
          </h2>
          <pre className="mt-4 overflow-auto rounded-xl bg-white p-4 text-sm leading-7 text-gray-800">{`0 9 15 * MON`}</pre>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            In traditional Vixie/Cronie-style cron, when both day fields are
            restricted, the job is generally triggered when the day of month
            matches <em>or</em> the day of week matches. The expression above is
            therefore not naturally read as “only when the 15th is Monday.”
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Other schedulers can define their own grammar or day semantics.
            Whenever both fields are restricted, verify the exact scheduler
            rather than translating the English requirement by intuition.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            “Cron” Is a Family of Dialects, Not One Universal Grammar
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Traditional system cron commonly uses five time/date fields.
            Quartz-style expressions add fields and operators such as{" "}
            <code>?</code>, <code>L</code>, <code>W</code> and <code>#</code>.
            Some cloud schedulers add a year field. Cronie has extensions such
            as random ranges. Kubernetes and CI platforms document their own
            accepted syntax and timezone behavior.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A validator that accepts every symbol used by any of those systems
            is not “more compatible”; it can accidentally approve an expression
            that your real scheduler rejects. Yoryantra therefore validates a
            deliberately portable five-field subset and rejects vendor-specific
            tokens rather than guessing.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Steps Have a Base—They Are Not Just “Every N” Attached Anywhere
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>*/15</code> means step through the full minute field by 15.
            <code>0-45/15</code> steps through an explicit range. A form such as{" "}
            <code>5/15</code> is interpreted differently or rejected across cron
            implementations and is outside this portable subset.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            If you mean minute 5, write <code>5</code>. If you mean every 15
            minutes, write <code>*/15</code>. If you mean a bounded stepped
            range, write the range explicitly.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Calendar Syntax Can Describe Dates That Never Exist
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Numeric range validation alone says that day 31 is legal and
            February is legal. The pair <code>31 2</code> still has no calendar
            date. This validator checks restricted day-of-month values against
            selected months and warns when a selected day cannot occur.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            February 29 is kept possible because leap years exist. The validator
            does not invent a specific future year just to mark a legal leap-day
            schedule as broken.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            DST Can Create a Missing Run or a Repeated Local Time
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A local clock can jump forward over a scheduled time when daylight
            saving begins, or repeat a local time when daylight saving ends.
            Different cron implementations document how jobs inside those gaps
            and repeated ranges are handled.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If “run exactly once every elapsed 24 hours” is the real
            requirement, a local-time cron schedule may be the wrong abstraction.
            If “run at 02:30 local business time” is the requirement, document
            the DST expectation explicitly.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            The Command Environment Is Separate From the Schedule
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A correct schedule does not guarantee a successful job. Traditional
            cron runs commands with a smaller environment than an interactive
            shell, and production jobs can depend on PATH, HOME, credentials,
            working directory, shell choice, file permissions and service
            accounts.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Use absolute paths where appropriate, capture useful logs, test the
            command under the same account/environment, and consider locking or
            idempotency when a previous execution can overlap the next one.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            High Frequency Is an Operational Property, Not a Syntax Error
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>* * * * *</code> is a perfectly recognizable five-field cron
            expression. It also asks for a run every matching minute. That may
            be correct for a tiny health check and disastrous for a backup,
            billing task, email sender or long-running batch job.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra reports that frequency as a warning instead of declaring
            the expression invalid. Syntax validators should not silently turn
            operational judgment into grammar.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          For traditional Linux-style cron semantics,{" "}
          <a
            href="https://man7.org/linux/man-pages/man5/crontab.5.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            crontab(5)
          </a>{" "}
          is useful for field ranges, names, step values, day matching and DST
          behavior. For a managed scheduler such as{" "}
          <a
            href="https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            Kubernetes CronJob
          </a>
          , its own documentation remains the final authority.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/cron-expression-validator" />
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}
