"use client";

import { useMemo, useState, type ReactNode } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type HeaderEntry = {
  name: string;
  value: string;
};

type QueryEntry = {
  key: string;
  value: string;
};

type Diagnostic = {
  severity: "info" | "warning";
  title: string;
  message: string;
};

type ParsedRequest = {
  method: string;
  target: string;
  protocol: string;
  headers: HeaderEntry[];
  queryParams: QueryEntry[];
  body: string;
  formattedBody: string;
  bodyType: string;
  bodyBytes: number;
  diagnostics: Diagnostic[];
};

const sampleRequest = `POST /api/users?source=web&active=true HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token_here
User-Agent: Yoryantra-Test
Content-Length: 53

{"name":"Yoryantra","role":"developer","active":true}`;

const sensitiveHeaders = new Set([
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api-key",
  "x-auth-token",
]);

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ParsedRequest | null>(null);
  const [error, setError] = useState("");
  const [redactSensitive, setRedactSensitive] = useState(true);
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () => (result ? formatParsedRequest(result, redactSensitive) : ""),
    [result, redactSensitive]
  );

  const formatRequest = () => {
    if (!input.trim()) {
      setError("Please paste a raw HTTP request to format.");
      setResult(null);
      return;
    }

    try {
      const parsed = parseHttpRequest(input);
      setResult(parsed);
      setError("");
      setCopied(false);
    } catch (err) {
      setResult(null);
      setCopied(false);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to format this HTTP request."
      );
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadExample = () => {
    setInput(sampleRequest);
    setResult(null);
    setError("");
    setRedactSensitive(true);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setResult(null);
    setError("");
    setRedactSensitive(true);
    setCopied(false);
  };

  return (
    <ToolShell
      title="HTTP Request Formatter"
      description="Parse raw HTTP requests into request-line, headers, query parameters, body details, and practical diagnostics without sending the request."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Raw HTTP Request
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste an HTTP/1.x-style request from logs, a proxy, a debugging note, a test fixture, or an API troubleshooting session.
          </p>

          <textarea
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setResult(null);
              setError("");
              setCopied(false);
            }}
            placeholder={sampleRequest}
            spellCheck={false}
            className="mt-4 w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm leading-6 font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Output Safety</h3>

          <label className="mt-5 flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={redactSensitive}
              onChange={(event) => {
                setRedactSensitive(event.target.checked);
                setCopied(false);
              }}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#d9a928]"
            />
            <span>
              <span className="font-medium text-gray-900">Redact sensitive header values</span>
              <span className="mt-1 block leading-6 text-gray-500">
                Hides common credentials such as Authorization, Cookie, X-API-Key, and authentication-token headers in formatted output.
              </span>
            </span>
          </label>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
            <p className="font-semibold text-gray-900">The formatter checks:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>request method, target, and protocol</li>
              <li>duplicate and malformed header lines</li>
              <li>query parameter decoding</li>
              <li>JSON and URL encoded bodies</li>
              <li>Host, Content-Length, and framing clues</li>
              <li>sensitive headers before you copy output</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={formatRequest} className="yoryantra-btn">
          Format Request
        </button>
        <button type="button" onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Method" value={result.method} />
            <StatCard label="Headers" value={String(result.headers.length)} />
            <StatCard label="Query params" value={String(result.queryParams.length)} />
            <StatCard label="Body" value={result.body ? `${result.bodyType} · ${result.bodyBytes} bytes` : "None"} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Formatted Request</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Structured for reading and copying; the request is not sent anywhere.
                </p>
              </div>
              <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">
                {copied ? "Copied" : redactSensitive ? "Copy Redacted Output" : "Copy Output"}
              </button>
            </div>

            <pre className="mt-4 max-h-[620px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
              {output}
            </pre>
          </div>

          {result.diagnostics.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">Request Diagnostics</h3>
              <div className="mt-4 space-y-3">
                {result.diagnostics.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className={`rounded-xl border p-4 text-sm leading-6 ${
                      item.severity === "warning"
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }`}
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What You Can Learn From a Raw HTTP Request
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A raw HTTP request is more than a block of headers. The request line tells you the method and request target; headers carry routing, authentication, representation, and client context; the query string carries URI parameters; and the message body can contain JSON, form data, or another representation. Formatting those pieces separately makes debugging much faster than reading an unstructured log dump.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool is especially useful when comparing what a client intended to send with what a proxy, gateway, web server, or test fixture actually recorded.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Request Line, Headers, Blank Line, Body
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            In HTTP/1.1 text form, a request starts with a request line, followed by header field lines, an empty line, and then an optional message body. The formatter uses that boundary to avoid treating body content as headers. It also preserves repeated header fields instead of silently overwriting them.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Diagnostics Worth Checking During API Debugging
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li><strong className="text-gray-800">Missing Host:</strong> HTTP/1.1 requests require a Host field, including absolute-form requests sent through proxies.</li>
            <li><strong className="text-gray-800">Duplicate Host:</strong> more than one Host field is invalid in HTTP/1.1 and can be a serious parsing problem.</li>
            <li><strong className="text-gray-800">Content-Length mismatch:</strong> the declared octet count should match the actual request body when Content-Length provides framing.</li>
            <li><strong className="text-gray-800">Transfer-Encoding plus Content-Length:</strong> seeing both is a framing warning and deserves investigation.</li>
            <li><strong className="text-gray-800">Body without Content-Type:</strong> the payload may still be readable, but downstream software has less information about how to interpret it.</li>
            <li><strong className="text-gray-800">Credentials in logs:</strong> Authorization, cookies, and API-key headers should normally be redacted before a request is shared.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Body Formatting Is Content-Aware, Not a Full Protocol Decoder
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Valid JSON is pretty-printed. <span className="font-mono">application/x-www-form-urlencoded</span> bodies are expanded into readable key-value lines. Other payloads are preserved as text. Multipart bodies, compressed content, and chunked transfer coding are not reconstructed by this tool because those formats require message-framing or binary-aware parsing beyond a pasted request formatter.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            HTTP/2 and HTTP/3 Look Different on the Wire
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This formatter targets HTTP/1.x-style textual requests and normalized request dumps. HTTP/2 and HTTP/3 do not use the same plain-text request-line and header framing on the wire. Developer tools and proxies may still export an HTTP/2 or HTTP/3 exchange in a human-readable HTTP-like form, but that representation is already a decoded view rather than the original wire format.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Standards Reference</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            RFC 9110 defines HTTP semantics such as methods, request targets, fields, and content. RFC 9112 defines HTTP/1.1 message syntax, request-line structure, Host requirements, and message framing.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-[var(--green)]">
            <a href="https://www.rfc-editor.org/rfc/rfc9110.html" target="_blank" rel="noreferrer" className="hover:underline">
              RFC 9110: HTTP Semantics ↗
            </a>
            <a href="https://www.rfc-editor.org/rfc/rfc9112.html" target="_blank" rel="noreferrer" className="hover:underline">
              RFC 9112: HTTP/1.1 ↗
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Common Questions</h2>
          <div className="mt-5 space-y-6">
            <Question title="Does the formatter send the HTTP request?">
              No. It only parses the text you paste and formats it in your browser. It does not contact the Host or request target.
            </Question>
            <Question title="Why can Content-Length differ from JavaScript string length?">
              Content-Length is measured in octets, not JavaScript characters. UTF-8 characters can use more than one byte, so this tool compares Content-Length with the UTF-8 byte length of the pasted body.
            </Question>
            <Question title="Should I leave sensitive-header redaction enabled?">
              Keep it enabled when the output will be copied into a ticket, chat, issue, or document. Turn it off only when you genuinely need to inspect the original header value and can handle it safely.
            </Question>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/http-request-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseHttpRequest(source: string): ParsedRequest {
  const normalized = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const separator = findHeaderBodySeparator(normalized);
  const headPart = separator === -1 ? normalized : normalized.slice(0, separator);
  const body = separator === -1 ? "" : normalized.slice(separator).replace(/^\n[ \t]*\n/, "");
  const headLines = headPart.split("\n");

  while (headLines.length && !headLines[0].trim()) headLines.shift();
  while (headLines.length && !headLines[headLines.length - 1].trim()) headLines.pop();

  if (!headLines.length) {
    throw new Error("Request content is empty.");
  }

  const requestLine = headLines[0].trim();
  const requestMatch = requestLine.match(/^(\S+)\s+(\S+)(?:\s+(HTTP\/\d(?:\.\d)?))?$/i);

  if (!requestMatch) {
    throw new Error("The first line should look like: GET /path HTTP/1.1");
  }

  const method = requestMatch[1].toUpperCase();
  const target = requestMatch[2];
  const protocol = requestMatch[3]?.toUpperCase() || "HTTP/1.1";
  const { headers, usedObsFold } = parseHeaders(headLines.slice(1));
  const queryParams = parseQueryParams(target);
  const contentType = getFirstHeader(headers, "content-type");
  const bodyInfo = formatBody(body, contentType);
  const diagnostics = buildDiagnostics({
    method,
    target,
    protocol,
    headers,
    body,
    bodyBytes: bodyInfo.bytes,
    contentType,
    usedObsFold,
  });

  return {
    method,
    target,
    protocol,
    headers,
    queryParams,
    body,
    formattedBody: bodyInfo.formatted,
    bodyType: bodyInfo.type,
    bodyBytes: bodyInfo.bytes,
    diagnostics,
  };
}

function findHeaderBodySeparator(source: string) {
  const match = /\n[ \t]*\n/.exec(source);
  return match ? match.index : -1;
}

function parseHeaders(lines: string[]) {
  const headers: HeaderEntry[] = [];
  let usedObsFold = false;

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;

    if (/^[ \t]/.test(rawLine) && headers.length) {
      headers[headers.length - 1].value += ` ${rawLine.trim()}`;
      usedObsFold = true;
      continue;
    }

    const colonIndex = rawLine.indexOf(":");
    if (colonIndex <= 0) {
      throw new Error(`Invalid header line: ${rawLine.trim() || rawLine}`);
    }

    const name = rawLine.slice(0, colonIndex).trim();
    const value = rawLine.slice(colonIndex + 1).trim();

    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) {
      throw new Error(`Invalid HTTP header field name: ${name}`);
    }

    headers.push({ name, value });
  }

  return { headers, usedObsFold };
}

