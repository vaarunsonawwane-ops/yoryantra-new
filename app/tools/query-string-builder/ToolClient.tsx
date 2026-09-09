"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type EncodingMode = "encoded" | "raw";
type ArrayFormat = "repeat" | "brackets" | "comma";
type OutputMode = "query" | "url" | "json";
type NoteTone = "warning" | "info";

type QueryParam = {
  id: number;
  key: string;
  value: string;
  enabled: boolean;
};

type QueryNote = {
  title: string;
  message: string;
  tone: NoteTone;
};

const sampleParams: QueryParam[] = [
  { id: 1, key: "search", value: "developer tools", enabled: true },
  { id: 2, key: "page", value: "1", enabled: true },
  { id: 3, key: "tags", value: "api,http,json", enabled: true },
];

export default function ToolClient() {
  const [baseUrl, setBaseUrl] = useState("");
  const [params, setParams] = useState<QueryParam[]>([
    { id: 1, key: "", value: "", enabled: true },
  ]);
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("encoded");
  const [arrayFormat, setArrayFormat] = useState<ArrayFormat>("repeat");
  const [outputMode, setOutputMode] = useState<OutputMode>("query");
  const [splitCommaValues, setSplitCommaValues] = useState(false);
  const [skipEmptyValues, setSkipEmptyValues] = useState(false);
  const [sortParams, setSortParams] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const activeParams = useMemo(
    () =>
      params
        .filter((param) => param.enabled)
        .filter((param) => param.key.trim() !== "")
        .filter((param) => !(skipEmptyValues && param.value === "")),
    [params, skipEmptyValues]
  );

  const output = useMemo(
    () =>
      buildOutput({
        baseUrl,
        params: activeParams,
        encodingMode,
        arrayFormat,
        outputMode,
        splitCommaValues,
        sortParams,
      }),
    [baseUrl, activeParams, encodingMode, arrayFormat, outputMode, splitCommaValues, sortParams]
  );

  const notes = useMemo(
    () =>
      getQueryNotes({
        baseUrl,
        params: activeParams,
        outputMode,
        encodingMode,
        splitCommaValues,
      }),
    [baseUrl, activeParams, outputMode, encodingMode, splitCommaValues]
  );

  const addParam = () => {
    setParams((current) => [
      ...current,
      { id: Date.now() + current.length, key: "", value: "", enabled: true },
    ]);
    setCopied(false);
    setCopyError("");
  };

  const updateParam = (
    id: number,
    field: keyof Omit<QueryParam, "id">,
    value: string | boolean
  ) => {
    setParams((current) =>
      current.map((param) => (param.id === id ? { ...param, [field]: value } : param))
    );
    setCopied(false);
    setCopyError("");
  };

  const removeParam = (id: number) => {
    setParams((current) => {
      const next = current.filter((param) => param.id !== id);
      return next.length > 0
        ? next
        : [{ id: Date.now(), key: "", value: "", enabled: true }];
    });
    setCopied(false);
    setCopyError("");
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyError("Copy failed. Select the output and copy it manually.");
    }
  };

  const loadExample = () => {
    setBaseUrl("https://api.example.com/search");
    setParams(sampleParams);
    setEncodingMode("encoded");
    setArrayFormat("repeat");
    setOutputMode("url");
    setSplitCommaValues(true);
    setSkipEmptyValues(false);
    setSortParams(false);
    setCopied(false);
    setCopyError("");
  };

  const resetAll = () => {
    setBaseUrl("");
    setParams([{ id: 1, key: "", value: "", enabled: true }]);
    setEncodingMode("encoded");
    setArrayFormat("repeat");
    setOutputMode("query");
    setSplitCommaValues(false);
    setSkipEmptyValues(false);
    setSortParams(false);
    setCopied(false);
    setCopyError("");
  };

  return (
    <ToolShell
      title="Query String Builder"
      description="Build query strings from explicit key-value rows with controlled encoding, repeated keys, and array conventions."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Base URL</label>
        <input
          value={baseUrl}
          onChange={(event) => {
            setBaseUrl(event.target.value);
            setCopied(false);
            setCopyError("");
          }}
          placeholder="https://api.example.com/search"
          className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Needed only for Full URL output. Existing query text is preserved and new parameters are appended before any #fragment.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Query Parameters</h3>
            <p className="mt-1 text-sm text-gray-500">
              Each enabled row contributes one key/value pair unless comma splitting is deliberately enabled.
            </p>
          </div>
          <button onClick={addParam} className="yoryantra-btn-outline whitespace-nowrap">Add Parameter</button>
        </div>

        <div className="mt-5 space-y-3">
          {params.map((param, index) => (
            <div
              key={param.id}
              className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[auto_1fr_1fr_auto] md:items-center"
            >
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={(event) => updateParam(param.id, "enabled", event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[var(--light-gold)]"
                />
                <span>{index + 1}</span>
              </label>

              <input
                value={param.key}
                onChange={(event) => updateParam(param.id, "key", event.target.value)}
                placeholder="key"
                aria-label={`Parameter ${index + 1} key`}
                className="w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <input
                value={param.value}
                onChange={(event) => updateParam(param.id, "value", event.target.value)}
                placeholder="value"
                aria-label={`Parameter ${index + 1} value`}
                className="w-full rounded-xl border border-gray-300 p-3 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <button
                onClick={() => removeParam(param.id)}
                className="whitespace-nowrap rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">Output Options</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setCopied(false);
              setCopyError("");
            }}
            options={[
              { label: "Query string", value: "query" },
              { label: "Full URL", value: "url" },
              { label: "JSON object", value: "json" },
            ]}
          />

          <YoryantraSelect
            label="Key & Value Encoding"
            value={encodingMode}
            onChange={(value) => {
              setEncodingMode(value as EncodingMode);
              setCopied(false);
              setCopyError("");
            }}
            options={[
              { label: "Percent encoded", value: "encoded" },
              { label: "Unencoded", value: "raw" },
            ]}
          />

          <YoryantraSelect
            label="Array Convention"
            value={arrayFormat}
            onChange={(value) => {
              setArrayFormat(value as ArrayFormat);
              setCopied(false);
              setCopyError("");
            }}
            options={[
              { label: "Repeated keys", value: "repeat" },
              { label: "Brackets", value: "brackets" },
              { label: "Comma separated", value: "comma" },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={splitCommaValues}
              onChange={(event) => {
                setSplitCommaValues(event.target.checked);
                setCopied(false);
                setCopyError("");
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Treat commas as array separators</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Off by default, so a value like <span className="font-mono">Pune, Maharashtra</span> stays one literal value.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={skipEmptyValues}
              onChange={(event) => {
                setSkipEmptyValues(event.target.checked);
                setCopied(false);
                setCopyError("");
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Skip exactly empty values</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Removes only an empty string. Whitespace remains data and can still be percent encoded.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 self-start rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={sortParams}
              onChange={(event) => {
                setSortParams(event.target.checked);
                setCopied(false);
                setCopyError("");
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Sort new rows by key</span>
              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Sorts only the rows entered here. Existing query text in the base URL keeps its original order.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={copyOutput} className="yoryantra-btn whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">Load Example</button>
        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">Reset</button>
      </div>

      {copyError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {copyError}
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Active Rows" value={activeParams.length.toLocaleString()} />
        <SummaryCard label="Output" value={outputMode} />
        <SummaryCard label="Encoding" value={encodingMode === "encoded" ? "percent" : "raw"} />
        <SummaryCard label="Characters" value={output.length.toLocaleString()} />
      </div>

      {notes.length > 0 && (
        <div className="mt-6 space-y-3">
          {notes.map((note) => (
            <div
              key={`${note.tone}-${note.title}`}
              className={
                note.tone === "warning"
                  ? "self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
                  : "self-start rounded-xl border border-gray-200 bg-gray-50 p-4"
              }
            >
              <p className={note.tone === "warning" ? "text-sm font-semibold text-amber-900" : "text-sm font-semibold text-gray-900"}>
                {note.title}
              </p>
              <p className={note.tone === "warning" ? "mt-1 text-sm leading-relaxed text-amber-800" : "mt-1 text-sm leading-relaxed text-gray-600"}>
                {note.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Output</h3>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Query output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Query construction stays in your browser. The base URL and parameter values are not sent anywhere by this page.
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A query string is data plus a serialization choice</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Query syntax allows applications to place non-hierarchical data after <span className="font-mono">?</span>. The familiar <span className="font-mono">key=value&amp;key=value</span> shape is a convention layered on top of that syntax, so an API must still define what repeated keys, brackets, commas, empty values, and ordering mean for that endpoint.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Percent encoding here is deliberately strict</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Percent-encoded mode encodes each key and value as a UTF-8 component and uses <span className="font-mono">%20</span> for spaces. It also escapes characters such as <span className="font-mono">!</span>, <span className="font-mono">'</span>, <span className="font-mono">(</span>, <span className="font-mono">)</span>, and <span className="font-mono">*</span> so delimiters cannot accidentally become structure. This is intentionally different from <span className="font-mono">URLSearchParams</span> form serialization, which writes spaces as <span className="font-mono">+</span>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Unencoded mode is for inspection only. If a raw key or value contains <span className="font-mono">&amp;</span>, <span className="font-mono">=</span>, <span className="font-mono">#</span>, or whitespace, the resulting text can be ambiguous or unsuitable as a URL.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Repeated keys and array notation are not one universal standard</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Repeating a name is directly representable in URL query parameters, for example <span className="font-mono">tag=api&amp;tag=http</span>. Bracket notation such as <span className="font-mono">tag[]=api</span> and a single comma-separated value are application conventions. Use whichever form the receiving API documents.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Commas are treated as literal text unless the array-separator option is enabled. When it is enabled, every comma becomes a boundary and empty array items are preserved rather than silently discarded.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Existing query text and fragments stay in the right place</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Full URL output leaves an existing query string untouched, appends the new rows with <span className="font-mono">&amp;</span>, and inserts them before a <span className="font-mono">#fragment</span>. Sorting applies only to the new rows because reordering an existing query could change application-specific semantics.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards and browser references</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer">WHATWG URL Standard</a>{" "}
            defines URL parsing, query serialization, and URLSearchParams behavior. MDN documents how{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/append" target="_blank" rel="noreferrer">URLSearchParams.append()</a>{" "}
            preserves repeated names. For the generic URI component model, see{" "}
            <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc3986.html" target="_blank" rel="noreferrer">RFC 3986</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/query-string-builder" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function buildOutput({
  baseUrl,
  params,
  encodingMode,
  arrayFormat,
  outputMode,
  splitCommaValues,
  sortParams,
}: {
  baseUrl: string;
  params: QueryParam[];
  encodingMode: EncodingMode;
  arrayFormat: ArrayFormat;
  outputMode: OutputMode;
  splitCommaValues: boolean;
  sortParams: boolean;
}) {
  const sortedParams = sortParams
    ? params
        .map((param, index) => ({ param, index }))
        .sort((a, b) =>
          a.param.key < b.param.key
            ? -1
            : a.param.key > b.param.key
              ? 1
              : a.index - b.index
        )
        .map(({ param }) => param)
    : params;

  if (outputMode === "json") {
    const result = Object.create(null) as Record<string, string | string[]>;
    sortedParams.forEach((param) => {
      const values = splitCommaValues ? splitArrayValue(param.value) : [param.value];
      values.forEach((value) => appendJsonValue(result, param.key, value));
    });
    return JSON.stringify(result, null, 2);
  }

  const queryString = buildQueryString(sortedParams, {
    encodingMode,
    arrayFormat,
    splitCommaValues,
  });

  if (outputMode === "url") return combineBaseUrlAndQuery(baseUrl, queryString);
  return queryString;
}

function buildQueryString(
  params: QueryParam[],
  options: {
    encodingMode: EncodingMode;
    arrayFormat: ArrayFormat;
    splitCommaValues: boolean;
  }
) {
  const parts: string[] = [];

  params.forEach((param) => {
    const values = options.splitCommaValues ? splitArrayValue(param.value) : [param.value];

    if (options.splitCommaValues && options.arrayFormat === "comma") {
      parts.push(
        `${encodePart(param.key, options.encodingMode)}=${values
          .map((value) => encodePart(value, options.encodingMode))
          .join(",")}`
      );
      return;
    }

    values.forEach((value) => {
      const key = options.splitCommaValues && options.arrayFormat === "brackets"
        ? `${param.key}[]`
        : param.key;
      parts.push(`${encodePart(key, options.encodingMode)}=${encodePart(value, options.encodingMode)}`);
    });
  });

  return parts.join("&");
}

function splitArrayValue(value: string) {
  return value.split(",");
}

function appendJsonValue(target: Record<string, string | string[]>, key: string, value: string) {
  const current = target[key];
  if (current === undefined) {
    target[key] = value;
    return;
  }
  if (Array.isArray(current)) {
    current.push(value);
    return;
  }
  target[key] = [current, value];
}

function encodePart(value: string, encodingMode: EncodingMode) {
  if (encodingMode === "raw") return value;
  const scalarValue = replaceLoneSurrogates(value);
  return encodeURIComponent(scalarValue).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function replaceLoneSurrogates(value: string) {
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        result += value[index] + value[index + 1];
        index += 1;
      } else {
        result += "\uFFFD";
      }
      continue;
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      result += "\uFFFD";
      continue;
    }
    result += value[index];
  }
  return result;
}

function combineBaseUrlAndQuery(baseUrl: string, queryString: string) {
  const trimmedBaseUrl = baseUrl.trim();
  if (!trimmedBaseUrl) return queryString ? `?${queryString}` : "";
  if (!queryString) return trimmedBaseUrl;

  const hashIndex = trimmedBaseUrl.indexOf("#");
  const beforeHash = hashIndex === -1 ? trimmedBaseUrl : trimmedBaseUrl.slice(0, hashIndex);
  const hash = hashIndex === -1 ? "" : trimmedBaseUrl.slice(hashIndex);
  const separator = beforeHash.includes("?")
    ? beforeHash.endsWith("?") || beforeHash.endsWith("&")
      ? ""
      : "&"
    : "?";

  return `${beforeHash}${separator}${queryString}${hash}`;
}

function getQueryNotes({
  baseUrl,
  params,
  outputMode,
  encodingMode,
  splitCommaValues,
}: {
  baseUrl: string;
  params: QueryParam[];
  outputMode: OutputMode;
  encodingMode: EncodingMode;
  splitCommaValues: boolean;
}): QueryNote[] {
  const notes: QueryNote[] = [];

  if (outputMode === "url" && baseUrl && !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(baseUrl.trim()) && !baseUrl.trim().startsWith("/")) {
    notes.push({
      tone: "warning",
      title: "Base URL looks relative",
      message: "The Full URL output will still be built, but a bare relative reference needs a base context before a browser or HTTP client can resolve it.",
    });
  }

  if (outputMode === "url" && baseUrl.includes("?")) {
    notes.push({
      tone: "info",
      title: "Existing query text is preserved",
      message: "New rows are appended after the existing query. Sorting does not reorder parameters already present in the base URL.",
    });
  }

  const duplicateKeys = getDuplicateKeys(params);
  if (duplicateKeys.length > 0) {
    notes.push({
      tone: "info",
      title: "Repeated names are preserved",
      message: `Repeated parameter names remain separate values in query output and become arrays in JSON output: ${duplicateKeys.join(", ")}.`,
    });
  }

  if (encodingMode === "raw") {
    notes.push({
      tone: "warning",
      title: "Unencoded output can be ambiguous",
      message: "Reserved delimiters, whitespace, percent signs, and # characters are left exactly as entered. Do not treat this mode as URL-safe serialization.",
    });
  }

  if (splitCommaValues) {
    notes.push({
      tone: "info",
      title: "Every comma is an array boundary",
      message: "Comma splitting is explicit. Empty items and spaces on either side of a comma are preserved as data rather than trimmed away.",
    });
  }

  return notes;
}

function getDuplicateKeys(params: QueryParam[]) {
  const counts = new Map<string, number>();
  params.forEach((param) => counts.set(param.key, (counts.get(param.key) || 0) + 1));
  return Array.from(counts.entries()).filter(([, count]) => count > 1).map(([key]) => key);
}
