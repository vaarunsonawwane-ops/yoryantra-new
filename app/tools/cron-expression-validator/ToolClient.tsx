"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type CronIssue = {
  level: "Error" | "Warning" | "Suggestion";
  message: string;
};

type CronFieldReport = {
  name: string;
  value: string;
  valid: boolean;
  meaning: string;
};

type CronValidationReport = {
  valid: boolean;
  fields: CronFieldReport[];
  issues: CronIssue[];
  summary: string;
};

const sampleCron = "*/15 9-17 * * MON-FRI";

const fieldDefinitions = [
  {
    name: "Minute",
    min: 0,
    max: 59,
    aliases: {},
  },
  {
    name: "Hour",
    min: 0,
    max: 23,
    aliases: {},
  },
  {
    name: "Day of month",
    min: 1,
    max: 31,
    aliases: {},
  },
  {
    name: "Month",
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
    } as Record<string, number>,
  },
  {
    name: "Day of week",
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
    } as Record<string, number>,
  },
];

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateCron = () => {
    if (!input.trim()) {
      setError("Please enter a cron expression to validate.");
      setOutput("");
      return;
    }

    try {
      const report = validateCronExpression(input.trim());
      setOutput(formatReport(input.trim(), report));
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to validate this cron expression.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleCron);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Cron Expression Validator"
      description="Validate cron expressions, check cron syntax, preview schedule meaning, and find common cron timing issues."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Cron Expression
        </label>

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleCron}
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Enter a standard 5-field cron expression such as{" "}
          <strong>*/15 9-17 * * MON-FRI</strong>.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateCron} className="yoryantra-btn">
          Validate Cron
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Validation Result
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Cron validation result will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Validating Cron Expressions Before Scheduling Jobs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cron expressions are used to schedule jobs, scripts, backups,
            reports, cleanup tasks, deployments, monitoring checks, and other
            repeated work. A small mistake in a cron expression can make a job
            run too often, not run at all, or run at the wrong time.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Cron Expression Validator helps you check cron syntax, review
            each schedule field, understand common cron patterns, and find
            timing issues directly in your browser before adding cron jobs to a
            server, DevOps workflow, or automation system.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking Cron Syntax in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a 5-field cron expression into the input box.</li>
            <li>
              Click <strong>Validate Cron</strong>.
            </li>
            <li>Review field-by-field validation and schedule meaning.</li>
            <li>Fix warnings or errors before using the expression in production.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Cron Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking cron job syntax before adding it to a server.</li>
            <li>Validating backup, cleanup, or report schedules.</li>
            <li>Reviewing weekday and month aliases such as MON-FRI or JAN.</li>
            <li>Checking step values such as */5 or */15.</li>
            <li>Finding expressions that may run very frequently.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Cron Expressions
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`*/15 9-17 * * MON-FRI   Every 15 minutes during working hours
0 0 * * *                Every day at midnight
0 */6 * * *              Every 6 hours
30 2 * * SUN             Every Sunday at 2:30 AM`}
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
                What does a cron expression validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A cron expression validator checks whether a cron schedule uses
                valid field count, valid numeric ranges, supported aliases,
                ranges, lists, wildcards, and step values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support 5-field or 6-field cron?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool focuses on standard 5-field cron expressions using
                minute, hour, day of month, month, and day of week. Some systems
                support a seconds field, but that format varies by platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can cron behavior differ between systems?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Linux cron, Kubernetes CronJobs, Quartz, GitHub Actions,
                and cloud schedulers may handle some cron features differently.
                Always check the scheduler documentation for final behavior.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my cron expression uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Cron validation happens directly in your browser. Your cron
                expression is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/cron-expression-validator" />
        </div>
      </section>
    </ToolShell>
  );
}

function validateCronExpression(expression: string): CronValidationReport {
  const parts = expression.split(/\s+/).filter(Boolean);
  const issues: CronIssue[] = [];

  if (parts.length !== 5) {
    return {
      valid: false,
      fields: [],
      issues: [
        {
          level: "Error",
          message: `Expected 5 cron fields, but found ${parts.length}.`,
        },
      ],
      summary: "Invalid cron expression.",
    };
  }

  const fields = parts.map((part, index) => {
    const definition = fieldDefinitions[index];
    const validation = validateCronField(part, definition);

    if (!validation.valid) {
      validation.issues.forEach((issue) => issues.push(issue));
    }

    return {
      name: definition.name,
      value: part,
      valid: validation.valid,
      meaning: validation.meaning,
    };
  });

  const valid = issues.filter((issue) => issue.level === "Error").length === 0;

  if (valid) {
    addCronSuggestions(parts, issues);
  }

  return {
    valid,
    fields,
    issues,
    summary: valid ? buildCronSummary(parts) : "Invalid cron expression.",
  };
}

function validateCronField(
  value: string,
  definition: {
    name: string;
    min: number;
    max: number;
    aliases: Record<string, number>;
  }
) {
  const issues: CronIssue[] = [];

  if (!value.trim()) {
    issues.push({
      level: "Error",
      message: `${definition.name} field is empty.`,
    });

    return {
      valid: false,
      meaning: "Empty field",
      issues,
    };
  }

  const parts = value.split(",");

  for (const part of parts) {
    const result = validateCronPart(part.trim(), definition);

    if (!result.valid) {
      issues.push({
        level: "Error",
        message: `${definition.name}: ${result.message}`,
      });
    }
  }

  return {
    valid: issues.length === 0,
    meaning: describeField(value, definition),
    issues,
  };
}

