"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const formatSQL = () => {
    let formatted = input
      .replace(/select/gi, "\nSELECT")
      .replace(/from/gi, "\nFROM")
      .replace(/where/gi, "\nWHERE")
      .replace(/and/gi, "\nAND")
      .replace(/or/gi, "\nOR")
      .replace(/order by/gi, "\nORDER BY")
      .replace(/group by/gi, "\nGROUP BY")
      .replace(/inner join/gi, "\nINNER JOIN")
      .replace(/left join/gi, "\nLEFT JOIN")
      .replace(/right join/gi, "\nRIGHT JOIN")
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
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste SQL query here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatSQL} className="yoryantra-btn">
          Format SQL
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
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
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Formatted SQL query will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This SQL Formatter
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This SQL Formatter helps you format messy SQL queries into a
            cleaner and more readable structure. It is useful when working with
            SELECT statements, WHERE clauses, JOIN queries, GROUP BY, ORDER BY,
            and LIMIT clauses.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Clean SQL formatting makes database queries easier to read, review,
            debug, and share with other developers. This tool is helpful for
            developers, analysts, students, and anyone working with SQL queries.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the SQL Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your SQL query into the input box.</li>
            <li>Click <strong>Format SQL</strong> to beautify the query.</li>
            <li>Review the formatted output below.</li>
            <li>Use the copy button to copy the formatted SQL.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Beautifying long SQL queries for better readability.</li>
            <li>Formatting SELECT, WHERE, JOIN, and ORDER BY clauses.</li>
            <li>Cleaning SQL queries before sharing them with teammates.</li>
            <li>Debugging database queries more easily.</li>
            <li>Preparing SQL snippets for documentation or tutorials.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Before formatting:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              select name,email from users where status='active' order by name limit 10
            </pre>

            <p className="mt-4 font-medium text-gray-900">After formatting:</p>
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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a SQL formatter?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                A SQL formatter is a tool that organizes SQL queries with
                proper line breaks and spacing so they are easier to read and
                understand.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool change my SQL logic?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The formatter only changes the structure and readability of
                the query. It does not intentionally change the query logic.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I format SELECT queries?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can format SELECT queries with FROM, WHERE, JOIN,
                GROUP BY, ORDER BY, and LIMIT clauses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this SQL Formatter secure?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The formatting runs directly in your browser. Your SQL
                input is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">
              Regex Tester
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}