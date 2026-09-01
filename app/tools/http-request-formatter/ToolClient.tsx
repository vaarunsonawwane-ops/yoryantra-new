"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type Severity = "warning" | "note";

type Diagnostic = {
  severity: Severity;
  title: string;
  message: string;
};

type HeaderEntry = {
  name: string;
  lowerName: string;
  value: string;
  line: number;
};

type QueryEntry = {
  key: string;
  value: string;
};

type ParsedRequest = {
  method: string;
  target: string;
  targetForm: string;
  protocol: string;
  headers: HeaderEntry[];
  query: QueryEntry[];
  body: string;
  formattedBody: string;
  bodyType: string;
  bodyBytes: number;
  diagnostics: Diagnostic[];
};

const SAMPLE_REQUEST = `POST /api/users?source=web&active=true HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
User-Agent: Yoryantra-Test
Content-Length: 49

{"name":"Sneha","role":"developer","active":true}`;

const SENSITIVE_HEADERS = [
  "authorization",
  "proxy-authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "api-key",
  "x-auth-token",
];

function isToken(value: string) {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(value);
}

function hasInvalidFieldValueControl(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if (
      (code < 0x20 && code !== 0x09) ||
      code === 0x7f
    ) {
      return true;
    }
  }

  return false;
}

function isSensitiveHeader(name: string) {
  const lower = name.toLowerCase();

  return (
    SENSITIVE_HEADERS.indexOf(lower) !== -1 ||
    /(?:token|secret|api[-_]?key|credential)/i.test(lower)
  );
}

function getHeaders(headers: HeaderEntry[], name: string) {
  const lower = name.toLowerCase();

  return headers.filter((header) => header.lowerName === lower);
}

function firstHeader(headers: HeaderEntry[], name: string) {
  const values = getHeaders(headers, name);

  return values.length ? values[0].value : "";
}

function decodeQueryComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseQuery(target: string, targetForm: string) {
  if (
    targetForm !== "origin-form" &&
    targetForm !== "absolute-form"
  ) {
    return [] as QueryEntry[];
  }

  let query = "";

  if (targetForm === "absolute-form") {
    try {
      query = new URL(target).search.slice(1);
    } catch {
      return [];
    }
  } else {
    const question = target.indexOf("?");

    if (question === -1) {
      return [];
    }

    query = target.slice(question + 1);
  }

  if (!query) {
    return [];
  }

  return query.split("&").map((part) => {
    const equals = part.indexOf("=");
    const key = equals === -1 ? part : part.slice(0, equals);
    const value = equals === -1 ? "" : part.slice(equals + 1);

    return {
      key: decodeQueryComponent(key),
      value: decodeQueryComponent(value),
    };
  });
}

function classifyTarget(method: string, target: string) {
  if (target === "*") {
    return "asterisk-form";
  }

  if (
    method.toUpperCase() === "CONNECT" &&
    target.charAt(0) !== "/" &&
    !/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(target)
  ) {
    return "authority-form";
  }

  if (/^https?:\/\//i.test(target)) {
    return "absolute-form";
  }

  if (target.charAt(0) === "/") {
    return "origin-form";
  }

  return "unrecognized";
}

function parseRequestLine(line: string) {
  const match = line.match(/^(\S+)\s+(\S+)\s+(HTTP\/\d+\.\d+)$/);

  if (!match) {
    throw new Error(
      "The first line must look like METHOD request-target HTTP/1.x, for example GET /api/items HTTP/1.1."
    );
  }

  const method = match[1];
  const target = match[2];
  const protocol = match[3].toUpperCase();

  if (!isToken(method)) {
    throw new Error(`Request method "${method}" is not a valid HTTP token.`);
  }

  if (protocol !== "HTTP/1.0" && protocol !== "HTTP/1.1") {
    throw new Error(
      `${protocol} is not an HTTP/1.0 or HTTP/1.1 textual request line. HTTP/2 and HTTP/3 use binary framing rather than this HTTP/1.x wire format.`
    );
  }

  return {
    method,
    target,
    protocol,
    targetForm: classifyTarget(method, target),
  };
}

