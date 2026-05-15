"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import Link from "next/link";

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

        {/* INPUTS */}
        <div className="grid gap-5">

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-800">
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
            <label className="block mb-2 text-sm font-medium text-gray-800">
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
            <label className="block mb-2 text-sm font-medium text-gray-800">
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
            <label className="block mb-2 text-sm font-medium text-gray-800">
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
            <label className="block mb-2 text-sm font-medium text-gray-800">
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

        {/* ACTION BUTTONS */}
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

        {/* OUTPUT */}
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">

          <p className="mb-3 text-sm font-semibold text-gray-900">
            Generated Cron Expression
          </p>

          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-white p-4 text-sm text-gray-800">
            {expression}
          </pre>

        </div>

        {/* SEO CONTENT */}
        <section className="prose prose-gray max-w-none">

          <h2>What is a cron expression?</h2>

          <p>
            A cron expression is a scheduling format used to automate recurring
            tasks on Linux servers, cloud systems, CI/CD pipelines, and backend
            applications.
          </p>

          <h2>How does this cron expression generator work?</h2>

          <p>
            Enter values for minute, hour, day, month, and weekday fields to
            instantly generate a valid cron expression for your scheduled task.
          </p>

          <h2>Common cron examples</h2>

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
          </ul>

          <h2>FAQs</h2>

          <h3>What are cron jobs used for?</h3>

          <p>
            Cron jobs are used for automated backups, emails, scheduled scripts,
            database maintenance, deployments, and recurring server tasks.
          </p>

          <h3>Can I use this cron generator for Linux servers?</h3>

          <p>
            Yes. The generated cron expressions follow standard cron syntax
            supported by most Linux and Unix systems.
          </p>

          <h3>What does the asterisk symbol mean in cron?</h3>

          <p>
            The asterisk (*) means “every value” for that field.
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
              <Link href="/tools/jwt-decoder">
                JWT Decoder
              </Link>
            </li>
          </ul>

        </section>

      </div>
    </ToolShell>
  );
}