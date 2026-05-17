"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatSQL = () => {
    let formatted = input
      .replace(/\s+/g, " ")
      .replace(/select/gi, "\nSELECT")
      .replace(/from/gi, "\nFROM")
      .replace(/where/gi, "\nWHERE")
      .replace(/inner join/gi, "\nINNER JOIN")
      .replace(/left join/gi, "\nLEFT JOIN")
      .replace(/right join/gi, "\nRIGHT JOIN")
      .replace(/join/gi, "\nJOIN")
      .replace(/and/gi, "\n  AND")
      .replace(/or/gi, "\n  OR")
      .replace(/group by/gi, "\nGROUP BY")
      .replace(/order by/gi, "\nORDER BY")
      .replace(/having/gi, "\nHAVING")
      .replace(/limit/gi, "\nLIMIT");

    setOutput(formatted.trim());
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="SQL Formatter"
      description="Format and beautify SQL queries instantly with this free online SQL Formatter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          SQL Query
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste SQL query here..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={formatSQL}
          className="yoryantra-btn"
        >
          Format SQL
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
            Formatted Output
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  output
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output ||
            "Formatted SQL query will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          SQL formatting happens locally inside your browser. Your SQL queries
          are not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting SQL Queries So They Are Easier to Debug
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            SQL formatting helps organize messy database queries into a cleaner
            and more readable structure. Properly formatted SQL queries are
            easier to debug, review, optimize, document, and maintain during
            development workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Long SQL queries copied from applications, logs, ORMs, dashboards,
            or database tools often appear compressed into a single unreadable
            line. This SQL Formatter helps instantly beautify SELECT queries,
            JOIN statements, WHERE clauses, GROUP BY conditions, ORDER BY
            blocks, and other SQL structures.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for backend development, database debugging,
            analytics workflows, reporting systems, API development, query
            optimization, and SQL documentation directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the SQL Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your SQL query into the editor.
            </li>

            <li>
              Click <strong>Format SQL</strong>.
            </li>

            <li>
              Review the beautified query structure.
            </li>

            <li>
              Copy the formatted SQL output instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Beautifying long SQL queries for readability.
            </li>

            <li>
              Formatting SELECT, WHERE, JOIN, and GROUP BY clauses.
            </li>

            <li>
              Cleaning SQL copied from logs or applications.
            </li>

            <li>
              Debugging complex database queries more easily.
            </li>

            <li>
              Preparing SQL queries for documentation and tutorials.
            </li>

            <li>
              Improving readability during database optimization.
            </li>

            <li>
              Reviewing generated ORM or analytics queries.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example SQL Formatting
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Before formatting:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`select name,email from users where status='active' order by name limit 10`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              After formatting:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`SELECT name,email
FROM users
WHERE status='active'
ORDER BY name
LIMIT 10`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why SQL Formatting Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better readability:</strong> Structured SQL is easier to
                review and understand.
              </li>

              <li>
                <strong>Faster debugging:</strong> Organized clauses simplify
                query troubleshooting.
              </li>

              <li>
                <strong>Cleaner collaboration:</strong> Formatted queries are
                easier to share with teammates.
              </li>

              <li>
                <strong>Improved maintenance:</strong> Readable SQL is easier to
                update and optimize later.
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
                What is a SQL Formatter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A SQL Formatter organizes SQL queries using line breaks,
                spacing, and indentation so they are easier to read and debug.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does formatting change my SQL logic?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. SQL formatting changes readability only and does not
                intentionally modify the query logic.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which SQL clauses are supported?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The formatter supports common SQL clauses including SELECT,
                FROM, WHERE, JOIN, GROUP BY, ORDER BY, HAVING, and LIMIT.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this formatter useful for databases and APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Developers commonly format SQL while working with APIs,
                databases, dashboards, analytics systems, and backend
                applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is SQL formatting processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. SQL formatting happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            SQL formatting often connects with APIs, JSON workflows, structured
            data inspection, backend debugging, and analytics systems.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/json-to-csv-converter"
              className="yoryantra-btn-outline"
            >
              JSON to CSV Converter
            </Link>

            <Link
              href="/tools/csv-to-json"
              className="yoryantra-btn-outline"
            >
              CSV to JSON Converter
            </Link>

            <Link
              href="/tools/regex-tester"
              className="yoryantra-btn-outline"
            >
              Regex Tester
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}