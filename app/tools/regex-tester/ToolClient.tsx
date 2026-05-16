"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [pattern, setPattern] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const testRegex = () => {
    try {
      const regex = new RegExp(pattern, "g");
      const matches = text.match(regex);

      setResult(
        matches ? JSON.stringify(matches, null, 2) : "No matches found."
      );

      setError("");
    } catch {
      setError("Invalid regex pattern.");
      setResult("");
    }
  };

  const resetAll = () => {
    setPattern("");
    setText("");
    setResult("");
    setError("");
  };

  return (
    <ToolShell
      title="Regex Tester"
      description="Test, validate, and debug regular expressions instantly with this free online Regex Tester."
    >
      {/* REGEX PATTERN */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Regex Pattern
        </label>

        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Enter regex pattern..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* TEST TEXT */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Test Text
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste or type test text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={testRegex} className="yoryantra-btn">
          Test Regex
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Match Results
          </h3>

          {result && result !== "No matches found." && (
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {result || "Regex match results will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Regex Tester?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Regex Tester helps you test regular expressions against sample
            text and quickly check whether your pattern finds the expected
            matches. It is useful for validating text patterns, extracting
            values, checking input formats, and debugging search rules.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Regular expressions are commonly used in form validation, log
            analysis, data cleanup, search filters, and automation scripts. A
            simple regex testing tool makes it easier to experiment with
            patterns before using them in code.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Regex Tester
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter your regular expression in the pattern field.</li>
            <li>Paste or type the text you want to test against.</li>
            <li>Click <strong>Test Regex</strong> to find matching results.</li>
            <li>Review the matches shown in the output section.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing email, phone number, or username patterns.</li>
            <li>Finding specific words, numbers, or symbols in text.</li>
            <li>Debugging form validation rules.</li>
            <li>Extracting values from logs or structured text.</li>
            <li>Checking regex patterns before using them in JavaScript.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Regex pattern:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              \d+
            </pre>

            <p className="mt-4 font-medium text-gray-900">Test text:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
              Order 245 was placed on 2026-05-15
            </pre>

            <p className="mt-4 font-medium text-gray-900">Match result:</p>
            <pre className="mt-2 whitespace-pre-wrap break-words">
{`[
  "245",
  "2026",
  "05",
  "15"
]`}
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
                What is a regex tester?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                A regex tester is a tool that lets you test a regular
                expression against sample text to see which parts of the text
                match the pattern.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does regex mean?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Regex stands for regular expression. It is a pattern used to
                search, match, validate, or extract text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this Regex Tester support JavaScript regex?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This tool uses JavaScript regular expressions with the
                global match flag to find all matching results.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Regex Tester secure?
              </h3>
              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The regex test runs directly in your browser. Your pattern
                and test text are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/word-counter" className="yoryantra-btn-outline">
              Word Counter
            </Link>

            <Link href="/tools/text-case-converter" className="yoryantra-btn-outline">
              Text Case Converter
            </Link>

            <Link href="/tools/sql-formatter" className="yoryantra-btn-outline">
              SQL Formatter
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
