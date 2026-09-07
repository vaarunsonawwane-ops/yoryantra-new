"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ActionMode = "jsonToQuery" | "queryToJson" | "inspect";
type OutputMode = "query" | "fullUrl" | "json" | "markdown" | "csv" | "checklist";
type KeyStyle = "dot" | "bracket";
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
  sourcePath: string;
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
  const [trimStringValues, setTrimStringValues] = useState(false);
  const [sortParams, setSortParams] = useState(false);
  const [encodeSpacesAsPlus, setEncodeSpacesAsPlus] = useState(false);
  const [includeQuestionMark, setIncludeQuestionMark] = useState(false);
  const [includeEmptyStrings, setIncludeEmptyStrings] = useState(true);
  const [decodePlusAsSpace, setDecodePlusAsSpace] = useState(true);
  const [coerceQueryValues, setCoerceQueryValues] = useState(false);
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
    setTrimStringValues(false);
    setSortParams(false);
    setEncodeSpacesAsPlus(false);
    setIncludeQuestionMark(false);
    setIncludeEmptyStrings(true);
    setDecodePlusAsSpace(true);
    setCoerceQueryValues(false);
    setWarnNestedObjects(true);
    setWarnLongQuery(true);
    clearResult();
  };

  const loadQueryExample = () => {
    setInput(sampleQuery);
    setActionMode("queryToJson");
    setOutputMode("json");
    setDecodePlusAsSpace(true);
    setCoerceQueryValues(false);
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
    setTrimStringValues(false);
    setSortParams(false);
    setEncodeSpacesAsPlus(false);
    setIncludeQuestionMark(false);
    setIncludeEmptyStrings(true);
    setDecodePlusAsSpace(true);
    setCoerceQueryValues(false);
    setWarnNestedObjects(true);
    setWarnLongQuery(true);
    clearResult();
  };

  return (
    <ToolShell
      title="JSON to URL Query Converter"
      description="Translate JSON and query parameters without hiding encoding, nesting, repetition, or type-conversion choices."
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

          {outputMode === "fullUrl" && actionMode === "jsonToQuery" ? (
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
                if (next === "inspect" && (outputMode === "query" || outputMode === "fullUrl")) setOutputMode("markdown");
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
              options={actionMode === "jsonToQuery" ? [
                { label: "Query string", value: "query" },
                { label: "Full URL", value: "fullUrl" },
                { label: "JSON report", value: "json" },
                { label: "Markdown table", value: "markdown" },
                { label: "CSV", value: "csv" },
                { label: "Review checklist", value: "checklist" },
              ] : [
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
          <Toggle checked={encodeSpacesAsPlus} onChange={setEncodeSpacesAsPlus} label="Use form-style encoding (space → +)" />
          <Toggle checked={includeQuestionMark} onChange={setIncludeQuestionMark} label="Prefix query output with ?" />
          <Toggle checked={includeEmptyStrings} onChange={setIncludeEmptyStrings} label="Include empty string values" />
          <Toggle checked={decodePlusAsSpace} onChange={setDecodePlusAsSpace} label="Decode plus signs as spaces" />
          <Toggle checked={coerceQueryValues} onChange={setCoerceQueryValues} label="Coerce decoded booleans, nulls, and safe numbers" />
          <Toggle checked={warnNestedObjects} onChange={setWarnNestedObjects} label="Warn about nested object conversion" />
          <Toggle checked={warnLongQuery} onChange={setWarnLongQuery} label="Warn when query string is long" />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-gray-500">
          Query parameters are strings on the wire. Nesting, arrays, plus signs, and type coercion are application-level choices, so keep only the transformations your receiving system expects.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={processInput}
          className="min-h-[44px] whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Convert Query Data
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load JSON Example
        </button>
        <button
          type="button"
          onClick={loadQueryExample}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-3 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Load Query Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
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
                className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
              <div key={`${note.title}-${note.message}`} className={issueCardClass(note.severity)}>
                <p className={issueTitleClass(note.severity)}>{note.title}</p>
                <p className={issueTextClass(note.severity)}>{note.message}</p>
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
          <h2 className="text-2xl font-semibold text-gray-900">A query string is a list of name-value pairs, not a typed JSON object</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Converting JSON into a URL query means choosing how structure is flattened. A JSON boolean, number, array, nested object, <code className="rounded bg-gray-100 px-1 py-0.5">null</code>, and empty string do not carry their JSON types through a query string by themselves. On the wire, a parameter is a name and a string value; the receiving application decides what that string means.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            That is why decoded values stay strings by default. Optional coercion is deliberately conservative and only converts <code className="rounded bg-gray-100 px-1 py-0.5">true</code>, <code className="rounded bg-gray-100 px-1 py-0.5">false</code>, <code className="rounded bg-gray-100 px-1 py-0.5">null</code>, and finite numbers that JavaScript can represent safely.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Nested-key syntax is an application convention</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Dot form such as <code className="rounded bg-white px-1 py-0.5">filter.status</code> and bracket form such as <code className="rounded bg-white px-1 py-0.5">filter[status]</code> are common conventions, but the URL standard does not assign nested-object semantics to either one. Match the backend or framework that will parse the request.
            </p>
          </div>
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-lg font-semibold text-amber-900">Array syntax can change the meaning of the request</h2>
            <p className="mt-3 text-sm leading-6 text-amber-800">
              Repeated names, comma-joined values, empty brackets, indexed brackets, and JSON text are not interchangeable. A comma inside an array item makes comma mode ambiguous unless the receiver has its own escaping rule. Repeated keys are usually the least lossy representation when the API explicitly supports them.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Percent encoding and form encoding are related but not identical</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Generic component encoding uses percent escapes such as <code className="rounded bg-gray-100 px-1 py-0.5">%20</code> for a space. The WHATWG <code className="rounded bg-gray-100 px-1 py-0.5">application/x-www-form-urlencoded</code> serializer used by <code className="rounded bg-gray-100 px-1 py-0.5">URLSearchParams</code> encodes spaces as <code className="rounded bg-gray-100 px-1 py-0.5">+</code> and uses a slightly different percent-encode set. The form-style option follows that behavior instead of only swapping one character after the fact.
          </p>
          <p className="mt-3 text-sm text-gray-600">
            Primary reference:{" "}
            <a
              href="https://url.spec.whatwg.org/#application/x-www-form-urlencoded"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-2"
            >
              WHATWG URL Standard — application/x-www-form-urlencoded
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Malformed percent escapes are errors, not text to guess around</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A copied query containing an incomplete escape such as <code className="rounded bg-gray-100 px-1 py-0.5">%E0</code> or a stray <code className="rounded bg-gray-100 px-1 py-0.5">%</code> is stopped during decoding. Silently returning the undecoded source would mix encoded and decoded data in the same result and make later comparisons unreliable.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A <code className="rounded bg-gray-100 px-1 py-0.5">+</code> is decoded as a space only when the form-style interpretation is enabled. Outside that convention, a literal plus can be meaningful data and should remain a plus.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appending parameters to a full URL must preserve the fragment</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Existing query parameters are retained, new pairs are added before any <code className="rounded bg-gray-100 px-1 py-0.5">#fragment</code>, and the fragment stays at the end of the URL. This avoids the common mistake of appending <code className="rounded bg-gray-100 px-1 py-0.5">?x=1</code> after a fragment, where it would no longer be part of the URL query.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Flattening can create collisions</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A literal JSON key named <code className="rounded bg-gray-100 px-1 py-0.5">filter.status</code> can collide with the dot-path representation of <code className="rounded bg-gray-100 px-1 py-0.5">{'{"filter":{"status":"live"}}'}</code>. Bracket syntax has similar edge cases when source keys contain brackets. Repeated generated names are surfaced so you can decide whether they are intentional array entries or a structural collision.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Empty objects have no natural query-pair representation and are omitted. Empty arrays are also omitted unless the selected array policy serializes the whole array as JSON text. Those omissions are reported when they occur.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">JSON input is checked before browser parsing can hide data loss</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Duplicate JSON object names are rejected instead of allowing <code className="rounded bg-gray-100 px-1 py-0.5">JSON.parse</code> to keep one value silently. Integers outside JavaScript's safe exact range are also stopped before they can be rounded and then emitted as a different query value.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Local processing does not remove every privacy consideration</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Conversion and decoding run in the current browser tab; the page code does not send the pasted query or JSON to a Yoryantra server. Query strings often contain identifiers, search terms, tokens, or internal filters, so remove secrets before sharing generated URLs in tickets, screenshots, analytics tools, chat logs, or documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4"><YoryantraRelatedTools currentHref="/tools/json-to-url-query-converter" /></div>
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

  const dataRisk = findJsonDataRisk(options.input);
  if (dataRisk) {
    return emptyResult(`__ERROR__:${dataRisk}`, options.input.length);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return emptyResult("__ERROR__:Paste a JSON object. Query parameters need named top-level members.", options.input.length);
  }

  let params: ParamRow[];
  try {
    params = flattenToParams(parsed as Record<string, unknown>, options);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The JSON structure could not be flattened safely.";
    return emptyResult(`__ERROR__:${message}`, options.input.length);
  }

  if (!options.includeEmptyStrings) {
    params = params.filter((param) => !(param.sourceType === "string" && param.value === ""));
  }

  if (options.sortParams) {
    params = [...params].sort((a, b) => compareCodeUnits(a.key, b.key) || compareCodeUnits(a.sourcePath, b.sourcePath));
  }

  try {
    params = params.map((param) => ({
      ...param,
      encodedKey: encodePart(param.key, options.encodeSpacesAsPlus),
      encodedValue: encodePart(param.value, options.encodeSpacesAsPlus),
    }));
  } catch {
    return emptyResult("__ERROR__:A query name or value contains an unpaired UTF-16 surrogate that cannot be percent-encoded safely. Replace or remove that character first.", options.input.length);
  }

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
  const parts = raw === "" ? [] : raw.split("&");

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    if (part === "") continue;

    const equalIndex = part.indexOf("=");
    const rawKey = equalIndex >= 0 ? part.slice(0, equalIndex) : part;
    const rawValue = equalIndex >= 0 ? part.slice(equalIndex + 1) : "";

    const decodedKey = decodePart(rawKey, options.decodePlusAsSpace);
    if (!decodedKey.valid) {
      return emptyResult(`__ERROR__:Parameter ${index + 1} has malformed percent-encoding in its name.`, options.input.length);
    }

    const decodedValue = decodePart(rawValue, options.decodePlusAsSpace);
    if (!decodedValue.valid) {
      return emptyResult(`__ERROR__:Parameter ${index + 1} has malformed percent-encoding in its value.`, options.input.length);
    }

    const key = decodedKey.value;
    const value = decodedValue.value;
    params.push({
      key,
      value,
      encodedKey: rawKey,
      encodedValue: rawValue,
      sourceType: inferValueType(value),
      depth: estimateQueryDepth(key),
      repeated: false,
      sourcePath: `query[${index}]`,
    });
  }

  const counts = new Map<string, number>();
  params.forEach((param) => counts.set(param.key, (counts.get(param.key) ?? 0) + 1));
  const marked = params.map((param) => ({ ...param, repeated: (counts.get(param.key) ?? 0) > 1 }));

  const issues = buildQueryIssues(marked, { ...options, rawQuery: raw });
  const jsonObject = paramsToObject(marked, options.coerceQueryValues);
  let output = "";

  if (options.outputMode === "json") {
    output = JSON.stringify(jsonObject, null, 2);
  } else {
    output = formatOutput(
      marked,
      issues,
      {
        ...options,
        outputMode: options.outputMode === "query" || options.outputMode === "fullUrl" ? "markdown" : options.outputMode,
        baseUrl: "",
        includeQuestionMark: false,
      },
      "query string",
    );
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

type QueryPathPart =
  | { kind: "key"; value: string }
  | { kind: "arrayIndex"; value: string }
  | { kind: "arrayBracket"; value: "" };

function flattenToParams(value: Record<string, unknown>, options: {
  keyStyle: KeyStyle;
  arrayMode: ArrayMode;
  booleanMode: BooleanMode;
  nullMode: NullMode;
  trimStringValues: boolean;
}): ParamRow[] {
  const rows: ParamRow[] = [];

  const walk = (current: unknown, path: QueryPathPart[], sourcePath: string, depth: number) => {
    if (depth > 100) {
      throw new Error("Nested JSON is deeper than 100 levels. Flatten it in application code where recursion and schema rules can be controlled.");
    }

    if (current === null) {
      if (options.nullMode === "omit") return;
      rows.push(makeRow(path, options.nullMode === "null" ? "null" : "", "null", depth, sourcePath, options));
      return;
    }

    if (Array.isArray(current)) {
      if (options.arrayMode === "json") {
        rows.push(makeRow(path, JSON.stringify(current), "array", depth, sourcePath, options));
        return;
      }

      if (options.arrayMode === "comma") {
        rows.push(makeRow(path, current.map((item) => formatValue(item, options)).join(","), "array", depth, sourcePath, options));
        return;
      }

      current.forEach((item, index) => {
        if (options.arrayMode === "repeat") {
          walk(item, path, `${sourcePath}/${index}`, depth + 1);
        } else if (options.arrayMode === "brackets") {
          walk(item, [...path, { kind: "arrayBracket", value: "" }], `${sourcePath}/${index}`, depth + 1);
        } else {
          walk(item, [...path, { kind: "arrayIndex", value: String(index) }], `${sourcePath}/${index}`, depth + 1);
        }
      });
      return;
    }

    if (current && typeof current === "object") {
      Object.entries(current as Record<string, unknown>).forEach(([key, item]) => {
        walk(
          item,
          [...path, { kind: "key", value: key }],
          `${sourcePath}/${encodePointerSegment(key)}`,
          depth + 1,
        );
      });
      return;
    }

    rows.push(makeRow(path, formatValue(current, options), typeof current, depth, sourcePath, options));
  };

  Object.entries(value).forEach(([key, item]) => {
    walk(item, [{ kind: "key", value: key }], `/${encodePointerSegment(key)}`, 0);
  });

  const counts = new Map<string, number>();
  rows.forEach((row) => counts.set(row.key, (counts.get(row.key) ?? 0) + 1));
  return rows.map((row) => ({ ...row, repeated: (counts.get(row.key) ?? 0) > 1 }));
}

function makeRow(
  path: QueryPathPart[],
  value: string,
  sourceType: string,
  depth: number,
  sourcePath: string,
  options: { keyStyle: KeyStyle },
): ParamRow {
  return {
    key: buildKey(path, options.keyStyle),
    value,
    encodedKey: "",
    encodedValue: "",
    sourceType,
    depth,
    repeated: false,
    sourcePath,
  };
}

function buildKey(path: QueryPathPart[], keyStyle: KeyStyle) {
  let output = "";

  path.forEach((part) => {
    if (part.kind === "arrayBracket") {
      output += "[]";
      return;
    }
    if (part.kind === "arrayIndex") {
      output += `[${part.value}]`;
      return;
    }

    if (!output) {
      output = part.value;
    } else if (keyStyle === "dot") {
      output += `.${part.value}`;
    } else {
      output += `[${part.value}]`;
    }
  });

  return output;
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

  if (typeof value === "number") return Object.is(value, -0) ? "-0" : String(value);
  return JSON.stringify(value);
}

function formatOutput(params: ParamRow[], issues: Issue[], options: {
  outputMode: OutputMode;
  baseUrl?: string;
  includeQuestionMark?: boolean;
}, detectedShape: string) {
  if (options.outputMode === "query" || options.outputMode === "fullUrl") {
    const query = params.map((param) => `${param.encodedKey}=${param.encodedValue}`).join("&");
    if (options.outputMode === "fullUrl") {
      return appendQueryToUrl(options.baseUrl || "https://example.com/search", query);
    }
    return options.includeQuestionMark ? `?${query}` : query;
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
    const rows = [["key", "value", "encoded_key", "encoded_value", "type", "repeated", "source_path"]];
    params.forEach((param) => rows.push([
      param.key,
      param.value,
      param.encodedKey,
      param.encodedValue,
      param.sourceType,
      param.repeated ? "true" : "false",
      param.sourcePath,
    ]));
    return rows.map((row) => row.map(csvCell).join(",")).join("\n");
  }

  const lines = [
    "# Query parameter check",
    "",
    `- [${params.length ? "x" : " "}] Produced or inspected ${params.length} parameter${params.length === 1 ? "" : "s"}.`,
    `- [${issues.every((issue) => issue.severity !== "high") ? "x" : " "}] No high-severity encoding or data-integrity errors remain.`,
    `- [${params.length <= 100 ? "x" : " "}] Parameter count is still practical for manual inspection.`,
  ];

  if (issues.length) {
    lines.push("", "Notes:");
    issues.forEach((issue) => lines.push(`- ${issue.title}: ${issue.message}`));
  }

  return lines.join("\n");
}

function paramsToObject(params: ParamRow[], coerce: boolean) {
  const output = Object.create(null) as Record<string, unknown>;

  params.forEach((param) => {
    const value = coerce ? coerceValue(param.value) : param.value;

    if (Object.prototype.hasOwnProperty.call(output, param.key)) {
      const current = output[param.key];
      output[param.key] = Array.isArray(current) ? [...current, value] : [current, value];
    } else {
      Object.defineProperty(output, param.key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  });

  return output;
}

function coerceValue(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;

  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue) && (!Number.isInteger(numberValue) || Number.isSafeInteger(numberValue)) && !Object.is(numberValue, -0)) {
      return numberValue;
    }
  }

  return value;
}

function buildIssues(original: unknown, params: ParamRow[], options: {
  keyStyle: KeyStyle;
  arrayMode: ArrayMode;
  booleanMode: BooleanMode;
  trimStringValues: boolean;
  warnNestedObjects: boolean;
  warnLongQuery: boolean;
}) {
  const issues: Issue[] = [];

  if (options.warnNestedObjects && hasNestedStructure(original)) {
    issues.push({
      severity: "info",
      title: "Structure was flattened into parameter names",
      message: `Nested data uses ${options.keyStyle === "dot" ? "dot" : "bracket"} notation and the selected array policy. The receiving application must interpret that convention the same way.`,
    });
  }

  const queryLength = params.map((param) => `${param.encodedKey}=${param.encodedValue}`).join("&").length;
  if (options.warnLongQuery && queryLength > 2000) {
    issues.push({
      severity: "warning",
      title: "Long generated query",
      message: `The encoded query is ${queryLength.toLocaleString()} characters. 2,000 is only a review threshold here, not a protocol limit; browser, proxy, server, and framework limits vary.`,
    });
  }

  if (params.some((param) => param.repeated)) {
    issues.push({
      severity: "info",
      title: "Repeated parameter names need receiver agreement",
      message: "Repeated names can represent arrays, but they can also arise when flattened source paths collide. Confirm how the backend reads repeated parameters.",
    });
  }

  if (options.arrayMode === "comma" && hasAmbiguousCommaArray(original)) {
    issues.push({
      severity: "warning",
      title: "Comma joining can be ambiguous",
      message: "At least one array item contains a comma or structured value. A comma-joined query cannot preserve those item boundaries without an application-specific escaping rule.",
    });
  }

  const emptyContainers = countEmptyContainers(original);
  if (emptyContainers > 0 && options.arrayMode !== "json") {
    issues.push({
      severity: "info",
      title: "Empty containers have no emitted pair",
      message: `${emptyContainers} empty object or array ${emptyContainers === 1 ? "value has" : "values have"} no natural name-value pair in the selected representation and may be omitted.`,
    });
  }

  if (hasAmbiguousMemberNames(original, options.keyStyle)) {
    issues.push({
      severity: "warning",
      title: "Source member names overlap the nesting syntax",
      message: options.keyStyle === "dot"
        ? 'At least one JSON member name contains a dot. A literal "a.b" key can collide with the flattened path for {"a":{"b":...}}.'
        : "At least one JSON member name contains brackets. Bracket notation can become ambiguous when brackets are literal source characters.",
    });
  }

  if (options.trimStringValues && hasTrimmedStringChange(original)) {
    issues.push({
      severity: "warning",
      title: "String whitespace was changed",
      message: "Trimming is enabled and at least one JSON string has leading or trailing whitespace. Query output therefore does not preserve that source value exactly.",
    });
  }

  if (options.booleanMode === "presence") {
    issues.push({
      severity: "info",
      title: "Presence-style booleans are application-specific",
      message: 'true becomes an empty-valued present parameter while false is emitted as "false". Confirm that this matches the receiver before relying on it.',
    });
  }

  return issues;
}

function buildQueryIssues(params: ParamRow[], options: {
  warnLongQuery: boolean;
  input: string;
  rawQuery: string;
  coerceQueryValues: boolean;
  decodePlusAsSpace: boolean;
}) {
  const issues: Issue[] = [];

  if (params.some((param) => param.repeated)) {
    issues.push({
      severity: "info",
      title: "Repeated names become arrays in decoded JSON",
      message: "That array representation is a local decoding choice; the query string itself carries repeated name-value pairs rather than a JSON array type.",
    });
  }

  if (options.warnLongQuery && options.rawQuery.length > 2000) {
    issues.push({
      severity: "warning",
      title: "Long query",
      message: `The query portion is ${options.rawQuery.length.toLocaleString()} characters. 2,000 is a review threshold, not a universal URL limit.`,
    });
  }

  if (options.coerceQueryValues && params.some((param) => coerceValue(param.value) !== param.value)) {
    issues.push({
      severity: "warning",
      title: "Decoded strings were coerced",
      message: "Some query values were converted to booleans, null, or safe JavaScript numbers. Query strings do not carry those JSON types themselves.",
    });
  }

  if (options.decodePlusAsSpace && options.rawQuery.includes("+")) {
    issues.push({
      severity: "info",
      title: "Plus signs were interpreted as spaces",
      message: "That behavior matches form-style query decoding. Disable it when literal plus signs are part of the data.",
    });
  }

  return issues;
}

function getNotes(result: Result): Issue[] {
  const notes = [...result.issues];

  if (result.outputLength > 50000) {
    notes.push({
      severity: "info",
      title: "Large generated report",
      message: "The output is sizeable enough that a request body or structured file may be a better transport than a query string.",
    });
  }

  return notes;
}

function hasNestedStructure(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).some((item) => item !== null && typeof item === "object");
}

function hasAmbiguousCommaArray(value: unknown): boolean {
  if (Array.isArray(value)) {
    if (value.some((item) => (typeof item === "string" && item.includes(",")) || (item !== null && typeof item === "object"))) {
      return true;
    }
    return value.some(hasAmbiguousCommaArray);
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(hasAmbiguousCommaArray);
  }
  return false;
}

function countEmptyContainers(value: unknown): number {
  if (Array.isArray(value)) {
    return (value.length === 0 ? 1 : 0) + value.reduce((count, item) => count + countEmptyContainers(item), 0);
  }
  if (value && typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>);
    return (values.length === 0 ? 1 : 0) + values.reduce<number>((count, item) => count + countEmptyContainers(item), 0);
  }
  return 0;
}

function hasAmbiguousMemberNames(value: unknown, keyStyle: KeyStyle): boolean {
  if (Array.isArray(value)) return value.some((item) => hasAmbiguousMemberNames(item, keyStyle));
  if (!value || typeof value !== "object") return false;

  return Object.entries(value as Record<string, unknown>).some(([key, item]) => {
    const ambiguous = keyStyle === "dot" ? key.includes(".") : key.includes("[") || key.includes("]");
    return ambiguous || hasAmbiguousMemberNames(item, keyStyle);
  });
}

function hasTrimmedStringChange(value: unknown): boolean {
  if (typeof value === "string") return value !== value.trim();
  if (Array.isArray(value)) return value.some(hasTrimmedStringChange);
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some(hasTrimmedStringChange);
  }
  return false;
}

function extractQueryString(input: string) {
  const trimmed = input.trim();
  const hashIndex = trimmed.indexOf("#");
  const withoutHash = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
  const questionIndex = withoutHash.indexOf("?");
  if (questionIndex >= 0) return withoutHash.slice(questionIndex + 1);
  return withoutHash.replace(/^\?/, "");
}

function encodePart(value: string, formStyle: boolean) {
  let encoded = encodeURIComponent(value);
  if (!formStyle) return encoded;

  encoded = encoded.replace(/[!'()~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  return encoded.replace(/%20/g, "+");
}

function decodePart(value: string, formStyle: boolean): { valid: boolean; value: string } {
  const prepared = formStyle ? value.replace(/\+/g, " ") : value;
  try {
    return { valid: true, value: decodeURIComponent(prepared) };
  } catch {
    return { valid: false, value: "" };
  }
}

function inferValueType(value: string) {
  if (value === "true" || value === "false") return "boolean-like string";
  if (value === "null") return "null-like string";
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) return "number-like string";
  return "string";
}

function estimateQueryDepth(key: string) {
  const dotSegments = key.split(".").filter((part) => part !== "").length;
  const bracketSegments = (key.match(/\[[^\]]*\]/g) || []).length;
  return Math.max(0, dotSegments + bracketSegments - 1);
}

function appendQueryToUrl(url: string, query: string) {
  if (!query) return url;
  if (!url.trim()) return `?${query}`;

  const hashIndex = url.indexOf("#");
  const beforeHash = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const fragment = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const separator = beforeHash.includes("?")
    ? (beforeHash.endsWith("?") || beforeHash.endsWith("&") ? "" : "&")
    : "?";

  return `${beforeHash}${separator}${query}${fragment}`;
}

function encodePointerSegment(segment: string) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

function compareCodeUnits(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function findJsonDataRisk(text: string): string | null {
  let index = 0;

  const skipWhitespace = () => {
    while (index < text.length && /\s/.test(text[index])) index += 1;
  };

  const parseString = (): string => {
    const start = index;
    index += 1;
    while (index < text.length) {
      const char = text[index];
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === '"') {
        index += 1;
        return JSON.parse(text.slice(start, index)) as string;
      }
      index += 1;
    }
    throw new Error("syntax");
  };

  const parseNumber = () => {
    const match = text.slice(index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/);
    if (!match) throw new Error("syntax");
    const token = match[0];
    index += token.length;
    const value = Number(token);

    if (!Number.isFinite(value)) {
      throw new Error("A JSON number is outside JavaScript's finite numeric range. Convert it to a string before generating query data.");
    }
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new Error(`JSON integer ${token} cannot be represented exactly by JavaScript. Convert it to a string before generating query data.`);
    }
    if (Object.is(value, -0)) {
      throw new Error("JSON number -0 can lose its sign during conversion. Convert it to a string if that distinction matters.");
    }
  };

  const parseValue = (depth: number): void => {
    if (depth > 200) throw new Error("JSON nesting is deeper than 200 levels, which is unsafe for this browser-side conversion.");
    skipWhitespace();
    const char = text[index];

    if (char === "{") {
      index += 1;
      skipWhitespace();
      const names = new Set<string>();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      while (index < text.length) {
        skipWhitespace();
        if (text[index] !== '"') throw new Error("syntax");
        const name = parseString();
        if (names.has(name)) {
          throw new Error(`Duplicate object member "${name}" would be collapsed by JSON.parse. Remove or rename the duplicate before converting.`);
        }
        names.add(name);
        skipWhitespace();
        if (text[index] !== ":") throw new Error("syntax");
        index += 1;
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "}") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("syntax");
        index += 1;
      }
      throw new Error("syntax");
    }

    if (char === "[") {
      index += 1;
      skipWhitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      while (index < text.length) {
        parseValue(depth + 1);
        skipWhitespace();
        if (text[index] === "]") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("syntax");
        index += 1;
      }
      throw new Error("syntax");
    }

    if (char === '"') {
      parseString();
      return;
    }

    if (char === "-" || (char >= "0" && char <= "9")) {
      parseNumber();
      return;
    }

    if (text.slice(index, index + 4) === "true" || text.slice(index, index + 4) === "null") {
      index += 4;
      return;
    }
    if (text.slice(index, index + 5) === "false") {
      index += 5;
      return;
    }
    throw new Error("syntax");
  };

  try {
    parseValue(0);
    return null;
  } catch (error) {
    if (error instanceof Error && error.message !== "syntax") return error.message;
    return null;
  }
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function issueCardClass(severity: Issue["severity"]) {
  if (severity === "high") return "self-start rounded-xl border border-red-200 bg-red-50 p-4";
  if (severity === "warning") return "self-start rounded-xl border border-amber-200 bg-amber-50 p-4";
  return "self-start rounded-xl border border-gray-200 bg-gray-50 p-4";
}

function issueTitleClass(severity: Issue["severity"]) {
  if (severity === "high") return "text-sm font-semibold text-red-900";
  if (severity === "warning") return "text-sm font-semibold text-amber-900";
  return "text-sm font-semibold text-gray-900";
}

function issueTextClass(severity: Issue["severity"]) {
  if (severity === "high") return "mt-1 text-sm leading-6 text-red-800";
  if (severity === "warning") return "mt-1 text-sm leading-6 text-amber-800";
  return "mt-1 text-sm leading-6 text-gray-600";
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#d9a928]"
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