function parseQueryParams(target: string): QueryEntry[] {
  const questionIndex = target.indexOf("?");
  if (questionIndex === -1) return [];

  const hashIndex = target.indexOf("#", questionIndex);
  const query = target.slice(questionIndex + 1, hashIndex === -1 ? undefined : hashIndex);
  if (!query) return [];

  return query.split("&").filter(Boolean).map((part) => {
    const equalsIndex = part.indexOf("=");
    const rawKey = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    const rawValue = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
    return {
      key: decodeComponent(rawKey),
      value: decodeComponent(rawValue),
    };
  });
}

function formatBody(body: string, contentType: string) {
  if (!body) {
    return { formatted: "", type: "none", bytes: 0 };
  }

  const bytes = new TextEncoder().encode(body).length;
  const trimmed = body.trim();
  const normalizedType = contentType.toLowerCase();

  if (normalizedType.includes("application/json") || normalizedType.includes("+json") || looksLikeJson(trimmed)) {
    try {
      return {
        formatted: JSON.stringify(JSON.parse(trimmed), null, 2),
        type: "JSON",
        bytes,
      };
    } catch {
      return { formatted: body, type: normalizedType.includes("json") ? "invalid JSON" : "text", bytes };
    }
  }

  if (normalizedType.includes("application/x-www-form-urlencoded")) {
    const params = parseUrlEncodedBody(trimmed);
    return {
      formatted: params.length
        ? params.map((param) => `${param.key}: ${param.value}`).join("\n")
        : body,
      type: "URL encoded form",
      bytes,
    };
  }

  if (normalizedType.includes("multipart/form-data")) {
    return { formatted: body, type: "multipart form-data", bytes };
  }

  return { formatted: body, type: contentType ? contentType.split(";")[0] : "text", bytes };
}

