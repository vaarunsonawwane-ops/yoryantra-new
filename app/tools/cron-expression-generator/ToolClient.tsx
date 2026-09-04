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

type FieldConfig = {
  label: string;
  min: number;
  max: number;
  names?: Record<string, number>;
};

type Validation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

const MONTHS: Record<string, number> = {
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

const WEEKDAYS: Record<string, number> = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
};

const FIELD_CONFIG: Record<FieldName, FieldConfig> = {
  minute: { label: "Minute", min: 0, max: 59 },
  hour: { label: "Hour", min: 0, max: 23 },
  dayOfMonth: {
    label: "Day of month",
    min: 1,
    max: 31,
  },
  month: {
    label: "Month",
    min: 1,
    max: 12,
    names: MONTHS,
  },
  dayOfWeek: {
    label: "Day of week",
    min: 0,
    max: 7,
    names: WEEKDAYS,
  },
};

const PRESETS = [
  {
    label: "Every 5 minutes",
    value: "*/5 * * * *",
  },
  {
    label: "Daily at 02:30",
    value: "30 2 * * *",
  },
  {
    label: "Weekdays at 09:00",
    value: "0 9 * * MON-FRI",
  },
  {
    label: "1st day monthly",
    value: "0 0 1 * *",
  },
  {
    label: "Sunday at midnight",
    value: "0 0 * * SUN",
  },
];