function parseHeaders(lines: string[]) {
  const headers: HeaderEntry[] = [];
  const diagnostics: Diagnostic[] = [];
  let previous: HeaderEntry | null = null;

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 2;

    if (/^[ \t]/.test(rawLine)) {
      if (!previous) {
        diagnostics.push({
          severity: "warning",
          title: "Orphaned folded line",
          message:
            `Line ${lineNumber} begins with whitespace but has no preceding field to continue.`,
        });
        return;
      }

      previous.value += ` ${rawLine.trim()}`;
      diagnostics.push({
        severity: "warning",
        title: "Obsolete folded field",
        message:
          `Line ${lineNumber} was unfolded into ${previous.name}. Modern HTTP senders must not generate obs-fold.`,
      });
      return;
    }

    const colon = rawLine.indexOf(":");

    if (colon <= 0) {
      diagnostics.push({
        severity: "warning",
        title: "Malformed header line",
        message:
          `Line ${lineNumber} has no valid field-name/colon boundary and was not treated as a header.`,
      });
      previous = null;
      return;
    }

    const rawName = rawLine.slice(0, colon);
    const name = rawName.trim();

    if (rawName !== name) {
      diagnostics.push({
        severity: "warning",
        title: "Whitespace before header colon",
        message:
          `Line ${lineNumber} contains whitespace between the field name and colon. HTTP/1.x field syntax does not allow that whitespace.`,
      });
      previous = null;
      return;
    }

    if (!isToken(name)) {
      diagnostics.push({
        severity: "warning",
        title: "Invalid header field name",
        message:
          `Line ${lineNumber} contains field name "${name}", which is not a valid HTTP token.`,
      });
      previous = null;
      return;
    }

    const value = rawLine
      .slice(colon + 1)
      .replace(/^[ \t]+|[ \t]+$/g, "");

    if (hasInvalidFieldValueControl(value)) {
      diagnostics.push({
        severity: "warning",
        title: "Control character in header value",
        message:
          `Line ${lineNumber} (${name}) contains a control character that is unsafe or invalid in modern HTTP field values.`,
      });
    }

    const entry: HeaderEntry = {
      name,
      lowerName: name.toLowerCase(),
      value,
      line: lineNumber,
    };

    headers.push(entry);
    previous = entry;
  });

  return {
    headers,
    diagnostics,
  };
}

function parseUrlEncodedBody(body: string) {
  const result: QueryEntry[] = [];
  const params = new URLSearchParams(body);

  params.forEach((value, key) => {
    result.push({
      key,
      value,
    });
  });

  return result;
}

function looksLikeJson(value: string) {
  return (
    (value.charAt(0) === "{" && value.charAt(value.length - 1) === "}") ||
    (value.charAt(0) === "[" && value.charAt(value.length - 1) === "]")
  );
}

function formatBody(body: string, contentType: string) {
  if (!body) {
    return {
      formattedBody: "",
      bodyType: "none",
      bodyBytes: 0,
      bodyDiagnostics: [] as Diagnostic[],
    };
  }

  const bodyBytes = new TextEncoder().encode(body).length;
  const trimmed = body.trim();
  const lowerType = contentType.toLowerCase();
  const bodyDiagnostics: Diagnostic[] = [];

  if (
    lowerType.indexOf("application/json") !== -1 ||
    lowerType.indexOf("+json") !== -1 ||
    looksLikeJson(trimmed)
  ) {
    try {
      return {
        formattedBody: JSON.stringify(JSON.parse(trimmed), null, 2),
        bodyType: "JSON",
        bodyBytes,
        bodyDiagnostics,
      };
    } catch (caught) {
      if (
        lowerType.indexOf("json") !== -1
      ) {
        bodyDiagnostics.push({
          severity: "warning",
          title: "JSON body does not parse",
          message:
            caught instanceof Error
              ? `Content-Type says JSON, but JSON.parse failed: ${caught.message}`
              : "Content-Type says JSON, but the body could not be parsed as JSON.",
        });
      }

      return {
        formattedBody: body,
        bodyType:
          lowerType.indexOf("json") !== -1
            ? "invalid JSON"
            : "text",
        bodyBytes,
        bodyDiagnostics,
      };
    }
  }

  if (
    lowerType.indexOf("application/x-www-form-urlencoded") !== -1
  ) {
    const fields = parseUrlEncodedBody(body);

    return {
      formattedBody: fields
        .map((field) => `${field.key}: ${field.value}`)
        .join("\n"),
      bodyType: "URL-encoded form",
      bodyBytes,
      bodyDiagnostics,
    };
  }

  if (
    lowerType.indexOf("multipart/form-data") !== -1
  ) {
    const boundaryMatch = contentType.match(
      /(?:^|;)\s*boundary=(?:"([^"]+)"|([^;\s]+))/i
    );

    if (!boundaryMatch) {
      bodyDiagnostics.push({
        severity: "warning",
        title: "Multipart boundary missing",
        message:
          "Content-Type says multipart/form-data but does not declare a boundary parameter. Receivers need the boundary to separate body parts.",
      });
    } else {
      const boundary = boundaryMatch[1] || boundaryMatch[2];

      if (body.indexOf(`--${boundary}`) === -1) {
        bodyDiagnostics.push({
          severity: "warning",
          title: "Multipart boundary not found in body",
          message:
            `The declared multipart boundary "${boundary}" was not found in the pasted body.`,
        });
      }
    }

    return {
      formattedBody: body,
      bodyType: "multipart/form-data",
      bodyBytes,
      bodyDiagnostics,
    };
  }

  return {
    formattedBody: body,
    bodyType: contentType ? contentType.split(";")[0] : "text",
    bodyBytes,
    bodyDiagnostics,
  };
}