function parseUrlEncodedBody(body: string): QueryEntry[] {
  if (!body) return [];
  return body.split("&").filter(Boolean).map((part) => {
    const equalsIndex = part.indexOf("=");
    const rawKey = equalsIndex === -1 ? part : part.slice(0, equalsIndex);
    const rawValue = equalsIndex === -1 ? "" : part.slice(equalsIndex + 1);
    return {
      key: decodeComponent(rawKey),
      value: decodeComponent(rawValue),
    };
  });
}

function buildDiagnostics(options: {
  method: string;
  target: string;
  protocol: string;
  headers: HeaderEntry[];
  body: string;
  bodyBytes: number;
  contentType: string;
  usedObsFold: boolean;
}) {
  const diagnostics: Diagnostic[] = [];
  const hostHeaders = getHeaders(options.headers, "host");
  const contentLengthHeaders = getHeaders(options.headers, "content-length");
  const transferEncodingHeaders = getHeaders(options.headers, "transfer-encoding");
  const sensitiveFound = options.headers.filter((header) => isSensitiveHeader(header.name));

  if (options.protocol === "HTTP/1.1" && hostHeaders.length === 0) {
    diagnostics.push({
      severity: "warning",
      title: "HTTP/1.1 Host header is missing",
      message: "HTTP/1.1 requests require a Host field. Check whether the request dump is incomplete or was normalized by another tool.",
    });
  }

  if (hostHeaders.length > 1) {
    diagnostics.push({
      severity: "warning",
      title: "Multiple Host headers found",
      message: "An HTTP/1.1 request should not contain more than one Host field. Duplicate Host fields can create ambiguous routing and parsing behavior.",
    });
  }

  if (contentLengthHeaders.length > 1) {
    const uniqueLengths = new Set(contentLengthHeaders.map((header) => header.value.trim()));
    diagnostics.push({
      severity: "warning",
      title: "Multiple Content-Length headers found",
      message: uniqueLengths.size === 1
        ? "Repeated identical Content-Length values still deserve review because request framing should be unambiguous."
        : "Conflicting Content-Length values make request framing ambiguous and can indicate a malformed or dangerous request.",
    });
  }

  if (contentLengthHeaders.length) {
    const value = contentLengthHeaders[0].value.trim();
    if (!/^\d+$/.test(value)) {
      diagnostics.push({
        severity: "warning",
        title: "Content-Length is not a valid decimal value",
        message: `Content-Length is ${JSON.stringify(value)}. A valid Content-Length is a non-negative decimal octet count.`,
      });
    } else if (Number(value) !== options.bodyBytes) {
      diagnostics.push({
        severity: "warning",
        title: "Content-Length does not match the pasted body",
        message: `The header declares ${Number(value).toLocaleString()} bytes, while the pasted body is ${options.bodyBytes.toLocaleString()} UTF-8 bytes. The log may be truncated, edited, or incorrectly framed.`,
      });
    }
  }

  if (transferEncodingHeaders.length && contentLengthHeaders.length) {
    diagnostics.push({
      severity: "warning",
      title: "Transfer-Encoding and Content-Length are both present",
      message: "HTTP/1.1 message framing treats this combination as suspicious. Investigate the source before replaying or forwarding the request.",
    });
  }

  if (options.body && !options.contentType) {
    diagnostics.push({
      severity: "info",
      title: "Body found without Content-Type",
      message: "The request contains a body but no Content-Type field, so the payload format must be inferred rather than declared.",
    });
  }

  if (sensitiveFound.length) {
    diagnostics.push({
      severity: "info",
      title: "Sensitive headers detected",
      message: `${sensitiveFound.length} potentially sensitive header${sensitiveFound.length === 1 ? " was" : "s were"} found. Keep redaction enabled before sharing formatted output.`,
    });
  }

  if (options.usedObsFold) {
    diagnostics.push({
      severity: "warning",
      title: "Obsolete folded header line detected",
      message: "A continuation line beginning with whitespace was unfolded for readability. Obsolete line folding is not valid for normal modern HTTP/1.1 messages and can create parser differences.",
    });
  }

  if (options.target.includes("#")) {
    diagnostics.push({
      severity: "warning",
      title: "Fragment marker found in request target",
      message: "URI fragments are client-side identifiers and are not normally part of an HTTP request target sent to a server.",
    });
  }

  if (options.method === "CONNECT" && options.target.includes("/")) {
    diagnostics.push({
      severity: "info",
      title: "Check CONNECT request-target form",
      message: "CONNECT normally uses authority-form such as example.com:443 rather than an origin-form path.",
    });
  }

  return diagnostics;
}

