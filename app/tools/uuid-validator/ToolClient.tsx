"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type UUIDCheck = {
  value: string;
  valid: boolean;
  version: string;
  variant: string;
  format: string;
  message: string;
};

const sampleUUIDs = `550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
not-a-valid-uuid`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const validateUUIDs = () => {
    if (!input.trim()) {
      setError("Please enter one or more UUID values to validate.");
      setOutput("");
      return;
    }

    const values = input
      .split(/\r?\n|,|\s+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!values.length) {
      setError("Please enter one or more UUID values to validate.");
      setOutput("");
      return;
    }

    const results = values.map(checkUUID);

    setOutput(formatResults(results));
    setError("");
  };

  const loadExample = () => {
    setInput(sampleUUIDs);
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
      title="UUID Validator"
      description="Validate UUID values, check UUID format, and detect UUID versions directly in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          UUID Input
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleUUIDs}
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste one UUID or multiple UUID values separated by lines, spaces, or commas.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateUUIDs} className="yoryantra-btn">
          Validate UUID
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "UUID validation result will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking UUID Strings Before Using Them in Applications
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            UUID values are commonly used as identifiers in databases, APIs,
            logs, distributed systems, test data, and application records. A
            small formatting mistake can make a UUID fail validation or cause
            issues when it is used in code, queries, or request payloads.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This UUID Validator helps you validate UUID format, check whether a
            UUID string is valid, detect the UUID version, and inspect multiple
            UUID values directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Validating UUID Format in the Browser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste one UUID or multiple UUID values into the input box.</li>
            <li>
              Click <strong>Validate UUID</strong>.
            </li>
            <li>Review whether each UUID value is valid or invalid.</li>
            <li>Check the UUID version and variant when available.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common UUID Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking UUID values before using them in API requests.</li>
            <li>Validating database IDs copied from logs or queries.</li>
            <li>Reviewing generated UUIDs before storing test data.</li>
            <li>Detecting UUID versions such as UUID v1, v3, v4, or v5.</li>
            <li>Finding invalid UUID strings in copied lists.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example UUID Values
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleUUIDs}
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
                What does a UUID validator check?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A UUID validator checks whether a UUID string follows a valid
                UUID format. It can also identify the UUID version when the
                value includes a standard version marker.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool validate multiple UUIDs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can paste multiple UUID values separated by lines,
                spaces, or commas and validate them together.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What UUID versions can be detected?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool can detect common UUID versions from the UUID string,
                including version 1, version 3, version 4, and version 5 when
                the UUID is in standard format.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my UUID data uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. UUID validation happens directly in your browser. Your UUID
                values are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/uuid-generator"
              className="yoryantra-btn-outline"
            >
              UUID Generator
            </Link>

            <Link
              href="/tools/regex-tester"
              className="yoryantra-btn-outline"
            >
              Regex Tester
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function checkUUID(value: string): UUIDCheck {
  const normalized = value.trim();
  const standardPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const loosePattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (standardPattern.test(normalized)) {
    const versionNumber = normalized.charAt(14);
    const variantChar = normalized.charAt(19).toLowerCase();

    return {
      value: normalized,
      valid: true,
      version: `Version ${versionNumber}`,
      variant: getVariant(variantChar),
      format: "Standard UUID format",
      message: "Valid UUID",
    };
  }

  if (loosePattern.test(normalized)) {
    return {
      value: normalized,
      valid: false,
      version: "Unknown",
      variant: "Unknown",
      format: "UUID-like format",
      message:
        "This looks like a UUID, but the version or variant position is not valid.",
    };
  }

  return {
    value: normalized,
    valid: false,
    version: "Unknown",
    variant: "Unknown",
    format: "Invalid UUID format",
    message: "Invalid UUID",
  };
}

function formatResults(results: UUIDCheck[]) {
  const validCount = results.filter((result) => result.valid).length;
  const invalidCount = results.length - validCount;

  const lines = [
    "UUID validation completed.",
    "",
    `Total checked: ${results.length}`,
    `Valid UUIDs: ${validCount}`,
    `Invalid UUIDs: ${invalidCount}`,
    "",
    "Results:",
    "",
  ];

  results.forEach((result, index) => {
    lines.push(`${index + 1}. ${result.value}`);
    lines.push(`   Status: ${result.message}`);
    lines.push(`   Format: ${result.format}`);
    lines.push(`   Version: ${result.version}`);
    lines.push(`   Variant: ${result.variant}`);
    lines.push("");
  });

  return lines.join("\n").trim();
}

function getVariant(value: string) {
  if (["8", "9", "a", "b"].includes(value)) {
    return "RFC 4122 variant";
  }

  return "Unknown variant";
}