function hostFromAbsoluteTarget(target: string) {
  try {
    return new URL(target).host;
  } catch {
    return "";
  }
}

function buildDiagnostics(options: {
  method: string;
  target: string;
  targetForm: string;
  protocol: string;
  headers: HeaderEntry[];
  body: string;
  bodyBytes: number;
  contentType: string;
}) {
  const diagnostics: Diagnostic[] = [];
  const hostHeaders = getHeaders(options.headers, "host");
  const contentLengthHeaders = getHeaders(options.headers, "content-length");
  const transferEncodingHeaders = getHeaders(options.headers, "transfer-encoding");
  const contentTypeHeaders = getHeaders(options.headers, "content-type");
  const sensitive = options.headers.filter((header) =>
    isSensitiveHeader(header.name)
  );

  if (options.targetForm === "unrecognized") {
    diagnostics.push({
      severity: "warning",
      title: "Unrecognized request-target form",
      message:
        `Request target "${options.target}" is not recognized here as origin-form, absolute-form, authority-form, or asterisk-form.`,
    });
  }

  if (options.target.indexOf("#") !== -1) {
    diagnostics.push({
      severity: "warning",
      title: "Fragment marker in request target",
      message:
        "URL fragments are not part of the HTTP request target sent to an origin server. A raw # in a captured target deserves review.",
    });
  }

  if (options.protocol === "HTTP/1.1" && hostHeaders.length === 0) {
    diagnostics.push({
      severity: "warning",
      title: "HTTP/1.1 Host field is missing",
      message:
        "HTTP/1.1 requests require a Host field. The capture may be incomplete or invalid.",
    });
  }

  if (hostHeaders.length > 1) {
    diagnostics.push({
      severity: "warning",
      title: "Multiple Host fields",
      message:
        "HTTP/1.1 must not contain more than one Host field. Duplicate Host values create routing ambiguity and can be security-sensitive.",
    });
  }

  if (
    options.targetForm === "absolute-form" &&
    hostHeaders.length === 1
  ) {
    const targetHost = hostFromAbsoluteTarget(options.target);
    const hostHeader = hostHeaders[0].value.trim();

    if (
      targetHost &&
      hostHeader &&
      targetHost.toLowerCase() !== hostHeader.toLowerCase()
    ) {
      diagnostics.push({
        severity: "warning",
        title: "Absolute target and Host disagree",
        message:
          `The absolute request target names "${targetHost}" while Host is "${hostHeader}". Proxy/origin handling of authority must be reviewed carefully.`,
      });
    }
  }

  if (contentLengthHeaders.length > 1) {
    const unique = Array.from(
      new Set(
        contentLengthHeaders.map((header) => header.value.trim())
      )
    );

    diagnostics.push({
      severity: "warning",
      title: "Multiple Content-Length fields",
      message:
        unique.length === 1
          ? "Repeated identical Content-Length values still deserve review because request framing should be unambiguous."
          : `Conflicting Content-Length values were found: ${unique.join(", ")}.`,
    });
  }

  if (contentLengthHeaders.length) {
    const value = contentLengthHeaders[0].value.trim();

    if (!/^\d+$/.test(value)) {
      diagnostics.push({
        severity: "warning",
        title: "Invalid Content-Length",
        message:
          `Content-Length "${value}" is not a non-negative decimal byte count.`,
      });
    } else {
      const declared = Number(value);

      if (
        Number.isSafeInteger(declared) &&
        declared !== options.bodyBytes
      ) {
        diagnostics.push({
          severity: "warning",
          title: "Content-Length mismatch",
          message:
            `Content-Length declares ${declared} bytes, while the pasted body is ${options.bodyBytes} UTF-8 bytes. A text copy can differ from the original wire bytes, so verify the source capture before changing production framing.`,
        });
      }
    }
  }

  if (
    transferEncodingHeaders.length &&
    contentLengthHeaders.length
  ) {
    diagnostics.push({
      severity: "warning",
      title: "Transfer-Encoding and Content-Length both present",
      message:
        "This combination is a request-framing red flag. HTTP/1.1 defines precedence and recipient handling carefully because ambiguous framing has historically enabled request-smuggling vulnerabilities.",
    });
  }

  if (
    transferEncodingHeaders.length &&
    options.protocol === "HTTP/1.0"
  ) {
    diagnostics.push({
      severity: "warning",
      title: "Transfer-Encoding on HTTP/1.0 capture",
      message:
        "Transfer-Encoding is an HTTP/1.1 framing mechanism. Seeing it on an HTTP/1.0 request capture deserves investigation.",
    });
  }

  if (
    options.body &&
    !contentTypeHeaders.length
  ) {
    diagnostics.push({
      severity: "note",
      title: "Body has no Content-Type",
      message:
        "A body can exist without Content-Type, but recipients have less information about the representation format.",
    });
  }

  if (
    !options.body &&
    options.method.toUpperCase() === "GET" &&
    options.contentType
  ) {
    diagnostics.push({
      severity: "note",
      title: "Content-Type without a body",
      message:
        "Content-Type describes enclosed representation data. On a bodyless GET it may be unnecessary unless a specific API requires it.",
    });
  }

  if (
    getHeaders(options.headers, "connection").length &&
    options.protocol === "HTTP/1.1"
  ) {
    diagnostics.push({
      severity: "note",
      title: "Connection-specific field present",
      message:
        "Connection and the fields it names are hop-by-hop in HTTP/1.1. Intermediaries must not forward them as ordinary end-to-end metadata.",
    });
  }

  if (
    getHeaders(options.headers, "expect").some(
      (header) => header.value.toLowerCase() === "100-continue"
    )
  ) {
    diagnostics.push({
      severity: "note",
      title: "Expect: 100-continue",
      message:
        "The client may wait for an interim 100 Continue response before transmitting the request content. A pasted request block cannot show that timing exchange.",
    });
  }

  if (sensitive.length) {
    diagnostics.push({
      severity: "warning",
      title: "Credential-like headers present",
      message:
        `${sensitive.length} header field${
          sensitive.length === 1 ? " looks" : "s look"
        } credential-related. Keep redaction enabled before copying or sharing the formatted request.`,
    });
  }

  return diagnostics;
}

