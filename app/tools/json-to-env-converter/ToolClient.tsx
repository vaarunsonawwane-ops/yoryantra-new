"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type QuoteMode = "auto" | "always" | "never";

const sampleJson = `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "ssl": true
  },
  "api": {
    "key": "secret-key",
    "baseUrl": "https://api.example.com",
    "timeout": 30000
  },
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
  const [quoteMode, setQuoteMode] = useState<QuoteMode>("auto");
  const [flattenNestedKeys, setFlattenNestedKeys] = useState(true);
  const [preserveArrayValues, setPreserveArrayValues] = useState(true);

  const convertJsonToEnv = () => {
    if (!input.trim()) {
      setError("Please enter JSON input.");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);

      if (!isPlainObject(parsed)) {
        setError("Please enter a JSON object. ENV variables need object keys.");
        setOutput("");
        return;
      }

      const envVariables = convertValueToEnv(parsed, {
        flattenNestedKeys,
        preserveArrayValues,
      });

      if (envVariables.length === 0) {
        setError("No ENV variables could be generated from this JSON.");
        setOutput("");
        return;
      }

      const envOutput = envVariables
        .map(({ key, value }) => `${key}=${formatEnvValue(value, quoteMode)}`)
        .join("\n");

      setOutput(envOutput);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse and convert this JSON."
      );
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleJson);
    setOutput("");
    setError("");
    setQuoteMode("auto");
    setFlattenNestedKeys(true);
    setPreserveArrayValues(true);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setQuoteMode("auto");
    setFlattenNestedKeys(true);
    setPreserveArrayValues(true);
  };

  return (
    <ToolShell
      title="JSON to ENV Converter"
      description="Convert JSON into .env variables, flatten nested JSON keys, and generate dotenv-ready environment variables directly in your browser."
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
            data payload to convert its values into .env variables.
          </p>
        </div>

        <div>
          <YoryantraSelect
            label="Quote Values"
            value={quoteMode}
            onChange={(value) => {
              setQuoteMode(value as QuoteMode);
              setOutput("");
              setError("");
            }}
            options={[
              {
                label: "Auto",
                value: "auto",
              },
              {
                label: "Always",
                value: "always",
              },
              {
                label: "Never",
                value: "never",
              },
            ]}
          />

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-lg font-semibold text-gray-900">
              ENV Options
            </h3>

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={flattenNestedKeys}
                  onChange={(event) => {
                    setFlattenNestedKeys(event.target.checked);
                    setOutput("");
                    setError("");
                  }}
                  className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Flatten nested keys
                  </span>

                  <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                    Convert nested paths like database.host into DATABASE_HOST.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
                <input
                  type="checkbox"
                  checked={preserveArrayValues}
                  onChange={(event) => {
                    setPreserveArrayValues(event.target.checked);
                    setOutput("");
                    setError("");
                  }}
                  className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-900">
                    Preserve array values
                  </span>

                  <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                    Keep arrays as JSON strings instead of comma-separated text.
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertJsonToEnv} className="yoryantra-btn">
          Convert JSON to ENV
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
            ENV Output
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
          {output || "Generated .env output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        JSON to ENV conversion happens directly in your browser. Your JSON input
        is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting JSON Config Into Environment Variables
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON is often used for structured configuration, API examples,
            dashboard exports, local settings, generated files, and service
            credentials. Environment files use a different format: simple
            KEY=value lines that are easy for apps, scripts, and deployment
            platforms to read.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON to ENV Converter changes JSON object keys into dotenv
            variables while keeping values readable. You can flatten nested
            objects, preserve array values, quote values safely, and generate
            clean output for local development, CI/CD tools, Docker setups, and
            hosting dashboards.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating ENV Variables Without Rewriting JSON by Hand
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste valid JSON into the input box.</li>
            <li>Select whether values should be quoted automatically.</li>
            <li>Choose whether nested object keys should be flattened.</li>
            <li>
              Click <strong>Convert JSON to ENV</strong> and copy the formatted output.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common JSON to ENV Converter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Turning JSON config files into local .env variables.</li>
            <li>Preparing API keys, service URLs, and runtime settings.</li>
            <li>Flattening nested JSON before adding values to CI/CD tools.</li>
            <li>Creating .env.example files from structured documentation.</li>
            <li>Cleaning dashboard exports before sharing project setup steps.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example JSON to ENV Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Input:
{
  "database": {
    "host": "localhost",
    "port": 5432
  },
  "api": {
    "key": "secret-key"
  }
}

Output:
DATABASE_HOST=localhost
DATABASE_PORT=5432
API_KEY=secret-key`}
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
                What does JSON to ENV conversion mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON to ENV conversion means turning JSON object properties into
                dotenv-style environment variables such as API_KEY=value or
                DATABASE_HOST=localhost.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this change JSON values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool only converts the structure into ENV format. It
                does not intentionally change strings, numbers, booleans, or
                arrays.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this flatten nested JSON keys?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable nested key flattening to convert paths like
                database.host or api.baseUrl into DATABASE_HOST and API_BASE_URL.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my JSON uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser, and your JSON is
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

            <Link href="/tools/json-sort-keys" className="yoryantra-btn-outline">
              JSON Sort Keys
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

function convertValueToEnv(
  value: Record<string, unknown>,
  options: {
    flattenNestedKeys: boolean;
    preserveArrayValues: boolean;
  },
  parentKey = ""
): EnvVariable[] {
  const variables: EnvVariable[] = [];

  Object.entries(value).forEach(([key, item]) => {
    const envKey = parentKey
      ? `${parentKey}_${normalizeEnvKey(key)}`
      : normalizeEnvKey(key);

    if (isPlainObject(item) && options.flattenNestedKeys) {
      variables.push(...convertValueToEnv(item, options, envKey));
      return;
    }

    if (isPlainObject(item) && !options.flattenNestedKeys) {
      variables.push({
        key: envKey,
        value: JSON.stringify(item),
      });
      return;
    }

    if (Array.isArray(item)) {
      variables.push({
        key: envKey,
        value: options.preserveArrayValues
          ? JSON.stringify(item)
          : item.map((entry) => stringifyEnvValue(entry)).join(","),
      });
      return;
    }

    variables.push({
      key: envKey,
      value: stringifyEnvValue(item),
    });
  });

  return variables;
}

function normalizeEnvKey(key: string) {
  return key
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_")
    .toUpperCase();
}

function stringifyEnvValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value === null || value === undefined) {
    return "";
  }

  return JSON.stringify(value);
}

function formatEnvValue(value: string, quoteMode: QuoteMode) {
  if (quoteMode === "always") {
    return `"${escapeEnvValue(value)}"`;
  }

  if (quoteMode === "never") {
    return value;
  }

  if (needsQuotes(value)) {
    return `"${escapeEnvValue(value)}"`;
  }

  return value;
}

function needsQuotes(value: string) {
  return value === "" || /[\s#="'`\\\n\r]/.test(value);
}

function escapeEnvValue(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/"/g, '\\"');
}

function isPlainObject(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