function validateCronPart(
  value: string,
  definition: {
    min: number;
    max: number;
    aliases: Record<string, number>;
  }
) {
  if (!value) {
    return {
      valid: false,
      message: "empty list item",
    };
  }

  const [base, step] = value.split("/");

  if (value.split("/").length > 2) {
    return {
      valid: false,
      message: "too many step separators",
    };
  }

  if (step !== undefined) {
    const stepValue = Number(step);

    if (!/^\d+$/.test(step) || stepValue <= 0) {
      return {
        valid: false,
        message: "step value should be a positive number",
      };
    }
  }

  if (base === "*") {
    return {
      valid: true,
      message: "",
    };
  }

  if (base.includes("-")) {
    const [start, end] = base.split("-");

    if (!start || !end || base.split("-").length !== 2) {
      return {
        valid: false,
        message: "invalid range",
      };
    }

    const startValue = parseCronValue(start, definition.aliases);
    const endValue = parseCronValue(end, definition.aliases);

    if (startValue === null || endValue === null) {
      return {
        valid: false,
        message: "range contains an invalid value",
      };
    }

    if (
      startValue < definition.min ||
      startValue > definition.max ||
      endValue < definition.min ||
      endValue > definition.max
    ) {
      return {
        valid: false,
        message: `range should be between ${definition.min} and ${definition.max}`,
      };
    }

    if (startValue > endValue) {
      return {
        valid: false,
        message: "range start should be less than or equal to range end",
      };
    }

    return {
      valid: true,
      message: "",
    };
  }

  const parsed = parseCronValue(base, definition.aliases);

  if (parsed === null) {
    return {
      valid: false,
      message: "invalid value",
    };
  }

  if (parsed < definition.min || parsed > definition.max) {
    return {
      valid: false,
      message: `value should be between ${definition.min} and ${definition.max}`,
    };
  }

  return {
    valid: true,
    message: "",
  };
}

function parseCronValue(value: string, aliases: Record<string, number>) {
  const upper = value.toUpperCase();

  if (upper in aliases) {
    return aliases[upper];
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number(value);
}

function describeField(
  value: string,
  definition: {
    name: string;
  }
) {
  if (value === "*") {
    return `Every ${definition.name.toLowerCase()}`;
  }

  if (value.startsWith("*/")) {
    return `Every ${value.slice(2)} ${definition.name.toLowerCase()} units`;
  }

  if (value.includes(",")) {
    return `Specific ${definition.name.toLowerCase()} values: ${value}`;
  }

  if (value.includes("-")) {
    return `${definition.name} range: ${value}`;
  }

  return `Specific ${definition.name.toLowerCase()}: ${value}`;
}

function addCronSuggestions(parts: string[], issues: CronIssue[]) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  if (minute === "*" && hour === "*") {
    issues.push({
      level: "Warning",
      message:
        "This cron may run every minute. Confirm that the job is safe to run this frequently.",
    });
  }

  if (dayOfMonth !== "*" && dayOfWeek !== "*") {
    issues.push({
      level: "Suggestion",
      message:
        "Both day-of-month and day-of-week are restricted. Some cron systems handle this combination differently.",
    });
  }

  if (month !== "*" && dayOfMonth === "*" && dayOfWeek === "*") {
    issues.push({
      level: "Suggestion",
      message:
        "Month is restricted but day fields are broad. Confirm this is the intended seasonal schedule.",
    });
  }
}

function buildCronSummary(parts: string[]) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return [
    `Minute: ${minute}`,
    `Hour: ${hour}`,
    `Day of month: ${dayOfMonth}`,
    `Month: ${month}`,
    `Day of week: ${dayOfWeek}`,
  ].join("\n");
}

function formatReport(expression: string, report: CronValidationReport) {
  const errorCount = report.issues.filter((issue) => issue.level === "Error")
    .length;
  const warningCount = report.issues.filter((issue) => issue.level === "Warning")
    .length;
  const suggestionCount = report.issues.filter(
    (issue) => issue.level === "Suggestion"
  ).length;

  const lines = [
    "Cron expression validation completed.",
    "",
    `Expression: ${expression}`,
    `Status: ${report.valid ? "Valid" : "Invalid"}`,
    `Errors: ${errorCount}`,
    `Warnings: ${warningCount}`,
    `Suggestions: ${suggestionCount}`,
    "",
  ];

  if (report.fields.length) {
    lines.push("Fields:");
    lines.push("");

    report.fields.forEach((field) => {
      lines.push(`${field.name}: ${field.value}`);
      lines.push(`  Status: ${field.valid ? "Valid" : "Invalid"}`);
      lines.push(`  Meaning: ${field.meaning}`);
      lines.push("");
    });
  }

  lines.push("Summary:");
  lines.push(report.summary);
  lines.push("");

  lines.push("Issues:");

  if (report.issues.length) {
    report.issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  } else {
    lines.push("No common cron issues found.");
  }

  return lines.join("\n");
}