function parseHttpRequest(source: string): ParsedRequest {
  const normalized = source.replace(/\r\n?/g, "\n");
  const separator = normalized.indexOf("\n\n");
  const head = separator === -1 ? normalized : normalized.slice(0, separator);
  const body = separator === -1 ? "" : normalized.slice(separator + 2);
  const lines = head.split("\n");

  if (!lines.length || !lines[0].trim()) {
    throw new Error("A request line was not found.");
  }

  const requestLine = parseRequestLine(lines[0].trim());
  const parsedHeaders = parseHeaders(lines.slice(1));
  const contentType = firstHeader(parsedHeaders.headers, "content-type");
  const bodyResult = formatBody(body, contentType);
  const diagnostics = parsedHeaders.diagnostics.concat(
    bodyResult.bodyDiagnostics,
    buildDiagnostics({
      method: requestLine.method,
      target: requestLine.target,
      targetForm: requestLine.targetForm,
      protocol: requestLine.protocol,
      headers: parsedHeaders.headers,
      body,
      bodyBytes: bodyResult.bodyBytes,
      contentType,
    })
  );

  return {
    method: requestLine.method,
    target: requestLine.target,
    targetForm: requestLine.targetForm,
    protocol: requestLine.protocol,
    headers: parsedHeaders.headers,
    query: parseQuery(requestLine.target, requestLine.targetForm),
    body,
    formattedBody: bodyResult.formattedBody,
    bodyType: bodyResult.bodyType,
    bodyBytes: bodyResult.bodyBytes,
    diagnostics,
  };
}

function displayHeaderValue(header: HeaderEntry, redact: boolean) {
  if (redact && isSensitiveHeader(header.name)) {
    return "[redacted]";
  }

  return header.value;
}

