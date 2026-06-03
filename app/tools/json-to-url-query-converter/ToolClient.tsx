"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "jsonToQuery" | "queryToJson" | "inspect";
type OutputMode = "query" | "fullUrl" | "json" | "markdown" | "csv" | "checklist";
type KeyStyle = "dot" | "bracket" | "repeat" | "indexed";
type ArrayMode = "repeat" | "comma" | "brackets" | "indexed" | "json";
type BooleanMode = "literal" | "numeric" | "presence";
type NullMode = "empty" | "null" | "omit";

type ParamRow = {
  key: string;
  value: string;
  encodedKey: string;
  encodedValue: string;
  sourceType: string;
  depth: number;
  repeated: boolean;
};

type Issue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type Result = {
  output: string;
  params: ParamRow[];
  issues: Issue[];
  inputLength: number;
  paramCount: number;
  outputLength: number;
  detectedShape: string;
};

const sampleJson = `{
  "q": "json tools",
  "category": "JSON & Data",
  "page": 1,
  "filters": {
    "status": "live",
    "featured": true
  },
  "tags": ["api", "debugging", "query"]
}`;

const sampleQuery = `q=json%20tools&category=JSON%20%26%20Data&page=1&filters.status=live&filters.featured=true&tags=api&tags=debugging`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://example.com/search");
  const [actionMode, setActionMode] = useState<ActionMode>("jsonToQuery");
  const [outputMode, setOutputMode] = useState<OutputMode>("query");
  const [keyStyle, setKeyStyle] = useState<KeyStyle>("dot");
  const [arrayMode, setArrayMode] = useState<ArrayMode>("repeat");
  const [booleanMode, setBooleanMode] = useState<BooleanMode>("literal");
  const [nullMode, setNullMode] = useState<NullMode>("omit");
  const [trimStringValues, setTrimStringValues] = useState(true);
  const [sortParams, setSortParams] = useState(false);
  const [encodeSpacesAsPlus, setEncodeSpacesAsPlus] = useState(false);
  const [includeQuestionMark, setIncludeQuestionMark] = useState(false);
  const [includeEmptyStrings, setIncludeEmptyStrings] = useState(true);
  const [decodePlusAsSpace, setDecodePlusAsSpace] = useState(true);
  const [coerceQueryValues, setCoerceQueryValues] = useState(true);
  const [warnNestedObjects, setWarnNestedObjects] = useState(true);
  const [warnLongQuery, setWarnLongQuery] = useState(true);
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

  const processInput = () => {
    if (!input.trim()) {
      setError("Please paste a JSON object or URL query string to convert.");
      setResult(null);
      setOutput("");
      return;
    }

    const next = buildResult({
      input,
      baseUrl,
      actionMode,
      outputMode,
      keyStyle,
      arrayMode,
      booleanMode,
      nullMode,
      trimStringValues,
      sortParams,
      encodeSpacesAsPlus,
      includeQuestionMark,
      includeEmptyStrings,
      decodePlusAsSpace,
      coerceQueryValues,
      warnNestedObjects,
      warnLongQuery,
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
    setInput(sampleJson);
    setBaseUrl("https://example.com/search");
    setActionMode("jsonToQuery");
    setOutputMode("query");
    setKeyStyle("dot");
    setArrayMode("repeat");
    setBooleanMode("literal");
    setNullMode("omit");
    setTrimStringValues(true);
    setSortParams(false);
    setEncodeSpacesAsPlus(false);
    setIncludeQuestionMark(false);
    setIncludeEmptyStrings(true);
    setDecodePlusAsSpace(true);
    setCoerceQueryValues(true);
    setWarnNestedObjects(true);
    setWarnLongQuery(true);
    clearResult();
  };

  const loadQueryExample = () => {
    setInput(sampleQuery);
    setActionMode("queryToJson");
    setOutputMode("json");
    setDecodePlusAsSpace(true);
    setCoerceQueryValues(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setBaseUrl("https://example.com/search");
    setActionMode("jsonToQuery");
    setOutputMode("query");
    setKeyStyle("dot");
    setArrayMode("repeat");
    setBooleanMode("literal");
    setNullMode("omit");
    setTrimStringValues(true);
    setSortParams(false);
    setEncodeSpacesAsPlus(false);
    setIncludeQuestionMark(false);
    setIncludeEmptyStrings(true);
    setDecodePlusAsSpace(true);
    setCoerceQueryValues(true);
    setWarnNestedObjects(true);
    setWarnLongQuery(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON to URL Query Converter"
      description="Convert JSON objects into URL query strings, API query parameters, full URLs, and readable parameter reports. Decode query strings back into JSON locally in your browser."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900">JSON Object or Query String</label>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">
              Paste a JSON object to turn into query parameters, or paste a query string to decode it back into JSON.
            </p>
          </div>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={sampleJson}
            spellCheck={false}
            className="w-full min-h-[420px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          {outputMode === "fullUrl" || actionMode === "jsonToQuery" ? (
            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-900">Base URL</label>
              <input
                value={baseUrl}
                onChange={(event) => {
                  setBaseUrl(event.target.value);
                  clearResult();
                }}
                placeholder="https://example.com/search"
                className="mt-2 min-h-[48px] w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Query Settings</h3>

          <div className="mt-4 space-y-4">
            <YoryantraSelect
              label="Action"
              value={actionMode}
              onChange={(value) => {
                const next = value as ActionMode;
                setActionMode(next);
                if (next === "queryToJson") setOutputMode("json");
                if (next === "jsonToQuery" && outputMode === "json") setOutputMode("query");
                clearResult();
              }}
              options={[
                { label: "JSON to query string", value: "jsonToQuery" },
                { label: "Query string to JSON", value: "queryToJson" },
                { label: "Inspect query parameters", value: "inspect" },
              ]}
            />

            <YoryantraSelect
              label="Output"
              value={outputMode}
              onChange={(value) => {
                setOutputMode(value as OutputMode);
                clearResult();
              }}
              options={[
                { label: "Query string", value: "query" },
                { label: "Full URL", value: "fullUrl" },
                { label: "JSON output", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
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
                { label: "Dot paths: filter.status", value: "dot" },
                { label: "Brackets: filter[status]", value: "bracket" },
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
                { label: "Comma-separated value", value: "comma" },
                { label: "Use empty brackets", value: "brackets" },
                { label: "Use indexed brackets", value: "indexed" },
                { label: "Keep as JSON text", value: "json" },
              ]}
            />

            <YoryantraSelect
              label="Booleans"
              value={booleanMode}
              onChange={(value) => {
                setBooleanMode(value as BooleanMode);
                clearResult();
              }}
              options={[
                { label: "true / false", value: "literal" },
                { label: "1 / 0", value: "numeric" },
                { label: "Present key for true", value: "presence" },
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
                { label: "Omit null fields", value: "omit" },
                { label: "Convert to empty value", value: "empty" },
                { label: "Convert to null text", value: "null" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
          <Toggle checked={trimStringValues} onChange={setTrimStringValues} label="Trim string values" />
          <Toggle checked={sortParams} onChange={setSortParams} label="Sort query parameters alphabetically" />
          <Toggle checked={encodeSpacesAsPlus} onChange={setEncodeSpacesAsPlus} label="Encode spaces as plus signs" />
          <Toggle checked={includeQuestionMark} onChange={setIncludeQuestionMark} label="Prefix query output with ?" />
          <Toggle checked={includeEmptyStrings} onChange={setIncludeEmptyStrings} label="Include empty string values" />
          <Toggle checked={decodePlusAsSpace} onChange={setDecodePlusAsSpace} label="Decode plus signs as spaces" />
          <Toggle checked={coerceQueryValues} onChange={setCoerceQueryValues} label="Coerce decoded numbers and booleans" />
          <Toggle checked={warnNestedObjects} onChange={setWarnNestedObjects} label="Warn about nested object conversion" />
          <Toggle checked={warnLongQuery} onChange={setWarnLongQuery} label="Warn when query string is long" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          These options help match query-string behavior used by APIs, browsers, backend frameworks, and request tools.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processInput}
          className="rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert Query Data
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load JSON Example
        </button>
        <button
          type="button"
          onClick={loadQueryExample}
          className="rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Query Example
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
                <p className="mt-1 text-sm text-gray-500">Generated query string, URL, JSON, or parameter report.</p>
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
            <StatCard label="Parameters" value={String(result.paramCount)} />
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

      {result?.params.length ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Parameter Preview</h3>
          <p className="mt-1 text-sm text-gray-500">Review raw keys, values, encoded keys, and encoded values.</p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Encoded Key</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {result.params.slice(0, 80).map((param, index) => (
                  <tr key={`${param.key}-${index}`}>
                    <td className="px-4 py-3 font-mono">{param.key}</td>
                    <td className="px-4 py-3 break-words">{param.value}</td>
                    <td className="px-4 py-3 font-mono">{param.encodedKey}</td>
                    <td className="px-4 py-3">{param.sourceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.params.length > 80 ? (
            <p className="mt-3 text-sm text-gray-500">Showing the first 80 parameters to keep the preview readable.</p>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Converting JSON Objects Into Query Parameters</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Many APIs use query strings for filters, search terms, pagination, sorting, and small request options. When those values start as a JSON object, manually writing the query string can lead to missed encoding, inconsistent array styles, or confusing nested keys.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This converter turns JSON objects into URL query strings, full URLs, Markdown reports, CSV summaries, or decoded JSON. It is useful for API examples, frontend routing, request debugging, and documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">When This JSON to URL Query Converter Helps</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>Creating query strings from search, filter, sort, and pagination objects used by frontend apps or APIs.</p>
            <p className="mt-2">Comparing dot paths, bracket paths, repeated keys, and indexed keys before documenting an endpoint.</p>
            <p className="mt-2">Decoding copied query strings into JSON so they are easier to inspect and edit.</p>
            <p className="mt-2">Checking encoded values before pasting URLs into examples, docs, tests, or issue reports.</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">How to Use the JSON to URL Query Converter</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JSON object or query string into the input box.</li>
            <li>Choose whether to convert JSON to query, decode a query string, or inspect parameters.</li>
            <li>Select how nested keys, arrays, booleans, and null values should be handled.</li>
            <li>Choose query string, full URL, JSON, Markdown, CSV, or checklist output.</li>
            <li>Review the parameter preview and copy the generated output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Example Query String Output</h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">{`q=json%20tools&category=JSON%20%26%20Data&page=1&filters.status=live&tags=api&tags=debugging`}</pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Query String Styles Depend on the Backend</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            There is no single universal format for nested query parameters. Some APIs expect dot paths, some expect brackets, and some expect repeated keys for arrays. Use the style your backend or API documentation expects, especially when converting nested filters and arrays.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-6">
            <Faq title="What does this JSON to query converter do?">
              It converts JSON object keys into URL query parameters and can also decode a query string back into JSON-style output.
            </Faq>
            <Faq title="Can this handle nested JSON objects?">
              Yes. Nested objects can be represented with dot paths, bracket paths, repeated parent keys, or indexed paths depending on the selected setting.
            </Faq>
            <Faq title="How are arrays converted into query parameters?">
              Arrays can use repeated keys, comma-separated values, bracket keys, indexed bracket keys, or JSON text. The right choice depends on the API.
            </Faq>
            <Faq title="Is this different from a URL encoder?">
              Yes. A URL encoder focuses on escaping text. This tool turns structured JSON keys and values into query parameters and can inspect them as rows.
            </Faq>
            <Faq title="Is anything uploaded while converting query data?">
              No. The conversion runs entirely inside your browser.
            </Faq>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Query-string conversion often connects with API debugging, URL encoding, JSON formatting, and form-data preparation.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/url-query-encoder-decoder" className="yoryantra-btn-outline">URL Query Encoder Decoder</Link>
            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">URL Encoder Decoder</Link>
            <Link href="/tools/json-to-form-data-converter" className="yoryantra-btn-outline">JSON to Form Data Converter</Link>
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">JSON Formatter</Link>
            <Link href="/tools/json-validator" className="yoryantra-btn-outline">JSON Validator</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function buildResult(options: {
  input: string;
  baseUrl: string;
  actionMode: ActionMode;
  outputMode: OutputMode;
  keyStyle: KeyStyle;
  arrayMode: ArrayMode;
  booleanMode: BooleanMode;
  nullMode: NullMode;
  trimStringValues: boolean;
  sortParams: boolean;
  encodeSpacesAsPlus: boolean;
  includeQuestionMark: boolean;
  includeEmptyStrings: boolean;
  decodePlusAsSpace: boolean;
  coerceQueryValues: boolean;
  warnNestedObjects: boolean;
  warnLongQuery: boolean;
}): Result {
  if (options.actionMode === "queryToJson" || options.actionMode === "inspect") {
    return parseQueryInput(options);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(options.input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON input.";
    return emptyResult(`__ERROR__:The input is not valid JSON: ${message}`, options.input.length);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyResult("__ERROR__:Please paste a JSON object. Query parameters are generated from object keys.", options.input.length);
  }

  let params = flattenToParams(parsed as Record<string, unknown>, options);
  if (!options.includeEmptyStrings) params = params.filter((param) => param.value !== "");
  if (options.sortParams) params = [...params].sort((a, b) => a.key.localeCompare(b.key));

  params = params.map((param) => ({
    ...param,
    encodedKey: encodePart(param.key, options.encodeSpacesAsPlus),
    encodedValue: encodePart(param.value, options.encodeSpacesAsPlus),
  }));

  const issues = buildIssues(parsed, params, options);
  const output = formatOutput(params, issues, options, "JSON object");

  return {
    output,
    params,
    issues,
    inputLength: options.input.length,
    paramCount: params.length,
    outputLength: output.length,
    detectedShape: "JSON object",
  };
}

function parseQueryInput(options: {
  input: string;
  outputMode: OutputMode;
  includeQuestionMark: boolean;
  decodePlusAsSpace: boolean;
  coerceQueryValues: boolean;
  warnLongQuery: boolean;
}) {
  const raw = extractQueryString(options.input);
  const params: ParamRow[] = [];

  raw.split("&").filter(Boolean).forEach((part) => {
    const equalIndex = part.indexOf("=");
    const rawKey = equalIndex >= 0 ? part.slice(0, equalIndex) : part;
    const rawValue = equalIndex >= 0 ? part.slice(equalIndex + 1) : "";
    const key = decodePart(rawKey, options.decodePlusAsSpace);
    const value = decodePart(rawValue, options.decodePlusAsSpace);
    params.push({
      key,
      value,
      encodedKey: rawKey,
      encodedValue: rawValue,
      sourceType: inferValueType(value),
      depth: key.split(/[.[\]]/).filter(Boolean).length - 1,
      repeated: false,
    });
  });

  const counts = new Map<string, number>();
  params.forEach((param) => counts.set(param.key, (counts.get(param.key) ?? 0) + 1));
  const marked = params.map((param) => ({ ...param, repeated: (counts.get(param.key) ?? 0) > 1 }));

  const issues = buildQueryIssues(marked, options);
  const jsonObject = paramsToObject(marked, options.coerceQueryValues);
  let output = "";

  if (options.outputMode === "json") {
    output = JSON.stringify(jsonObject, null, 2);
  } else {
    output = formatOutput(marked, issues, { ...options, outputMode: options.outputMode === "query" ? "markdown" : options.outputMode, baseUrl: "", includeQuestionMark: false }, "query string");
  }

  return {
    output,
    params: marked,
    issues,
    inputLength: options.input.length,
    paramCount: marked.length,
    outputLength: output.length,
    detectedShape: "query string",
  };
}

function emptyResult(output: string, inputLength: number): Result {
  return {
    output,
    params: [],
    issues: [],
    inputLength,
    paramCount: 0,
    outputLength: 0,
    detectedShape: "invalid input",
  };
}

function flattenToParams(value: Record<string, unknown>, options: {
  keyStyle: KeyStyle;
  arrayMode: ArrayMode;
  booleanMode: BooleanMode;
  nullMode: NullMode;
  trimStringValues: boolean;
}): ParamRow[] {
  const rows: ParamRow[] = [];

  const walk = (current: unknown, path: string[], depth: number) => {
    if (current === null) {
      if (options.nullMode === "omit") return;
      rows.push(makeRow(path, options.nullMode === "null" ? "null" : "", "null", depth, options));
      return;
    }

    if (Array.isArray(current)) {
      if (options.arrayMode === "json") {
        rows.push(makeRow(path, JSON.stringify(current), "array", depth, options));
        return;
      }

      if (options.arrayMode === "comma") {
        rows.push(makeRow(path, current.map((item) => formatValue(item, options)).join(","), "array", depth, options));
        return;
      }

      current.forEach((item, index) => {
        let nextPath = path;
        if (options.arrayMode === "brackets") nextPath = [...path, ""];
        if (options.arrayMode === "indexed") nextPath = [...path, String(index)];
        walk(item, nextPath, depth + 1);
      });
      return;
    }

    if (current && typeof current === "object") {
      Object.entries(current as Record<string, unknown>).forEach(([key, item]) => {
        walk(item, [...path, key], depth + 1);
      });
      return;
    }

    rows.push(makeRow(path, formatValue(current, options), typeof current, depth, options));
  };

  Object.entries(value).forEach(([key, item]) => walk(item, [key], 0));
  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(row.key, (counts.get(row.key) ?? 0) + 1));
  return rows.map((row) => ({ ...row, repeated: (counts.get(row.key) ?? 0) > 1 }));
}

function makeRow(path: string[], value: string, sourceType: string, depth: number, options: { keyStyle: KeyStyle }) {
  return {
    key: buildKey(path, options.keyStyle),
    value,
    encodedKey: "",
    encodedValue: "",
    sourceType,
    depth,
    repeated: false,
  };
}

function buildKey(path: string[], keyStyle: KeyStyle) {
  if (keyStyle === "dot") return path.filter(Boolean).join(".");
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

function formatValue(value: unknown, options: {
  booleanMode: BooleanMode;
  trimStringValues: boolean;
}) {
  if (typeof value === "string") return options.trimStringValues ? value.trim() : value;
  if (typeof value === "boolean") {
    if (options.booleanMode === "numeric") return value ? "1" : "0";
    if (options.booleanMode === "presence") return value ? "" : "false";
    return value ? "true" : "false";
  }
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function formatOutput(params: ParamRow[], issues: Issue[], options: {
  outputMode: OutputMode;
  baseUrl?: string;
  includeQuestionMark?: boolean;
}, detectedShape: string) {
  if (options.outputMode === "query" || options.outputMode === "fullUrl") {
    const query = params.map((param) => `${param.encodedKey}=${param.encodedValue}`).join("&");
    const prefixed = options.includeQuestionMark ? `?${query}` : query;
    if (options.outputMode === "fullUrl") {
      return appendQueryToUrl(options.baseUrl || "https://example.com/search", query);
    }
    return prefixed;
  }

  if (options.outputMode === "json") {
    return JSON.stringify({ detectedShape, paramCount: params.length, params, issues }, null, 2);
  }

  if (options.outputMode === "markdown") {
    const lines = [
      "| Key | Value | Encoded Key | Encoded Value | Type |",
      "|---|---|---|---|---|",
      ...params.map((param) => `| ${escapeMarkdown(param.key)} | ${escapeMarkdown(param.value)} | ${escapeMarkdown(param.encodedKey)} | ${escapeMarkdown(param.encodedValue)} | ${param.sourceType} |`),
    ];
    if (issues.length) {
      lines.push("", "Notes:");
      issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
    }
    return lines.join("\n");
  }

  if (options.outputMode === "csv") {
    const rows = [["key", "value", "encoded_key", "encoded_value", "type", "repeated"]];
    params.forEach((param) => rows.push([param.key, param.value, param.encodedKey, param.encodedValue, param.sourceType, param.repeated ? "true" : "false"]));
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  const lines = [
    "# Query Parameter Checklist",
    "",
    `- [${params.length ? "x" : " "}] Generated or inspected ${params.length} parameter${params.length === 1 ? "" : "s"}.`,
    `- [${params.every((param) => param.key) ? "x" : " "}] Every parameter has a key.`,
    `- [${params.length <= 50 ? "x" : " "}] Parameter count is manageable for manual review.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function paramsToObject(params: ParamRow[], coerce: boolean) {
  const output: Record<string, unknown> = {};

  params.forEach((param) => {
    const value = coerce ? coerceValue(param.value) : param.value;
    if (Object.prototype.hasOwnProperty.call(output, param.key)) {
      const current = output[param.key];
      output[param.key] = Array.isArray(current) ? [...current, value] : [current, value];
    } else {
      output[param.key] = value;
    }
  });

  return output;
}

function coerceValue(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function buildIssues(original: unknown, params: ParamRow[], options: {
  warnNestedObjects: boolean;
  warnLongQuery: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnNestedObjects && hasNestedObject(original)) {
    issues.push({
      severity: "info",
      title: "Nested object converted",
      message: "Nested JSON keys were converted into query parameter names. Confirm the style expected by the API.",
    });
  }

  const queryLength = params.map((param) => `${param.encodedKey}=${param.encodedValue}`).join("&").length;
  if (options.warnLongQuery && queryLength > 1800) {
    issues.push({
      severity: "warning",
      title: "Long query string",
      message: "The generated query string is longer than 1,800 characters. Some systems may reject or truncate very long URLs.",
    });
  }

  if (params.some((param) => param.repeated)) {
    issues.push({
      severity: "info",
      title: "Repeated keys",
      message: "Some keys appear more than once. Repeated parameters are common for arrays, but not every backend handles them the same way.",
    });
  }

  return issues;
}

function buildQueryIssues(params: ParamRow[], options: { warnLongQuery: boolean; input: string }) {
  const issues: Issue[] = [];
  if (params.some((param) => param.repeated)) {
    issues.push({
      severity: "info",
      title: "Repeated query keys",
      message: "Repeated query keys were detected and will be represented as arrays in decoded JSON output.",
    });
  }
  if (options.warnLongQuery && options.input.length > 1800) {
    issues.push({
      severity: "warning",
      title: "Long query string",
      message: "The query string is longer than 1,800 characters. Long URLs can be difficult to share and may hit system limits.",
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
      message: "The generated output is large. Review whether a query string is still the right format for this data.",
    });
  }

  return notes;
}

function hasNestedObject(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some((item) => item && typeof item === "object");
}

function extractQueryString(input: string) {
  const trimmed = input.trim();
  const questionIndex = trimmed.indexOf("?");
  const hashIndex = trimmed.indexOf("#");
  const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  if (questionIndex >= 0) return withoutHash.slice(questionIndex + 1);
  return withoutHash.replace(/^\?/, "");
}

function encodePart(value: string, plusSpaces: boolean) {
  const encoded = encodeURIComponent(value);
  return plusSpaces ? encoded.replace(/%20/g, "+") : encoded;
}

function decodePart(value: string, plusSpaces: boolean) {
  const prepared = plusSpaces ? value.replace(/\+/g, " ") : value;
  try {
    return decodeURIComponent(prepared);
  } catch {
    return prepared;
  }
}

function inferValueType(value: string) {
  if (value === "true" || value === "false") return "boolean-like";
  if (value === "null") return "null-like";
  if (/^-?\d+(\.\d+)?$/.test(value)) return "number-like";
  return "string";
}

function appendQueryToUrl(url: string, query: string) {
  if (!url.trim()) return `?${query}`;
  const separator = url.includes("?") ? (url.endsWith("?") || url.endsWith("&") ? "" : "&") : "?";
  return `${url}${separator}${query}`;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
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
