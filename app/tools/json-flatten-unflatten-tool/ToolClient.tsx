"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "flatten" | "unflatten";

const nestedExample = `{
  "user": {
    "id": 101,
    "name": "Yoryantra User",
    "profile": {
      "role": "developer",
      "active": true
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

const flatExample = `{
  "user.id": 101,
  "user.name": "Yoryantra User",
  "user.profile.role": "developer",
  "user.profile.active": true,
  "settings.theme": "light",
  "settings.notifications.email": true,
  "settings.notifications.sms": false
}`;

export default function ToolClient() {
  const [mode, setMode] = useState<Mode>("flatten");
  const [input, setInput] = useState(nestedExample);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const processJson = () => {
    if (!input.trim()) {
      setError("Please enter JSON input.");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);

      if (mode === "flatten") {
        const flattened = flattenJson(parsed);
        setOutput(JSON.stringify(flattened, null, 2));
      } else {
        if (!isPlainObject(parsed)) {
          throw new Error("Unflatten mode expects a JSON object with flattened keys.");
        }

        const unflattened = unflattenJson(parsed as Record<string, unknown>);
        setOutput(JSON.stringify(unflattened, null, 2));
      }

      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process this JSON."
      );
      setOutput("");
    }
  };

  const loadExample = () => {
    if (mode === "flatten") {
      setInput(nestedExample);
    } else {
      setInput(flatExample);
    }

    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const switchMode = (value: string) => {
    const nextMode = value as Mode;

    setMode(nextMode);
    setInput(nextMode === "flatten" ? nestedExample : flatExample);
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="JSON Flatten / Unflatten Tool"
      description="Flatten nested JSON into dot notation paths or rebuild nested JSON from flattened key paths directly in your browser."
    >
      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            JSON Input
          </label>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={mode === "flatten" ? nestedExample : flatExample}
            className="w-full min-h-[300px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste nested JSON to flatten, or flattened key-path JSON to rebuild
            into a nested object.
          </p>
        </div>

        <div>
          <YoryantraSelect
            label="Mode"
            value={mode}
            onChange={switchMode}
            options={[
              {
                label: "Flatten JSON",
                value: "flatten",
              },
              {
                label: "Unflatten JSON",
                value: "unflatten",
              },
            ]}
          />

          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
            <p className="font-medium text-gray-900">
              {mode === "flatten" ? "Flatten mode" : "Unflatten mode"}
            </p>

            <p className="mt-2">
              {mode === "flatten"
                ? "Converts nested objects into flat dot notation keys."
                : "Rebuilds nested objects from flat dot notation keys."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={processJson} className="yoryantra-btn">
          {mode === "flatten" ? "Flatten JSON" : "Unflatten JSON"}
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
            Output
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
          {output || "Flattened or unflattened JSON will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON processing happens directly in your browser. Your input is not
        uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Flattening and Rebuilding Nested JSON for Data Workflows
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Nested JSON is common in API responses, configuration files, logs,
            analytics exports, and structured data. Flattening JSON makes deeply
            nested values easier to inspect, compare, store in spreadsheets, or
            map into key-value workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON Flatten / Unflatten Tool lets you convert nested objects
            into dot notation keys and rebuild flat JSON back into nested
            objects. It is useful when debugging APIs, preparing data
            transformations, comparing payloads, or cleaning structured exports.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Flatten / Unflatten Tool
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select whether you want to flatten or unflatten JSON.</li>
            <li>Paste valid JSON into the input area.</li>
            <li>
              Click <strong>Flatten JSON</strong> or <strong>Unflatten JSON</strong>.
            </li>
            <li>Review the output and copy it for your workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Flattening API responses for debugging.</li>
            <li>Preparing JSON for spreadsheet-style inspection.</li>
            <li>Converting nested configuration data into key-value paths.</li>
            <li>Rebuilding flat dot notation data into nested JSON.</li>
            <li>Comparing nested structures more easily during development.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Flattened JSON
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "user.profile.role": "developer",
  "settings.notifications.email": true
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
                What does flattening JSON mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Flattening JSON converts nested objects into a single-level
                object where each key represents the original nested path.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does unflattening JSON mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Unflattening JSON rebuilds a nested object from flat keys such
                as user.profile.name or settings.notifications.email.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support arrays?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Arrays are flattened using numeric path segments and can be
                rebuilt where numeric keys indicate array indexes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The flattening and unflattening process happens directly in
                your browser.
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
            <Link href="/tools/json-diff-checker" className="yoryantra-btn-outline">
              JSON Diff Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function flattenJson(value: unknown, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const key = prefix ? `${prefix}.${index}` : String(index);

      if (isObjectLike(item)) {
        Object.assign(result, flattenJson(item, key));
      } else {
        result[key] = item;
      }
    });

    return result;
  }

  if (isPlainObject(value)) {
    Object.entries(value).forEach(([key, item]) => {
      const nextKey = prefix ? `${prefix}.${key}` : key;

      if (isObjectLike(item)) {
        Object.assign(result, flattenJson(item, nextKey));
      } else {
        result[nextKey] = item;
      }
    });

    return result;
  }

  if (!prefix) {
    throw new Error("Flatten mode expects a JSON object or array.");
  }

  result[prefix] = value;
  return result;
}

function unflattenJson(flatObject: Record<string, unknown>) {
  const result: Record<string, unknown> = {};

  Object.entries(flatObject).forEach(([path, value]) => {
    if (!path.trim()) {
      return;
    }

    const parts = path.split(".").filter(Boolean);
    let current: Record<string, unknown> = result;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const nextPart = parts[index + 1];
      const shouldCreateArray = nextPart !== undefined && /^\d+$/.test(nextPart);

      if (isLast) {
        current[part] = value;
        return;
      }

      if (!(part in current) || !isObjectLike(current[part])) {
        current[part] = shouldCreateArray ? [] : {};
      }

      current = current[part] as Record<string, unknown>;
    });
  });

  return result;
}

function isObjectLike(value: unknown) {
  return value !== null && typeof value === "object";
}

function isPlainObject(value: unknown) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}