function formatParsedRequest(result: ParsedRequest, redact: boolean) {
  const lines = [
    "HTTP request inspection",
    "",
    `Method: ${result.method}`,
    `Target: ${result.target}`,
    `Target form: ${result.targetForm}`,
    `Protocol: ${result.protocol}`,
    "",
    "Headers:",
  ];

  if (result.headers.length) {
    result.headers.forEach((header) => {
      lines.push(
        `${header.name}: ${displayHeaderValue(header, redact)}`
      );
    });
  } else {
    lines.push("(none)");
  }

  lines.push("", "Query parameters:");

  if (result.query.length) {
    result.query.forEach((entry, index) => {
      lines.push(`${index + 1}. ${entry.key} = ${entry.value}`);
    });
  } else {
    lines.push("(none)");
  }

  lines.push(
    "",
    `Body: ${result.body ? `${result.bodyType} · ${result.bodyBytes} UTF-8 bytes in pasted text` : "none"}`
  );

  if (result.body) {
    lines.push("", result.formattedBody);
  }

  if (result.diagnostics.length) {
    lines.push("", "Diagnostics:");

    result.diagnostics.forEach((item, index) => {
      lines.push(
        `${index + 1}. ${item.severity.toUpperCase()} — ${item.title}: ${item.message}`
      );
    });
  }

  return lines.join("\n");
}

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

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const formatRequest = () => {
    if (!input.trim()) {
      setError("Paste a raw HTTP/1.x request to format.");
      setResult(null);
      return;
    }

    try {
      setResult(parseHttpRequest(input));
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setCopied(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to parse this HTTP request."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_REQUEST);
    setRedactSensitive(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setRedactSensitive(true);
    clearResult();
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The formatted report could not be copied. Select and copy it manually."
      );
    }
  };

  const warningCount = result
    ? result.diagnostics.filter((item) => item.severity === "warning").length
    : 0;

  return (
    <ToolShell
      title="HTTP Request Formatter"
      description="Turn an HTTP/1.x request capture into a readable request-line, header, query, body and framing review without replaying or sending the request."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">
            Raw HTTP/1.x request
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Paste a request from a log, proxy capture, test fixture, support
            ticket, API debugger or documentation example.
          </p>
          <textarea
            value={input}
            onChange={(event: { target: { value: string } }) => {
              setInput(event.target.value);
              clearResult();
            }}
            placeholder={SAMPLE_REQUEST}
            spellCheck={false}
            className="mt-4 min-h-[400px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Sharing safety
          </h2>

          <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-gray-700">
            <input
              type="checkbox"
              checked={redactSensitive}
              onChange={(event: { target: { checked: boolean } }) => {
                setRedactSensitive(event.target.checked);
                setCopied(false);
              }}
              className="mt-1"
            />
            <span>
              <strong>Redact credential-like header values.</strong>{" "}
              Authorization, Cookie, API-key and token-like fields display as
              <code> [redacted]</code> in copied output.
            </span>
          </label>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
            <strong className="text-gray-900">This formatter reviews:</strong>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>HTTP/1.0 and HTTP/1.1 request lines</li>
              <li>origin, absolute, authority and asterisk targets</li>
              <li>repeated/malformed fields and obsolete folding</li>
              <li>query parameters without turning + into a space</li>
              <li>JSON, URL-encoded and multipart body clues</li>
              <li>Host and message-framing inconsistencies</li>
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
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Stat label="Method" value={result.method} />
            <Stat label="Target form" value={result.targetForm} />
            <Stat label="Headers" value={String(result.headers.length)} />
            <Stat label="Query fields" value={String(result.query.length)} />
            <Stat label="Warnings" value={String(warningCount)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Formatted request
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  The report is a diagnostic reconstruction of pasted text, not
                  a byte-for-byte packet capture.
                </p>
              </div>

              <button
                type="button"
                onClick={copyOutput}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied
                  ? "Copied"
                  : redactSensitive
                  ? "Copy Redacted Report"
                  : "Copy Report"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[340px] max-h-[700px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {output}
            </pre>
          </div>

          {result.diagnostics.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Request diagnostics
              </h3>
              <div className="mt-4 space-y-3">
                {result.diagnostics.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className={`rounded-xl border p-4 text-sm leading-relaxed ${
                      item.severity === "warning"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-900"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }`}
                  >
                    <strong>{item.title}</strong>
                    <p className="mt-1">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <pre className="yoryantra-output mt-8 min-h-[300px] whitespace-pre-wrap break-words text-sm">
          Request-line, headers, query fields, body interpretation and
          diagnostics will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing happens on the text in your browser. Yoryantra does not send the
        request to its target, contact the Host value, or replay credentials.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this formatting operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Start With the Request Target—It Explains More Than the URL Alone
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            An HTTP/1.x request line contains a method, a request target and an
            HTTP version. Most origin requests use origin-form such as{" "}
            <code>GET /products?page=2 HTTP/1.1</code>. Forward proxies can
            receive absolute-form with a complete URL. CONNECT uses
            authority-form, and OPTIONS can use the special{" "}
            <code>*</code> target.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Distinguishing those forms matters when debugging proxies, routing
            and Host mismatches. A formatter that assumes every target is just a
            pathname can give the wrong explanation for a perfectly deliberate
            proxy request.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Content-Length Counts Octets, Not JavaScript Characters
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A body containing only ASCII characters often has the same character
            count and UTF-8 byte count. Add emoji, accented text or another
            multi-byte character and those numbers diverge. HTTP framing uses
            octets.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Yoryantra compares Content-Length with the UTF-8 byte length of the
            pasted body. That can expose a likely mismatch, but a copied log may
            already have changed line endings or decoded transfer/content
            codings, so the original wire capture remains the authority.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Transfer-Encoding Plus Content-Length Deserves Immediate Attention
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP request framing has strict rules because two recipients
            disagreeing about where one request ends and the next begins can
            create request-smuggling vulnerabilities. A captured HTTP/1.1
            request containing both Transfer-Encoding and Content-Length is not
            something to “format away.”
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The tool flags the combination and preserves repeated Content-Length
            lines rather than collapsing them into a dictionary. When this comes
            from a real reverse-proxy path, inspect how every hop parses and
            normalizes the message.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Query + and Form + Do Not Mean the Same Thing Everywhere
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In a generic URI query component, a plus sign can be a literal plus.
            In <code>application/x-www-form-urlencoded</code> parsing, plus is
            conventionally decoded as a space. Treating both contexts with the
            same decoder can silently change data.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This formatter percent-decodes request-target query components while
            preserving +, but uses URLSearchParams-style form decoding for an
            x-www-form-urlencoded message body.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Content-Type Tells You What the Body Claims to Be
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JSON is formatted only when the media type says JSON or the body
            strongly resembles JSON. If a JSON media type is declared but the
            text does not parse, the tool keeps the original body and reports
            the parse failure instead of relabeling malformed JSON as valid.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Multipart bodies need a boundary parameter. URL-encoded bodies use a
            different escaping model. Unknown media types stay as pasted text,
            because guessing a custom representation is less useful than
            preserving it.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Raw Request Captures Commonly Contain Credentials
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Authorization, Cookie and API-key fields are often exactly the
            information needed to reproduce an API problem—and exactly the
            information that should not be pasted into public tickets,
            screenshots or documentation.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            Redaction affects the formatted/copy report, not the textarea you
            pasted. Use placeholders whenever possible and rotate a real
            credential if it was shared outside its intended environment.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Why HTTP/2 and HTTP/3 Captures Look Different
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP semantics are shared across versions, but HTTP/2 and HTTP/3 do
            not put a textual <code>METHOD /path HTTP/1.1</code> request line on
            the wire. They use framed fields and pseudo-fields such as{" "}
            <code>:method</code>, <code>:scheme</code>, <code>:authority</code>
            and <code>:path</code>.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Some debugging tools render HTTP/2/3 back into HTTP/1-like text for
            readability. This formatter deliberately calls its input
            HTTP/1.x-style so a human-readable reconstruction is not mistaken
            for the actual wire encoding.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="RFC 9110 — HTTP Semantics"
            href="https://www.rfc-editor.org/rfc/rfc9110"
            text="Defines HTTP methods, fields, representations and request semantics shared across HTTP versions."
          />
          <ReferenceCard
            title="RFC 9112 — HTTP/1.1"
            href="https://www.rfc-editor.org/rfc/rfc9112"
            text="Defines the HTTP/1.1 textual message format, request-target forms, Host and message framing."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/http-request-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function ReferenceCard({
  title,
  href,
  text,
}: {
  title: string;
  href: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[var(--green)] underline underline-offset-4"
      >
        {title}
      </a>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{text}</p>
    </div>
  );
}
