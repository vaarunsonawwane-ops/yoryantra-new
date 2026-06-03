"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type Mode = "decode" | "encode" | "parse";
type OutputMode = "query" | "table" | "json" | "lines";
type SpaceMode = "percent20" | "plus";
type PairSeparator = "ampersand" | "newline";

type QueryPair = {
  id: number;
  key: string;
  value: string;
  enabled: boolean;
};

type ParsedParam = {
  key: string;
  value: string;
  encodedKey: string;
  encodedValue: string;
  index: number;
};

type QueryResult = {
  rawInput: string;
  cleanQuery: string;
  params: ParsedParam[];
  output: string;
  warnings: string[];
  duplicateKeys: string[];
  emptyKeys: number;
  emptyValues: number;
};

type QueryNote = {
  title: string;
  message: string;
};

const decodeExample =
  "name=Yoryantra%20User&email=user%40example.com&redirect=https%3A%2F%2Fexample.com%2Fthank-you%3Fsource%3Dtools&tags=dev%2Cseo%2Cdebugging";

const encodeExamplePairs: QueryPair[] = [
  {
    id: 1,
    key: "name",
    value: "Yoryantra User",
    enabled: true,
  },
  {
    id: 2,
    key: "email",
    value: "user@example.com",
    enabled: true,
  },
  {
    id: 3,
    key: "redirect",
    value: "https://example.com/thank-you?source=tools",
    enabled: true,
  },
];

