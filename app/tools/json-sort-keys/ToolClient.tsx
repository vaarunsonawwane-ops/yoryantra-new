"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type SortDirection = "asc" | "desc";

const sampleJson = `{
  "zebra": "last",
  "user": {
    "name": "Yoryantra User",
    "active": true,
    "id": 101,
    "profile": {
      "role": "developer",
      "country": "India",
      "skills": ["JSON", "APIs", "Debugging"]
    }
  },
  "alpha": "first",
  "settings": {
    "theme": "light",
    "notifications": {
      "sms": false,
      "email": true
    }
  }
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [sortNestedKeys, setSortNestedKeys] = useState(true);
  const [preserveArrayOrder, setPreserveArrayOrder] = useState(true);

  const sortJsonKeys = () => {
    if (!input.trim()) {
      setError("Please enter JSON input.");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const sorted = sortValue(parsed, {
        direction: sortDirection,
        sortNestedKeys,
        preserveArrayOrder,
      });

      setOutput(JSON.stringify(sorted, null, 2));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse and sort this JSON."
      );
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleJson);
    setOutput("");
    setError("");
    setSortDirection("asc");
    setSortNestedKeys(true);
    setPreserveArrayOrder(true);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setSortDirection("asc");
    setSortNestedKeys(true);
    setPreserveArrayOrder(true);
  };

  return (
    <ToolShell
      title="JSON Sort Keys Tool"
      description="Sort JSON object keys alphabetically, reorder nested JSON keys, and format structured JSON directly in your browser."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_280px]">
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
            Paste JSON from an API response, config file, export, or structured
            data payload to sort its object keys.
          </p>
        </div>

        <div>
          <YoryantraSelect
            label="Sort Direction"
            value={sortDirection}
            onChange={(value) => {
              setSortDirection(value as SortDirection);
              setOutput("");
              setError("");
            }}
            options={[
              {
                label: "A to Z",
                value: "asc",
              },
              {
                label: "Z to A",
                value: "desc",
              },
            ]}
          />

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Sort Options
            </h3>

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={sortNestedKeys}
                  onChange={(event) => {
                    setSortNestedKeys(event.target.checked);
                    setOutput("");
                    setError("");
                  }}
                  className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Sort nested keys
                  </span>

                  <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                    Sort keys inside nested objects, not just the top level.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={preserveArrayOrder}
                  onChange={(event) => {
                    setPreserveArrayOrder(event.target.checked);
                    setOutput("");
                    setError("");
                  }}
                  className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Preserve array order
                  </span>

                  <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                    Keep array item order unchanged while sorting objects.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={sortJsonKeys} className="yoryantra-btn">
          Sort JSON Keys
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

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Sorted JSON Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Sorted JSON output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON sorting happens directly in your browser. Your JSON input is not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Sorting JSON Keys for Cleaner Data Review
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON objects often arrive in inconsistent key order, especially when
            they come from APIs, generated configuration files, exported data,
            test fixtures, or logs. Sorting JSON keys makes payloads easier to
            compare, review, document, and commit into version control.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Sort Keys Tool reorders object keys alphabetically while
            preserving the structure of your data. You can sort only the top
            level or include nested objects, making it useful for debugging API
            responses, cleaning configuration files, comparing JSON changes, and
            preparing stable test data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sorting JSON Object Keys Without Changing Values
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste valid JSON into the input box.</li>
            <li>Select ascending or descending key order.</li>
            <li>Choose whether nested object keys should also be sorted.</li>
            <li>
              Click <strong>Sort JSON Keys</strong> and copy the formatted output.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON Sort Keys Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Cleaning API responses before comparing them.</li>
            <li>Preparing stable JSON fixtures for tests.</li>
            <li>Making configuration files easier to review.</li>
            <li>Reducing noisy diffs in version control.</li>
            <li>Organizing nested JSON data for documentation.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Before and After
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Before:
{
  "zebra": true,
  "alpha": true
}

After:
{
  "alpha": true,
  "zebra": true
}`}
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
                What does sorting JSON keys mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Sorting JSON keys means reordering object property names
                alphabetically while keeping values and structure intact.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this change JSON values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only changes object key order and formatting. It
                does not intentionally change values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this sort nested JSON keys?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable nested key sorting to reorder keys inside nested
                objects throughout the JSON structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Sorting happens directly in your browser, and your JSON is
                not uploaded to a server.
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

            <Link href="/tools/json-diff-checker" className="yoryantra-btn-outline">
              JSON Diff Checker
            </Link>

            <Link href="/tools/json-key-extractor" className="yoryantra-btn-outline">
              JSON Key Extractor
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function sortValue(
  value: unknown,
  options: {
    direction: SortDirection;
    sortNestedKeys: boolean;
    preserveArrayOrder: boolean;
  },
  isRoot = true
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) =>
      options.sortNestedKeys ? sortValue(item, options, false) : item
    );
  }

  if (isPlainObject(value)) {
    if (!isRoot && !options.sortNestedKeys) {
      return value;
    }

    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) =>
        options.direction === "asc"
          ? a.localeCompare(b)
          : b.localeCompare(a)
    );

    const sorted: Record<string, unknown> = {};

    entries.forEach(([key, item]) => {
      sorted[key] = options.sortNestedKeys
        ? sortValue(item, options, false)
        : item;
    });

    return sorted;
  }

  return value;
}

function isPlainObject(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
