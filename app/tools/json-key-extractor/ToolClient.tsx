"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type ExtractedKey = {
  key: string;
  path: string;
  type: string;
  depth: number;
};

type OutputMode = "detailed" | "paths" | "unique";

const sampleJson = `{
  "user": {
    "id": 101,
    "name": "Yoryantra User",
    "profile": {
      "role": "developer",
      "active": true,
      "skills": ["JSON", "APIs", "Debugging"]
    }
  },
  "settings": {
    "theme": "light",
    "notifications": {
      "email": true,
      "sms": false
    }
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleJson);
  const [includeArrayIndexes, setIncludeArrayIndexes] = useState(false);
  const [includeLeafOnly, setIncludeLeafOnly] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>("detailed");
  const [output, setOutput] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  const extractKeys = () => {
    if (!input.trim()) {
      setError("Please enter JSON input.");
      setOutput("");
      setSummary("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const extracted = collectKeys(parsed, {
        includeArrayIndexes,
        includeLeafOnly,
      });

      if (!extracted.length) {
        setError("No keys were found. Please enter a JSON object or array with fields.");
        setOutput("");
        setSummary("");
        return;
      }

      setOutput(formatOutput(extracted, outputMode));
      setSummary(buildSummary(extracted));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse this JSON input."
      );
      setOutput("");
      setSummary("");
    }
  };

  const loadExample = () => {
    setInput(sampleJson);
    setOutput("");
    setSummary("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setIncludeArrayIndexes(false);
    setIncludeLeafOnly(false);
    setOutputMode("detailed");
    setOutput("");
    setSummary("");
    setError("");
  };

  return (
    <ToolShell
      title="JSON Key Extractor"
      description="Extract keys, dot notation paths, value types, and nested field structure from JSON directly in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleJson}
          className="w-full min-h-[320px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a JSON object, array, API response, configuration file, or log
          payload to inspect its key structure.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Extraction Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeArrayIndexes}
              onChange={(event) => setIncludeArrayIndexes(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Include array indexes
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Show paths like users.0.name instead of users.name.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeLeafOnly}
              onChange={(event) => setIncludeLeafOnly(event.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Leaf keys only
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Show only final value paths and skip parent object paths.
              </span>
            </span>
          </label>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Output Format
          </p>

          <div className="flex flex-wrap gap-3">
            {[
              { label: "Detailed", value: "detailed" },
              { label: "Paths Only", value: "paths" },
              { label: "Unique Keys", value: "unique" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setOutputMode(option.value as OutputMode);
                  setOutput("");
                  setSummary("");
                  setError("");
                }}
                className={
                  outputMode === option.value
                    ? "yoryantra-btn"
                    : "yoryantra-btn-outline"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={extractKeys} className="yoryantra-btn">
          Extract JSON Keys
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

      {summary && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          {summary}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Extracted Keys
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[280px] whitespace-pre-wrap break-words">
          {output || "Extracted JSON keys and paths will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON key extraction happens directly in your browser. Your JSON input is
        not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Extracting JSON Keys and Paths from API Responses
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Large JSON payloads can be difficult to inspect manually, especially
            when they contain nested objects, arrays, configuration values, and
            repeated fields. Extracting JSON keys helps you understand the shape
            of an API response or data file before mapping, validating, or
            transforming it.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Key Extractor reads your JSON structure and generates
            field names, dot notation paths, value types, and nested depth
            information. It is useful for API debugging, documentation,
            frontend mapping, backend validation, data migration, and structured
            data review.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Checking Nested JSON Structure Quickly
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste valid JSON into the input box.</li>
            <li>Choose whether to include array indexes or only leaf fields.</li>
            <li>Select detailed output, paths only, or unique keys.</li>
            <li>
              Click <strong>Extract JSON Keys</strong> and copy the result.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Key Extractor Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Understanding API response fields before integration.</li>
            <li>Finding nested JSON paths for frontend or backend mapping.</li>
            <li>Preparing field lists for documentation or validation rules.</li>
            <li>Reviewing JSON exports from analytics, logs, or databases.</li>
            <li>Comparing data structures before building transformations.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON Paths
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`user.id
user.profile.role
user.profile.skills
settings.notifications.email`}
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
                What does a JSON Key Extractor do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It scans JSON input and extracts field names, nested paths, data
                types, and structural depth so you can understand the JSON
                shape quickly.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is a JSON path in this tool?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A path is a dot notation reference to a nested value, such as
                user.profile.role or settings.notifications.email.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this extract keys from arrays?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The tool can inspect arrays and optionally include numeric
                array indexes in the generated paths.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON sent to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The extraction happens locally in your browser. Your JSON is
                not uploaded or stored.
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

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/json-path-tester" className="yoryantra-btn-outline">
              JSON Path Tester
            </Link>

            <Link href="/tools/json-flatten-unflatten-tool" className="yoryantra-btn-outline">
              JSON Flatten / Unflatten Tool
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function collectKeys(
  value: unknown,
  options: {
    includeArrayIndexes: boolean;
    includeLeafOnly: boolean;
  },
  path = "",
  depth = 0
): ExtractedKey[] {
  const rows: ExtractedKey[] = [];

  if (Array.isArray(value)) {
    if (path && !options.includeLeafOnly) {
      rows.push({
        key: getLastPathSegment(path),
        path,
        type: "array",
        depth,
      });
    }

    value.forEach((item, index) => {
      const nextPath = options.includeArrayIndexes
        ? path
          ? `${path}.${index}`
          : String(index)
        : path;

      rows.push(...collectKeys(item, options, nextPath, depth + 1));
    });

    return rows;
  }

  if (isPlainObject(value)) {
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      const nextPath = path ? `${path}.${key}` : key;
      const itemType = getValueType(item);
      const isLeaf = !isObjectLike(item);

      if (!options.includeLeafOnly || isLeaf) {
        rows.push({
          key,
          path: nextPath,
          type: itemType,
          depth: depth + 1,
        });
      }

      if (isObjectLike(item)) {
        rows.push(...collectKeys(item, options, nextPath, depth + 1));
      }
    });

    return rows;
  }

  if (path) {
    rows.push({
      key: getLastPathSegment(path),
      path,
      type: getValueType(value),
      depth,
    });
  }

  return rows;
}

function formatOutput(rows: ExtractedKey[], mode: OutputMode) {
  if (mode === "paths") {
    return Array.from(new Set(rows.map((row) => row.path))).join("\n");
  }

  if (mode === "unique") {
    return Array.from(new Set(rows.map((row) => row.key))).sort().join("\n");
  }

  return rows
    .map(
      (row) =>
        `${row.path}\n  key: ${row.key}\n  type: ${row.type}\n  depth: ${row.depth}`
    )
    .join("\n\n");
}

function buildSummary(rows: ExtractedKey[]) {
  const uniqueKeys = new Set(rows.map((row) => row.key)).size;
  const maxDepth = rows.reduce((max, row) => Math.max(max, row.depth), 0);

  return `Found ${rows.length} key paths, ${uniqueKeys} unique key names, and maximum depth ${maxDepth}.`;
}

function getValueType(value: unknown) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function getLastPathSegment(path: string) {
  const parts = path.split(".");
  return parts[parts.length - 1] || path;
}

function isObjectLike(value: unknown) {
  return value !== null && typeof value === "object";
}

function isPlainObject(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
