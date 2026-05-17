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
      const regex = new RegExp(
        pattern,
        "g"
      );

      const matches =
        text.match(regex);

      setResult(
        matches
          ? JSON.stringify(
              matches,
              null,
              2
            )
          : "No matches found."
      );

      setError("");
    } catch {
      setError(
        "Invalid regex pattern."
      );

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
          onChange={(e) =>
            setPattern(
              e.target.value
            )
          }
          placeholder="Enter regex pattern..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* TEST TEXT */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Test Text
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste or type test text here..."
          value={text}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={testRegex}
          className="yoryantra-btn"
        >
          Test Regex
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Match Results
          </h3>

          {result &&
            result !==
              "No matches found." && (
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    result
                  )
                }
                className="yoryantra-btn-outline text-sm"
              >
                Copy
              </button>
            )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {result ||
            "Regex match results will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Regex testing happens locally inside your browser. Your regex patterns
          and test text are not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Testing Regex Patterns Before They Break Matches
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Regex testing helps developers validate regular expressions against
            sample text before using them in applications, APIs, forms,
            automation scripts, search filters, backend systems, and frontend
            validation workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Incorrect regex patterns can cause failed validations, broken search
            results, unexpected replacements, and parsing errors. This Regex
            Tester helps quickly experiment with regular expressions and inspect
            matching results directly inside your browser.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for form validation, data extraction, search
            filtering, text cleanup, automation workflows, log analysis, and
            JavaScript regex debugging.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Regex Tester
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Enter your regular expression in the pattern field.
            </li>

            <li>
              Paste or type the text you want to test.
            </li>

            <li>
              Click <strong>Test Regex</strong>.
            </li>

            <li>
              Review all matching results instantly.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Validating email addresses and usernames.
            </li>

            <li>
              Extracting numbers, URLs, and IDs from text.
            </li>

            <li>
              Debugging form validation rules.
            </li>

            <li>
              Cleaning logs and structured text data.
            </li>

            <li>
              Matching dates, phone numbers, and tokens.
            </li>

            <li>
              Testing JavaScript regular expressions before deployment.
            </li>

            <li>
              Building search and replace workflows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Regex Matching
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Regex pattern:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`\d+`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Test text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Order 245 was placed on 2026-05-15`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Match results:
            </p>

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
            Why Regex Testing Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better validation:</strong> Regex helps enforce text
                formats more accurately.
              </li>

              <li>
                <strong>Faster debugging:</strong> Testing patterns separately
                reduces application errors.
              </li>

              <li>
                <strong>Cleaner automation:</strong> Regular expressions simplify
                extraction and filtering workflows.
              </li>

              <li>
                <strong>Reliable matching:</strong> Pattern testing helps avoid
                broken searches and invalid replacements.
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
                What is regex?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Regex stands for regular expression, a pattern used to search,
                validate, extract, and manipulate text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is a Regex Tester?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A Regex Tester lets you test regular expressions against sample
                text and inspect matching results instantly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool support JavaScript regex?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This tool uses JavaScript regular expressions with global
                matching enabled.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I test email and phone number patterns?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Regex is commonly used for validating emails, phone
                numbers, usernames, dates, and many other text formats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is regex testing processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Regex testing happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Regex testing often connects with validation, APIs, JSON debugging,
            text cleanup, structured data workflows, and frontend development.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/sql-formatter"
              className="yoryantra-btn-outline"
            >
              SQL Formatter
            </Link>

            <Link
              href="/tools/url-encoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/text-case-converter"
              className="yoryantra-btn-outline"
            >
              Text Case Converter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}