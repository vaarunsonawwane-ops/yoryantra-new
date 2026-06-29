"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputMode = "pairs" | "urlencoded" | "curl" | "multipart" | "json" | "markdown" | "checklist";
type KeyStyle = "dot" | "bracket" | "repeat" | "indexed";
type ArrayMode = "repeat" | "brackets" | "indexed" | "json";
type ValueMode = "string" | "json" | "preserve";
type NullMode = "empty" | "null" | "omit";

type FieldRow = {
  key: string;
  value: string;
  sourceType: string;
  depth: number;
  isArrayValue: boolean;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  fields: FieldRow[];
  issues: Issue[];
  inputLength: number;
  fieldCount: number;
  outputLength: number;
  detectedShape: string;
};

const sampleInput = `{
  "name": "Yoryantra",
  "category": "JSON & Data",
  "active": true,
  "tags": ["api", "forms", "debugging"],
  "owner": {
    "name": "Varoun",
    "role": "creator"
  },
  "limit": 25
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("pairs");
  const [keyStyle, setKeyStyle] = useState<KeyStyle>("dot");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("repeat");
  const [valueMode, setValueMode] = useState<ValueMode>("string");
  const [nullMode, setNullMode] = useState<NullMode>("empty");
  const [trimStringValues, setTrimStringValues] = useState(true);
  const [includeEmptyStrings, setIncludeEmptyStrings] = useState(true);
  const [sortFields, setSortFields] = useState(false);
  const [encodeKeys, setEncodeKeys] = useState(true);
  const [encodeValues, setEncodeValues] = useState(true);
  const [includeCurlUrl, setIncludeCurlUrl] = useState(false);
  const [warnNestedObjects, setWarnNestedObjects] = useState(true);
  const [warnArrays, setWarnArrays] = useState(true);
  const [warnFileLikeValues, setWarnFileLikeValues] = useState(true);
  const [curlUrl, setCurlUrl] = useState("https://api.example.com/submit");
  const [result, setResult] = useState<Result | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getNotes(result) : []), [result]);

  const clearResult = () => {
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const processJson = () => {
    if (!input.trim()) {
      setError("Please paste a JSON object to convert into form-data fields.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      outputMode,
      keyStyle,
      arrayMode,
      valueMode,
      nullMode,
      trimStringValues,
      includeEmptyStrings,
      sortFields,
      encodeKeys,
      encodeValues,
      includeCurlUrl,
      curlUrl,
      warnNestedObjects,
      warnArrays,
      warnFileLikeValues,
    });

    if (next.output.startsWith("__ERROR__:")) {
      setError(next.output.replace("__ERROR__:", ""));
      setResult(next);
      setOutput("");
      setCopied(false);
      return;
    }

    setResult(next);
    setOutput(next.output);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setOutputMode("pairs");
    setKeyStyle("dot");
    setArrayMode("repeat");
    setValueMode("string");
    setNullMode("empty");
    setTrimStringValues(true);
    setIncludeEmptyStrings(true);
    setSortFields(false);
    setEncodeKeys(true);
    setEncodeValues(true);
    setIncludeCurlUrl(false);
    setWarnNestedObjects(true);
    setWarnArrays(true);
    setWarnFileLikeValues(true);
    setCurlUrl("https://api.example.com/submit");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setOutputMode("pairs");
    setKeyStyle("dot");
    setArrayMode("repeat");
    setValueMode("string");
    setNullMode("empty");
    setTrimStringValues(true);
    setIncludeEmptyStrings(true);
    setSortFields(false);
    setEncodeKeys(true);
    setEncodeValues(true);
    setIncludeCurlUrl(false);
    setWarnNestedObjects(true);
    setWarnArrays(true);
    setWarnFileLikeValues(true);
    setCurlUrl("https://api.example.com/submit");
    clearResult();
  };

  return (
    <ToolShell
      title="JSON to Form Data Converter"
      description="Convert JSON objects into form-data fields, URL encoded form bodies, cURL parameters, and flat key-value pairs for API debugging and request building."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Object</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a JSON object from an API payload, form model, Postman body, frontend state, or request example.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleInput}
            spellCheck={false}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Form Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Form field pairs", value: "pairs" },
                { label: "x-www-form-urlencoded", value: "urlencoded" },
                { label: "cURL form parameters", value: "curl" },
                { label: "Multipart-style preview", value: "multipart" },
                { label: "JSON field report", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "Review checklist", value: "checklist" },
              ]}
            />

            <YoryantraSelect
              label="Nested Key Style"
              value={keyStyle}
              onChange={(value) => {
                setKeyStyle(value as KeyStyle);
                clearResult();
              }}
              options={[
                { label: "Dot paths: user.name", value: "dot" },
                { label: "Brackets: user[name]", value: "bracket" },
                { label: "Repeat parent keys", value: "repeat" },
                { label: "Indexed paths", value: "indexed" },
              ]}
            />

            <YoryantraSelect
              label="Array Handling"
              value={arrayMode}
              onChange={(value) => {
                setArrayMode(value as ArrayMode);
                clearResult();
              }}
              options={[
                { label: "Repeat same key", value: "repeat" },
                { label: "Use empty brackets", value: "brackets" },
                { label: "Use indexed brackets", value: "indexed" },
                { label: "Keep array as JSON text", value: "json" },
              ]}
            />

            <YoryantraSelect
              label="Value Handling"
              value={valueMode}
              onChange={(value) => {
                setValueMode(value as ValueMode);
                clearResult();
              }}
              options={[
                { label: "Convert values to strings", value: "string" },
                { label: "JSON stringify objects", value: "json" },
                { label: "Preserve simple values", value: "preserve" },
              ]}
            />

            <YoryantraSelect
              label="Null Values"
              value={nullMode}
              onChange={(value) => {
                setNullMode(value as NullMode);
                clearResult();
              }}
              options={[
                { label: "Convert to empty string", value: "empty" },
                { label: "Convert to null text", value: "null" },
                { label: "Omit null fields", value: "omit" },
              ]}
            />

            {outputMode === "curl" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">cURL URL</label>
                <input
                  value={curlUrl}
                  onChange={(event) => {
                    setCurlUrl(event.target.value);
                    clearResult();
                  }}
                  placeholder="https://api.example.com/submit"
                  className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimStringValues} onChange={setTrimStringValues} label="Trim string values" />
          <Toggle checked={includeEmptyStrings} onChange={setIncludeEmptyStrings} label="Include empty string fields" />
          <Toggle checked={sortFields} onChange={setSortFields} label="Sort fields alphabetically" />
          <Toggle checked={encodeKeys} onChange={setEncodeKeys} label="URL encode keys when needed" />
          <Toggle checked={encodeValues} onChange={setEncodeValues} label="URL encode values when needed" />
          <Toggle checked={includeCurlUrl} onChange={setIncludeCurlUrl} label="Include URL in cURL output" />
          <Toggle checked={warnNestedObjects} onChange={setWarnNestedObjects} label="Warn about nested objects" />
          <Toggle checked={warnArrays} onChange={setWarnArrays} label="Warn about array handling" />
          <Toggle checked={warnFileLikeValues} onChange={setWarnFileLikeValues} label="Warn about file-like values" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options help match the way APIs expect form fields, especially when nested objects, arrays, booleans, and empty values are involved.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processJson}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert to Form Data
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

      {result ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Output</h3>
                <p className="mt-1 text-sm text-gray-500">Generated form fields, encoded body, cURL snippet, or report.</p>
              </div>
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? "Copied" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[520px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          <div className="space-y-4">
            <StatCard label="Fields" value={String(result.fieldCount)} />
            <StatCard label="Detected shape" value={result.detectedShape} />
            <StatCard label="Input size" value={`${result.inputLength.toLocaleString()} chars`} />
            <StatCard label="Output size" value={`${result.outputLength.toLocaleString()} chars`} />
          </div>
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Review Notes</h3>
          <div className="mt-4 space-y-3">
            {notes.map((note) => (
              <div key={`${note.title}-${note.message}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                <p className="mt-1 text-sm leading-6 text-gray-600">{note.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result?.fields.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Field Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Showing flattened field names, values, and source value types.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Depth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.fields.slice(0, 80).map((field, index) => (
                  <tr key={`${field.key}-${index}`}>
                    <td className="px-4 py-3 font-mono">{field.key}</td>
                    <td className="px-4 py-3 break-words">{field.value}</td>
                    <td className="px-4 py-3">{field.sourceType}</td>
                    <td className="px-4 py-3">{field.depth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.fields.length > 80 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 80 fields to keep the preview readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Converting JSON Payloads Into Form Fields</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            APIs do not always accept raw JSON. Some endpoints expect form-data fields, URL encoded form bodies, or cURL parameters instead. This converter helps flatten a JSON object into request-ready field names and values without manually rewriting each key.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            It is useful when moving between JSON bodies, HTML forms, backend handlers, Postman examples, cURL commands, and API documentation. You can choose how nested keys and arrays should be represented before copying the final output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON to Form Data Converter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Preparing fields for APIs that accept application/x-www-form-urlencoded or multipart/form-data instead of JSON.</p>
            <p className="mt-2">Flattening frontend form state into key-value pairs for debugging backend request handlers.</p>
            <p className="mt-2">Creating cURL snippets from a JSON object while checking how nested objects and arrays are represented.</p>
            <p className="mt-2">Comparing dot notation, bracket notation, repeated keys, and indexed keys before sending data to an API.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON to Form Data Converter</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JSON object into the input box.</li>
            <li>Choose the output format: field pairs, URL encoded body, cURL parameters, multipart preview, or report.</li>
            <li>Select how nested keys and arrays should be written.</li>
            <li>Review warnings about nested objects, arrays, empty values, or file-like fields.</li>
            <li>Copy the generated form output into your request tool, code sample, or notes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example URL Encoded Output</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`name=Yoryantra&category=JSON%20%26%20Data&active=true&tags=api&tags=forms&owner.name=Varoun`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Form Data Is Not Always a Perfect JSON Replacement</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON can represent nested objects and arrays clearly. Form fields are flatter, and different servers expect different naming styles. Bracket notation, repeated keys, indexed arrays, and JSON-stringified fields can all be valid depending on the backend. Always match the API documentation before sending real requests.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this JSON to form-data converter do?">
              It flattens a JSON object into form-style key-value fields and can output pairs, URL encoded text, multipart-style previews, cURL form parameters, and reports.
            </Faq>
            <Faq title="Can this create real file uploads?">
              No. It can warn about file-like values, but it does not read local files or create binary multipart uploads. It only converts pasted JSON text.
            </Faq>
            <Faq title="Which key style should I use?">
              Use the style your backend expects. Dot paths are readable, bracket notation is common in form parsers, and repeated keys are common for simple arrays.
            </Faq>
            <Faq title="Is x-www-form-urlencoded the same as multipart/form-data?">
              No. URL encoded forms are a single encoded text body. Multipart form-data uses separated parts and is often used for file uploads. This tool gives a text preview, not a network request.
            </Faq>
            <Faq title="Is anything uploaded while converting JSON to form data?">
              No. The conversion runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/json-to-form-data-converter" />
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  outputMode: OutputMode;
  keyStyle: KeyStyle;
  arrayMode: ArrayMode;
  valueMode: ValueMode;
  nullMode: NullMode;
  trimStringValues: boolean;
  includeEmptyStrings: boolean;
  sortFields: boolean;
  encodeKeys: boolean;
  encodeValues: boolean;
  includeCurlUrl: boolean;
  curlUrl: string;
  warnNestedObjects: boolean;
  warnArrays: boolean;
  warnFileLikeValues: boolean;
}): Result {
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    return emptyResult(`__ERROR__:The input is not valid JSON: ${message}`, options.input.length);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyResult("__ERROR__:Please paste a JSON object. Form data fields are usually generated from object keys.", options.input.length);
  }

  let fields = flattenToFields(parsed as Record<string, unknown>, options);
  if (!options.includeEmptyStrings) {
    fields = fields.filter((field) => field.value !== "");
  }
  if (options.sortFields) {
    fields = [...fields].sort((a, b) => a.key.localeCompare(b.key));
  }

  const issues = buildIssues(parsed, fields, options);
  let output = "";

  if (options.outputMode === "pairs") {
    output = buildPairs(fields);
  } else if (options.outputMode === "urlencoded") {
    output = buildUrlEncoded(fields, options);
  } else if (options.outputMode === "curl") {
    output = buildCurl(fields, options);
  } else if (options.outputMode === "multipart") {
    output = buildMultipartPreview(fields);
  } else if (options.outputMode === "json") {
    output = JSON.stringify({ fieldCount: fields.length, fields, issues }, null, 2);
  } else if (options.outputMode === "markdown") {
    output = buildMarkdown(fields, issues);
  } else {
    output = buildChecklist(fields, issues);
  }

  return {
    output,
    fields,
    issues,
    inputLength: options.input.length,
    fieldCount: fields.length,
    outputLength: output.length,
    detectedShape: "JSON object",
  };
}

function emptyResult(output: string, inputLength: number): Result {
  return {
    output,
    fields: [],
    issues: [],
    inputLength,
    fieldCount: 0,
    outputLength: 0,
    detectedShape: "invalid or unsupported JSON",
  };
}

function flattenToFields(value: Record<string, unknown>, options: {
  keyStyle: KeyStyle;
  arrayMode: ArrayMode;
  valueMode: ValueMode;
  nullMode: NullMode;
  trimStringValues: boolean;
}): FieldRow[] {
  const fields: FieldRow[] = [];

  const walk = (current: unknown, path: string[], depth: number, fromArray: boolean) => {
    if (current === null) {
      if (options.nullMode === "omit") return;
      fields.push({
        key: buildKey(path, options.keyStyle),
        value: options.nullMode === "null" ? "null" : "",
        sourceType: "null",
        depth,
        isArrayValue: fromArray,
      });
      return;
    }

    if (Array.isArray(current)) {
      if (options.arrayMode === "json") {
        fields.push({
          key: buildKey(path, options.keyStyle),
          value: JSON.stringify(current),
          sourceType: "array",
          depth,
          isArrayValue: true,
        });
        return;
      }

      current.forEach((item, index) => {
        let nextPath = path;
        if (options.arrayMode === "brackets") {
          nextPath = [...path, ""];
        } else if (options.arrayMode === "indexed") {
          nextPath = [...path, String(index)];
        }
        walk(item, nextPath, depth + 1, true);
      });
      return;
    }

    if (typeof current === "object") {
      Object.entries(current as Record<string, unknown>).forEach(([key, item]) => {
        walk(item, [...path, key], depth + 1, fromArray);
      });
      return;
    }

    fields.push({
      key: buildKey(path, options.keyStyle),
      value: formatValue(current, options.valueMode, options.trimStringValues),
      sourceType: typeof current,
      depth,
      isArrayValue: fromArray,
    });
  };

  Object.entries(value).forEach(([key, item]) => walk(item, [key], 0, false));
  return fields;
}

function buildKey(path: string[], keyStyle: KeyStyle) {
  if (!path.length) return "";

  if (keyStyle === "dot") {
    return path.filter((part) => part !== "").join(".");
  }

  if (keyStyle === "bracket") {
    const [first, ...rest] = path;
    return `${first}${rest.map((part) => `[${part}]`).join("")}`;
  }

  if (keyStyle === "indexed") {
    const [first, ...rest] = path;
    return `${first}${rest.map((part) => `[${part || ""}]`).join("")}`;
  }

  return path[path.length - 1] || path[0];
}

function formatValue(value: unknown, valueMode: ValueMode, trimStringValues: boolean) {
  if (typeof value === "string") {
    return trimStringValues ? value.trim() : value;
  }

  if (valueMode === "json") {
    return JSON.stringify(value);
  }

  return String(value);
}

function buildPairs(fields: FieldRow[]) {
  return fields.map((field) => `${field.key}: ${field.value}`).join("\n");
}

function buildUrlEncoded(fields: FieldRow[], options: {
  encodeKeys: boolean;
  encodeValues: boolean;
}) {
  return fields.map((field) => {
    const key = options.encodeKeys ? encodeURIComponent(field.key) : field.key;
    const value = options.encodeValues ? encodeURIComponent(field.value) : field.value;
    return `${key}=${value}`;
  }).join("&");
}

function buildCurl(fields: FieldRow[], options: {
  includeCurlUrl: boolean;
  curlUrl: string;
}) {
  const parts = ["curl -X POST"];
  if (options.includeCurlUrl) {
    parts.push(`"${options.curlUrl || "https://api.example.com/submit"}"`);
  }
  fields.forEach((field) => {
    parts.push(`  -F ${shellQuote(`${field.key}=${field.value}`)}`);
  });
  return parts.join(" \\\n");
}

function buildMultipartPreview(fields: FieldRow[]) {
  const boundary = "----YoryantraFormBoundary";
  const parts = fields.map((field) => [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${field.key.replace(/"/g, '\\"')}"`,
    "",
    field.value,
  ].join("\n"));
  return [...parts, `--${boundary}--`].join("\n");
}

function buildMarkdown(fields: FieldRow[], issues: Issue[]) {
  const lines = [
    "| Key | Value | Type | Depth |",
    "|---|---|---|---:|",
    ...fields.map((field) => `| ${escapeMarkdown(field.key)} | ${escapeMarkdown(field.value)} | ${field.sourceType} | ${field.depth} |`),
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => {
      lines.push(`- ${issue.title}: ${issue.message}`);
    });
  }

  return lines.join("\n");
}

function buildChecklist(fields: FieldRow[], issues: Issue[]) {
  const lines = [
    "# JSON to Form Data Checklist",
    "",
    `- [${fields.length ? "x" : " "}] Generated ${fields.length} form field${fields.length === 1 ? "" : "s"}.`,
    `- [${fields.every((field) => field.key) ? "x" : " "}] Every field has a key.`,
    `- [${fields.length <= 50 ? "x" : " "}] Field count is manageable for manual review.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => {
      lines.push(`- ${issue.title}: ${issue.message}`);
    });
  }

  return lines.join("\n");
}

function buildIssues(original: unknown, fields: FieldRow[], options: {
  warnNestedObjects: boolean;
  warnArrays: boolean;
  warnFileLikeValues: boolean;
  arrayMode: ArrayMode;
}): Issue[] {
  const issues: Issue[] = [];

  if (options.warnNestedObjects && hasNestedObject(original)) {
    issues.push({
      severity: "info",
      title: "Nested object fields",
      message: "Nested JSON objects were flattened into form field keys. Confirm the key style expected by your backend.",
    });
  }

  if (options.warnArrays && hasArray(original)) {
    issues.push({
      severity: "warning",
      title: "Array handling matters",
      message: `Arrays were handled using the selected ${options.arrayMode} mode. Different APIs expect different array formats.`,
    });
  }

  if (options.warnFileLikeValues) {
    const fileLike = fields.filter((field) => /file|path|filename|upload|avatar|image/i.test(field.key) || /^data:/.test(field.value));
    if (fileLike.length) {
      issues.push({
        severity: "warning",
        title: "Possible file-like field",
        message: `${fileLike.length} field${fileLike.length === 1 ? "" : "s"} look file-related. This tool does not create real binary file uploads.`,
      });
    }
  }

  if (fields.length > 100) {
    issues.push({
      severity: "info",
      title: "Many fields generated",
      message: "The JSON object produced more than 100 form fields. Review the output before pasting it into request tools.",
    });
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large output",
      message: "The generated form output is large. Some request tools or terminals may be harder to review with very long field lists.",
    });
  }

  return notes;
}

function hasNestedObject(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some((item) => {
    if (Array.isArray(item)) return item.some((entry) => entry && typeof entry === "object");
    if (item && typeof item === "object") return true;
    return false;
  });
}

function hasArray(value: unknown): boolean {
  if (Array.isArray(value)) return true;
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some(hasArray);
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
      />
      <span>{label}</span>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Faq({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
