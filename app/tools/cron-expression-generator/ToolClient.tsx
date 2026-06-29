"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

export default function ToolClient() {
  const [minute, setMinute] =
    useState("*");

  const [hour, setHour] =
    useState("*");

  const [dayOfMonth, setDayOfMonth] =
    useState("*");

  const [month, setMonth] =
    useState("*");

  const [dayOfWeek, setDayOfWeek] =
    useState("*");

  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const resetAll = () => {
    setMinute("*");
    setHour("*");
    setDayOfMonth("*");
    setMonth("*");
    setDayOfWeek("*");
  };

  return (
    <ToolShell
      title="Cron Expression Generator"
      description="Generate cron expressions instantly for scheduled jobs, Linux cron tasks, automation workflows, and recurring backend processes."
    >
      {/* MINUTE */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Minute
        </label>

        <input
          type="text"
          value={minute}
          onChange={(e) =>
            setMinute(
              e.target.value
            )
          }
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* HOUR */}
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hour
        </label>

        <input
          type="text"
          value={hour}
          onChange={(e) =>
            setHour(
              e.target.value
            )
          }
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* DAY OF MONTH */}
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Day of Month
        </label>

        <input
          type="text"
          value={dayOfMonth}
          onChange={(e) =>
            setDayOfMonth(
              e.target.value
            )
          }
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* MONTH */}
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Month
        </label>

        <input
          type="text"
          value={month}
          onChange={(e) =>
            setMonth(
              e.target.value
            )
          }
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* DAY OF WEEK */}
      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Day of Week
        </label>

        <input
          type="text"
          value={dayOfWeek}
          onChange={(e) =>
            setDayOfWeek(
              e.target.value
            )
          }
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() =>
            navigator.clipboard.writeText(
              expression
            )
          }
          className="yoryantra-btn"
        >
          Copy Expression
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Cron Expression
          </h3>

          <button
            onClick={() =>
              navigator.clipboard.writeText(
                expression
              )
            }
            className="yoryantra-btn-outline text-sm"
          >
            Copy
          </button>
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {expression}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Cron expression generation happens locally inside your browser. No
          scheduling data or cron values are uploaded or stored on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building Cron Expressions for Scheduled Jobs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cron expressions help developers schedule recurring jobs, backend
            scripts, Linux cron tasks, server automation, database maintenance,
            CI/CD workflows, notifications, backups, and recurring background
            processes.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cron syntax is widely used across Linux servers, cloud platforms,
            DevOps systems, automation tools, Kubernetes jobs, and backend
            frameworks. Even small syntax mistakes can cause tasks to run at the
            wrong time or fail entirely.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Cron Expression Generator helps create valid five-field cron
            expressions instantly while making scheduling syntax easier to
            understand and copy into production workflows.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Cron Expression Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter the minute value.
            </li>

            <li>
              Enter the hour value.
            </li>

            <li>
              Enter the day of month value.
            </li>

            <li>
              Enter the month value.
            </li>

            <li>
              Enter the day of week value.
            </li>

            <li>
              Copy the generated cron expression instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Cron Scheduling Examples
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Every minute:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`* * * * *`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Every hour:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`0 * * * *`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Every day at midnight:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`0 0 * * *`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Every Monday at 9 AM:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`0 9 * * 1`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Every 15 minutes:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`*/15 * * * *`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Scheduling backend scripts and recurring jobs.
            </li>

            <li>
              Running automated backups and maintenance tasks.
            </li>

            <li>
              Creating CI/CD automation workflows.
            </li>

            <li>
              Scheduling database cleanup and reporting jobs.
            </li>

            <li>
              Running recurring notifications and email systems.
            </li>

            <li>
              Building server-side automation workflows.
            </li>

            <li>
              Testing cron syntax before deployment.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Understanding Cron Syntax
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>*</strong> means every possible value.
              </li>

              <li>
                <strong>*/5</strong> means every 5 intervals.
              </li>

              <li>
                <strong>1,2,3</strong> means multiple specific values.
              </li>

              <li>
                <strong>1-5</strong> means a value range.
              </li>

              <li>
                Standard cron format uses five fields:
                minute, hour, day of month, month, and day of week.
              </li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a cron expression?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A cron expression is a scheduling format used to automate tasks
                at specific times or recurring intervals.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where are cron expressions used?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Cron expressions are commonly used in Linux servers, cloud
                systems, backend frameworks, DevOps pipelines, and automation
                workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does the asterisk (*) mean in cron?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The asterisk means every possible value for that field.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this compatible with Linux cron jobs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This tool generates standard five-field cron expressions
                commonly used in Linux and Unix systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is cron expression generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Cron expressions are generated entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/cron-expression-generator" />
        </div>
      </section>
    </ToolShell>
  );
}