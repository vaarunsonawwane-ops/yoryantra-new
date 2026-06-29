"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type BodyParseMode = "auto" | "text" | "json" | "form";
type OutputFormat = "summary" | "json" | "curl";
type ParsedPair = {
  key: string;
  value: string;
};

type ParsedHeader = {
  name: string;
  value: string;
};

type ParsedHTTPRequest = {
  method: string;
  target: string;
  path: string;
  protocol: string;
  host: string;
  url: string;
  headers: ParsedHeader[];
  queryParams: ParsedPair[];
  cookies: ParsedPair[];
  body: string;
  parsedBody: unknown;
  bodyType: string;
  contentLength: number;
};

type RequestWarning = {
  title: string;
  message: string;
};

const sampleRequest = `POST /api/users?role=admin&active=true HTTP/1.1
Host: example.com
User-Agent: Yoryantra-Test/1.0
Accept: application/json
Content-Type: application/json
Authorization: Bearer example-token
Cookie: session_id=abc123; theme=light
X-Request-ID: req_12345

{
  "name": "Yoryantra User",
  "email": "user@example.com",
  "active": true
}`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleRequest);
  const [bodyParseMode, setBodyParseMode] = useState<BodyParseMode>("auto");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("summary");
  const [includeSensitiveHeaders, setIncludeSensitiveHeaders] = useState(false);
  const [decodeQueryParams, setDecodeQueryParams] = useState(true);
  const [parsedRequest, setParsedRequest] =
    useState<ParsedHTTPRequest | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const warnings = useMemo(
    () =>
      parsedRequest
        ? getRequestWarnings(parsedRequest, includeSensitiveHeaders)
        : [],
    [parsedRequest, includeSensitiveHeaders]
  );

  const parseRequest = () => {
    if (!input.trim()) {
      setError("Please paste a raw HTTP request.");
      setParsedRequest(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextParsed = parseRawHTTPRequest(input, {
        bodyParseMode,
        decodeQueryParams,
      });

      const nextOutput = formatParsedRequest(nextParsed, {
        outputFormat,
        includeSensitiveHeaders,
      });

      setParsedRequest(nextParsed);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to parse this HTTP request."
      );
      setParsedRequest(null);
      setOutput("");
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
    setInput(sampleRequest);
    setBodyParseMode("auto");
    setOutputFormat("summary");
    setIncludeSensitiveHeaders(false);
    setDecodeQueryParams(true);
    setParsedRequest(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setBodyParseMode("auto");
    setOutputFormat("summary");
    setIncludeSensitiveHeaders(false);
    setDecodeQueryParams(true);
    setParsedRequest(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="HTTP Request Parser"
      description="Parse raw HTTP requests, inspect methods, URLs, headers, query parameters, cookies, and request bodies directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Raw HTTP Request
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setParsedRequest(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleRequest}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a raw HTTP request copied from logs, proxy tools, API debugging
          output, browser tooling, or server traces.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Parsing Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Body Parsing"
            value={bodyParseMode}
            onChange={(value) => {
              setBodyParseMode(value as BodyParseMode);
              setParsedRequest(null);
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
                label: "Text",
                value: "text",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Form Data",
                value: "form",
              },
            ]}
          />

          <YoryantraSelect
            label="Output Format"
            value={outputFormat}
            onChange={(value) => {
              setOutputFormat(value as OutputFormat);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "cURL",
                value: "curl",
              },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={decodeQueryParams}
              onChange={(event) => {
                setDecodeQueryParams(event.target.checked);
                setParsedRequest(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Decode query parameters
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Decode URL-encoded query values like %20 into readable text.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeSensitiveHeaders}
              onChange={(event) => {
                setIncludeSensitiveHeaders(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Include sensitive headers in output
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Show Authorization, Cookie, API keys, and token-like headers in
                copied output.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseRequest} className="yoryantra-btn">
          Parse HTTP Request
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

      {parsedRequest && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Method" value={parsedRequest.method} />
          <SummaryCard label="Protocol" value={parsedRequest.protocol} />
          <SummaryCard
            label="Headers"
            value={String(parsedRequest.headers.length)}
          />
          <SummaryCard
            label="Body Size"
            value={`${parsedRequest.contentLength.toLocaleString()} chars`}
          />
        </div>
      )}

      {parsedRequest && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Line and URL
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            The request line identifies the HTTP method, request target, and
            protocol version.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailCard label="Method" value={parsedRequest.method} />
            <DetailCard label="Path" value={parsedRequest.path} />
            <DetailCard label="Host" value={parsedRequest.host || "(not provided)"} />
            <DetailCard label="Full URL" value={parsedRequest.url} />
          </div>
        </div>
      )}

      {parsedRequest && parsedRequest.queryParams.length > 0 && (
        <ParsedTable
          title="Query Parameters"
          description="Query parameters parsed from the request target."
          columns={["Name", "Value"]}
          rows={parsedRequest.queryParams.map((param) => [
            param.key,
            param.value,
          ])}
        />
      )}

      {parsedRequest && parsedRequest.headers.length > 0 && (
        <ParsedTable
          title="Headers"
          description="HTTP headers parsed from the request. Sensitive headers can be hidden from copied output."
          columns={["Header", "Value"]}
          rows={parsedRequest.headers.map((header) => [
            header.name,
            isSensitiveHeader(header.name) && !includeSensitiveHeaders
              ? "[hidden]"
              : header.value,
          ])}
        />
      )}

      {parsedRequest && parsedRequest.cookies.length > 0 && (
        <ParsedTable
          title="Cookies"
          description="Cookie key-value pairs parsed from the Cookie header."
          columns={["Cookie", "Value"]}
          rows={parsedRequest.cookies.map((cookie) => [
            cookie.key,
            includeSensitiveHeaders ? cookie.value : "[hidden]",
          ])}
        />
      )}

      {parsedRequest && parsedRequest.body && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Request Body
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Body type detected as{" "}
            <span className="font-semibold text-gray-900">
              {parsedRequest.bodyType}
            </span>
            .
          </p>

          <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
            {formatBodyPreview(parsedRequest.parsedBody, parsedRequest.body)}
          </pre>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Request review notes
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
            Parsed Output
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
          {output || "Parsed HTTP request output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        HTTP request parsing happens directly in your browser. Your raw request,
        headers, cookies, and body are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Parsing Raw HTTP Requests for API and Web Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw HTTP requests are often copied from proxy tools, server logs,
            browser debugging sessions, API gateways, load balancers, and
            security tools. They contain useful details, but reading the method,
            target, headers, query parameters, cookies, and body by hand can be
            slow and error-prone.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Request Parser breaks a raw request into structured pieces
            so you can inspect it quickly. It helps with API debugging, request
            reproduction, header review, cookie inspection, query parameter
            checks, and converting a raw request into a safer summary or cURL
            command.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Inspecting HTTP Requests Without Manual Splitting
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a raw HTTP request into the input box.</li>
            <li>Select how the request body should be parsed.</li>
            <li>Choose summary, JSON, or cURL output.</li>
            <li>Review the request line, URL, headers, cookies, query parameters, and body.</li>
            <li>
              Copy the parsed output after hiding or including sensitive headers.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HTTP Request Parser Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging API requests copied from logs or proxy tools.</li>
            <li>Inspecting headers, cookies, and authorization behavior.</li>
            <li>Checking query parameters and URL-encoded values.</li>
            <li>Reviewing JSON or form request bodies before replaying them.</li>
            <li>Converting raw requests into cURL commands for testing.</li>
            <li>Documenting request examples without manually formatting every part.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Raw HTTP Request
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`POST /api/users?role=admin HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer token

{
  "name": "Yoryantra User"
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing Sensitive Request Data
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw HTTP requests often contain tokens, cookies, session IDs, API
            keys, and authorization headers. This tool hides sensitive header
            values from copied output by default so it is safer to share parsed
            summaries in tickets, documentation, or chat messages.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            You can choose to include sensitive headers when you are debugging
            locally, but avoid pasting real secrets into public issues, support
            threads, or documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is an HTTP request parser?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An HTTP request parser reads a raw HTTP request and separates it
                into method, path, protocol, headers, query parameters, cookies,
                and request body.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this parse JSON request bodies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Auto mode detects JSON content types and JSON-looking
                bodies. You can also force JSON parsing from the body parsing
                option.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this convert a request to cURL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Choose cURL output to generate a command that includes the
                method, URL, headers, and body.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support cookies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Cookie values are parsed from the Cookie header and shown in
                a separate table for easier review.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are my requests uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Request parsing happens directly in your browser, and your
                raw request data is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/http-request-parser" />
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

function parseRawHTTPRequest(
  input: string,
  options: {
    bodyParseMode: BodyParseMode;
    decodeQueryParams: boolean;
  }
): ParsedHTTPRequest {
  const normalizedInput = input.replace(/\r\n/g, "\n");
  const [headPart, ...bodyParts] = normalizedInput.split(/\n\n/);
  const body = bodyParts.join("\n\n");
  const headLines = headPart.split("\n").filter((line) => line.trim() !== "");

  if (headLines.length === 0) {
    throw new Error("Request is missing a request line.");
  }

  const requestLine = headLines[0].trim();
  const requestParts = requestLine.split(/\s+/);

  if (requestParts.length < 3) {
    throw new Error(
      "Request line must include method, target, and protocol, such as GET /path HTTP/1.1."
    );
  }

  const [method, target, protocol] = requestParts;

  if (!/^[A-Z]+$/.test(method)) {
    throw new Error("HTTP method should be uppercase, such as GET or POST.");
  }

  if (!/^HTTP\/\d(?:\.\d)?$/.test(protocol)) {
    throw new Error("Protocol should look like HTTP/1.1 or HTTP/2.");
  }

  const headers = parseHeaders(headLines.slice(1));
  const host = getHeaderValue(headers, "host");
  const urlInfo = parseTarget(target, host, options.decodeQueryParams);
  const cookies = parseCookieHeader(getHeaderValue(headers, "cookie"));
  const contentType = getHeaderValue(headers, "content-type");
  const parsedBody = parseRequestBody(body, contentType, options.bodyParseMode);
  const bodyType = getBodyType(body, contentType, options.bodyParseMode);

  return {
    method,
    target,
    path: urlInfo.path,
    protocol,
    host,
    url: urlInfo.url,
    headers,
    queryParams: urlInfo.queryParams,
    cookies,
    body,
    parsedBody,
    bodyType,
    contentLength: body.length,
  };
}

function parseHeaders(lines: string[]): ParsedHeader[] {
  const headers: ParsedHeader[] = [];
  let currentHeader: ParsedHeader | null = null;

  lines.forEach((line, index) => {
    if (/^\s/.test(line) && currentHeader) {
      currentHeader.value = `${currentHeader.value} ${line.trim()}`;
      return;
    }

    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      throw new Error(`Header line ${index + 2} is missing a colon.`);
    }

    const name = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (!name) {
      throw new Error(`Header line ${index + 2} has an empty name.`);
    }

    currentHeader = {
      name,
      value,
    };

    headers.push(currentHeader);
  });

  return headers;
}

function parseTarget(
  target: string,
  host: string,
  decodeQueryParams: boolean
) {
  const hasAbsoluteUrl = /^https?:\/\//i.test(target);
  const fallbackBase = host ? `https://${host}` : "https://example.local";
  const url = new URL(target, fallbackBase);
  const path = `${url.pathname}${url.search}`;
  const queryParams: ParsedPair[] = [];

  url.searchParams.forEach((value, key) => {
    queryParams.push({
      key: decodeQueryParams ? safeDecode(key) : key,
      value: decodeQueryParams ? safeDecode(value) : value,
    });
  });

  return {
    path,
    queryParams,
    url: hasAbsoluteUrl ? target : host ? `${url.protocol}//${host}${path}` : path,
  };
}

function parseCookieHeader(cookieHeader: string): ParsedPair[] {
  if (!cookieHeader) {
    return [];
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const equalsIndex = part.indexOf("=");

      if (equalsIndex === -1) {
        return {
          key: part,
          value: "",
        };
      }

      return {
        key: part.slice(0, equalsIndex).trim(),
        value: part.slice(equalsIndex + 1).trim(),
      };
    });
}

function parseRequestBody(
  body: string,
  contentType: string,
  mode: BodyParseMode
): unknown {
  if (!body) {
    return "";
  }

  const trimmedBody = body.trim();

  if (
    mode === "json" ||
    (mode === "auto" &&
      (contentType.includes("application/json") ||
        trimmedBody.startsWith("{") ||
        trimmedBody.startsWith("[")))
  ) {
    try {
      return JSON.parse(trimmedBody);
    } catch {
      if (mode === "json") {
        throw new Error("Request body is not valid JSON.");
      }

      return body;
    }
  }

  if (
    mode === "form" ||
    (mode === "auto" &&
      contentType.includes("application/x-www-form-urlencoded"))
  ) {
    return parseFormBody(trimmedBody);
  }

  return body;
}

function parseFormBody(body: string): ParsedPair[] {
  return body
    .split("&")
    .filter(Boolean)
    .map((part) => {
      const equalsIndex = part.indexOf("=");

      if (equalsIndex === -1) {
        return {
          key: safeDecode(part),
          value: "",
        };
      }

      return {
        key: safeDecode(part.slice(0, equalsIndex)),
        value: safeDecode(part.slice(equalsIndex + 1)),
      };
    });
}

function getBodyType(
  body: string,
  contentType: string,
  mode: BodyParseMode
) {
  if (!body) {
    return "none";
  }

  if (
    mode === "json" ||
    (mode === "auto" &&
      (contentType.includes("application/json") ||
        body.trim().startsWith("{") ||
        body.trim().startsWith("[")))
  ) {
    return "json";
  }

  if (
    mode === "form" ||
    (mode === "auto" &&
      contentType.includes("application/x-www-form-urlencoded"))
  ) {
    return "form-urlencoded";
  }

  return "text";
}

function formatParsedRequest(
  request: ParsedHTTPRequest,
  options: {
    outputFormat: OutputFormat;
    includeSensitiveHeaders: boolean;
  }
) {
  if (options.outputFormat === "json") {
    return JSON.stringify(
      {
        ...request,
        headers: request.headers.map((header) => ({
          ...header,
          value:
            isSensitiveHeader(header.name) && !options.includeSensitiveHeaders
              ? "[hidden]"
              : header.value,
        })),
        cookies: request.cookies.map((cookie) => ({
          ...cookie,
          value: options.includeSensitiveHeaders ? cookie.value : "[hidden]",
        })),
      },
      null,
      2
    );
  }

  if (options.outputFormat === "curl") {
    return toCurlCommand(request, options.includeSensitiveHeaders);
  }

  return [
    `${request.method} ${request.path} ${request.protocol}`,
    `URL: ${request.url}`,
    `Host: ${request.host || "(not provided)"}`,
    `Headers: ${request.headers.length}`,
    `Query parameters: ${request.queryParams.length}`,
    `Cookies: ${request.cookies.length}`,
    `Body type: ${request.bodyType}`,
    `Body size: ${request.contentLength.toLocaleString()} characters`,
    "",
    "Headers:",
    ...request.headers.map(
      (header) =>
        `${header.name}: ${
          isSensitiveHeader(header.name) && !options.includeSensitiveHeaders
            ? "[hidden]"
            : header.value
        }`
    ),
    request.queryParams.length > 0 ? "" : "",
    request.queryParams.length > 0 ? "Query Parameters:" : "",
    ...request.queryParams.map((param) => `${param.key}=${param.value}`),
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function toCurlCommand(
  request: ParsedHTTPRequest,
  includeSensitiveHeaders: boolean
) {
  const parts = [`curl -X ${shellQuote(request.method)} ${shellQuote(request.url)}`];

  request.headers.forEach((header) => {
    if (isSensitiveHeader(header.name) && !includeSensitiveHeaders) {
      return;
    }

    parts.push(`  -H ${shellQuote(`${header.name}: ${header.value}`)}`);
  });

  if (request.body) {
    parts.push(`  --data ${shellQuote(request.body)}`);
  }

  return parts.join(" \\\n");
}

function formatBodyPreview(parsedBody: unknown, rawBody: string) {
  if (typeof parsedBody === "string") {
    return parsedBody || rawBody;
  }

  return JSON.stringify(parsedBody, null, 2);
}

function getRequestWarnings(
  request: ParsedHTTPRequest,
  includeSensitiveHeaders: boolean
): RequestWarning[] {
  const warnings: RequestWarning[] = [];

  const hasAuthorization = request.headers.some((header) =>
    isSensitiveHeader(header.name)
  );

  if (hasAuthorization && !includeSensitiveHeaders) {
    warnings.push({
      title: "Sensitive headers hidden",
      message:
        "Authorization, Cookie, token, and key-like headers are hidden in copied output by default.",
    });
  }

  if (!request.host && !request.target.startsWith("http")) {
    warnings.push({
      title: "Host header missing",
      message:
        "Relative HTTP requests usually need a Host header to reconstruct a full URL.",
    });
  }

  if (request.body && !getHeaderValue(request.headers, "content-type")) {
    warnings.push({
      title: "Body has no Content-Type",
      message:
        "A request body is present, but no Content-Type header was found. Body parsing may be less accurate.",
    });
  }

  if (request.method === "GET" && request.body.trim()) {
    warnings.push({
      title: "GET request has a body",
      message:
        "GET requests with bodies can behave inconsistently across clients, servers, and proxies.",
    });
  }

  return warnings;
}

function getHeaderValue(headers: ParsedHeader[], name: string) {
  const header = headers.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );

  return header ? header.value : "";
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

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}