export default function ToolClient() {
  const [mode, setMode] = useState<Mode>("decode");
  const [input, setInput] = useState("");
  const [pairs, setPairs] = useState<QueryPair[]>([
    {
      id: 1,
      key: "",
      value: "",
      enabled: true,
    },
  ]);
  const [outputMode, setOutputMode] = useState<OutputMode>("query");
  const [spaceMode, setSpaceMode] = useState<SpaceMode>("percent20");
  const [pairSeparator, setPairSeparator] = useState<PairSeparator>("ampersand");
  const [decodePlusAsSpace, setDecodePlusAsSpace] = useState(true);
  const [sortKeys, setSortKeys] = useState(false);
  const [skipEmptyValues, setSkipEmptyValues] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const activePairs = useMemo(
    () =>
      pairs
        .filter((pair) => pair.enabled)
        .filter((pair) => pair.key.trim())
        .filter((pair) => !(skipEmptyValues && !pair.value.trim())),
    [pairs, skipEmptyValues]
  );

  const notes = useMemo(
    () => (result ? getQueryNotes(result) : []),
    [result]
  );

  const runTool = () => {
    try {
      if (mode === "decode" || mode === "parse") {
        if (!input.trim()) {
          setError("Please paste a URL query string or full URL.");
          setResult(null);
          setOutput("");
          setCopied(false);
          return;
        }

        const nextResult = parseQueryInput(input, {
          decodePlusAsSpace,
          outputMode,
          sortKeys,
        });

        setResult(nextResult);
        setOutput(nextResult.output);
      }

      if (mode === "encode") {
        if (activePairs.length === 0) {
          setError("Add at least one enabled query parameter.");
          setResult(null);
          setOutput("");
          setCopied(false);
          return;
        }

        const nextResult = encodeQueryPairs(activePairs, {
          outputMode,
          spaceMode,
          pairSeparator,
          sortKeys,
        });

        setResult(nextResult);
        setOutput(nextResult.output);
      }

      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process this query string."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const addPair = () => {
    setPairs((current) => [
      ...current,
      {
        id: Date.now(),
        key: "",
        value: "",
        enabled: true,
      },
    ]);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const updatePair = (
    id: number,
    field: keyof Omit<QueryPair, "id">,
    value: string | boolean
  ) => {
    setPairs((current) =>
      current.map((pair) =>
        pair.id === id
          ? {
              ...pair,
              [field]: value,
            }
          : pair
      )
    );
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const removePair = (id: number) => {
    setPairs((current) => {
      const next = current.filter((pair) => pair.id !== id);

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
    setResult(null);
    setOutput("");
    setError("");
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

  const loadDecodeExample = () => {
    setMode("decode");
    setInput(decodeExample);
    setOutputMode("table");
    setSpaceMode("percent20");
    setPairSeparator("ampersand");
    setDecodePlusAsSpace(true);
    setSortKeys(false);
    setSkipEmptyValues(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const loadEncodeExample = () => {
    setMode("encode");
    setInput("");
    setPairs(encodeExamplePairs);
    setOutputMode("query");
    setSpaceMode("percent20");
    setPairSeparator("ampersand");
    setDecodePlusAsSpace(true);
    setSortKeys(false);
    setSkipEmptyValues(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setMode("decode");
    setInput("");
    setPairs([
      {
        id: 1,
        key: "",
        value: "",
        enabled: true,
      },
    ]);
    setOutputMode("query");
    setSpaceMode("percent20");
    setPairSeparator("ampersand");
    setDecodePlusAsSpace(true);
    setSortKeys(false);
    setSkipEmptyValues(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="URL Query Encoder Decoder"
      description="Encode and decode URL query strings, query parameters, form-style values, plus signs, percent encoding, and copied URL query text directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose a Query String Task
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <ModeButton
            active={mode === "decode"}
            title="Decode Query"
            description="Decode percent-encoded query text into readable key-value pairs."
            onClick={() => {
              setMode("decode");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />

          <ModeButton
            active={mode === "encode"}
            title="Encode Query"
            description="Build an encoded query string from plain key-value rows."
            onClick={() => {
              setMode("encode");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />

          <ModeButton
            active={mode === "parse"}
            title="Parse Full URL"
            description="Paste a full URL and extract only its query parameters."
            onClick={() => {
              setMode("parse");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
          />
        </div>
      </div>

      {mode === "encode" ? (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Query Parameters
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add plain keys and values. The tool will encode them into a query
                string.
              </p>
            </div>

            <button onClick={addPair} className="yoryantra-btn-outline whitespace-nowrap px-4 py-2">
              Add Parameter
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {pairs.map((pair, index) => (
              <div
                key={pair.id}
                className="grid gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[auto_1fr_1fr_auto]"
              >
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={pair.enabled}
                    onChange={(event) =>
                      updatePair(pair.id, "enabled", event.target.checked)
                    }
                    className="h-4 w-4 accent-[var(--light-gold)]"
                  />

                  <span>{index + 1}</span>
                </label>

                <input
                  value={pair.key}
                  onChange={(event) =>
                    updatePair(pair.id, "key", event.target.value)
                  }
                  placeholder="utm_source"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />

                <input
                  value={pair.value}
                  onChange={(event) =>
                    updatePair(pair.id, "value", event.target.value)
                  }
                  placeholder="newsletter"
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
                />

                <button
                  onClick={() => removePair(pair.id)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            {mode === "parse" ? "Full URL or Query String" : "Encoded Query String"}
          </label>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            placeholder={
              mode === "parse"
                ? `https://example.com/search?${decodeExample}`
                : decodeExample
            }
            className="w-full min-h-[280px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />

          <p className="mt-2 text-sm text-gray-500">
            Paste a query string with or without a leading question mark. Full
            URLs are also supported.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Query string",
                value: "query",
              },
              {
                label: "Table",
                value: "table",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Key-value lines",
                value: "lines",
              },
            ]}
          />

          {mode === "encode" && (
            <YoryantraSelect
              label="Spaces"
              value={spaceMode}
              onChange={(value) => {
                setSpaceMode(value as SpaceMode);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              options={[
                {
                  label: "%20",
                  value: "percent20",
                },
                {
                  label: "+",
                  value: "plus",
                },
              ]}
            />
          )}

          {mode === "encode" && (
            <YoryantraSelect
              label="Pair Separator"
              value={pairSeparator}
              onChange={(value) => {
                setPairSeparator(value as PairSeparator);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              options={[
                {
                  label: "&",
                  value: "ampersand",
                },
                {
                  label: "New line",
                  value: "newline",
                },
              ]}
            />
          )}

          {(mode === "decode" || mode === "parse") && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
              <input
                type="checkbox"
                checked={decodePlusAsSpace}
                onChange={(event) => {
                  setDecodePlusAsSpace(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Decode + as space
            </label>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(event) => {
                setSortKeys(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Sort keys
          </label>

          {mode === "encode" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
              <input
                type="checkbox"
                checked={skipEmptyValues}
                onChange={(event) => {
                  setSkipEmptyValues(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Skip empty values
            </label>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Query encoding uses percent encoding. In form-style query strings, plus
          signs are often read as spaces.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runTool} className="yoryantra-btn">
          {mode === "encode"
            ? "Encode Query"
            : mode === "parse"
            ? "Parse Query"
            : "Decode Query"}
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadDecodeExample} className="yoryantra-btn-outline">
          Load Decode Example
        </button>

        <button onClick={loadEncodeExample} className="yoryantra-btn-outline">
          Load Encode Example
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

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Parameters"
            value={result.params.length.toLocaleString()}
          />
          <SummaryCard
            label="Duplicate Keys"
            value={result.duplicateKeys.length.toLocaleString()}
          />
          <SummaryCard
            label="Empty Values"
            value={result.emptyValues.toLocaleString()}
          />
          <SummaryCard
            label="Output Length"
            value={result.output.length.toLocaleString()}
          />
        </div>
      )}

      {result && result.params.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Query Parameters
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Decoded and encoded values for each query parameter.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Key</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Encoded Key</th>
                  <th className="px-4 py-3 font-semibold">Encoded Value</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.params.map((param) => (
                  <tr key={`${param.index}-${param.key}-${param.value}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {param.index + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[220px] break-words">
                        {param.key || "(empty)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[260px] break-words">
                        {param.value || "(empty)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[220px] break-words">
                        {param.encodedKey}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      <span className="block max-w-[260px] break-words">
                        {param.encodedValue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "URL query output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        URL query encoding and decoding happens directly in your browser. Your
        pasted query strings and values are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Encoding and Decoding URL Query Strings
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Query strings often contain percent-encoded spaces, email addresses,
            redirect URLs, filters, UTM tags, search text, and copied API
            parameters. They can become hard to read when everything is packed
            into one long line.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This URL Query Encoder Decoder turns encoded query text into readable
            key-value pairs and can build a clean encoded query string from plain
            keys and values. It is useful for debugging URLs, API requests,
            tracking links, redirects, and copied browser query strings.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Decoding or Building a Query String
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose decode, encode, or parse full URL mode.</li>
            <li>Paste a query string or add key-value parameter rows.</li>
            <li>Choose output format and space handling.</li>
            <li>Review decoded keys, values, duplicate keys, and empty values.</li>
            <li>Copy the encoded query string, JSON, table, or key-value lines.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common URL Query Encoder Decoder Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Decoding copied URLs with long query strings.</li>
            <li>Building API query parameters from readable values.</li>
            <li>Checking redirect URLs embedded inside query parameters.</li>
            <li>Reading UTM campaign parameters from a tracking URL.</li>
            <li>Converting spaces as %20 or plus signs for form-style queries.</li>
            <li>Finding duplicate or empty query parameters before sharing a URL.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Encoded Query String
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`name=Yoryantra%20User&email=user%40example.com&redirect=https%3A%2F%2Fexample.com%2Fthank-you`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Query Strings, Plus Signs, and Percent Encoding
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Normal URL percent encoding represents spaces as %20. In
            form-encoded query strings, spaces are often written as plus signs.
            That is why a value like hello+world may mean hello world in some
            query contexts.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use the plus-as-space option when working with form-style query
            strings. Turn it off when a literal plus sign should stay as a plus
            sign.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is a URL query encoder decoder?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It encodes and decodes the query part of a URL, usually the text
                after the question mark.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse a full URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Paste a full URL and the tool can extract and decode the
                query parameters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between this and a normal URL encoder?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A normal URL encoder works on any text. This tool focuses on
                query strings and key-value parameters, so it is better for
                reading and building URL queries.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should plus signs decode as spaces?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                In form-style query strings, plus signs often mean spaces. This
                tool lets you choose how to handle them.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my query string uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Query encoding and decoding happens directly in your browser.
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

            <Link href="/tools/url-parts-parser" className="yoryantra-btn-outline">
              URL Parts Parser
            </Link>

            <Link href="/tools/query-string-builder" className="yoryantra-btn-outline">
              Query String Builder
            </Link>

            <Link href="/tools/utm-builder" className="yoryantra-btn-outline">
              UTM Builder
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

function ModeButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border border-gray-200 bg-white p-4 text-left transition ${
        active ? "shadow-sm ring-2 ring-[var(--green)]" : "hover:border-[var(--green)]"
      }`}
    >
      <span className="block text-sm font-semibold text-gray-900">{title}</span>

      <span className="mt-1 block text-sm leading-relaxed text-gray-500">
        {description}
      </span>
    </button>
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

function parseQueryInput(
  input: string,
  options: {
    decodePlusAsSpace: boolean;
    outputMode: OutputMode;
    sortKeys: boolean;
  }
): QueryResult {
  const cleanQuery = extractQuery(input);
  const warnings: string[] = [];

  if (!cleanQuery) {
    throw new Error("No query string was found.");
  }

  const params = cleanQuery
    .split("&")
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const equalsIndex = part.indexOf("=");
      const rawKey = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
      const rawValue = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
      const key = safeDecode(rawKey, options.decodePlusAsSpace);
      const value = safeDecode(rawValue, options.decodePlusAsSpace);

      return {
        key,
        value,
        encodedKey: rawKey,
        encodedValue: rawValue,
        index,
      };
    });

  if (params.length === 0) {
    warnings.push("No key-value parameters were found.");
  }

  const finalParams = options.sortKeys
    ? [...params].sort((a, b) => a.key.localeCompare(b.key))
    : params;

  const duplicateKeys = findDuplicateKeys(params);
  const emptyKeys = params.filter((param) => !param.key).length;
  const emptyValues = params.filter((param) => !param.value).length;
  const output = formatOutput(finalParams, {
    outputMode: options.outputMode,
  });

  return {
    rawInput: input,
    cleanQuery,
    params: finalParams,
    output,
    warnings,
    duplicateKeys,
    emptyKeys,
    emptyValues,
  };
}

function encodeQueryPairs(
  pairs: QueryPair[],
  options: {
    outputMode: OutputMode;
    spaceMode: SpaceMode;
    pairSeparator: PairSeparator;
    sortKeys: boolean;
  }
): QueryResult {
  const params = pairs.map((pair, index) => {
    const encodedKey = encodeQueryComponent(pair.key, options.spaceMode);
    const encodedValue = encodeQueryComponent(pair.value, options.spaceMode);

    return {
      key: pair.key,
      value: pair.value,
      encodedKey,
      encodedValue,
      index,
    };
  });

  const finalParams = options.sortKeys
    ? [...params].sort((a, b) => a.key.localeCompare(b.key))
    : params;

  const cleanQuery = finalParams
    .map((param) => `${param.encodedKey}=${param.encodedValue}`)
    .join(options.pairSeparator === "newline" ? "\n" : "&");

  const duplicateKeys = findDuplicateKeys(params);
  const emptyKeys = params.filter((param) => !param.key).length;
  const emptyValues = params.filter((param) => !param.value).length;
  const warnings: string[] = [];

  if (duplicateKeys.length > 0) {
    warnings.push("Duplicate query keys were found.");
  }

  return {
    rawInput: "",
    cleanQuery,
    params: finalParams,
    output: formatOutput(finalParams, {
      outputMode: options.outputMode,
      encodedQuery: cleanQuery,
    }),
    warnings,
    duplicateKeys,
    emptyKeys,
    emptyValues,
  };
}

function extractQuery(input: string) {
  const trimmed = input.trim();

  try {
    const url = new URL(trimmed);
    return url.search.replace(/^\?/, "");
  } catch {
    const withoutHash = trimmed.split("#")[0];

    if (withoutHash.includes("?")) {
      return withoutHash.slice(withoutHash.indexOf("?") + 1).replace(/^\?/, "");
    }

    return withoutHash.replace(/^\?/, "");
  }
}

function safeDecode(value: string, decodePlusAsSpace: boolean) {
  const prepared = decodePlusAsSpace ? value.replace(/\+/g, " ") : value;

  try {
    return decodeURIComponent(prepared);
  } catch {
    return prepared;
  }
}

function encodeQueryComponent(value: string, spaceMode: SpaceMode) {
  const encoded = encodeURIComponent(value);

  return spaceMode === "plus" ? encoded.replace(/%20/g, "+") : encoded;
}

function formatOutput(
  params: ParsedParam[],
  options: {
    outputMode: OutputMode;
    encodedQuery?: string;
  }
) {
  if (options.outputMode === "json") {
    return JSON.stringify(
      params.map((param) => ({
        key: param.key,
        value: param.value,
        encodedKey: param.encodedKey,
        encodedValue: param.encodedValue,
      })),
      null,
      2
    );
  }

  if (options.outputMode === "table") {
    return [
      "Key | Value | Encoded Key | Encoded Value",
      "--- | --- | --- | ---",
      ...params.map(
        (param) =>
          `${escapeTable(param.key)} | ${escapeTable(param.value)} | ${escapeTable(
            param.encodedKey
          )} | ${escapeTable(param.encodedValue)}`
      ),
    ].join("\n");
  }

  if (options.outputMode === "lines") {
    return params.map((param) => `${param.key}=${param.value}`).join("\n");
  }

  if (options.encodedQuery) {
    return options.encodedQuery;
  }

  return params
    .map((param) => `${param.encodedKey}=${param.encodedValue}`)
    .join("&");
}

function findDuplicateKeys(params: ParsedParam[]) {
  const counts = new Map<string, number>();

  params.forEach((param) => {
    counts.set(param.key, (counts.get(param.key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key]) => key);
}

function escapeTable(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function getQueryNotes(result: QueryResult): QueryNote[] {
  const notes: QueryNote[] = [];

  if (result.duplicateKeys.length > 0) {
    notes.push({
      title: "Duplicate keys found",
      message:
        "Some query keys appear more than once. That can be valid, but the server decides how repeated keys are handled.",
    });
  }

  if (result.emptyKeys > 0) {
    notes.push({
      title: "Empty key found",
      message:
        "One or more parameters have an empty key. Check whether the query string was copied correctly.",
    });
  }

  if (result.emptyValues > 0) {
    notes.push({
      title: "Empty values found",
      message:
        "Some parameters have empty values. That may be intentional, but it is worth checking.",
    });
  }

  if (result.cleanQuery.includes("%25")) {
    notes.push({
      title: "Possible double encoding",
      message:
        "The query contains %25, which sometimes appears when a value has been encoded more than once.",
    });
  }

  if (result.output.length > 2000) {
    notes.push({
      title: "Long query string",
      message:
        "This output is long. Very long URLs can be hard to share and may not work in every system.",
    });
  }

  return notes;
}
