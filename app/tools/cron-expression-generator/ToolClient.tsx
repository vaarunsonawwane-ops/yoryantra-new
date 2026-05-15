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
      <div className="space-y-8">
        <div className="grid gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Minute
            </label>
            <input
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="*"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-gray-400"
            />
          </div>
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

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="mb-3 text-sm font-semibold text-gray-900">
            Generated Cron Expression
          </p>

          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-gray-800">
            {expression}
          </pre>
        </div>

        <section className="prose prose-gray max-w-none">
          <h2>Free online cron expression generator</h2>

          <p>
            This Cron Expression Generator helps you create cron expressions for
            scheduled jobs, automation workflows, backend tasks, server scripts,
            and recurring jobs. You can enter each cron field manually and copy
            the final expression instantly.
          </p>

          <h2>What is a cron expression?</h2>

          <p>
            A cron expression is a time-based scheduling format used to run
            automated tasks at fixed times, dates, or intervals. Cron expressions
            are commonly used on Linux servers, cloud platforms, CI/CD systems,
            backend applications, and automation tools.
          </p>

          <h2>How to use this cron generator</h2>

          <p>
            Enter values for minute, hour, day of month, month, and day of week.
            The generated cron expression updates automatically and can be used
            in most standard cron job systems.
          </p>

          <h2>Common cron expression examples</h2>

          <ul>
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
              <code>0 9 * * 1</code> → Every Monday at 9 AM
            </li>
            <li>
              <code>*/5 * * * *</code> → Every 5 minutes
            </li>
          </ul>

          <h2>FAQs</h2>

          <h3>What does an asterisk mean in cron?</h3>

          <p>
            The asterisk symbol means every possible value for that field. For
            example, an asterisk in the minute field means every minute.
          </p>

          <h3>Can I use this cron expression in Linux?</h3>

          <p>
            Yes. The generated format follows the standard five-field cron
            syntax used by most Linux and Unix cron systems.
          </p>

          <h3>What is the format of a cron expression?</h3>

          <p>
            A standard cron expression has five fields: minute, hour, day of
            month, month, and day of week.
          </p>

          <h3>Does this tool support every cron platform?</h3>

          <p>
            This tool generates standard five-field cron expressions. Some
            platforms may use six-field cron syntax with seconds, so always
            check your platform documentation before using it in production.
          </p>

          <h2>Related tools</h2>

          <ul>
            <li>
              <Link href="/tools/api-key-generator">
                API Key Generator
              </Link>
            </li>
            <li>
              <Link href="/tools/bcrypt-generator">
                bcrypt Generator
              </Link>
            </li>
            <li>
              <Link href="/tools/jwt-decoder">JWT Decoder</Link>
            </li>
          </ul>
        </section>
      </div>
    </ToolShell>
  );
}