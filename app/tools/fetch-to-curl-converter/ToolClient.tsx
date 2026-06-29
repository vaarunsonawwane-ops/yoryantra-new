"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type OutputStyle = "multiline" | "single";
type BodyMode = "auto" | "raw" | "json";
type QuoteStyle = "double" | "single";

type ParsedHeader = {
  name: string;
  value: string;
};

type ParsedPair = {
  key: string;
  value: string;
};

type ParsedFetchRequest = {
  url: string;
  urlPath: string;
  method: string;
  headers: ParsedHeader[];
  body: string;
  credentials: string;
  mode: string;
  cache: string;
  redirect: string;
  queryParams: ParsedPair[];
  sourceKind: string;
};

type ConversionWarning = {
  title: string;
  message: string;
};

const sampleFetch = `const response = await fetch("https://api.example.com/users?role=admin", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Bearer example-token"
  },
  body: JSON.stringify({
    name: "Yoryantra User",
    active: true
  })
});

const data = await response.json();
console.log(data);`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsedRequest, setParsedRequest] = useState<ParsedFetchRequest | null>(
    null
  );
  const [error, setError] = useState("");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("multiline");
  const [bodyMode, setBodyMode] = useState<BodyMode>("auto");
  const [quoteStyle, setQuoteStyle] = useState<QuoteStyle>("double");
  const [hideSensitiveValues, setHideSensitiveValues] = useState(true);
  const [includeCompressed, setIncludeCompressed] = useState(false);
  const [includeLocation, setIncludeLocation] = useState(false);
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(
    () => (parsedRequest ? getConversionWarnings(parsedRequest) : []),
    [parsedRequest]
  );

  const convertFetchToCurl = () => {
    if (!input.trim()) {
      setError("Please paste a JavaScript fetch request.");
      setOutput("");
      setParsedRequest(null);
      setCopied(false);
      return;
    }

    try {
      const nextParsed = parseFetchRequest(input, {
        bodyMode,
      });

      const curlCommand = buildCurlCommand(nextParsed, {
        outputStyle,
        quoteStyle,
        hideSensitiveValues,
        includeCompressed,
        includeLocation,
      });

      setParsedRequest(nextParsed);
      setOutput(curlCommand);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this fetch request."
      );
      setOutput("");
      setParsedRequest(null);
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
    setInput(sampleFetch);
    setOutput("");
    setParsedRequest(null);
    setError("");
    setOutputStyle("multiline");
    setBodyMode("auto");
    setQuoteStyle("double");
    setHideSensitiveValues(true);
    setIncludeCompressed(false);
    setIncludeLocation(false);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setParsedRequest(null);
    setError("");
    setOutputStyle("multiline");
    setBodyMode("auto");
    setQuoteStyle("double");
    setHideSensitiveValues(true);
    setIncludeCompressed(false);
    setIncludeLocation(false);
    setCopied(false);
  };

  return (
    <ToolShell
      title="Fetch to cURL Converter"
      description="Convert JavaScript fetch requests into cURL commands with method, URL, headers, body, and safe placeholders directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JavaScript Fetch Request
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setParsedRequest(null);
            setError("");
            setCopied(false);
          }}
          placeholder={sampleFetch}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste fetch code from a browser script, frontend file, Node.js test,
          API debugging note, or copied example to turn it into a cURL command.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          cURL Output Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Output Style"
            value={outputStyle}
            onChange={(value) => {
              setOutputStyle(value as OutputStyle);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Multi-line",
                value: "multiline",
              },
              {
                label: "Single line",
                value: "single",
              },
            ]}
          />

          <YoryantraSelect
            label="Body Handling"
            value={bodyMode}
            onChange={(value) => {
              setBodyMode(value as BodyMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Auto",
                value: "auto",
              },
              {
                label: "Raw body",
                value: "raw",
              },
              {
                label: "JSON body",
                value: "json",
              },
            ]}
          />

          <YoryantraSelect
            label="Quote Style"
            value={quoteStyle}
            onChange={(value) => {
              setQuoteStyle(value as QuoteStyle);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Double quotes",
                value: "double",
              },
              {
                label: "Single quotes",
                value: "single",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideSensitiveValues}
              onChange={(event) => {
                setHideSensitiveValues(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Hide sensitive values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Replace tokens, cookies, API keys, and auth values with safe
                placeholders.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeLocation}
              onChange={(event) => {
                setIncludeLocation(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Add redirect flag
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Add -L so cURL follows redirects.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeCompressed}
              onChange={(event) => {
                setIncludeCompressed(event.target.checked);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Add compressed flag
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Add --compressed for compressed responses.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertFetchToCurl} className="yoryantra-btn">
          Convert Fetch to cURL
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>

        <Link href="/tools/curl-to-fetch-converter" className="yoryantra-btn-outline">
          cURL to Fetch Converter
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {parsedRequest && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Method" value={parsedRequest.method} />
          <SummaryCard
            label="Headers"
            value={parsedRequest.headers.length.toLocaleString()}
          />
          <SummaryCard
            label="Query Params"
            value={parsedRequest.queryParams.length.toLocaleString()}
          />
          <SummaryCard
            label="Body Size"
            value={`${parsedRequest.body.length.toLocaleString()} chars`}
          />
        </div>
      )}

      {parsedRequest && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Fetch Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            A quick check of the request before using the generated cURL command.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailCard label="Method" value={parsedRequest.method} />
            <DetailCard label="URL" value={parsedRequest.url || "(not found)"} />
            <DetailCard label="Path" value={parsedRequest.urlPath || "(not found)"} />
            <DetailCard
              label="Source"
              value={parsedRequest.sourceKind || "fetch() call"}
            />
          </div>
        </div>
      )}

      {parsedRequest && parsedRequest.headers.length > 0 && (
        <ParsedTable
          title="Headers"
          description="Headers that will be included in the generated cURL command."
          columns={["Header", "Value"]}
          rows={parsedRequest.headers.map((header) => [
            header.name,
            hideSensitiveValues && isSensitiveHeader(header.name)
              ? "[hidden]"
              : header.value,
          ])}
        />
      )}

      {parsedRequest && parsedRequest.queryParams.length > 0 && (
        <ParsedTable
          title="Query Parameters"
          description="Query string values already present in the fetch URL."
          columns={["Name", "Value"]}
          rows={parsedRequest.queryParams.map((param) => [
            param.key,
            param.value,
          ])}
        />
      )}

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Conversion notes
          </h3>

          <div className="mt-3 space-y-3">
            {warnings.map((warning) => (
              <div key={warning.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {warning.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {warning.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            cURL Output
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
          {output || "Generated cURL command will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Fetch to cURL conversion happens directly in your browser. Your code,
        headers, cookies, and body are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting Fetch Requests Into cURL Commands
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JavaScript fetch snippets are common in frontend code, browser
            consoles, Node.js scripts, API examples, and debugging notes. When
            you need to test the same request from a terminal, converting it into
            cURL by hand can be annoying.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Fetch to cURL Converter reads a fetch request and creates a cURL
            command with the method, URL, headers, and body. It is useful when
            you want to replay a request in a terminal, share a clearer API
            example, or debug a request outside the browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Turning Fetch Code Into a Terminal Request
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a JavaScript fetch request into the input box.</li>
            <li>Choose multi-line or single-line cURL output.</li>
            <li>Pick how the request body should be handled.</li>
            <li>Hide sensitive values if you plan to share the command.</li>
            <li>Copy the generated cURL command and test it in your terminal.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Fetch to cURL Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Replaying a browser fetch request from the terminal.</li>
            <li>Turning frontend API code into a shareable cURL example.</li>
            <li>Debugging headers and request bodies outside the browser.</li>
            <li>Creating API support examples from existing JavaScript code.</li>
            <li>Replacing tokens and cookies with placeholders before sharing.</li>
            <li>Checking whether a request behaves differently in cURL and fetch.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Input:
fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name: "Yoryantra User" })
});

Output:
curl -X POST "https://api.example.com/users" \\
  -H "Content-Type: application/json" \\
  --data-raw '{"name":"Yoryantra User"}'`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            A Note About Fetch and cURL Differences
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Browser fetch and cURL do not behave exactly the same. Fetch is
            affected by CORS, browser cookie rules, credentials settings, and
            frontend security behavior. cURL runs from your terminal and does not
            follow the same browser rules.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The generated command is a practical starting point. Review it,
            replace secrets, and test it against the API before using it in a
            script or sharing it with someone else.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Fetch to cURL Converter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads a JavaScript fetch request and turns the method, URL,
                headers, and body into a cURL command.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this send the request?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The tool only converts code text. It does not call the API or
                send any network request.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this read JSON.stringify bodies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It can read common JSON.stringify usage and convert the body
                into --data-raw output when possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are some values hidden?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Authorization headers, cookies, API keys, and similar values can
                contain secrets. They are hidden by default so copied commands
                are safer to share.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my fetch code uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser, and your fetch
                code is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/fetch-to-curl-converter" />
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

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-sm text-gray-900">
        {value}
      </div>
    </div>
  );
}

function ParsedTable({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      <p className="mt-2 text-sm text-gray-500">{description}</p>

      <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-semibold">
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${title}-${rowIndex}-${cellIndex}`}
                    className="px-4 py-3 font-mono text-xs text-gray-700"
                  >
                    <span className="block max-w-[520px] break-words">
                      {cell}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function parseFetchRequest(
  input: string,
  options: {
    bodyMode: BodyMode;
  }
): ParsedFetchRequest {
  const normalized = input.trim();
  const fetchCall = extractFetchCall(normalized);

  if (!fetchCall) {
    throw new Error("Could not find a fetch(...) call in the input.");
  }

  const url = extractFetchUrl(fetchCall);

  if (!url) {
    throw new Error("Could not find a URL inside fetch(...).");
  }

  const optionsObject = extractFetchOptions(fetchCall);
  const method = extractOptionString(optionsObject, "method") || "GET";
  const headers = extractHeaders(optionsObject);
  const body = extractBody(optionsObject, options.bodyMode);
  const credentials = extractOptionString(optionsObject, "credentials");
  const mode = extractOptionString(optionsObject, "mode");
  const cache = extractOptionString(optionsObject, "cache");
  const redirect = extractOptionString(optionsObject, "redirect");
  const urlDetails = parseUrlDetails(url);

  return {
    url,
    method: method.toUpperCase(),
    headers,
    body,
    credentials,
    mode,
    cache,
    redirect,
    queryParams: urlDetails.queryParams,
    urlPath: urlDetails.path,
    sourceKind: "fetch() call",
  };
}

function extractFetchCall(input: string) {
  const fetchIndex = input.indexOf("fetch(");

  if (fetchIndex === -1) {
    return "";
  }

  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = fetchIndex; index < input.length; index += 1) {
    const char = input[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(") {
      depth += 1;
      continue;
    }

    if (char === ")") {
      depth -= 1;

      if (depth === 0) {
        return input.slice(fetchIndex, index + 1);
      }
    }
  }

  return "";
}

function extractFetchUrl(fetchCall: string) {
  const openIndex = fetchCall.indexOf("(");
  const inside = fetchCall.slice(openIndex + 1, -1).trim();
  const firstArg = splitTopLevel(inside, ",")[0]?.trim() || "";

  return unquote(firstArg);
}

function extractFetchOptions(fetchCall: string) {
  const openIndex = fetchCall.indexOf("(");
  const inside = fetchCall.slice(openIndex + 1, -1).trim();
  const args = splitTopLevel(inside, ",");

  if (args.length < 2) {
    return "";
  }

  return args.slice(1).join(",").trim();
}

function extractOptionString(optionsObject: string, key: string) {
  const regex = new RegExp(`${key}\\s*:\\s*(['"\`])([\\s\\S]*?)\\1`);
  const match = optionsObject.match(regex);

  return match ? match[2] : "";
}

function extractHeaders(optionsObject: string): ParsedHeader[] {
  const headersBlock = extractObjectValue(optionsObject, "headers");

  if (!headersBlock) {
    return [];
  }

  const entries = splitTopLevel(headersBlock.slice(1, -1), ",");
  const headers: ParsedHeader[] = [];

  entries.forEach((entry) => {
    const colonIndex = findTopLevelColon(entry);

    if (colonIndex === -1) {
      return;
    }

    const rawName = entry.slice(0, colonIndex).trim();
    const rawValue = entry.slice(colonIndex + 1).trim();
    const name = unquote(rawName);
    const value = unquote(rawValue);

    if (name) {
      headers.push({
        name,
        value,
      });
    }
  });

  return headers;
}

function extractBody(optionsObject: string, bodyMode: BodyMode) {
  const bodyValue = extractRawOptionValue(optionsObject, "body");

  if (!bodyValue) {
    return "";
  }

  const trimmed = bodyValue.trim();

  if (trimmed.startsWith("JSON.stringify")) {
    const jsonArg = extractCallArgument(trimmed);

    if (jsonArg) {
      const normalized = normalizeJavaScriptObject(jsonArg);

      try {
        return JSON.stringify(JSON.parse(normalized));
      } catch {
        return jsonArg.trim();
      }
    }
  }

  if (bodyMode === "json") {
    const normalized = normalizeJavaScriptObject(trimmed);

    try {
      return JSON.stringify(JSON.parse(normalized));
    } catch {
      return unquote(trimmed);
    }
  }

  return unquote(trimmed);
}

function extractObjectValue(source: string, key: string) {
  const keyIndex = source.search(new RegExp(`${key}\\s*:`));

  if (keyIndex === -1) {
    return "";
  }

  const colonIndex = source.indexOf(":", keyIndex);
  const firstBrace = source.indexOf("{", colonIndex);

  if (firstBrace === -1) {
    return "";
  }

  return readBalanced(source, firstBrace, "{", "}");
}

function extractRawOptionValue(source: string, key: string) {
  const keyMatch = source.match(new RegExp(`${key}\\s*:`));

  if (!keyMatch || keyMatch.index === undefined) {
    return "";
  }

  const colonIndex = source.indexOf(":", keyMatch.index);
  const start = colonIndex + 1;
  const afterColon = source.slice(start).trimStart();
  const offset = source.length - afterColon.length;
  const firstChar = source[offset];

  if (firstChar === "{" || firstChar === "[") {
    return readBalanced(source, offset, firstChar, firstChar === "{" ? "}" : "]");
  }

  if (firstChar === "'" || firstChar === '"' || firstChar === "`") {
    return readQuoted(source, offset);
  }

  if (source.slice(offset).startsWith("JSON.stringify")) {
    const callStart = source.indexOf("(", offset);
    const callBody = readBalanced(source, callStart, "(", ")");
    return `JSON.stringify${callBody}`;
  }

  const rest = source.slice(offset);
  const nextComma = findTopLevelComma(rest);

  return (nextComma === -1 ? rest : rest.slice(0, nextComma)).trim();
}

function extractCallArgument(callText: string) {
  const openIndex = callText.indexOf("(");

  if (openIndex === -1) {
    return "";
  }

  const balanced = readBalanced(callText, openIndex, "(", ")");

  if (!balanced) {
    return "";
  }

  return balanced.slice(1, -1);
}

function readBalanced(
  source: string,
  startIndex: number,
  openChar: string,
  closeChar: string
) {
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = startIndex; index < source.length; index += 1) {
    const char = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
      continue;
    }

    if (char === closeChar) {
      depth -= 1;

      if (depth === 0) {
        return source.slice(startIndex, index + 1);
      }
    }
  }

  return "";
}

function readQuoted(source: string, startIndex: number) {
  const quote = source[startIndex];
  let escaped = false;

  for (let index = startIndex + 1; index < source.length; index += 1) {
    const char = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === quote) {
      return source.slice(startIndex, index + 1);
    }
  }

  return source.slice(startIndex);
}

function splitTopLevel(value: string, separator: string) {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;
  let escaped = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }

    if (quote) {
      current += char;

      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      current += char;
      quote = char;
      continue;
    }

    if (char === "{" || char === "[" || char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (char === "}" || char === "]" || char === ")") {
      depth = Math.max(depth - 1, 0);
      current += char;
      continue;
    }

    if (char === separator && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function findTopLevelColon(value: string) {
  let quote: "'" | '"' | "`" | null = null;
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

    if (quote) {
      if (char === quote) {
        quote = null;
      }

      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }

    if (char === ":") {
      return index;
    }
  }

  return -1;
}

function findTopLevelComma(value: string) {
  return splitTopLevel(value, ",")[0]?.length ?? -1;
}

function normalizeJavaScriptObject(value: string) {
  return value
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')
    .replace(/'/g, '"')
    .replace(/,\s*([}\]])/g, "$1");
}

function parseUrlDetails(url: string) {
  try {
    const parsedUrl = new URL(url);
    const queryParams: ParsedPair[] = [];

    parsedUrl.searchParams.forEach((value, key) => {
      queryParams.push({
        key: safeDecode(key),
        value: safeDecode(value),
      });
    });

    return {
      path: `${parsedUrl.pathname}${parsedUrl.search}`,
      queryParams,
    };
  } catch {
    return {
      path: "",
      queryParams: [],
    };
  }
}

function buildCurlCommand(
  parsed: ParsedFetchRequest,
  options: {
    outputStyle: OutputStyle;
    quoteStyle: QuoteStyle;
    hideSensitiveValues: boolean;
    includeCompressed: boolean;
    includeLocation: boolean;
  }
) {
  const quote = options.quoteStyle === "single" ? "'" : '"';
  const parts = [`curl -X ${parsed.method} ${shellQuote(parsed.url, quote)}`];

  parsed.headers.forEach((header) => {
    const value =
      options.hideSensitiveValues && isSensitiveHeader(header.name)
        ? getSafePlaceholder(header.name)
        : header.value;

    parts.push(`-H ${shellQuote(`${header.name}: ${value}`, quote)}`);
  });

  if (parsed.body) {
    parts.push(`--data-raw ${shellQuote(parsed.body, quote)}`);
  }

  if (options.includeLocation || parsed.redirect === "follow") {
    parts.push("-L");
  }

  if (options.includeCompressed) {
    parts.push("--compressed");
  }

  if (options.outputStyle === "single") {
    return parts.join(" ");
  }

  return parts
    .map((part, index) => (index === 0 ? part : `  ${part}`))
    .join(" \\\n");
}

function unquote(value: string) {
  const trimmed = value.trim();

  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];

    if (
      (first === '"' && last === '"') ||
      (first === "'" && last === "'") ||
      (first === "`" && last === "`")
    ) {
      return trimmed
        .slice(1, -1)
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\`/g, "`")
        .replace(/\\n/g, "\n")
        .replace(/\\\\/g, "\\");
    }
  }

  return trimmed;
}

function shellQuote(value: string, quote: string) {
  if (quote === "'") {
    return `'${value.replace(/'/g, "'\\''")}'`;
  }

  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function getConversionWarnings(parsed: ParsedFetchRequest): ConversionWarning[] {
  const warnings: ConversionWarning[] = [];

  if (parsed.headers.some((header) => isSensitiveHeader(header.name))) {
    warnings.push({
      title: "Sensitive values found",
      message:
        "The fetch request includes headers or cookies that may contain tokens, sessions, API keys, or passwords. Keep placeholders if you plan to share the generated cURL command.",
    });
  }

  if (parsed.credentials) {
    warnings.push({
      title: "Credentials behavior may differ",
      message:
        "Browser fetch credentials and terminal cURL cookies do not behave the same way. Review cookie handling before testing.",
    });
  }

  if (parsed.mode) {
    warnings.push({
      title: "Browser mode is not a cURL option",
      message:
        "Fetch mode settings such as cors or no-cors are browser behavior. They cannot be copied directly to cURL.",
    });
  }

  return warnings;
}

function isSensitiveHeader(name: string) {
  const normalized = name.toLowerCase();

  return (
    normalized === "authorization" ||
    normalized === "cookie" ||
    normalized === "set-cookie" ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("api-key") ||
    normalized.includes("apikey") ||
    normalized.includes("x-api-key")
  );
}

function getSafePlaceholder(headerName: string) {
  const normalized = headerName.toLowerCase();

  if (normalized === "authorization") {
    return "Bearer YOUR_TOKEN";
  }

  if (normalized === "cookie") {
    return "session_id=YOUR_SESSION";
  }

  if (normalized.includes("api")) {
    return "YOUR_API_KEY";
  }

  return "YOUR_VALUE";
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}