function formatParsedRequest(request: ParsedRequest, redactSensitive: boolean) {
  const output = [
    "HTTP request formatted",
    "",
    "Request line",
    `Method: ${request.method}`,
    `Target: ${request.target}`,
    `Protocol: ${request.protocol}`,
    "",
    `Headers (${request.headers.length})`,
  ];

  if (request.headers.length) {
    request.headers.forEach((header) => {
      const value = redactSensitive && isSensitiveHeader(header.name)
        ? "[REDACTED]"
        : header.value;
      output.push(`${header.name}: ${value}`);
    });
  } else {
    output.push("No headers found.");
  }

  output.push("", `Query parameters (${request.queryParams.length})`);

  if (request.queryParams.length) {
    request.queryParams.forEach((param) => {
      output.push(`${param.key}: ${param.value}`);
    });
  } else {
    output.push("No query parameters found.");
  }

  output.push("", `Body (${request.body ? `${request.bodyType}, ${request.bodyBytes} bytes` : "none"})`);
  output.push(request.body ? request.formattedBody : "No body found.");

  if (request.diagnostics.length) {
    output.push("", "Diagnostics");
    request.diagnostics.forEach((item) => {
      output.push(`${item.severity.toUpperCase()}: ${item.title} — ${item.message}`);
    });
  }

  return output.join("\n");
}

function getHeaders(headers: HeaderEntry[], name: string) {
  const normalized = name.toLowerCase();
  return headers.filter((header) => header.name.toLowerCase() === normalized);
}

function getFirstHeader(headers: HeaderEntry[], name: string) {
  return getHeaders(headers, name)[0]?.value ?? "";
}

function isSensitiveHeader(name: string) {
  const normalized = name.toLowerCase();
  return sensitiveHeaders.has(normalized) || /(?:token|secret|api[-_]?key|auth)/i.test(normalized);
}

function decodeComponent(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}

function looksLikeJson(value: string) {
  return (value.startsWith("{") && value.endsWith("}")) || (value.startsWith("[") && value.endsWith("]"));
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 break-words font-mono text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Question({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600 leading-relaxed">{children}</p>
    </div>
  );
}