function resolveCronValue(
  value: string,
  config: FieldConfig
) {
  if (
    config.names &&
    Object.prototype.hasOwnProperty.call(
      config.names,
      value
    )
  ) {
    return config.names[value];
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const numeric = Number(value);

  if (
    !Number.isInteger(numeric) ||
    numeric < config.min ||
    numeric > config.max
  ) {
    return null;
  }

  return numeric;
}

function validateCronField(
  name: FieldName,
  rawValue: string
) {
  const config = FIELD_CONFIG[name];
  const value = rawValue.trim().toUpperCase();
  const errors: string[] = [];

  if (!value) {
    return [`${config.label} cannot be empty.`];
  }

  if (/[?#]/.test(value)) {
    return [
      `${config.label}: ? and # are Quartz/vendor-style tokens and are outside this traditional five-field crontab subset.`,
    ];
  }

  if (value.indexOf("~") !== -1) {
    return [
      `${config.label}: Cronie random-range syntax using ~ is intentionally outside this portable five-field subset.`,
    ];
  }

  const items = value.split(",");

  if (items.some((item) => !item)) {
    return [
      `${config.label}: an empty list item was found.`,
    ];
  }

  for (const item of items) {
    const stepParts = item.split("/");

    if (stepParts.length > 2) {
      errors.push(
        `${config.label}: invalid step syntax "${item}".`
      );
      continue;
    }

    const base = stepParts[0];

    if (stepParts.length === 2) {
      const stepText = stepParts[1];

      if (
        !/^\d+$/.test(stepText) ||
        Number(stepText) <= 0
      ) {
        errors.push(
          `${config.label}: step "${stepText}" must be a positive integer.`
        );
        continue;
      }

      if (
        base !== "*" &&
        base.indexOf("-") === -1
      ) {
        errors.push(
          `${config.label}: this Linux-crontab baseline applies /step to * or a range, not to a single value such as "${item}".`
        );
        continue;
      }
    }

    if (base === "*") {
      continue;
    }

    const rangeParts = base.split("-");

    if (
      rangeParts.length > 2 ||
      rangeParts.some((part) => !part)
    ) {
      errors.push(
        `${config.label}: invalid range "${base}".`
      );
      continue;
    }

    if (rangeParts.length === 2) {
      const start = resolveCronValue(
        rangeParts[0],
        config
      );
      const end = resolveCronValue(
        rangeParts[1],
        config
      );

      if (start === null || end === null) {
        errors.push(
          `${config.label}: range "${base}" contains an invalid value.`
        );
      } else if (start > end) {
        errors.push(
          `${config.label}: range "${base}" must run from a lower value to a higher value in this baseline.`
        );
      }

      continue;
    }

    if (
      resolveCronValue(base, config) === null
    ) {
      errors.push(
        `${config.label}: "${base}" is outside ${config.min}-${config.max}${
          config.names
            ? " and is not a supported three-letter name"
            : ""
        }.`
      );
    }
  }

  return errors;
}

function explicitValues(
  rawValue: string,
  config: FieldConfig
) {
  const value = rawValue.trim().toUpperCase();

  if (
    !value ||
    value.indexOf("*") !== -1 ||
    value.indexOf("/") !== -1 ||
    value.indexOf("-") !== -1
  ) {
    return null;
  }

  const parts = value.split(",");
  const values: number[] = [];

  for (const part of parts) {
    const resolved = resolveCronValue(part, config);

    if (resolved === null) {
      return null;
    }

    values.push(resolved);
  }

  return values;
}

function impossibleDateWarning(
  dayOfMonth: string,
  month: string
) {
  const days = explicitValues(
    dayOfMonth,
    FIELD_CONFIG.dayOfMonth
  );
  const months = explicitValues(
    month,
    FIELD_CONFIG.month
  );

  if (!days || !months) {
    return "";
  }

  const maxDays: Record<number, number> = {
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

  const possible = days.some((day) =>
    months.some(
      (selectedMonth) =>
        day <= maxDays[selectedMonth]
    )
  );

  return possible
    ? ""
    : `The selected day-of-month value${
        days.length === 1 ? "" : "s"
      } cannot occur in the selected month${
        months.length === 1 ? "" : "s"
      }. The day-of-month side is syntactically valid but can never match those month/date combinations.`;
}

function describeField(
  name: FieldName,
  raw: string
) {
  const value = raw.trim().toUpperCase();
  const label = FIELD_CONFIG[name].label;

  if (value === "*") {
    return `${label}: every allowed value`;
  }

  const step = value.match(/^\*\/(\d+)$/);

  if (step) {
    return `${label}: every ${step[1]} allowed units`;
  }

  if (/^\d+$/.test(value)) {
    return `${label}: ${value}`;
  }

  return `${label}: ${value}`;
}

function validateExpression(
  minute: string,
  hour: string,
  dayOfMonth: string,
  month: string,
  dayOfWeek: string
): Validation {
  const fields: Array<[FieldName, string]> = [
    ["minute", minute],
    ["hour", hour],
    ["dayOfMonth", dayOfMonth],
    ["month", month],
    ["dayOfWeek", dayOfWeek],
  ];
  const errors: string[] = [];

  fields.forEach(([name, value]) => {
    validateCronField(name, value).forEach(
      (error) => errors.push(error)
    );
  });

  const warnings: string[] = [];

  if (errors.length === 0) {
    if (
      dayOfMonth.indexOf("*") === -1 &&
      dayOfWeek.indexOf("*") === -1
    ) {
      warnings.push(
        "Both day-of-month and day-of-week are restricted. In Vixie/Cronie-style crontab semantics, the job runs when either day field matches, not only when both match."
      );
    }

    const impossible = impossibleDateWarning(
      dayOfMonth,
      month
    );

    if (impossible) {
      warnings.push(impossible);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default function ToolClient() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] =
    useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] =
    useState("*");
  const [importText, setImportText] =
    useState("");
  const [importError, setImportError] =
    useState("");
  const [copyError, setCopyError] = useState("");
  const [copied, setCopied] = useState(false);

  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const validation = useMemo(
    () =>
      validateExpression(
        minute,
        hour,
        dayOfMonth,
        month,
        dayOfWeek
      ),
    [
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek,
    ]
  );

  const applyExpression = (value: string) => {
    setCopyError("");
    setCopied(false);
    const parts = value.trim().split(/\s+/);

    if (parts.length !== 5) {
      setImportError(
        "Enter exactly five fields: minute hour day-of-month month day-of-week."
      );
      return;
    }

    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
    setImportText(value.trim());
    setImportError("");
    setCopied(false);
  };

  const copyExpression = async () => {
    if (!validation.valid) return;

    try {
      await navigator.clipboard.writeText(
        expression
      );
      setCopyError("");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopyError(
        "The expression could not be copied. Select it and copy it manually."
      );
      setCopied(false);
    }
  };

  const resetAll = () => {
    setMinute("*");
    setHour("*");
    setDayOfMonth("*");
    setMonth("*");
    setDayOfWeek("*");
    setImportText("");
    setImportError("");
    setCopyError("");
    setCopied(false);
  };

  const fields: Array<{
    name: FieldName;
    value: string;
    setValue: (value: string) => void;
    placeholder: string;
  }> = [
    {
      name: "minute",
      value: minute,
      setValue: setMinute,
      placeholder: "0-59, *, */5",
    },
    {
      name: "hour",
      value: hour,
      setValue: setHour,
      placeholder: "0-23, *, 9-17",
    },
    {
      name: "dayOfMonth",
      value: dayOfMonth,
      setValue: setDayOfMonth,
      placeholder: "1-31, *, 1,15",
    },
    {
      name: "month",
      value: month,
      setValue: setMonth,
      placeholder: "1-12 or JAN-DEC",
    },
    {
      name: "dayOfWeek",
      value: dayOfWeek,
      setValue: setDayOfWeek,
      placeholder: "0-7 or SUN-SAT",
    },
  ];

  return (
    <ToolShell
      title="Cron Expression Generator"
      description="Build and validate five-field cron schedules without mixing in Quartz or vendor-specific syntax."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label
          htmlFor="cron-import"
          className="block text-sm font-semibold text-gray-900"
        >
          Import an existing five-field expression
        </label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Paste all five fields here when you already have a schedule and want
          to inspect or edit it.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            id="cron-import"
            value={importText}
            onChange={(event: { target: { value: string } }) => {
              setImportText(event.target.value);
              setImportError("");
              setCopyError("");
            }}
            placeholder="0 9 * * MON-FRI"
            spellCheck={false}
            className="min-w-0 flex-1 rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-[var(--green)]"
          />
          <button
            type="button"
            onClick={() => applyExpression(importText)}
            className="yoryantra-btn-outline"
          >
            Apply Expression
          </button>
        </div>

        {importError ? (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {importError}
          </p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {fields.map((field) => {
          const config = FIELD_CONFIG[field.name];
          const fieldErrors = validateCronField(
            field.name,
            field.value
          );

          return (
            <div key={field.name}>
              <label
                htmlFor={`cron-${field.name}`}
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {config.label}
              </label>
              <input
                id={`cron-${field.name}`}
                type="text"
                value={field.value}
                onChange={(event: { target: { value: string } }) => {
                  field.setValue(event.target.value);
                  setCopyError("");
                  setCopied(false);
                }}
                placeholder={field.placeholder}
                spellCheck={false}
                className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
              <p
                className={`mt-2 min-h-[20px] text-xs ${
                  fieldErrors.length
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {fieldErrors.length
                  ? fieldErrors[0]
                  : `${config.min}-${config.max}${
                      field.name === "month"
                        ? " or JAN-DEC"
                        : field.name ===
                          "dayOfWeek"
                        ? "; 0 or 7 = Sunday; SUN-SAT"
                        : ""
                    }`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="text-sm font-medium text-gray-700">
          Cron expression
        </div>
        <div className="mt-2 overflow-auto font-mono text-xl font-semibold text-gray-950">
          {expression}
        </div>
        <div
          className={`mt-3 text-sm ${
            validation.valid
              ? "text-green-700"
              : "text-red-700"
          }`}
        >
          {validation.valid
            ? "Valid syntax for this traditional five-field baseline."
            : `${validation.errors.length} field issue${
                validation.errors.length === 1 ? "" : "s"
              } to fix before copying.`}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={copyExpression}
          disabled={!validation.valid}
          className="yoryantra-btn disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy Expression"}
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {copyError ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {copyError}
        </p>
      ) : null}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">
          Start from a familiar schedule
        </h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() =>
                applyExpression(preset.value)
              }
              className="yoryantra-btn-outline text-sm"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {validation.errors.length ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700"
        >
          <strong>Syntax issues:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validation.errors.map(
              (item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      ) : null}

      {validation.warnings.length ? (
        <div
          role="status"
          className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900"
        >
          <strong>Schedule review:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validation.warnings.map(
              (item, index) => (
                <li key={`${item}-${index}`}>
                  {item}
                </li>
              )
            )}
          </ul>
        </div>
      ) : null}

      {validation.valid ? (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <strong>Field interpretation:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{describeField("minute", minute)}</li>
            <li>{describeField("hour", hour)}</li>
            <li>
              {describeField(
                "dayOfMonth",
                dayOfMonth
              )}
            </li>
            <li>{describeField("month", month)}</li>
            <li>
              {describeField(
                "dayOfWeek",
                dayOfWeek
              )}
            </li>
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Editing and validating the five fields happens in browser memory. Nothing
        is submitted to cron, installed in a crontab, or sent to a scheduler.
        Normal site analytics or advertising, when present, are outside that
        schedule operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A Cron Expression Describes Matching Times; It Does Not Run Anything
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The five fields select minute, hour, day of month, month, and day of
            week. The scheduler wakes up, evaluates those fields against the
            current time, and runs the associated command when the schedule
            matches. Only the five schedule fields are handled here; no shell
            command is created, no crontab is installed, and no server is contacted.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That separation matters when a schedule looks right in isolation
            but the real job still fails because of environment variables,
            permissions, working directory, PATH, shell differences, or the
            command itself.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Read 15 9 * * MON-FRI From Left to Right
          </h2>
          <div className="mt-4 overflow-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b text-gray-900">
                  <th className="p-3">Field</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Meaning</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b">
                  <td className="p-3">Minute</td>
                  <td className="p-3 font-mono">15</td>
                  <td className="p-3">At minute 15</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Hour</td>
                  <td className="p-3 font-mono">9</td>
                  <td className="p-3">During the 09:00 hour</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Day of month</td>
                  <td className="p-3 font-mono">*</td>
                  <td className="p-3">Any allowed day of month</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">Month</td>
                  <td className="p-3 font-mono">*</td>
                  <td className="p-3">Every month</td>
                </tr>
                <tr>
                  <td className="p-3">Day of week</td>
                  <td className="p-3 font-mono">MON-FRI</td>
                  <td className="p-3">Monday through Friday</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            Together, that means 09:15 on weekdays in the scheduler&apos;s
            effective timezone.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Lists, Ranges, and Steps Solve Different Scheduling Problems
          </h2>
          <div className="mt-4 space-y-4 leading-relaxed text-gray-600">
            <p>
              A comma creates a list: <code>0,30</code> selects minute 0 and
              minute 30.
            </p>
            <p>
              A hyphen creates an inclusive range: <code>MON-FRI</code> selects
              weekdays.
            </p>
            <p>
              A slash adds a step to an asterisk or range:{" "}
              <code>*/15</code> selects every fifteenth minute, while{" "}
              <code>1-10/2</code> advances through that range by two.
            </p>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cron implementations extend those rules in different directions.
            The accepted syntax stays with the common five-field subset of
            asterisks, lists, ranges, steps, and three-letter names rather than
            treating every Cronie, Quartz, or vendor extension as portable.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            The Two Day Fields Are the Classic Cron Surprise
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            In common Vixie/Cronie semantics, if both day-of-month and
            day-of-week are restricted, a run can be selected when either field
            matches. For example, a schedule containing day-of-month 1 and
            Monday should not automatically be read as “only when the first day
            of the month is a Monday.”
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            That combination is flagged because it is valid syntax but often
            describes a different schedule from what the author had in mind.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Syntax Can Be Valid and Still Describe a Time That Never Exists
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Cron field validation normally checks ranges independently. That
            means day 31 and February are individually valid field values even
            though February never has a 31st day. When both the month and
            day-of-month are simple explicit lists, a cross-field check warns
            about combinations that can never occur.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            It deliberately treats February 29 as possible because a five-field
            cron schedule has no year field and leap years do occur.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Five Time Fields Are Only Part of a Real Crontab Entry
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A user crontab normally puts the command after the five schedule
            fields. System crontabs such as <code>/etc/crontab</code> and files in
            <code>/etc/cron.d</code> commonly add a username before the command.
            Environment assignments such as <code>PATH</code>, <code>SHELL</code>,
            and <code>CRON_TZ</code> can also change how a job behaves.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Nicknames such as <code>@daily</code> and <code>@reboot</code>, command
            text, usernames, and environment lines are intentionally outside the
            five-field editor. A valid schedule can still fail at runtime because
            the command, permissions, environment, working directory, or target
            scheduler is wrong.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            “Every Day at 02:30” Depends on Timezone and Daylight Saving
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The expression <code>30 2 * * *</code> does not contain a timezone.
            The cron daemon, crontab environment, container, platform, or
            scheduler determines which clock the fields are matched against.
            During daylight-saving transitions, a local wall-clock time can be
            skipped or occur twice depending on the timezone and scheduler.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For jobs where “exactly once every 24 hours” matters more than “at
            this local clock time,” review the scheduler&apos;s timezone and DST
            semantics instead of relying on the expression alone.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Cron, Quartz, Kubernetes, GitHub Actions, and EventBridge Are Not One Language
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Quartz commonly uses additional fields and tokens such as{" "}
            <code>?</code>, <code>L</code>, <code>W</code>, and <code>#</code>.
            Cloud schedulers can change day-of-week numbering or field count.
            Kubernetes CronJobs use cron syntax through the controller and add
            workload-specific behavior such as concurrency policy and missed
            schedules.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A five-field Unix expression should not be assumed portable across
            those dialects. If the destination is not a traditional Unix-style
            crontab, validate the copied expression against that product&apos;s own
            documentation.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          The Linux <a
            href="https://man7.org/linux/man-pages/man5/crontab.5.html"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            crontab(5) manual
          </a>{" "}
          documents the five field ranges, names, lists, ranges, steps,
          timezone behavior, and the day-of-month/day-of-week matching rule used
          here. The current Cronie manual also documents extensions such as
          randomized <code>~</code> ranges that are deliberately outside this
          narrower five-field syntax.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/cron-expression-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
