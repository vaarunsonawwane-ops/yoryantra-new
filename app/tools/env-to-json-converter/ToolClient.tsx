"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ValueMode = "auto" | "string";
type KeyMode = "nested" | "flat";
type OutputSpacing = "two" | "four" | "compact";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type ParsedEnvLine = {
  key: string;
  value: string;
  lineNumber: number;
};

const sampleEnv = `DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_SSL=true
API_KEY=secret-key
API_BASE_URL=https://api.example.com
USER_NAME="Yoryantra User"
USER_ACTIVE=true
FEATURES=["JSON","APIs","Debugging"]`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleEnv);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [parsedLines, setParsedLines] = useState<ParsedEnvLine[]>([]);
  const [valueMode, setValueMode] = useState<ValueMode>("auto");
  const [keyMode, setKeyMode] = useState<KeyMode>("nested");
  const [outputSpacing, setOutputSpacing] = useState<OutputSpacing>("two");
  const [ignoreComments, setIgnoreComments] = useState(true);
  const [stripExportKeyword, setStripExportKeyword] = useState(true);
  const [copied, setCopied] = useState(false);

  const convertEnvToJson = () => {
    if (!input.trim()) {
      setError("Please enter ENV input.");
      setOutput("");
      setParsedLines([]);
      setCopied(false);
      return;
    }

    try {
      const lines = parseEnvInput(input, {
        ignoreComments,
        stripExportKeyword,
      });

      if (lines.length === 0) {
        setError("No ENV variables were found in this input.");
        setOutput("");
        setParsedLines([]);
        setCopied(false);
        return;
      }

      const jsonObject = createJsonObject(lines, {
        valueMode,
        keyMode,
      });

      setOutput(JSON.stringify(jsonObject, null, getSpacingValue(outputSpacing)));
      setParsedLines(lines);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse and convert this ENV input."
      );
      setOutput("");
      setParsedLines([]);
      setCopied(false);
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
    setInput(sampleEnv);
    setOutput("");
    setError("");
    setParsedLines([]);
    setValueMode("auto");
    setKeyMode("nested");
    setOutputSpacing("two");
    setIgnoreComments(true);
    setStripExportKeyword(true);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setParsedLines([]);
    setValueMode("auto");
    setKeyMode("nested");
    setOutputSpacing("two");
    setIgnoreComments(true);
    setStripExportKeyword(true);
    setCopied(false);
  };

  return (
    <ToolShell
      title="ENV to JSON Converter"
      description="Convert .env variables into JSON, parse dotenv key-value pairs, nest environment keys, and format clean JSON directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          ENV Input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setError("");
            setParsedLines([]);
            setCopied(false);
          }}
          placeholder={sampleEnv}
          className="w-full min-h-[340px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste .env variables, dotenv content, deployment settings, or
          shell-style key-value pairs to convert them into structured JSON.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          JSON Conversion Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Value Parsing"
            value={valueMode}
            onChange={(value) => {
              setValueMode(value as ValueMode);
              setOutput("");
              setError("");
              setParsedLines([]);
              setCopied(false);
            }}
            options={[
              {
                label: "Auto",
                value: "auto",
              },
              {
                label: "String Only",
                value: "string",
              },
            ]}
          />

          <YoryantraSelect
            label="Key Output"
            value={keyMode}
            onChange={(value) => {
              setKeyMode(value as KeyMode);
              setOutput("");
              setError("");
              setParsedLines([]);
              setCopied(false);
            }}
            options={[
              {
                label: "Nested JSON",
                value: "nested",
              },
              {
                label: "Flat Keys",
                value: "flat",
              },
            ]}
          />

          <YoryantraSelect
            label="Output Spacing"
            value={outputSpacing}
            onChange={(value) => {
              setOutputSpacing(value as OutputSpacing);
              setOutput("");
              setError("");
              setParsedLines([]);
              setCopied(false);
            }}
            options={[
              {
                label: "2 spaces",
                value: "two",
              },
              {
                label: "4 spaces",
                value: "four",
              },
              {
                label: "Compact",
                value: "compact",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={ignoreComments}
              onChange={(event) => {
                setIgnoreComments(event.target.checked);
                setOutput("");
                setError("");
                setParsedLines([]);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Ignore comments
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Skip lines that start with # and keep only ENV variables in the
                JSON output.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={stripExportKeyword}
              onChange={(event) => {
                setStripExportKeyword(event.target.checked);
                setOutput("");
                setError("");
                setParsedLines([]);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Strip export keyword
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Treat export API_KEY=value as API_KEY=value before converting.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertEnvToJson} className="yoryantra-btn">
          Convert ENV to JSON
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

      {parsedLines.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed ENV Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Review parsed keys and values before using the generated JSON.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">ENV Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {parsedLines.map((line) => (
                  <tr key={`${line.lineNumber}-${line.key}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {line.lineNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                      {line.key}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      <span className="block max-w-[360px] truncate">
                        {line.value}
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
            JSON Output
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
          {output || "Converted JSON output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        ENV to JSON conversion happens directly in your browser. Your ENV input
        is not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting ENV Variables Into Structured JSON
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Environment files are useful for local configuration, deployment
            settings, service credentials, API keys, feature flags, and runtime
            values. But when you need to review, document, transform, or move
            those settings into a structured config file, JSON is often easier to
            read and work with.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This ENV to JSON Converter parses dotenv-style key-value pairs and
            turns them into clean JSON. You can keep keys flat or nest underscore
            separated names, making it useful for debugging app configuration,
            preparing documentation, converting deployment settings, and
            reviewing environment files in a more structured format.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating JSON From .env Files Without Manual Editing
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste valid .env content into the input box.</li>
            <li>Select whether values should be parsed automatically or kept as strings.</li>
            <li>Choose whether underscore-separated ENV keys should become nested JSON.</li>
            <li>Select the spacing style for the generated JSON output.</li>
            <li>
              Click <strong>Convert ENV to JSON</strong> and copy the formatted output.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common ENV to JSON Converter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Turning .env files into structured JSON configuration.</li>
            <li>Reviewing deployment environment variables in a readable format.</li>
            <li>Converting dotenv values before sharing app setup documentation.</li>
            <li>Preparing JSON config from Node.js, Next.js, Docker, or CI/CD variables.</li>
            <li>Checking API keys, service URLs, feature flags, and runtime settings together.</li>
            <li>Cleaning shell-style export lines before moving values into JSON.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Before and After
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Before:
DATABASE_HOST=localhost
DATABASE_PORT=5432
API_KEY=secret-key

After:
{
  "database": {
    "host": "localhost",
    "port": 5432
  },
  "api": {
    "key": "secret-key"
  }
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nesting ENV Keys Into JSON Objects
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Many environment variables use prefixes to show grouping, such as
            DATABASE_HOST, DATABASE_PORT, API_BASE_URL, or USER_ACTIVE. Nested
            mode converts those underscore-separated names into JSON objects so
            related values sit together.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Flat mode keeps the original ENV keys exactly as top-level JSON
            properties. This is useful when you want a direct key-value export
            without changing names or grouping values.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does ENV to JSON conversion mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                ENV to JSON conversion means parsing dotenv key-value lines like
                API_KEY=value and turning them into a JSON object that is easier
                to inspect, copy, document, or transform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this create nested JSON from ENV keys?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Enable nested key conversion to turn names like
                DATABASE_HOST and API_BASE_URL into database.host and
                api.base.url in the JSON output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this parse numbers and booleans?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Auto parsing converts values such as true, false, null,
                numbers, arrays, and JSON objects when they are written in a
                recognizable format. You can also keep all values as strings.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this handle quoted ENV values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Quoted values are unwrapped, common escaped characters are
                handled, and values with equals signs are preserved after the
                first key-value separator.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What happens to comments?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Comment lines that start with # can be ignored. Disable the
                option if you want the tool to warn about lines that are not
                valid key-value pairs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my ENV file uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser, and your ENV
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

            <Link href="/tools/json-validator" className="yoryantra-btn-outline">
              JSON Validator
            </Link>

            <Link href="/tools/json-sort-keys" className="yoryantra-btn-outline">
              JSON Sort Keys
            </Link>

            <Link href="/tools/json-to-env-converter" className="yoryantra-btn-outline">
              JSON to ENV Converter
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

function parseEnvInput(
  input: string,
  options: {
    ignoreComments: boolean;
    stripExportKeyword: boolean;
  }
): ParsedEnvLine[] {
  const lines = input.split(/\r?\n/);
  const parsed: ParsedEnvLine[] = [];

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line) {
      return;
    }

    if (options.ignoreComments && line.startsWith("#")) {
      return;
    }

    const normalizedLine =
      options.stripExportKeyword && line.startsWith("export ")
        ? line.slice("export ".length).trim()
        : line;

    const equalsIndex = findFirstUnquotedEquals(normalizedLine);

    if (equalsIndex === -1) {
      throw new Error(`Line ${index + 1} is missing an equals sign.`);
    }

    const key = normalizedLine.slice(0, equalsIndex).trim();
    const rawValue = normalizedLine.slice(equalsIndex + 1).trim();

    if (!key) {
      throw new Error(`Line ${index + 1} has an empty key.`);
    }

    if (!isValidEnvKey(key)) {
      throw new Error(`Line ${index + 1} has an invalid ENV key: ${key}`);
    }

    parsed.push({
      key,
      value: unwrapEnvValue(rawValue),
      lineNumber: index + 1,
    });
  });

  return parsed;
}

function createJsonObject(
  lines: ParsedEnvLine[],
  options: {
    valueMode: ValueMode;
    keyMode: KeyMode;
  }
): Record<string, JsonValue> {
  const output: Record<string, JsonValue> = {};

  lines.forEach(({ key, value }) => {
    const parsedValue =
      options.valueMode === "auto" ? parseEnvValue(value) : value;

    if (options.keyMode === "flat") {
      output[key] = parsedValue;
      return;
    }

    const path = key
      .toLowerCase()
      .split("_")
      .map((part) => part.trim())
      .filter(Boolean);

    if (path.length === 0) {
      output[key] = parsedValue;
      return;
    }

    setNestedValue(output, path, parsedValue);
  });

  return output;
}

function setNestedValue(
  target: Record<string, JsonValue>,
  path: string[],
  value: JsonValue
) {
  let current: Record<string, JsonValue> = target;

  path.forEach((part, index) => {
    const isLast = index === path.length - 1;

    if (isLast) {
      current[part] = value;
      return;
    }

    const existing = current[part];

    if (!isPlainObject(existing)) {
      current[part] = {};
    }

    current = current[part] as Record<string, JsonValue>;
  });
}

function parseEnvValue(value: string): JsonValue {
  const trimmed = value.trim();

  if (trimmed === "") {
    return "";
  }

  if (trimmed === "true") {
    return true;
  }

  if (trimmed === "false") {
    return false;
  }

  if (trimmed === "null") {
    return null;
  }

  if (isNumericString(trimmed)) {
    return Number(trimmed);
  }

  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed) as JsonValue;
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function unwrapEnvValue(value: string) {
  if (value.length < 2) {
    return value;
  }

  const first = value[0];
  const last = value[value.length - 1];

  if (
    (first === '"' && last === '"') ||
    (first === "'" && last === "'")
  ) {
    return value
      .slice(1, -1)
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\r")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, "\\");
  }

  return value;
}

function findFirstUnquotedEquals(value: string) {
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if ((char === '"' || char === "'") && quote === null) {
      quote = char;
      continue;
    }

    if (char === quote) {
      quote = null;
      continue;
    }

    if (char === "=" && quote === null) {
      return index;
    }
  }

  return -1;
}

function getSpacingValue(outputSpacing: OutputSpacing) {
  if (outputSpacing === "four") {
    return 4;
  }

  if (outputSpacing === "compact") {
    return 0;
  }

  return 2;
}

function isValidEnvKey(key: string) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
}

function isNumericString(value: string) {
  if (value.trim() === "") {
    return false;
  }

  return /^-?\d+(\.\d+)?$/.test(value);
}

function isPlainObject(value: unknown): value is Record<string, JsonValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
