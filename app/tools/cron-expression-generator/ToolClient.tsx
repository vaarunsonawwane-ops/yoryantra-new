"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");

  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;

  const copyExpression = async () => {
    await navigator.clipboard.writeText(expression);
  };

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
      description="Generate cron expressions online for scheduled jobs, automation workflows, and recurring tasks."
    >
      <div className="space-y-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Minute
              </label>

              <input
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="*"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Hour
              </label>

              <input
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder="*"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Day of Month
              </label>

              <input
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="*"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Month
              </label>

              <input
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="*"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-800">
                Day of Week
              </label>

              <input
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                placeholder="*"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={copyExpression}
                className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Copy Expression
              </button>

              <button
                onClick={resetAll}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">
                Generated Cron Expression
              </p>

              <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-gray-800">
                {expression}
              </pre>
            </div>
          </div>
        </div>

        <section className="space-y-8 text-sm leading-7 text-gray-700">
          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              About This Cron Expression Generator
            </h2>

            <p>
              This Cron Expression Generator helps developers create cron
              expressions for scheduled jobs, recurring scripts, automation
              workflows, Linux cron jobs, CI/CD pipelines, and backend task
              scheduling.
            </p>

            <p className="mt-3">
              Enter values for minute, hour, day of month, month, and weekday to
              instantly generate a valid cron expression that can be used in
              Linux servers, cloud platforms, and automation systems.
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Cron Expression Features
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>Generate standard cron expressions instantly.</li>
              <li>Useful for Linux cron jobs and task scheduling.</li>
              <li>Copy cron expressions with one click.</li>
              <li>Supports standard five-field cron syntax.</li>
              <li>Helpful for developers, DevOps, and backend workflows.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              How to Use the Cron Generator
            </h2>

            <ol className="list-decimal space-y-2 pl-5">
              <li>Enter the minute value.</li>
              <li>Enter the hour value.</li>
              <li>Enter the day of month value.</li>
              <li>Enter the month value.</li>
              <li>Enter the weekday value.</li>
              <li>Copy the generated cron expression.</li>
            </ol>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Common Cron Expression Examples
            </h2>

            <ul className="list-disc space-y-2 pl-5">
              <li>
                <code>* * * * *</code> → Every minute
              </li>

              <li>
                <code>0 * * * *</code> → Every hour
              </li>

              <li>
                <code>0 0 * * *</code> → Every day at midnight
              </li>

              <li>
                <code>*/5 * * * *</code> → Every 5 minutes
              </li>

              <li>
                <code>0 9 * * 1</code> → Every Monday at 9 AM
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>

            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-gray-900">
                  What is a cron expression?
                </h3>

                <p>
                  A cron expression is a scheduling format used to run automated
                  tasks at specific intervals or times on Linux and Unix systems.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  What does the asterisk symbol mean?
                </h3>

                <p>
                  The asterisk (*) means every possible value for that field.
                  For example, an asterisk in the minute field means every
                  minute.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Can I use this cron expression on Linux servers?
                </h3>

                <p>
                  Yes. The generated format follows standard cron syntax used by
                  most Linux and Unix systems.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Does every platform support the same cron syntax?
                </h3>

                <p>
                  Most systems support the standard five-field format, but some
                  platforms also use a seconds field or additional syntax.
                  Always check your platform documentation before production
                  use.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              Related Tools
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/tools/api-key-generator"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                API Key Generator
              </Link>

              <Link
                href="/tools/bcrypt-generator"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                bcrypt Generator
              </Link>

              <Link
                href="/tools/jwt-decoder"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                JWT Decoder
              </Link>

              <Link
                href="/tools/hmac-generator"
                className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
              >
                HMAC Generator
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ToolShell>
  );
}