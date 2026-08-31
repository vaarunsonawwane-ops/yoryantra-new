"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type FieldName = "minute" | "hour" | "dayOfMonth" | "month" | "dayOfWeek";

type FieldConfig = {
  label: string;
  min: number;
  max: number;
  names?: Record<string, number>;
};

const MONTHS: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const WEEKDAYS: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

const FIELD_CONFIG: Record<FieldName, FieldConfig> = {
  minute: { label: "Minute", min: 0, max: 59 },
  hour: { label: "Hour", min: 0, max: 23 },
  dayOfMonth: { label: "Day of month", min: 1, max: 31 },
  month: { label: "Month", min: 1, max: 12, names: MONTHS },
  dayOfWeek: { label: "Day of week", min: 0, max: 7, names: WEEKDAYS },
};

const presets = [
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Daily at 02:30", value: "30 2 * * *" },
  { label: "Weekdays at 09:00", value: "0 9 * * MON-FRI" },
  { label: "1st day monthly", value: "0 0 1 * *" },
];

export default function ToolClient() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [copied, setCopied] = useState(false);

  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const validation = useMemo(() => {
    const fields: Array<[FieldName, string]> = [
      ["minute", minute],
      ["hour", hour],
      ["dayOfMonth", dayOfMonth],
      ["month", month],
      ["dayOfWeek", dayOfWeek],
    ];
    const errors = fields.flatMap(([name, value]) => validateCronField(name, value));
    return { valid: errors.length === 0, errors };
  }, [minute, hour, dayOfMonth, month, dayOfWeek]);

  const applyExpression = (value: string) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length !== 5) return;
    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
    setCopied(false);
  };

  const copyExpression = async () => {
    if (!validation.valid) return;
    await navigator.clipboard.writeText(expression);
    setCopied(true);
  };

  const resetAll = () => {
    applyExpression("* * * * *");
  };

  const fields: Array<{ name: FieldName; value: string; setValue: (value: string) => void; placeholder: string }> = [
    { name: "minute", value: minute, setValue: setMinute, placeholder: "0-59, *, */5" },
    { name: "hour", value: hour, setValue: setHour, placeholder: "0-23, *, 9-17" },
    { name: "dayOfMonth", value: dayOfMonth, setValue: setDayOfMonth, placeholder: "1-31, *, 1,15" },
    { name: "month", value: month, setValue: setMonth, placeholder: "1-12 or JAN-DEC" },
    { name: "dayOfWeek", value: dayOfWeek, setValue: setDayOfWeek, placeholder: "0-7 or SUN-SAT" },
  ];

  return (
    <ToolShell
      title="Cron Expression Generator"
      description="Build traditional five-field Unix cron expressions with validation for values, lists, ranges, steps, month names, and weekday names."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => {
          const config = FIELD_CONFIG[field.name];
          const fieldErrors = validateCronField(field.name, field.value);
          return (
            <div key={field.name}>
              <label className="block mb-2 text-sm font-medium text-gray-700">{config.label}</label>
              <input
                type="text"
                value={field.value}
                onChange={(event) => {
                  field.setValue(event.target.value);
                  setCopied(false);
                }}
                placeholder={field.placeholder}
                className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
              />
              <p className={`mt-2 min-h-[20px] text-xs ${fieldErrors.length ? "text-red-600" : "text-gray-500"}`}>
                {fieldErrors[0] ?? `${config.min}-${config.max}${field.name === "month" ? " or JAN-DEC" : field.name === "dayOfWeek" ? "; 0 or 7 = Sunday; SUN-SAT accepted" : ""}`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="text-sm font-medium text-gray-700">Cron expression</div>
        <div className="mt-2 overflow-auto font-mono text-xl font-semibold text-gray-950">{expression}</div>
        <div className={`mt-3 text-sm ${validation.valid ? "text-green-700" : "text-red-700"}`}>
          {validation.valid ? "Valid traditional five-field cron syntax." : `${validation.errors.length} field issue${validation.errors.length === 1 ? "" : "s"} to fix before copying.`}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={copyExpression} disabled={!validation.valid} className="yoryantra-btn disabled:cursor-not-allowed disabled:opacity-50">
          {copied ? "Copied" : "Copy Expression"}
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Common presets</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {presets.map((preset) => (
            <button key={preset.value} type="button" onClick={() => applyExpression(preset.value)} className="yoryantra-btn-outline text-sm">
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {validation.errors.length ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          <ul className="list-disc space-y-1 pl-5">
            {validation.errors.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ul>
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">The five fields this generator targets</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Traditional Unix-style crontab schedules use minute, hour, day of month, month, and day of week. This generator accepts asterisks, numeric values, comma-separated lists, inclusive ranges, and step values such as <code>*/15</code> or <code>1-10/2</code>. Month and weekday names use their three-letter forms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Day-of-month and day-of-week have special matching behavior</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            In common cron implementations, when both day fields are restricted rather than <code>*</code>, a job can run when either field matches. That surprises people who read the two fields as a simple logical AND. Verify this behavior against the scheduler you actually deploy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What this generator intentionally does not mix in</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Quartz, AWS EventBridge, Kubernetes CronJob, GitHub Actions, systemd timers, and vendor schedulers can add fields or impose their own rules. Tokens such as <code>?</code>, <code>L</code>, <code>W</code>, and <code>#</code> are not accepted here because they are not part of the basic five-field crontab syntax this page targets.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <strong>Timezone note:</strong> a syntactically valid cron expression does not by itself define a timezone. The scheduler&apos;s environment and daylight-saving behavior determine actual wall-clock execution.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            The Linux <a className="underline" href="https://man7.org/linux/man-pages/man5/crontab.5.html" target="_blank" rel="noreferrer">crontab(5) manual</a> documents the field ranges, lists, ranges, steps, names, and day-field matching behavior used as this tool&apos;s baseline.
          </p>
        </div>

        <YoryantraRelatedTools currentHref="/tools/cron-expression-generator" />
      </section>
    </ToolShell>
  );
}

function validateCronField(name: FieldName, rawValue: string) {
  const config = FIELD_CONFIG[name];
  const value = rawValue.trim().toUpperCase();
  const errors: string[] = [];

  if (!value) return [`${config.label} cannot be empty.`];
  if (/[?#]/.test(value)) return [`${config.label}: Quartz/vendor-specific tokens such as ? and # are not supported.`];

  const items = value.split(",");
  if (items.some((item) => !item)) return [`${config.label}: empty list item found.`];

  for (const item of items) {
    const stepParts = item.split("/");
    if (stepParts.length > 2) {
      errors.push(`${config.label}: invalid step syntax '${item}'.`);
      continue;
    }

    const base = stepParts[0];
    if (stepParts.length === 2) {
      if (!/^\d+$/.test(stepParts[1]) || Number(stepParts[1]) <= 0) {
        errors.push(`${config.label}: step '${stepParts[1]}' must be a positive integer.`);
        continue;
      }
    }

    if (base === "*") continue;

    const rangeParts = base.split("-");
    if (rangeParts.length > 2 || rangeParts.some((part) => !part)) {
      errors.push(`${config.label}: invalid range '${base}'.`);
      continue;
    }

    if (rangeParts.length === 2) {
      const start = resolveCronValue(rangeParts[0], config, name);
      const end = resolveCronValue(rangeParts[1], config, name);
      if (start === null || end === null) {
        errors.push(`${config.label}: range '${base}' contains an invalid value.`);
      } else if (start > end) {
        errors.push(`${config.label}: range '${base}' must run from a lower value to a higher value.`);
      }
      continue;
    }

    if (resolveCronValue(base, config, name) === null) {
      errors.push(`${config.label}: '${base}' is outside ${config.min}-${config.max}${config.names ? " or is not a supported name" : ""}.`);
    }
  }

  return errors;
}

function resolveCronValue(value: string, config: FieldConfig, name: FieldName) {
  if (config.names && Object.prototype.hasOwnProperty.call(config.names, value)) return config.names[value];
  if (!/^\d+$/.test(value)) return null;
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < config.min || numeric > config.max) return null;
  if (name === "dayOfWeek" && numeric === 7) return 7;
  return numeric;
}
