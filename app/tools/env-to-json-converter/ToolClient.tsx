"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
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
  wasQuoted: boolean;
};

type ParsedAssignmentValue = {
  value: string;
  endIndex: number;
  wasQuoted: boolean;
};

const MAX_INPUT_CHARS = 1_000_000;
const MAX_ENV_ENTRIES = 5_000;

const sampleEnv = `# Values in quotes stay strings in Auto mode
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_SSL=true
API_KEY="secret-key"
API_BASE_URL=https://api.example.com
USER_NAME="Sneha"
FEATURES=["JSON","APIs","Debugging"]`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleEnv);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [parsedLines, setParsedLines] = useState<ParsedEnvLine[]>([]);
  const [valueMode, setValueMode] = useState<ValueMode>("auto");
  const [keyMode, setKeyMode] = useState<KeyMode>("flat");
  const [outputSpacing, setOutputSpacing] = useState<OutputSpacing>("two");
  const [ignoreComments, setIgnoreComments] = useState(true);
  const [stripExportKeyword, setStripExportKeyword] = useState(true);
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setOutput("");
    setError("");
    setParsedLines([]);
    setCopied(false);
  };

  const convertEnvToJson = () => {
    if (!input.trim()) {
      setError("Paste at least one environment-variable assignment.");
      setOutput("");
      setParsedLines([]);
      setCopied(false);
      return;
    }

    if (input.length > MAX_INPUT_CHARS) {
      setError(
        `Input is too large for an interactive browser conversion. Keep it under ${MAX_INPUT_CHARS.toLocaleString()} characters.`
      );
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
        setError("No environment-variable assignments were found.");
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
          : "The ENV text could not be converted safely."
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
        "The browser blocked clipboard access. Select the JSON output and copy it manually."
      );
    }
  };

  const loadExample = () => {
    setInput(sampleEnv);
    setOutput("");
    setError("");
    setParsedLines([]);
    setValueMode("auto");
    setKeyMode("flat");
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
    setKeyMode("flat");
    setOutputSpacing("two");
    setIgnoreComments(true);
    setStripExportKeyword(true);
    setCopied(false);
  };

  return (
    <ToolShell
      title="ENV to JSON Converter"
      description="Parse dotenv-style assignments into flat or grouped JSON while keeping type inference explicit."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          ENV input
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={sampleEnv}
          spellCheck={false}
          className="min-h-[340px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Paste dotenv-style assignments. Quoted values may span lines; an
          unquoted # starts a comment when comment handling is enabled.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          How ENV values should become JSON
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Value handling"
            value={valueMode}
            onChange={(value) => {
              setValueMode(value as ValueMode);
              clearResult();
            }}
            options={[
              { label: "Conservative auto inference", value: "auto" },
              { label: "Keep every value as text", value: "string" },
            ]}
          />

          <YoryantraSelect
            label="Key shape"
            value={keyMode}
            onChange={(value) => {
              setKeyMode(value as KeyMode);
              clearResult();
            }}
            options={[
              { label: "Keep original keys", value: "flat" },
              { label: "Split underscores into objects", value: "nested" },
            ]}
          />

          <YoryantraSelect
            label="JSON spacing"
            value={outputSpacing}
            onChange={(value) => {
              setOutputSpacing(value as OutputSpacing);
              clearResult();
            }}
            options={[
              { label: "2 spaces", value: "two" },
              { label: "4 spaces", value: "four" },
              { label: "Compact", value: "compact" },
            ]}
          />
        </div>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={ignoreComments}
              onChange={(event) => {
                setIgnoreComments(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Treat # as comment syntax
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Skip full-line comments and remove unquoted inline comments.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={stripExportKeyword}
              onChange={(event) => {
                setStripExportKeyword(event.target.checked);
                clearResult();
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Accept an export prefix
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Read export API_KEY=value as the API_KEY assignment.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertEnvToJson}
          className="yoryantra-btn min-h-10 whitespace-nowrap"
        >
          Convert ENV to JSON
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

      {parsedLines.length > 0 && (
        <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed assignments
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Likely secret values are masked in this preview. The generated JSON
            still contains the original value.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Line</th>
                  <th className="px-4 py-3 font-semibold">ENV key</th>
                  <th className="px-4 py-3 font-semibold">Parsed value</th>
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
                        {getPreviewValue(line)}
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
          <h3 className="text-lg font-semibold text-gray-900">JSON output</h3>

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
          {output || "Converted JSON will appear here."}
        </pre>
      </div>

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          Parsing and conversion run in this browser component. Pasted secrets
          remain visible in the page, generated output, browser memory, and any
          clipboard copy you make.
        </div>

        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          Auto inference and underscore nesting are transformations, not dotenv
          semantics. Keep values as text and keys flat when exact preservation
          matters.
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A .env file carries text, not JSON types
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Environment variables arrive at an application as strings. A line
            such as PORT=5432 does not itself say that 5432 is a JSON number,
            and FEATURE_ENABLED=false does not make false a boolean. Auto
            inference here is therefore deliberately optional. Quoted values
            always stay strings, while unquoted booleans, null, safe numbers,
            and valid JSON arrays or objects can be inferred when that mode is
            selected.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            Dotenv files do not have one cross-platform formal standard. Node.js
            publishes its own .env rules for variable names, comments, quoted
            values, multiline quoted text, and optional export prefixes. Those
            rules are a useful reference, but another runtime or dotenv library
            can differ. See the{" "}
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
            What the parser accepts
          </h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Names made from letters, digits, and underscores, without a leading digit.</li>
            <li>Values containing additional equals signs after the first separator.</li>
            <li>Single- or double-quoted values, including quoted text that spans lines.</li>
            <li>Full-line and inline # comments when comment handling is enabled.</li>
            <li>An optional export prefix when that option is enabled.</li>
          </ul>

          <p className="mt-4 leading-relaxed text-gray-600">
            Shell expansion is intentionally outside scope. References such as
            $HOME, command substitutions, and shell expressions are copied as
            text rather than executed.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Underscore nesting is a naming convention, not a standard
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            Flat mode preserves DATABASE_HOST as the JSON member
            DATABASE_HOST. Nested mode treats every underscore as a boundary,
            lowercases the pieces, and produces database.host. That can be handy
            for a naming scheme built around prefixes, but it is lossy for names
            where underscores are part of the intended field name.
          </p>

          <p className="mt-4 leading-relaxed text-gray-600">
            Collisions are rejected rather than overwritten. For example,
            APP=value and APP_NAME=Sneha cannot both become one nested structure
            because APP would need to be both a value and an object. Duplicate
            ENV names are rejected for the same reason: silently keeping the last
            value would hide configuration mistakes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A small example where quoting matters
          </h2>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 font-mono text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">{`PORT=5432
PIN="0017"
ENABLED=true
NAME="Sneha # local"

Auto inference produces:
{
  "PORT": 5432,
  "PIN": "0017",
  "ENABLED": true,
  "NAME": "Sneha # local"
}`}</pre>
          </div>

          <p className="mt-4 leading-relaxed text-gray-600">
            PIN remains text because it was quoted. That avoids turning an
            identifier with leading zeroes into a number. Integers outside
            JavaScript&apos;s safe range are also left as strings instead of being
            rounded silently.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Secrets do not become harmless after conversion
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            JSON output can expose the same passwords, tokens, private keys, and
            connection strings that were present in the source file. The preview
            masks likely secret names only to reduce accidental on-screen
            exposure; it does not redact the generated JSON. Avoid pasting
            production credentials into tickets, chat messages, screenshots, or
            source control after conversion.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Boundaries that are better left explicit
          </h2>

          <p className="mt-4 leading-relaxed text-gray-600">
            This parser does not expand variables, execute shell syntax, fetch
            files, or decide application-specific types. It also stops at 5,000
            assignments and one million input characters so an accidental huge
            paste does not lock up the page. If a deployment platform uses its
            own dotenv extensions, compare the generated JSON with that
            platform&apos;s parser before replacing a production configuration
            path.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/env-to-json-converter" />
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
  const seenKeys = new Set<string>();

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const leadingTrimmed = rawLine.replace(/^\s+/, "");

    if (!leadingTrimmed.trim()) {
      continue;
    }

    if (options.ignoreComments && leadingTrimmed.startsWith("#")) {
      continue;
    }

    const normalizedLine =
      options.stripExportKeyword && /^export\s+/.test(leadingTrimmed)
        ? leadingTrimmed.replace(/^export\s+/, "")
        : leadingTrimmed;

    const equalsIndex = normalizedLine.indexOf("=");

    if (equalsIndex === -1) {
      throw new Error(`Line ${index + 1} is missing an equals sign.`);
    }

    const key = normalizedLine.slice(0, equalsIndex).trim();
    const rawValue = normalizedLine.slice(equalsIndex + 1);

    if (!isValidEnvKey(key)) {
      throw new Error(
        `Line ${index + 1} has an invalid environment-variable name: ${key || "(empty)"}.`
      );
    }

    if (seenKeys.has(key)) {
      throw new Error(
        `Line ${index + 1} repeats ${key}. Duplicate assignments are not overwritten silently.`
      );
    }

    const parsedValue = parseAssignmentValue(
      rawValue,
      lines,
      index,
      options.ignoreComments
    );

    parsed.push({
      key,
      value: parsedValue.value,
      lineNumber: index + 1,
      wasQuoted: parsedValue.wasQuoted,
    });
    seenKeys.add(key);
    index = parsedValue.endIndex;

    if (parsed.length > MAX_ENV_ENTRIES) {
      throw new Error(
        `More than ${MAX_ENV_ENTRIES.toLocaleString()} assignments were found. Split the file into smaller parts before converting.`
      );
    }
  }

  return parsed;
}

function parseAssignmentValue(
  rawValue: string,
  lines: string[],
  startIndex: number,
  ignoreComments: boolean
): ParsedAssignmentValue {
  const initial = rawValue.replace(/^\s+/, "");
  const quote = initial[0] === '"' || initial[0] === "'" ? initial[0] : "";

  if (!quote) {
    const commentIndex = ignoreComments ? initial.indexOf("#") : -1;
    const value = commentIndex >= 0 ? initial.slice(0, commentIndex) : initial;

    return {
      value: value.replace(/\s+$/, ""),
      endIndex: startIndex,
      wasQuoted: false,
    };
  }

  let collected = initial.slice(1);

  for (let index = startIndex; index < lines.length; index += 1) {
    const segment = index === startIndex ? collected : lines[index];
    const closingIndex = findClosingQuote(segment, quote, ignoreComments);

    if (closingIndex >= 0) {
      const beforeQuote = segment.slice(0, closingIndex);
      const value =
        index === startIndex
          ? beforeQuote
          : `${collected}\n${beforeQuote}`;

      return {
        value,
        endIndex: index,
        wasQuoted: true,
      };
    }

    if (index === startIndex) {
      collected = segment;
    } else {
      collected += `\n${segment}`;
    }
  }

  throw new Error(`Line ${startIndex + 1} starts a quoted value that never closes.`);
}

function findClosingQuote(
  segment: string,
  quote: string,
  ignoreComments: boolean
) {
  for (let index = segment.length - 1; index >= 0; index -= 1) {
    if (segment[index] !== quote) {
      continue;
    }

    const trailing = segment.slice(index + 1).trim();

    if (!trailing || (ignoreComments && trailing.startsWith("#"))) {
      return index;
    }
  }

  return -1;
}

function createJsonObject(
  lines: ParsedEnvLine[],
  options: {
    valueMode: ValueMode;
    keyMode: KeyMode;
  }
): Record<string, JsonValue> {
  const output = createRecord();

  lines.forEach(({ key, value, wasQuoted }) => {
    const parsedValue =
      options.valueMode === "auto" ? parseEnvValue(value, wasQuoted) : value;

    if (options.keyMode === "flat") {
      defineOwnValue(output, key, parsedValue);
      return;
    }

    const path = key
      .toLowerCase()
      .split("_")
      .map((part) => part.trim())
      .filter(Boolean);

    if (path.length === 0) {
      throw new Error(`${key} cannot be represented by underscore nesting.`);
    }

    setNestedValue(output, path, parsedValue, key);
  });

  return output;
}

function setNestedValue(
  target: Record<string, JsonValue>,
  path: string[],
  value: JsonValue,
  sourceKey: string
) {
  let current = target;

  path.forEach((part, index) => {
    const isLast = index === path.length - 1;
    const hasPart = Object.prototype.hasOwnProperty.call(current, part);

    if (isLast) {
      if (hasPart) {
        throw new Error(
          `${sourceKey} collides with another key after underscore nesting. Use flat keys or rename the conflicting variables.`
        );
      }

      defineOwnValue(current, part, value);
      return;
    }

    if (!hasPart) {
      defineOwnValue(current, part, createRecord());
    } else if (!isPlainObject(current[part])) {
      throw new Error(
        `${sourceKey} needs ${path.slice(0, index + 1).join(".")} to be an object, but another variable already placed a value there.`
      );
    }

    current = current[part] as Record<string, JsonValue>;
  });
}

function parseEnvValue(value: string, wasQuoted: boolean): JsonValue {
  if (wasQuoted) {
    return value;
  }

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

  if (isJsonNumberToken(trimmed)) {
    const numericValue = Number(trimmed);

    if (isSafeNumberToken(trimmed, numericValue)) {
      return numericValue;
    }

    return value;
  }

  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      assertLosslessJsonText(trimmed);
      return JSON.parse(trimmed) as JsonValue;
    } catch {
      return value;
    }
  }

  return value;
}

function assertLosslessJsonText(text: string) {
  JSON.parse(text);
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
          throw new Error("Duplicate JSON member name.");
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
          throw new Error("JSON number would lose precision.");
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

function isJsonNumberToken(value: string) {
  return /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value);
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

function createRecord(): Record<string, JsonValue> {
  return Object.create(null) as Record<string, JsonValue>;
}

function defineOwnValue(
  target: Record<string, JsonValue>,
  key: string,
  value: JsonValue
) {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    configurable: true,
    writable: true,
  });
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

function isPlainObject(value: unknown): value is Record<string, JsonValue> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function getPreviewValue(line: ParsedEnvLine) {
  if (/(?:SECRET|TOKEN|PASSWORD|PASS|PRIVATE|CREDENTIAL|API_KEY|ACCESS_KEY)/i.test(line.key)) {
    return "••••••••";
  }

  return line.value;
}
