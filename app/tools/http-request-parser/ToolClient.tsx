"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type BodyParseMode = "auto" | "text" | "json" | "form";
type OutputFormat = "summary" | "json" | "curl";
type URLScheme = "https" | "http";
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
  targetForm: "origin" | "absolute" | "authority" | "asterisk";
  path: string;
  protocol: string;
  host: string;
  url: string;
  scheme: URLScheme;
  headers: ParsedHeader[];
  queryParams: ParsedPair[];
  cookies: ParsedPair[];
  body: string;
  parsedBody: unknown;
  bodyType: string;
  bodyCharacters: number;
  bodyUtf8Bytes: number;
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
  const [urlScheme, setUrlScheme] = useState<URLScheme>("https");
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
        urlScheme,
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
    setUrlScheme("https");
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
    setUrlScheme("https");
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
      description="Break a raw HTTP/1.x request into request-line, headers, query parameters, cookies, and body details."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Raw HTTP Request
        </label>

        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
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

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <YoryantraSelect
            label="Body Parsing"
            value={bodyParseMode}
            onChange={(value: string) => {
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
            onChange={(value: string) => {
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

          <YoryantraSelect
            label="Scheme for relative targets"
            value={urlScheme}
            onChange={(value: string) => {
              setUrlScheme(value as URLScheme);
              setParsedRequest(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "HTTPS", value: "https" },
              { label: "HTTP", value: "http" },
            ]}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={decodeQueryParams}
              onChange={(event: { target: { checked: boolean } }) => {
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
                Percent-decode query names and values. A literal + stays + because URI query syntax does not universally define it as a space.
              </span>
            </span>
          </label>

          <label className="self-start flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={includeSensitiveHeaders}
              onChange={(event: { target: { checked: boolean } }) => {
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
                Include recognized credential, cookie, token, and key-like header values in copied output. Request bodies are never scrubbed automatically.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseRequest} className="yoryantra-btn whitespace-nowrap">
          Parse HTTP Request
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline whitespace-nowrap">
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
            value={`${parsedRequest.bodyUtf8Bytes.toLocaleString()} UTF-8 bytes`}
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
            <DetailCard label="Target Form" value={parsedRequest.targetForm} />
            <DetailCard label="Path / Target" value={parsedRequest.path} />
            <DetailCard label="Host" value={parsedRequest.host || "(not provided)"} />
            <DetailCard
              label="Reconstructed URL"
              value={
                includeSensitiveHeaders
                  ? parsedRequest.url
                  : redactUrl(parsedRequest.url)
              }
            />
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
            !includeSensitiveHeaders && isSensitiveName(param.key)
              ? "[hidden]"
              : param.value,
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
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
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
              className="yoryantra-btn-outline whitespace-nowrap text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Parsed HTTP request output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing stays in the browser and never sends the pasted request. Sensitive-value masking applies to recognized headers and query keys; arbitrary body text is left untouched.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading an HTTP/1.x Request Without Inventing Missing Context
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A textual HTTP/1.x request has a request line, field lines, an empty line, and optionally a message body. The scheme is not present in an origin-form request such as <code className="font-mono text-sm">GET /api HTTP/1.1</code>, so HTTPS or HTTP must be chosen explicitly when a full URL is reconstructed.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP/2 and HTTP/3 do not use the HTTP/1.x request-line format on the wire. Paste a textual HTTP/1.0 or HTTP/1.1 message here rather than pseudo-header or binary framing dumps.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Request Targets Have Four Forms</h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>origin-form</strong>: a path and optional query, normally used when talking directly to an origin server.</li>
            <li><strong>absolute-form</strong>: a complete URI, normally sent to an HTTP proxy.</li>
            <li><strong>authority-form</strong>: host and port for CONNECT.</li>
            <li><strong>asterisk-form</strong>: <code className="font-mono text-sm">*</code> for server-wide OPTIONS.</li>
          </ul>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The parser checks the target against the method instead of forcing every request through a URL constructor. That prevents CONNECT and OPTIONS <code className="font-mono text-sm">*</code> requests from being misrepresented as ordinary paths.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Header Syntax Is Security-Relevant</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP field names are tokens and whitespace before the colon is invalid. Obsolete folded field lines are rejected rather than silently unfolded. For HTTP/1.1, exactly one Host field is required. Requests containing both Transfer-Encoding and Content-Length are rejected because ambiguous message framing is a well-known request-smuggling boundary.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Body Parsing Follows Content-Type</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Auto mode parses JSON only for <code className="font-mono text-sm">application/json</code> or a <code className="font-mono text-sm">+json</code> media type, and parses form data only for <code className="font-mono text-sm">application/x-www-form-urlencoded</code>. A body that merely starts with a brace is not enough to call it JSON.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Transfer-coded bodies are left as pasted wire text; chunk framing is not decoded here. The UTF-8 byte count is calculated from the pasted body and compared with a simple Content-Length value when one is present. That is a debugging aid, not proof of the bytes that originally crossed the network.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Turning a Parsed Request into cURL</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Generated commands use POSIX-shell quoting and <code className="font-mono text-sm">--data-raw</code> so a leading <code className="font-mono text-sm">@</code> in body text is not treated as a filename. Recognized secrets are replaced with placeholders unless you explicitly include them. Transfer-Encoding framing is not converted because curl would need the decoded payload rather than the pasted chunk syntax.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Primary References</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <a href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">RFC 9110</a> defines HTTP semantics, methods, and field names. <a href="https://www.rfc-editor.org/rfc/rfc9112.html" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">RFC 9112</a> defines HTTP/1.1 message syntax, request-target forms, Host requirements, field-line parsing, and message framing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/http-request-parser" />
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
    urlScheme: URLScheme;
  }
): ParsedHTTPRequest {
  const separator = /\r?\n\r?\n/.exec(input);
  const headPart = separator ? input.slice(0, separator.index) : input;
  const body = separator ? input.slice(separator.index + separator[0].length) : "";
  const headLines = headPart.replace(/\r\n/g, "\n").split("\n");

  if (!headLines[0]?.trim()) throw new Error("Request is missing a request line.");
  const requestLine = headLines[0];
  const match = /^([!#$%&'*+.^_`|~0-9A-Za-z-]+) ([^\x00-\x20\x7F]+) (HTTP\/1\.[01])$/.exec(requestLine);
  if (!match) throw new Error("Request line must be METHOD SP request-target SP HTTP/1.0 or HTTP/1.1.");

  const [, method, target, protocol] = match;
  const headers = parseHeaders(headLines.slice(1));
  const hostValues = getHeaderValues(headers, "host");
  if (protocol === "HTTP/1.1" && hostValues.length !== 1) {
    throw new Error("HTTP/1.1 requires exactly one Host header field.");
  }
  if (hostValues.length > 1) throw new Error("More than one Host header field makes request routing ambiguous.");

  const transferEncoding = getHeaderValue(headers, "transfer-encoding");
  const contentLengthValues = getHeaderValues(headers, "content-length");
  if (transferEncoding && contentLengthValues.length) {
    throw new Error("A request containing both Transfer-Encoding and Content-Length has ambiguous framing and is not parsed.");
  }
  if (contentLengthValues.length > 1 && new Set(contentLengthValues.map((value) => value.trim())).size > 1) {
    throw new Error("Conflicting Content-Length field values make the message length ambiguous.");
  }

  const host = hostValues[0] || "";
  if (host) validateHostField(host);
  const targetInfo = parseTarget(target, method, host, options.urlScheme, options.decodeQueryParams);
  const cookies = parseCookieHeader(getHeaderValue(headers, "cookie"));
  const contentType = getHeaderValue(headers, "content-type");
  const isTransferCoded = Boolean(transferEncoding);
  const parsedBody = isTransferCoded ? body : parseRequestBody(body, contentType, options.bodyParseMode);
  const bodyType = isTransferCoded ? `transfer-coded (${transferEncoding})` : getBodyType(body, contentType, options.bodyParseMode);

  return {
    method,
    target,
    targetForm: targetInfo.targetForm,
    path: targetInfo.path,
    protocol,
    host,
    url: targetInfo.url,
    scheme: targetInfo.scheme,
    headers,
    queryParams: targetInfo.queryParams,
    cookies,
    body,
    parsedBody,
    bodyType,
    bodyCharacters: body.length,
    bodyUtf8Bytes: new TextEncoder().encode(body).length,
  };
}

function parseHeaders(lines: string[]): ParsedHeader[] {
  const headers: ParsedHeader[] = [];
  lines.forEach((line, index) => {
    if (!line) return;
    if (/^[ \t]/.test(line)) throw new Error(`Header line ${index + 2} uses obsolete line folding, which is not accepted in HTTP/1.1 requests.`);
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) throw new Error(`Header line ${index + 2} is missing a colon.`);
    const name = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1).replace(/^[ \t]+|[ \t]+$/g, "");
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) throw new Error(`Header line ${index + 2} has an invalid field name or whitespace before the colon.`);
    if (/\r|\n/.test(value)) throw new Error(`Header line ${index + 2} contains an unexpected line break.`);
    headers.push({ name, value });
  });
  return headers;
}

function parseTarget(
  target: string,
  method: string,
  host: string,
  scheme: URLScheme,
  decodeQueryParams: boolean
) {
  if (target.includes("#")) throw new Error("HTTP request targets do not include URI fragments (#...).");

  if (target === "*") {
    if (method !== "OPTIONS") throw new Error("The asterisk-form request target is defined for OPTIONS requests.");
    return { targetForm: "asterisk" as const, path: "*", queryParams: [] as ParsedPair[], url: host ? `${scheme}://${host}/` : "*", scheme };
  }

  if (method === "CONNECT") {
    if (!/^\[[0-9A-Fa-f:.]+\]:\d+$/.test(target) && !/^[^/?#\s:]+:\d+$/.test(target)) {
      throw new Error("CONNECT uses authority-form: host:port.");
    }
    return { targetForm: "authority" as const, path: target, queryParams: [] as ParsedPair[], url: target, scheme };
  }

  if (/^https?:\/\//i.test(target)) {
    const url = new URL(target);
    if (url.username || url.password) throw new Error("HTTP absolute-form request targets do not use URI userinfo credentials.");
    const pairs = parseRawQuery(url.search, decodeQueryParams);
    return { targetForm: "absolute" as const, path: `${url.pathname}${url.search}`, queryParams: pairs, url: target, scheme: url.protocol === "http:" ? "http" as const : "https" as const };
  }

  if (!target.startsWith("/")) throw new Error("Expected origin-form (/path), absolute-form URL, CONNECT authority-form, or OPTIONS * request target.");
  const question = target.indexOf("?");
  const query = question === -1 ? "" : target.slice(question);
  const pairs = parseRawQuery(query, decodeQueryParams);
  return { targetForm: "origin" as const, path: target, queryParams: pairs, url: host ? `${scheme}://${host}${target}` : target, scheme };
}

function validateHostField(host: string) {
  if (/[/\?#@\s]/.test(host)) throw new Error("Host must contain only an HTTP host and optional port, without whitespace, userinfo, path, query, or fragment text.");
  try {
    const parsed = new URL(`http://${host}/`);
    if (!parsed.hostname) throw new Error("missing hostname");
  } catch {
    throw new Error("Host is not a valid host with an optional port.");
  }
}

function parseRawQuery(search: string, decodeQueryParams: boolean): ParsedPair[] {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  if (!raw) return [];
  return raw.split("&").map((part) => {
    const equalsIndex = part.indexOf("=");
    const rawKey = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    const rawValue = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
    return { key: decodeQueryParams ? safePercentDecode(rawKey) : rawKey, value: decodeQueryParams ? safePercentDecode(rawValue) : rawValue };
  });
}

function parseCookieHeader(cookieHeader: string): ParsedPair[] {
  if (!cookieHeader) return [];
  return cookieHeader.split(";").map((part) => part.trim()).filter(Boolean).map((part) => {
    const equalsIndex = part.indexOf("=");
    return equalsIndex === -1 ? { key: part, value: "" } : { key: part.slice(0, equalsIndex).trim(), value: part.slice(equalsIndex + 1).trim() };
  });
}

function parseRequestBody(body: string, contentType: string, mode: BodyParseMode): unknown {
  if (!body) return "";
  const trimmedBody = body.trim();
  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  const jsonType = mediaType === "application/json" || mediaType.endsWith("+json");

  if (mode === "json" || (mode === "auto" && jsonType)) {
    try { return JSON.parse(trimmedBody); }
    catch { if (mode === "json") throw new Error("Request body is not valid JSON."); return body; }
  }
  if (mode === "form" || (mode === "auto" && mediaType === "application/x-www-form-urlencoded")) return parseFormBody(trimmedBody);
  return body;
}

function parseFormBody(body: string): ParsedPair[] {
  if (!body) return [];
  return body.split("&").map((part) => {
    const equalsIndex = part.indexOf("=");
    const key = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    const value = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
    return { key: safeFormDecode(key), value: safeFormDecode(value) };
  });
}

function getBodyType(body: string, contentType: string, mode: BodyParseMode) {
  if (!body) return "none";
  if (mode === "json") return "json";
  if (mode === "form") return "form-urlencoded";
  if (mode === "text") return "text";
  const mediaType = contentType.split(";", 1)[0].trim().toLowerCase();
  if (mediaType === "application/json" || mediaType.endsWith("+json")) return "json";
  if (mediaType === "application/x-www-form-urlencoded") return "form-urlencoded";
  return "text";
}

function formatParsedRequest(
  request: ParsedHTTPRequest,
  options: { outputFormat: OutputFormat; includeSensitiveHeaders: boolean }
) {
  const visibleUrl = options.includeSensitiveHeaders ? request.url : redactUrl(request.url);
  const visibleQuery = request.queryParams.map((pair) => ({ ...pair, value: !options.includeSensitiveHeaders && isSensitiveName(pair.key) ? "[hidden]" : pair.value }));
  const visibleHeaders = request.headers.map((header) => ({ ...header, value: isSensitiveHeader(header.name) && !options.includeSensitiveHeaders ? "[hidden]" : header.value }));
  const visibleCookies = request.cookies.map((cookie) => ({ ...cookie, value: options.includeSensitiveHeaders ? cookie.value : "[hidden]" }));

  if (options.outputFormat === "json") {
    return JSON.stringify({ ...request, url: visibleUrl, headers: visibleHeaders, queryParams: visibleQuery, cookies: visibleCookies }, null, 2);
  }
  if (options.outputFormat === "curl") return toCurlCommand(request, options.includeSensitiveHeaders);

  return [
    `${request.method} ${request.target} ${request.protocol}`,
    `Target form: ${request.targetForm}`,
    `URL: ${visibleUrl}`,
    `Host: ${request.host || "(not provided)"}`,
    `Headers: ${request.headers.length}`,
    `Query parameters: ${request.queryParams.length}`,
    `Cookies: ${request.cookies.length}`,
    `Body type: ${request.bodyType}`,
    `Body size: ${request.bodyUtf8Bytes.toLocaleString()} UTF-8 bytes (${request.bodyCharacters.toLocaleString()} JS characters)`,
    "\nHeaders:",
    ...visibleHeaders.map((header) => `${header.name}: ${header.value}`),
    visibleQuery.length ? "\nQuery Parameters:" : "",
    ...visibleQuery.map((param) => `${param.key}=${param.value}`),
  ].filter(Boolean).join("\n");
}

function toCurlCommand(request: ParsedHTTPRequest, includeSensitiveHeaders: boolean) {
  if (request.method === "CONNECT") throw new Error("CONNECT authority-form cannot be represented faithfully as an ordinary cURL URL command here.");
  if (getHeaderValue(request.headers, "transfer-encoding")) throw new Error("cURL output is unavailable for transfer-coded request bodies because the pasted chunk framing is not a decoded payload.");
  if (request.body.includes("\0")) throw new Error("A NUL character in the pasted body cannot be represented safely in this POSIX-shell cURL output.");

  const url = request.targetForm === "asterisk" ? request.url : request.url;
  if (!/^https?:\/\//i.test(url)) throw new Error("Choose a Host and scheme before generating cURL from a relative request target.");
  const parts = [`curl -X ${shellQuote(request.method)} ${shellQuote(includeSensitiveHeaders ? url : redactUrl(url))}`];
  if (request.targetForm === "asterisk") parts.push(`  --request-target ${shellQuote("*")}`);

  request.headers.forEach((header) => {
    const lower = header.name.toLowerCase();
    if (lower === "content-length" || lower === "transfer-encoding") return;
    const value = isSensitiveHeader(header.name) && !includeSensitiveHeaders ? "[hidden]" : header.value;
    parts.push(`  -H ${shellQuote(`${header.name}: ${value}`)}`);
  });
  if (request.body) parts.push(`  --data-raw ${shellQuote(request.body)}`);
  return parts.join(" \\\n");
}

function formatBodyPreview(parsedBody: unknown, rawBody: string) {
  if (typeof parsedBody === "string") return parsedBody || rawBody;
  return JSON.stringify(parsedBody, null, 2);
}

function getRequestWarnings(request: ParsedHTTPRequest, includeSensitiveHeaders: boolean): RequestWarning[] {
  const warnings: RequestWarning[] = [];
  const sensitive = request.headers.some((header) => isSensitiveHeader(header.name)) || request.queryParams.some((pair) => isSensitiveName(pair.key));
  if (sensitive && !includeSensitiveHeaders) warnings.push({ title: "Recognized secrets are masked", message: "Credential-like headers, cookies, and sensitive-looking query keys are hidden in copied output. Arbitrary body content is not inspected for secrets." });
  if (!request.host && request.targetForm !== "absolute") warnings.push({ title: "Host is unavailable", message: "Without a Host field, a relative HTTP/1.0 target cannot be reconstructed as a full URL. HTTP/1.1 requests are rejected earlier when Host is missing." });
  if (request.body && !getHeaderValue(request.headers, "content-type")) warnings.push({ title: "Body has no Content-Type", message: "The body is kept as text in Auto mode because no media type describes how to interpret it." });
  const contentType = getHeaderValue(request.headers, "content-type").split(";", 1)[0].trim().toLowerCase();
  if (request.body && (contentType === "application/json" || contentType.endsWith("+json")) && typeof request.parsedBody === "string") {
    try {
      JSON.parse(request.body.trim());
    } catch {
      warnings.push({ title: "Content-Type says JSON, but the body is invalid JSON", message: "Auto mode leaves the body as text when JSON parsing fails instead of inventing a parsed structure." });
    }
  }
  if (request.method === "GET" && request.body) warnings.push({ title: "GET request carries content", message: "HTTP does not define generally applicable semantics for content in a GET request, and some implementations reject it." });
  if (request.method !== request.method.toUpperCase() && ["GET", "HEAD", "POST", "PUT", "DELETE", "CONNECT", "OPTIONS", "TRACE", "PATCH"].includes(request.method.toUpperCase())) warnings.push({ title: "Method token is case-sensitive", message: `${request.method} is not the same method token as ${request.method.toUpperCase()}. Standard method names are normally uppercase.` });

  const contentLength = getHeaderValue(request.headers, "content-length");
  if (contentLength && /^\d+$/.test(contentLength)) {
    const declared = Number(contentLength);
    if (Number.isSafeInteger(declared) && declared !== request.bodyUtf8Bytes) warnings.push({ title: "Content-Length does not match pasted UTF-8 bytes", message: `The field says ${declared} bytes, while the pasted body encodes to ${request.bodyUtf8Bytes} UTF-8 bytes. Copying, decoding, or line-ending changes can cause this difference.` });
  }
  if (getHeaderValue(request.headers, "transfer-encoding")) warnings.push({ title: "Transfer coding is not decoded", message: "The body is shown as pasted wire text. Chunk sizes, chunk extensions, and trailers are not decoded into a representation payload." });
  return warnings;
}

function getHeaderValue(headers: ParsedHeader[], name: string) {
  return headers.find((item) => item.name.toLowerCase() === name.toLowerCase())?.value || "";
}

function getHeaderValues(headers: ParsedHeader[], name: string) {
  return headers.filter((item) => item.name.toLowerCase() === name.toLowerCase()).map((item) => item.value);
}

function isSensitiveHeader(name: string) {
  const normalized = name.toLowerCase();
  return normalized === "authorization" || normalized === "cookie" || normalized === "proxy-authorization" || isSensitiveName(normalized);
}

function isSensitiveName(name: string) {
  return /(?:^|[-_.])(token|secret|api[-_]?key|key|password|passwd|session|credential|auth)(?:$|[-_.])/i.test(name) || /authorization/i.test(name);
}

function redactUrl(value: string) {
  if (!/^https?:\/\//i.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.username) url.username = "hidden";
    if (url.password) url.password = "hidden";
    Array.from(url.searchParams.keys()).forEach((key) => { if (isSensitiveName(key)) url.searchParams.set(key, "[hidden]"); });
    return url.toString();
  } catch { return value; }
}

function safePercentDecode(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function safeFormDecode(value: string) {
  try { return decodeURIComponent(value.replace(/\+/g, " ")); } catch { return value; }
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

