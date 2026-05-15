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
      {/* INPUTS */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Minute
        </label>

        <input
          type="text"
          value={minute}
          onChange={(e) => setMinute(e.target.value)}
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hour
        </label>

        <input
          type="text"
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Day of Month
        </label>

        <input
          type="text"
          value={dayOfMonth}
          onChange={(e) => setDayOfMonth(e.target.value)}
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Month
        </label>

        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Day of Week
        </label>

        <input
          type="text"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          placeholder="*"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() => navigator.clipboard.writeText(expression)}
          className="yoryantra-btn"
        >
          Copy Expression
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
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
            onClick={() => navigator.clipboard.writeText(expression)}
            className="yoryantra-btn-outline text-sm"
          >
            Copy
          </button>
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {expression}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This Cron Expression Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Cron Expression Generator helps you create cron expressions for
            scheduled jobs, recurring scripts, automation workflows, Linux cron
            jobs, CI/CD pipelines, backend services, and server-side task
            scheduling.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Cron expressions are commonly used to run commands or scripts at
            fixed times, dates, or intervals. This tool lets you enter each cron
            field manually and copy the final expression instantly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Cron Expression Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter the minute value.</li>
            <li>Enter the hour value.</li>
            <li>Enter the day of month value.</li>
            <li>Enter the month value.</li>
            <li>Enter the day of week value.</li>
            <li>Copy the generated cron expression.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Scheduling backend jobs and server scripts.</li>
            <li>Running automated backups at fixed intervals.</li>
            <li>Creating recurring CI/CD or deployment tasks.</li>
            <li>Scheduling email, report, or notification jobs.</li>
            <li>Testing cron syntax for automation workflows.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Cron Examples
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Every minute:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              * * * * *
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Every hour:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              0 * * * *
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Every day at midnight:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              0 0 * * *
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Every Monday at 9 AM:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              0 9 * * 1
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
                What is a cron expression?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A cron expression is a scheduling format used to run automated
                tasks at specific times or intervals, commonly on Linux and Unix
                systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does the asterisk mean in cron?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The asterisk (*) means every possible value for that field. For
                example, an asterisk in the minute field means every minute.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the standard cron format?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The standard cron format has five fields: minute, hour, day of
                month, month, and day of week.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use this cron expression on Linux servers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This tool generates standard five-field cron expressions
                used by most Linux and Unix cron systems.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/api-key-generator" className="yoryantra-btn-outline">
              API Key Generator
            </Link>

            <Link href="/tools/bcrypt-generator" className="yoryantra-btn-outline">
              bcrypt Generator
            </Link>

            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/hmac-generator" className="yoryantra-btn-outline">
              HMAC Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}