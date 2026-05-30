"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type EncodingMode = "encoded" | "readable";
type ArrayFormat = "repeat" | "brackets" | "comma";
type OutputMode = "query" | "url" | "json";

type QueryParam = {
  id: number;
  key: string;
  value: string;
  enabled: boolean;
};

type QueryNote = {
  title: string;
  message: string;
};

const sampleParams: QueryParam[] = [
  {
    id: 1,
    key: "search",
    value: "developer tools",
    enabled: true,
  },
  {
    id: 2,
    key: "page",
    value: "1",
    enabled: true,
  },
  {
    id: 3,
    key: "tags",
    value: "api,http,json",
    enabled: true,
  },
];

export default function ToolClient() {
  const [baseUrl, setBaseUrl] = useState("");
  const [params, setParams] = useState<QueryParam[]>([
    {
      id: 1,
      key: "",
      value: "",
      enabled: true,
    },
  ]);
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("encoded");
  const [arrayFormat, setArrayFormat] = useState<ArrayFormat>("repeat");
  const [outputMode, setOutputMode] = useState<OutputMode>("query");
  const [skipEmptyValues, setSkipEmptyValues] = useState(false);
  const [sortParams, setSortParams] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeParams = useMemo(
    () =>
      params
        .filter((param) => param.enabled)
        .filter((param) => param.key.trim())
        .filter((param) => !(skipEmptyValues && !param.value.trim())),
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
        sortParams,
      }),
    [baseUrl, activeParams, encodingMode, arrayFormat, outputMode, sortParams]
  );

  const notes = useMemo(
    () =>
      getQueryNotes({
        baseUrl,
        params: activeParams,
        output,
      }),
    [baseUrl, activeParams, output]
  );

  const addParam = () => {
    setParams((current) => [
      ...current,
      {
        id: Date.now(),
        key: "",
        value: "",
        enabled: true,
      },
    ]);
    setCopied(false);
  };

  const updateParam = (
    id: number,
    field: keyof Omit<QueryParam, "id">,
    value: string | boolean
  ) => {
    setParams((current) =>
      current.map((param) =>
        param.id === id
          ? {
              ...param,
              [field]: value,
            }
          : param
      )
    );
    setCopied(false);
  };

  const removeParam = (id: number) => {
    setParams((current) => {
      const next = current.filter((param) => param.id !== id);

      return next.length > 0
        ? next
        : [
            {
              id: Date.now(),
              key: "",
              value: "",
              enabled: true,
            },
          ];
    });
    setCopied(false);
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
    setBaseUrl("https://api.example.com/search");
    setParams(sampleParams);
    setEncodingMode("encoded");
    setArrayFormat("repeat");
    setOutputMode("url");
    setSkipEmptyValues(false);
    setSortParams(false);
    setCopied(false);
  };

  const resetAll = () => {
    setBaseUrl("");
    setParams([
      {
        id: 1,
        key: "",
        value: "",
        enabled: true,
      },
    ]);
    setEncodingMode("encoded");
    setArrayFormat("repeat");
    setOutputMode("query");
    setSkipEmptyValues(false);
    setSortParams(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="Query String Builder"
      description="Build URL query strings from key-value parameters, encode values, preview the final URL, and copy clean API query strings directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Base URL
        </label>

        <input
          value={baseUrl}
          onChange={(event) => {
            setBaseUrl(event.target.value);
            setCopied(false);
          }}
          placeholder="https://api.example.com/search"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Add a full URL when you want a complete final URL, or leave this empty
          when you only need the query string.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Query Parameters
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Add the keys and values you want to include in the query string.
            </p>
          </div>

          <button onClick={addParam} className="yoryantra-btn-outline">
            Add Parameter
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {params.map((param, index) => (
            <div
              key={param.id}
              className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[auto_1fr_1fr_auto]"
            >
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={(event) =>
                    updateParam(param.id, "enabled", event.target.checked)
                  }
                  className="h-4 w-4 accent-[var(--light-gold)]"
                />

                <span>{index + 1}</span>
              </label>

              <input
                value={param.key}
                onChange={(event) =>
                  updateParam(param.id, "key", event.target.value)
                }
                placeholder="key"
                className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <input
                value={param.value}
                onChange={(event) =>
                  updateParam(param.id, "value", event.target.value)
                }
                placeholder="value"
                className="w-full rounded-xl border border-gray-300 p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />

              <button
                onClick={() => removeParam(param.id)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-600">
          For arrays, enter comma-separated values such as{" "}
          <span className="font-mono text-gray-900">api,http,json</span>, then
          choose how arrays should be written.
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Output Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setCopied(false);
            }}
            options={[
              {
                label: "Query string",
                value: "query",
              },
              {
                label: "Full URL",
                value: "url",
              },
              {
                label: "JSON object",
                value: "json",
              },
            ]}
          />

          <YoryantraSelect
            label="Encoding"
            value={encodingMode}
            onChange={(value) => {
              setEncodingMode(value as EncodingMode);
              setCopied(false);
            }}
            options={[
              {
                label: "URL encoded",
                value: "encoded",
              },
              {
                label: "Readable",
                value: "readable",
              },
            ]}
          />

          <YoryantraSelect
            label="Array Format"
            value={arrayFormat}
            onChange={(value) => {
              setArrayFormat(value as ArrayFormat);
              setCopied(false);
            }}
            options={[
              {
                label: "Repeated keys",
                value: "repeat",
              },
              {
                label: "Brackets",
                value: "brackets",
              },
              {
                label: "Comma separated",
                value: "comma",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={skipEmptyValues}
              onChange={(event) => {
                setSkipEmptyValues(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Skip empty values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Leave out parameters where the value field is blank.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={sortParams}
              onChange={(event) => {
                setSortParams(event.target.checked);
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Sort by key
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Sort parameters alphabetically before building the output.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <SummaryCard
          label="Active Params"
          value={activeParams.length.toLocaleString()}
        />
        <SummaryCard label="Output Type" value={outputMode} />
        <SummaryCard label="Encoding" value={encodingMode} />
        <SummaryCard
          label="Length"
          value={output.length.toLocaleString()}
        />
      </div>

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Query notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Query string output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Query string building happens directly in your browser. The URL and
        parameters you enter are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Building Query Strings for API URLs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Query strings are used in API requests, search pages, filters,
            tracking links, pagination, and many debugging tasks. They look
            simple at first, but encoding spaces, symbols, arrays, and repeated
            values by hand can quickly become messy.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Query String Builder lets you add parameters as normal key-value
            rows and then copy a clean query string or full URL. It is useful
            when testing APIs, creating links, checking encoded values, or
            preparing request examples for notes and documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Creating a Query String Without Hand-Encoding Values
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Add a base URL if you want the final output to include one.</li>
            <li>Enter each query parameter as a key and value pair.</li>
            <li>Choose URL encoded or readable output.</li>
            <li>Pick how comma-separated array values should be written.</li>
            <li>Copy the query string, full URL, or JSON object output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Query String Builder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Building API URLs with filters, search terms, and pagination.</li>
            <li>Encoding spaces, symbols, and special characters correctly.</li>
            <li>Testing repeated query parameters for API endpoints.</li>
            <li>Creating readable query examples for documentation or support notes.</li>
            <li>Checking how array values should appear in a request URL.</li>
            <li>Preparing clean URLs for browser, cURL, fetch, or Postman testing.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Query String
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Base URL:
https://api.example.com/search

Parameters:
search = developer tools
page = 1
tags = api,http,json

Output:
https://api.example.com/search?search=developer%20tools&page=1&tags=api&tags=http&tags=json`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A Note About Array Query Parameters
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            APIs do not all handle arrays the same way. Some expect repeated
            keys like <span className="font-mono">tag=api&amp;tag=http</span>,
            some expect brackets like{" "}
            <span className="font-mono">tag[]=api&amp;tag[]=http</span>, and
            some expect one comma-separated value.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Choose the array format that matches the API you are testing. When in
            doubt, check the API documentation or try the exact format your
            endpoint expects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a query string builder?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A query string builder creates URL query parameters from normal
                key-value pairs so you do not have to type and encode the full
                query string manually.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this encode special characters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. URL encoded mode encodes spaces, symbols, and special
                characters so the query string is safer to use in URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I build a full URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Add a base URL and choose Full URL output to combine the
                base URL with the query string.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How do array values work?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Enter comma-separated values and choose repeated keys, brackets,
                or comma-separated output depending on what your API expects.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my URLs uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Query string building happens directly in your browser, and
                your values are not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/http-request-parser" className="yoryantra-btn-outline">
              HTTP Request Parser
            </Link>

            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              cURL Command Builder
            </Link>

            <Link href="/tools/curl-command-parser" className="yoryantra-btn-outline">
              cURL Command Parser
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function buildOutput({
  baseUrl,
  params,
  encodingMode,
  arrayFormat,
  outputMode,
  sortParams,
}: {
  baseUrl: string;
  params: QueryParam[];
  encodingMode: EncodingMode;
  arrayFormat: ArrayFormat;
  outputMode: OutputMode;
  sortParams: boolean;
}) {
  const sortedParams = sortParams
    ? [...params].sort((a, b) => a.key.localeCompare(b.key))
    : params;

  if (outputMode === "json") {
    return JSON.stringify(
      sortedParams.reduce<Record<string, string | string[]>>((acc, param) => {
        const values = splitValues(param.value);

        if (values.length > 1) {
          acc[param.key] = values;
          return acc;
        }

        acc[param.key] = param.value;
        return acc;
      }, {}),
      null,
      2
    );
  }

  const queryString = buildQueryString(sortedParams, {
    encodingMode,
    arrayFormat,
  });

  if (outputMode === "url") {
    return combineBaseUrlAndQuery(baseUrl, queryString);
  }

  return queryString;
}

function buildQueryString(
  params: QueryParam[],
  options: {
    encodingMode: EncodingMode;
    arrayFormat: ArrayFormat;
  }
) {
  const parts: string[] = [];

  params.forEach((param) => {
    const values = splitValues(param.value);

    if (values.length > 1) {
      if (options.arrayFormat === "comma") {
        parts.push(
          `${encodePart(param.key, options.encodingMode)}=${encodePart(
            values.join(","),
            options.encodingMode
          )}`
        );
        return;
      }

      values.forEach((value) => {
        const key =
          options.arrayFormat === "brackets" ? `${param.key}[]` : param.key;

        parts.push(
          `${encodePart(key, options.encodingMode)}=${encodePart(
            value,
            options.encodingMode
          )}`
        );
      });

      return;
    }

    parts.push(
      `${encodePart(param.key, options.encodingMode)}=${encodePart(
        param.value,
        options.encodingMode
      )}`
    );
  });

  return parts.join("&");
}

function splitValues(value: string) {
  if (!value.includes(",")) {
    return [value];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function encodePart(value: string, encodingMode: EncodingMode) {
  if (encodingMode === "readable") {
    return value;
  }

  return encodeURIComponent(value);
}

function combineBaseUrlAndQuery(baseUrl: string, queryString: string) {
  const trimmedBaseUrl = baseUrl.trim();

  if (!trimmedBaseUrl) {
    return queryString ? `?${queryString}` : "";
  }

  if (!queryString) {
    return trimmedBaseUrl;
  }

  const hashIndex = trimmedBaseUrl.indexOf("#");
  const beforeHash =
    hashIndex === -1 ? trimmedBaseUrl : trimmedBaseUrl.slice(0, hashIndex);
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
  output,
}: {
  baseUrl: string;
  params: QueryParam[];
  output: string;
}): QueryNote[] {
  const notes: QueryNote[] = [];

  if (baseUrl && !/^https?:\/\//i.test(baseUrl.trim())) {
    notes.push({
      title: "Base URL has no protocol",
      message:
        "The base URL does not start with http:// or https://. That may be fine for a relative URL, but check it before sharing.",
    });
  }

  const duplicateKeys = getDuplicateKeys(params);

  if (duplicateKeys.length > 0) {
    notes.push({
      title: "Repeated keys found",
      message:
        "Some keys appear more than once. This is valid for many APIs, but make sure the endpoint expects repeated parameters.",
    });
  }

  if (output.length > 2000) {
    notes.push({
      title: "Long URL",
      message:
        "The generated output is long. Some browsers, servers, and tools may have URL length limits.",
    });
  }

  return notes;
}

function getDuplicateKeys(params: QueryParam[]) {
  const counts = new Map<string, number>();

  params.forEach((param) => {
    counts.set(param.key, (counts.get(param.key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key);
}
