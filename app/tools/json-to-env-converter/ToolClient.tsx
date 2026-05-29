"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type QuoteMode = "auto" | "always" | "never";
type ArrayMode = "json" | "comma" | "indexed";
type NullMode = "empty" | "skip" | "literal";
type KeyStyle = "uppercase" | "preserve";

type EnvVariable = {
  key: string;
  value: string;
  path: string;
};

type ConvertOptions = {
  quoteMode: QuoteMode;
  arrayMode: ArrayMode;
  nullMode: NullMode;
  keyStyle: KeyStyle;
  flattenNestedKeys: boolean;
  includeExportPrefix: boolean;
};

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
  "auth": {
    "jwtSecret": "change me",
    "issuer": "yoryantra"
  },
  "features": ["JSON", "APIs", "Debugging"],
  "debug": false,
  "emptyValue": null
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [quoteMode, setQuoteMode] = useState<QuoteMode>("auto");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("json");
  const [nullMode, setNullMode] = useState<NullMode>("empty");
  const [keyStyle, setKeyStyle] = useState<KeyStyle>("uppercase");
  const [flattenNestedKeys, setFlattenNestedKeys] = useState(true);
  const [includeExportPrefix, setIncludeExportPrefix] = useState(false);
  const [copied, setCopied] = useState(false);

  const convertJsonToEnv = () => {
    if (!input.trim()) {
      setError("Please enter JSON input.");
      setOutput("");
      setVariables([]);
      setCopied(false);
      return;
    }

    try {
      const parsed = JSON.parse(input);

      if (!isPlainObject(parsed)) {
        setError("Please enter a JSON object. ENV variables need object keys.");
        setOutput("");
        setVariables([]);
        setCopied(false);
        return;
      }

      const nextVariables = buildEnvVariables(parsed, {
        quoteMode,
        arrayMode,
        nullMode,
        keyStyle,
        flattenNestedKeys,
        includeExportPrefix,
      });

      if (nextVariables.length === 0) {
        setError(
          "No ENV variables were generated. Check whether null values are skipped or the JSON object is empty."
        );
        setOutput("");
        setVariables([]);
        setCopied(false);
        return;
      }

      const duplicateKeys = findDuplicateKeys(nextVariables.map((item) => item.key));

      if (duplicateKeys.length > 0) {
        setError(
          `Duplicate ENV keys were generated after formatting: ${duplicateKeys.join(
            ", "
          )}. Rename the original JSON keys or change the structure.`
        );
        setOutput("");
        setVariables([]);
        setCopied(false);
        return;
      }

      const envOutput = nextVariables
        .map(({ key, value }) => {
          const prefix = includeExportPrefix ? "export " : "";
          return `${prefix}${key}=${formatEnvValue(value, quoteMode)}`;
        })
        .join("\n");

      setOutput(envOutput);
      setVariables(nextVariables);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse and convert this JSON."
      );
      setOutput("");
      setVariables([]);
      setCopied(false);
    }
  };

  const formatJsonInput = () => {
    if (!input.trim()) {
      setError("Please enter JSON input.");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to format this JSON."
      );
    }
  };

  const minifyJsonInput = () => {
    if (!input.trim()) {
      setError("Please enter JSON input.");
      return;
    }

    try {
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to minify this JSON."
      );
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleJson);
    setOutput("");
    setError("");
    setVariables([]);
    setQuoteMode("auto");
    setArrayMode("json");
    setNullMode("empty");
    setKeyStyle("uppercase");
    setFlattenNestedKeys(true);
    setIncludeExportPrefix(false);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setVariables([]);
    setQuoteMode("auto");
    setArrayMode("json");
    setNullMode("empty");
    setKeyStyle("uppercase");
    setFlattenNestedKeys(true);
    setIncludeExportPrefix(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="JSON to ENV Converter"
      description="Convert JSON into .env variables, flatten nested JSON keys, and generate dotenv-ready environment variables directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setVariables([]);
            setError("");
            setCopied(false);
          }}
          placeholder={sampleJson}
          className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste JSON from a config file, API response, dashboard export, app
          settings object, or structured payload to turn it into dotenv
          variables.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={formatJsonInput} className="yoryantra-btn-outline">
            Format JSON
          </button>

          <button onClick={minifyJsonInput} className="yoryantra-btn-outline">
            Minify JSON
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          ENV Formatting Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Quote Values"
            value={quoteMode}
            onChange={(value) => {
              setQuoteMode(value as QuoteMode);
              setOutput("");
              setVariables([]);
              setError("");
              setCopied(false);
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

          <YoryantraSelect
            label="Array Values"
            value={arrayMode}
            onChange={(value) => {
              setArrayMode(value as ArrayMode);
              setOutput("");
              setVariables([]);
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "JSON String",
                value: "json",
              },
              {
                label: "Comma Separated",
                value: "comma",
              },
              {
                label: "Indexed Keys",
                value: "indexed",
              },
            ]}
          />

          <YoryantraSelect
            label="Null Values"
            value={nullMode}
            onChange={(value) => {
              setNullMode(value as NullMode);
              setOutput("");
              setVariables([]);
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Empty",
                value: "empty",
              },
              {
                label: "Skip",
                value: "skip",
              },
              {
                label: "Literal null",
                value: "literal",
              },
            ]}
          />

          <YoryantraSelect
            label="Key Style"
            value={keyStyle}
            onChange={(value) => {
              setKeyStyle(value as KeyStyle);
              setOutput("");
              setVariables([]);
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Uppercase",
                value: "uppercase",
              },
              {
                label: "Preserve",
                value: "preserve",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={flattenNestedKeys}
              onChange={(event) => {
                setFlattenNestedKeys(event.target.checked);
                setOutput("");
                setVariables([]);
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Flatten nested keys
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Convert paths like database.host into DATABASE_HOST instead of
                keeping nested objects as JSON strings.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeExportPrefix}
              onChange={(event) => {
                setIncludeExportPrefix(event.target.checked);
                setOutput("");
                setVariables([]);
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Add export prefix
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Generate shell-style output like export API_KEY=value.
              </span>
            </span>
          </label>
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

      {variables.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Key Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Review how JSON paths are mapped before copying the final .env
            output.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">JSON Path</th>
                  <th className="px-4 py-3 font-semibold">ENV Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {variables.map((item) => (
                  <tr key={`${item.path}-${item.key}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {item.path}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                      {item.key}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      <span className="block max-w-[320px] truncate">
                        {item.value}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            ENV Output
          </h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
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
            JSON is useful when configuration is structured, nested, and easy to
            read. But local development files, deployment dashboards, Docker
            setups, and CI/CD tools often expect simple dotenv variables instead
            of nested JSON objects.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This JSON to ENV Converter turns JSON object keys into clean .env
            variables while preserving the original values. You can flatten
            nested paths, quote values safely, format arrays, handle null values,
            and copy the generated environment variables into your project.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating .env Variables From JSON Without Rewriting Every Key
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste valid JSON into the input box.</li>
            <li>Select how values should be quoted.</li>
            <li>Choose whether nested object keys should be flattened.</li>
            <li>Select how arrays and null values should be handled.</li>
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
            <li>Preparing API keys and service URLs for app setup.</li>
            <li>Flattening nested app settings before adding them to CI/CD tools.</li>
            <li>Generating dotenv values for Node.js, Next.js, Docker, and scripts.</li>
            <li>Creating .env.example files from structured JSON documentation.</li>
            <li>Cleaning exported dashboard settings before sharing setup steps.</li>
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
            Flattening Nested JSON Keys for Dotenv Files
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Nested JSON is common in API responses and configuration exports.
            Dotenv files are usually flat. When nested key flattening is enabled,
            this tool turns paths like database.host, api.baseUrl, and
            auth.jwtSecret into DATABASE_HOST, API_BASE_URL, and AUTH_JWT_SECRET.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This keeps the generated variables readable without losing the
            meaning of the original JSON structure. It also makes the output
            easier to paste into hosting dashboards, shell scripts, and project
            documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quoting ENV Values Safely
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Some environment values are safe without quotes, while others need
            quotes because they contain spaces, hash symbols, equal signs, line
            breaks, quotes, or special characters. Auto quote mode keeps simple
            values clean and quotes only values that are likely to need it.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            You can also force every value to be quoted or leave every value
            unquoted. This is helpful when your project or deployment platform
            expects a specific dotenv style.
          </p>
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
                JSON to ENV conversion means turning object keys and values into
                dotenv-style variables such as API_KEY=value or
                DATABASE_HOST=localhost.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this convert nested JSON keys?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable nested key flattening to convert paths like
                database.host into DATABASE_HOST and api.baseUrl into
                API_BASE_URL.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this change JSON values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool formats JSON values as environment variables. It
                does not intentionally change strings, numbers, booleans, or
                array contents.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How are arrays converted?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Arrays can be stored as JSON strings, converted into
                comma-separated values, or expanded into indexed keys depending
                on the selected option.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should ENV values be quoted?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Values with spaces, hashes, equal signs, quotes, or line breaks
                are safer when quoted. Auto quote mode only quotes values when
                needed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use this for Next.js environment variables?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can convert JSON into regular environment variables for
                Next.js. Only use public prefixes such as NEXT_PUBLIC for values
                that are safe to expose in the browser.
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

            <Link href="/tools/env-to-json-converter" className="yoryantra-btn-outline">
              ENV to JSON Converter
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

function buildEnvVariables(
  value: Record<string, unknown>,
  options: ConvertOptions,
  parentKey = "",
  parentPath = ""
): EnvVariable[] {
  const variables: EnvVariable[] = [];

  Object.entries(value).forEach(([key, item]) => {
    const normalizedKey = normalizeEnvKey(key, options.keyStyle);
    const envKey = parentKey ? `${parentKey}_${normalizedKey}` : normalizedKey;
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (isPlainObject(item) && options.flattenNestedKeys) {
      variables.push(
        ...buildEnvVariables(item, options, envKey, currentPath)
      );
      return;
    }

    if (isPlainObject(item) && !options.flattenNestedKeys) {
      variables.push({
        key: envKey,
        value: JSON.stringify(item),
        path: currentPath,
      });
      return;
    }

    if (Array.isArray(item)) {
      if (options.arrayMode === "indexed") {
        item.forEach((arrayItem, index) => {
          variables.push({
            key: `${envKey}_${index}`,
            value: stringifyEnvValue(arrayItem),
            path: `${currentPath}.${index}`,
          });
        });

        if (item.length === 0 && options.nullMode !== "skip") {
          variables.push({
            key: envKey,
            value: "[]",
            path: currentPath,
          });
        }

        return;
      }

      variables.push({
        key: envKey,
        value:
          options.arrayMode === "comma"
            ? item.map((entry) => stringifyEnvValue(entry)).join(",")
            : JSON.stringify(item),
        path: currentPath,
      });
      return;
    }

    if (item === null || item === undefined || item === "") {
      if (options.nullMode === "skip") {
        return;
      }

      variables.push({
        key: envKey,
        value: options.nullMode === "literal" ? "null" : "",
        path: currentPath,
      });

      return;
    }

    variables.push({
      key: envKey,
      value: stringifyEnvValue(item),
      path: currentPath,
    });
  });

  return variables;
}

function normalizeEnvKey(key: string, keyStyle: KeyStyle) {
  const normalized = key
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");

  return keyStyle === "uppercase" ? normalized.toUpperCase() : normalized;
}

function stringifyEnvValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "boolean") {
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

function findDuplicateKeys(keys: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  keys.forEach((key) => {
    if (seen.has(key)) {
      duplicates.add(key);
    }

    seen.add(key);
  });

  return Array.from(duplicates);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
