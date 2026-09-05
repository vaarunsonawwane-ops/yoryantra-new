"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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

type FormattedEnvValue = {
  text: string;
  usedBacktick: boolean;
};

const MAX_INPUT_CHARS = 1_000_000;
const MAX_ENV_VARIABLES = 5_000;

const sampleJson = `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "ssl": true
  },
  "api": {
    "baseUrl": "https://api.example.com",
    "token": "secret-value"
  },
  "owner": "Sneha",
  "features": ["JSON", "APIs", "Debugging"],
  "emptyText": "",
  "optionalValue": null
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleJson);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [quoteMode, setQuoteMode] = useState<QuoteMode>("auto");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("json");
  const [nullMode, setNullMode] = useState<NullMode>("empty");
  const [keyStyle, setKeyStyle] = useState<KeyStyle>("uppercase");
  const [flattenNestedKeys, setFlattenNestedKeys] = useState(true);
  const [includeExportPrefix, setIncludeExportPrefix] = useState(false);
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setOutput("");
    setError("");
    setWarnings([]);
    setVariables([]);
    setCopied(false);
  };

  const convertJsonToEnv = () => {
    if (!input.trim()) {
      setError("Paste a JSON object before converting.");
      setOutput("");
      setWarnings([]);
      setVariables([]);
      setCopied(false);
      return;
    }

    if (input.length > MAX_INPUT_CHARS) {
      setError(
        `Input is too large for an interactive browser conversion. Keep it under ${MAX_INPUT_CHARS.toLocaleString()} characters.`
      );
      setOutput("");
      setWarnings([]);
      setVariables([]);
      setCopied(false);
      return;
    }

    try {
      assertLosslessJsonText(input);
      const parsed = JSON.parse(input);

      if (!isPlainObject(parsed)) {
        throw new Error(
          "The root JSON value must be an object because environment-variable output needs named keys."
        );
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
        throw new Error(
          "No environment-variable assignments were generated. The object may be empty or every null value may be set to Skip."
        );
      }

      if (nextVariables.length > MAX_ENV_VARIABLES) {
        throw new Error(
          `The conversion would create more than ${MAX_ENV_VARIABLES.toLocaleString()} variables. Split the configuration into smaller parts.`
        );
      }

      const duplicateKeys = findDuplicateKeys(nextVariables.map((item) => item.key));

      if (duplicateKeys.length > 0) {
        throw new Error(
          `Key normalization produced duplicate ENV names: ${duplicateKeys.join(
            ", "
          )}. Rename the source fields or change the flattening strategy.`
        );
      }

      let usedBacktick = false;
      const lines = nextVariables.map(({ key, value }) => {
        const prefix = includeExportPrefix ? "export " : "";
        const formatted = formatEnvValue(value, quoteMode);
        usedBacktick = usedBacktick || formatted.usedBacktick;
        return `${prefix}${key}=${formatted.text}`;
      });

      const nextWarnings = getConversionWarnings({
        arrayMode,
        includeExportPrefix,
        usedBacktick,
        nullMode,
      });

      setOutput(lines.join("\n"));
      setVariables(nextVariables);
      setWarnings(nextWarnings);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The JSON could not be converted without changing its meaning."
      );
      setOutput("");
      setWarnings([]);
      setVariables([]);
      setCopied(false);
    }
  };

  const formatJsonInput = () => {
    if (!input.trim()) {
      setError("Paste JSON before formatting it.");
      return;
    }

    try {
      assertLosslessJsonText(input);
      setInput(JSON.stringify(JSON.parse(input), null, 2));
      clearResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The JSON could not be formatted safely.");
    }
  };

  const minifyJsonInput = () => {
    if (!input.trim()) {
      setError("Paste JSON before minifying it.");
      return;
    }

    try {
      assertLosslessJsonText(input);
      setInput(JSON.stringify(JSON.parse(input)));
      clearResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The JSON could not be minified safely.");
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      setCopied(false);
      setError(
        "The browser blocked clipboard access. Select the ENV output and copy it manually."
      );
    }
  };

  const loadExample = () => {
    setInput(sampleJson);
    setOutput("");
    setError("");
    setWarnings([]);
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
    setWarnings([]);
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
      description="Flatten JSON configuration into environment assignments with explicit array, null, and quoting choices."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          JSON input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleJson}
          spellCheck={false}
          className="min-h-[340px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          The root must be a JSON object. Duplicate member names and numbers that
          JavaScript would round are rejected before conversion.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={formatJsonInput}
            className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
          >
            Format JSON
          </button>

          <button
            onClick={minifyJsonInput}
            className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
          >
            Minify JSON
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          How JSON should become ENV lines
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Quote values"
            value={quoteMode}
            onChange={(value) => {
              setQuoteMode(value as QuoteMode);
              clearResult();
            }}
            options={[
              { label: "Only when needed", value: "auto" },
              { label: "Always quote", value: "always" },
              { label: "Never quote", value: "never" },
            ]}
          />

          <YoryantraSelect
            label="Arrays"
            value={arrayMode}
            onChange={(value) => {
              setArrayMode(value as ArrayMode);
              clearResult();
            }}
            options={[
              { label: "JSON text", value: "json" },
              { label: "Comma-separated text", value: "comma" },
              { label: "Indexed variables", value: "indexed" },
            ]}
          />

          <YoryantraSelect
            label="Null values"
            value={nullMode}
            onChange={(value) => {
              setNullMode(value as NullMode);
              clearResult();
            }}
            options={[
              { label: "Empty value", value: "empty" },
              { label: "Skip variable", value: "skip" },
              { label: "Literal text: null", value: "literal" },
            ]}
          />

          <YoryantraSelect
            label="Key letter case"
            value={keyStyle}
            onChange={(value) => {
              setKeyStyle(value as KeyStyle);
              clearResult();
            }}
            options={[
              { label: "UPPER_SNAKE_CASE", value: "uppercase" },
              { label: "Keep source letter case", value: "preserve" },
            ]}
          />
        </div>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={flattenNestedKeys}
              onChange={(event) => {
                setFlattenNestedKeys(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Flatten nested objects
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                database.host becomes DATABASE_HOST instead of JSON text in one value.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeExportPrefix}
              onChange={(event) => {
                setIncludeExportPrefix(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">
                Add export prefix
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Emit export NAME=value for parsers and shells that accept it.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertJsonToEnv}
          className="yoryantra-btn min-h-10 whitespace-nowrap"
        >
          Convert JSON to ENV
        </button>

        <button
          onClick={loadExample}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
          Load Example
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-10 whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          <p className="font-semibold text-amber-900">Conversion cautions</p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {variables.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated key preview
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Source paths are shown beside the normalized ENV names so collisions
            and naming changes are visible before copying.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">JSON path</th>
                  <th className="px-4 py-3 font-semibold">ENV key</th>
                  <th className="px-4 py-3 font-semibold">Value preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variables.map((item, index) => (
                  <tr key={`${item.key}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      {item.path}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">
                      {item.key}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      <span className="block max-w-[320px] truncate">
                        {isSensitiveEnvKey(item.key) ? "••••••••" : item.value}
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">ENV output</h3>

          {output && (
            <button
              onClick={copyOutput}
              className="yoryantra-btn-outline min-h-10 whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output min-h-[300px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Generated environment-variable assignments will appear here."}
        </pre>
      </div>

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          Conversion runs in this browser component. Secrets remain visible in
          the input, generated output, browser memory, and any clipboard copy you
          make.
        </div>

        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          Dotenv has no native nested-object, array, null, or numeric type. The
          selected flattening and serialization choices are conventions that
          your application must interpret consistently.
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Dotenv can only carry environment-variable text
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            JSON has objects, arrays, booleans, numbers, strings, and null.
            Environment variables do not preserve those types: applications read
            their values as strings. Turning JSON into .env text therefore needs
            decisions about key names and serialization, not just a change of
            punctuation.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            There is no single universal dotenv specification. Node.js documents
            one concrete format with variable-name rules, comments, quoted
            values, multiline quoted text, and optional export prefixes. It is a
            useful baseline when checking generated output: {" "}
            <a
              href="https://nodejs.org/api/environment_variables.html#env-files"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              Node.js .env documentation
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Nested JSON needs a naming convention
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            With flattening enabled, database.host becomes DATABASE_HOST and
            api.baseUrl becomes API_BASE_URL. Camel-case boundaries and
            punctuation are normalized into underscores, and a leading digit is
            prefixed with an underscore so the result remains a valid variable
            name under the Node.js rules.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            Normalization can make different JSON paths converge on the same ENV
            name. Those collisions are reported as errors rather than choosing a
            winner. If flattening is disabled, a nested object is serialized as
            JSON text inside one environment value instead.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Arrays have no native .env representation
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            JSON text is the least ambiguous option because the full array shape
            remains visible. Comma-separated output is easier for simple lists
            but becomes ambiguous when an element itself contains a comma.
            Indexed variables such as FEATURES_0 and FEATURES_1 are another
            convention and require matching application code.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Quoting preserves text; it does not create a data type
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Auto mode leaves simple values unquoted and quotes values that would
            otherwise be empty, contain whitespace, include comment syntax, or
            contain quote characters. The formatter chooses a delimiter that is
            not present in the value. If both single and double quotes are
            present, current Node.js environment-file parsing also accepts a
            backtick delimiter; other dotenv parsers may not, so that case is
            flagged. Node documents that syntax in its {" "}
            <a
              href="https://nodejs.org/api/cli.html#--env-filefile"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              --env-file documentation
            </a>
            .
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            Never-quote mode refuses values that need quoting instead of emitting
            text likely to be truncated or reinterpreted. That is safer than
            silently turning a value such as "hello # team" into "hello" under a
            parser that treats # as a comment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Null and empty string are different source values
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            An empty JSON string is always preserved as an empty ENV value. JSON
            null follows the selected policy: empty output, skipped variable, or
            literal text null. That literal is still the four-character string
            "null" when an application reads the environment; it does not remain
            a JSON null value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Precision and duplicate names are checked before parsing
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript JSON parsing can silently collapse duplicate object member
            names and can round numbers beyond its safe numeric range. The
            conversion stops before either change occurs. RFC 8259 notes that
            duplicate names are not interoperable because receivers handle them
            differently. See {" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc8259.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              RFC 8259
            </a>
            {" "}for the JSON interoperability guidance.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Treat generated secret files like the source configuration
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Converting a token or password to a different syntax does not reduce
            its sensitivity. Likely secret values are masked only in the preview;
            the actual ENV output remains complete. Keep generated files out of
            source control unless the values are intentionally non-secret, and
            be careful when copying them into tickets, terminals, or chat logs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/json-to-env-converter" />
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
  parentPath = "$"
): EnvVariable[] {
  const variables: EnvVariable[] = [];

  Object.entries(value).forEach(([key, item]) => {
    const currentPath = toJsonPath(parentPath, key);
    const normalizedKey = normalizeEnvKey(key, options.keyStyle, currentPath);
    const envKey = parentKey ? `${parentKey}_${normalizedKey}` : normalizedKey;

    if (isPlainObject(item) && options.flattenNestedKeys) {
      const childEntries = Object.keys(item);

      if (childEntries.length === 0) {
        variables.push({ key: envKey, value: "{}", path: currentPath });
      } else {
        variables.push(...buildEnvVariables(item, options, envKey, currentPath));
      }
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
        if (item.length === 0) {
          variables.push({ key: envKey, value: "[]", path: currentPath });
          return;
        }

        item.forEach((arrayItem, index) => {
          variables.push({
            key: `${envKey}_${index}`,
            value: stringifyEnvValue(arrayItem),
            path: `${currentPath}[${index}]`,
          });
        });
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

    if (item === null) {
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

function normalizeEnvKey(key: string, keyStyle: KeyStyle, path: string) {
  let normalized = key
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!normalized) {
    throw new Error(
      `${path} cannot produce an environment-variable name after normalization.`
    );
  }

  if (/^\d/.test(normalized)) {
    normalized = `_${normalized}`;
  }

  return keyStyle === "uppercase" ? normalized.toUpperCase() : normalized;
}

function stringifyEnvValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("A non-finite number cannot be represented in JSON or ENV output.");
    }
    return String(value);
  }

  if (typeof value === "boolean") {
    return String(value);
  }

  if (value === null) {
    return "null";
  }

  return JSON.stringify(value);
}

function formatEnvValue(value: string, quoteMode: QuoteMode): FormattedEnvValue {
  const requiresQuotes = needsQuotes(value);

  if (quoteMode === "never") {
    if (requiresQuotes) {
      throw new Error(
        "Never-quote mode cannot safely represent at least one value. Switch to automatic or always-quote mode."
      );
    }

    return { text: value, usedBacktick: false };
  }

  if (quoteMode === "auto" && !requiresQuotes) {
    return { text: value, usedBacktick: false };
  }

  return quoteEnvValue(value);
}

function quoteEnvValue(value: string): FormattedEnvValue {
  if (!value.includes('"')) {
    return { text: `"${value}"`, usedBacktick: false };
  }

  if (!value.includes("'")) {
    return { text: `'${value}'`, usedBacktick: false };
  }

  if (!value.includes("`")) {
    return { text: `\`${value}\``, usedBacktick: true };
  }

  throw new Error(
    "A value contains single quotes, double quotes, and backticks, so it has no delimiter-safe representation in the supported dotenv syntax."
  );
}

function needsQuotes(value: string) {
  return (
    value === "" ||
    value !== value.trim() ||
    /[\s#'"`\n\r]/.test(value)
  );
}

function getConversionWarnings(options: {
  arrayMode: ArrayMode;
  includeExportPrefix: boolean;
  usedBacktick: boolean;
  nullMode: NullMode;
}) {
  const warnings: string[] = [];

  if (options.arrayMode === "comma") {
    warnings.push(
      "Comma-separated arrays are lossy when an element itself contains a comma or nested JSON."
    );
  }

  if (options.arrayMode === "indexed") {
    warnings.push(
      "Indexed array variables are a naming convention; the receiving application must rebuild the array explicitly."
    );
  }

  if (options.nullMode === "literal") {
    warnings.push(
      'Literal null is emitted as the text "null". Environment-variable readers will still receive a string.'
    );
  }

  if (options.includeExportPrefix) {
    warnings.push(
      "The export prefix is accepted by Node.js and shell-oriented formats, but not every dotenv parser treats it the same way."
    );
  }

  if (options.usedBacktick) {
    warnings.push(
      "At least one value needed backtick quoting because it contains both single and double quotes. Node.js accepts backticks, but portability to other dotenv parsers varies."
    );
  }

  return warnings;
}

function assertLosslessJsonText(text: string) {
  try {
    JSON.parse(text);
  } catch {
    throw new Error("The input is not valid JSON.");
  }

  const stack: Array<{ type: "object" | "array"; keys?: Set<string> }> = [];
  let index = 0;

  while (index < text.length) {
    const char = text[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "{") {
      stack.push({ type: "object", keys: new Set<string>() });
      index += 1;
      continue;
    }

    if (char === "[") {
      stack.push({ type: "array" });
      index += 1;
      continue;
    }

    if (char === "}" || char === "]") {
      stack.pop();
      index += 1;
      continue;
    }

    if (char === '"') {
      const tokenEnd = findJsonStringEnd(text, index);
      const token = text.slice(index, tokenEnd + 1);
      let next = tokenEnd + 1;

      while (next < text.length && /\s/.test(text[next])) {
        next += 1;
      }

      const frame = stack[stack.length - 1];

      if (frame?.type === "object" && text[next] === ":") {
        const key = JSON.parse(token) as string;

        if (frame.keys?.has(key)) {
          throw new Error(
            `Duplicate JSON member name ${JSON.stringify(key)} would be collapsed by JavaScript parsing.`
          );
        }

        frame.keys?.add(key);
      }

      index = tokenEnd + 1;
      continue;
    }

    if (char === "-" || /\d/.test(char)) {
      const numberMatch = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);

      if (numberMatch) {
        const token = numberMatch[0];
        const numericValue = Number(token);

        if (!isSafeNumberToken(token, numericValue)) {
          throw new Error(
            `JSON number ${token} cannot be converted safely with JavaScript number semantics. Keep high-precision values as JSON strings.`
          );
        }

        index += token.length;
        continue;
      }
    }

    index += 1;
  }
}

function findJsonStringEnd(text: string, start: number) {
  let escaped = false;

  for (let index = start + 1; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === '"') {
      return index;
    }
  }

  return text.length - 1;
}

function isSafeNumberToken(token: string, numericValue: number) {
  if (!Number.isFinite(numericValue) || Object.is(numericValue, -0)) {
    return false;
  }

  if (/^-?(?:0|[1-9]\d*)$/.test(token)) {
    return Number.isSafeInteger(numericValue);
  }

  const significantDigits = token
    .replace(/^[+-]/, "")
    .split(/[eE]/)[0]
    .replace(".", "")
    .replace(/^0+/, "").length;

  if (significantDigits > 15) {
    return false;
  }

  if (numericValue === 0 && /[1-9]/.test(token)) {
    return false;
  }

  return true;
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

function toJsonPath(parentPath: string, key: string) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}[${JSON.stringify(key)}]`;
}

function isSensitiveEnvKey(key: string) {
  return /(?:SECRET|TOKEN|PASSWORD|PASS|PRIVATE|CREDENTIAL|API_KEY|ACCESS_KEY)/i.test(key);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
