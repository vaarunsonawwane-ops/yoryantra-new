"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type BodyMode = "auto" | "json" | "text";
type OutputMode = "formatted" | "summary" | "headers";
type Severity = "warning" | "note";

type HeaderEntry = {
  name: string;
  lowerName: string;
  value: string;
  line: number;
};

type CookieInfo = {
  name: string;
  value: string;
  attributes: Array<{
    name: string;
    value: string;
  }>;
};

type Diagnostic = {
  severity: Severity;
  title: string;
  message: string;
};

type ParsedResponse = {
  protocol: string;
  statusCode: number;
  reason: string;
  category: string;
  headers: HeaderEntry[];
  cookies: CookieInfo[];
  body: string;
  formattedBody: string;
  bodyType: string;
  bodyBytes: number;
  contentType: string;
  contentLength: string;
  transferEncoding: string;
  location: string;
  diagnostics: Diagnostic[];
};

const SAMPLE_RESPONSE = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
X-Request-ID: req_12345
Content-Length: 78

{"success":true,"message":"Response formatted with Yoryantra","items":[1,2,3]}`;

function isToken(value: string) {
  return /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(value);
}

function hasBadControl(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);

    if ((code < 0x20 && code !== 0x09) || code === 0x7f) {
      return true;
    }
  }

  return false;
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
          title: "Orphaned folded header line",
          message: `Line ${lineNumber} begins with whitespace but has no preceding field to continue.`,
        });
        return;
      }

      previous.value += ` ${rawLine.trim()}`;
      diagnostics.push({
        severity: "warning",
        title: "Obsolete header folding",
        message: `Line ${lineNumber} was unfolded into ${previous.name}. Modern HTTP senders must not generate obs-fold.`,
      });
      return;
    }

    const colon = rawLine.indexOf(":");

    if (colon <= 0) {
      diagnostics.push({
        severity: "warning",
        title: "Malformed header line",
        message: `Line ${lineNumber} has no valid field-name/colon boundary.`,
      });
      previous = null;
      return;
    }

    const rawName = rawLine.slice(0, colon);
    const name = rawName.trim();

    if (name !== rawName) {
      diagnostics.push({
        severity: "warning",
        title: "Whitespace before header colon",
        message: `Line ${lineNumber} contains whitespace before the colon. HTTP/1 field syntax does not permit that whitespace.`,
      });
      previous = null;
      return;
    }

    if (!isToken(name)) {
      diagnostics.push({
        severity: "warning",
        title: "Invalid header name",
        message: `Line ${lineNumber} contains field name "${name}", which is not a valid HTTP token.`,
      });
      previous = null;
      return;
    }

    const value = rawLine
      .slice(colon + 1)
      .replace(/^[ \t]+|[ \t]+$/g, "");

    if (hasBadControl(value)) {
      diagnostics.push({
        severity: "warning",
        title: "Control character in header value",
        message: `Line ${lineNumber} (${name}) contains a control character that should not appear in a modern HTTP field value.`,
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

function headerValues(headers: HeaderEntry[], name: string) {
  const lower = name.toLowerCase();
  return headers
    .filter((header) => header.lowerName === lower)
    .map((header) => header.value);
}

function firstHeader(headers: HeaderEntry[], name: string) {
  const values = headerValues(headers, name);
  return values.length ? values[0] : "";
}

function parseCookie(value: string): CookieInfo {
  const parts = value.split(";").map((part) => part.trim());
  const nameValue = parts[0] || "";
  const equals = nameValue.indexOf("=");

  const name =
    equals === -1 ? nameValue : nameValue.slice(0, equals).trim();
  const cookieValue =
    equals === -1 ? "" : nameValue.slice(equals + 1);

  const attributes = parts.slice(1).map((part) => {
    const attributeEquals = part.indexOf("=");

    if (attributeEquals === -1) {
      return {
        name: part,
        value: "",
      };
    }

    return {
      name: part.slice(0, attributeEquals).trim(),
      value: part.slice(attributeEquals + 1).trim(),
    };
  });

  return {
    name,
    value: cookieValue,
    attributes,
  };
}

function parseCookies(headers: HeaderEntry[]) {
  return headers
    .filter((header) => header.lowerName === "set-cookie")
    .map((header) => parseCookie(header.value));
}

function looksLikeJson(body: string) {
  const trimmed = body.trim();

  return (
    (trimmed.charAt(0) === "{" &&
      trimmed.charAt(trimmed.length - 1) === "}") ||
    (trimmed.charAt(0) === "[" &&
      trimmed.charAt(trimmed.length - 1) === "]")
  );
}

function bodyInfo(
  body: string,
  contentType: string,
  mode: BodyMode
) {
  const bodyBytes = new TextEncoder().encode(body).length;
  const diagnostics: Diagnostic[] = [];

  if (!body) {
    return {
      formattedBody: "",
      bodyType: "none",
      bodyBytes,
      diagnostics,
    };
  }

  const lowerType = contentType.toLowerCase();
  const shouldTryJson =
    mode === "json" ||
    (mode === "auto" &&
      (lowerType.indexOf("application/json") !== -1 ||
        lowerType.indexOf("+json") !== -1 ||
        looksLikeJson(body)));

  if (shouldTryJson) {
    try {
      return {
        formattedBody: JSON.stringify(JSON.parse(body.trim()), null, 2),
        bodyType: "JSON",
        bodyBytes,
        diagnostics,
      };
    } catch (caught) {
      if (mode === "json") {
        throw new Error(
          caught instanceof Error
            ? `Response body is not valid JSON: ${caught.message}`
            : "Response body is not valid JSON."
        );
      }

      diagnostics.push({
        severity: "warning",
        title: "JSON-looking body did not parse",
        message:
          lowerType.indexOf("json") !== -1
            ? "Content-Type declares JSON, but the pasted body is not valid JSON. The original body is preserved."
            : "The body resembles JSON but could not be parsed. It remains labelled as text rather than valid JSON.",
      });

      return {
        formattedBody: body,
        bodyType:
          lowerType.indexOf("json") !== -1 ? "invalid JSON" : "text",
        bodyBytes,
        diagnostics,
      };
    }
  }

  return {
    formattedBody: body,
    bodyType: contentType ? contentType.split(";")[0] : "text",
    bodyBytes,
    diagnostics,
  };
}

function statusCategory(code: number) {
  if (code >= 100 && code < 200) return "Informational";
  if (code >= 200 && code < 300) return "Successful";
  if (code >= 300 && code < 400) return "Redirection";
  if (code >= 400 && code < 500) return "Client error";
  if (code >= 500 && code < 600) return "Server error";
  return "Non-standard";
}

function noContentStatus(code: number) {
  return (
    (code >= 100 && code < 200) ||
    code === 204 ||
    code === 304
  );
}

function buildDiagnostics(
  protocol: string,
  statusCode: number,
  headers: HeaderEntry[],
  body: string,
  bodyBytes: number
) {
  const diagnostics: Diagnostic[] = [];
  const contentLengths = headerValues(headers, "content-length");
  const transferEncodings = headerValues(headers, "transfer-encoding");
  const locations = headerValues(headers, "location");
  const contentTypes = headerValues(headers, "content-type");

  if (contentLengths.length > 1) {
    const unique = Array.from(new Set(contentLengths.map((value) => value.trim())));

    diagnostics.push({
      severity: "warning",
      title: "Multiple Content-Length fields",
      message:
        unique.length === 1
          ? "Repeated identical Content-Length values still deserve review because message framing should be unambiguous."
          : `Conflicting Content-Length values were found: ${unique.join(", ")}.`,
    });
  }

  if (contentLengths.length) {
    const value = contentLengths[0].trim();

    if (!/^\d+$/.test(value)) {
      diagnostics.push({
        severity: "warning",
        title: "Invalid Content-Length",
        message: `Content-Length "${value}" is not a non-negative decimal byte count.`,
      });
    } else {
      const declared = Number(value);

      if (
        Number.isSafeInteger(declared) &&
        declared !== bodyBytes &&
        !noContentStatus(statusCode)
      ) {
        diagnostics.push({
          severity: "note",
          title: "Pasted body size differs from Content-Length",
          message:
            `Content-Length declares ${declared} bytes while the pasted body is ${bodyBytes} UTF-8 bytes. Logs/devtools can expose decoded or transformed content, so this difference alone does not prove the origin sent invalid framing.`,
        });
      }
    }
  }

  if (transferEncodings.length && contentLengths.length) {
    diagnostics.push({
      severity: "warning",
      title: "Transfer-Encoding and Content-Length both present",
      message:
        "HTTP/1.1 recipients apply strict framing rules when both appear. This combination is especially important in proxy/security investigations because ambiguous framing has enabled request/response smuggling classes of bugs.",
    });
  }

  if (protocol === "HTTP/1.0" && transferEncodings.length) {
    diagnostics.push({
      severity: "warning",
      title: "Transfer-Encoding on HTTP/1.0 capture",
      message:
        "Transfer-Encoding is part of HTTP/1.1 message framing. Seeing it on an HTTP/1.0 textual capture deserves review.",
    });
  }

  if (noContentStatus(statusCode) && body) {
    diagnostics.push({
      severity: "warning",
      title: "Body shown on a no-content status",
      message:
        `${statusCode} responses do not carry ordinary message content under HTTP semantics. The pasted text may include another response, logging output, or a tool-generated representation rather than wire content.`,
    });
  }

  if (statusCode >= 300 && statusCode < 400 && !locations.length) {
    diagnostics.push({
      severity: "note",
      title: "Redirect-class status without Location",
      message:
        "Not every 3xx response is required to carry Location in every context, but a navigation redirect normally needs a target. Review the exact status semantics.",
    });
  }

  if (locations.length > 1) {
    diagnostics.push({
      severity: "warning",
      title: "Multiple Location fields",
      message:
        "Multiple Location field lines can create ambiguous redirect handling. Confirm which intermediary or application generated them.",
    });
  }

  if (contentTypes.length > 1) {
    diagnostics.push({
      severity: "warning",
      title: "Multiple Content-Type fields",
      message:
        "A response representation should have one effective media type. Multiple Content-Type values can cause inconsistent interpretation.",
    });
  }

  if (
    headerValues(headers, "set-cookie").length &&
    !headerValues(headers, "cache-control").length
  ) {
    diagnostics.push({
      severity: "note",
      title: "Set-Cookie without visible Cache-Control",
      message:
        "Cookie-setting responses are not automatically uncacheable. Review cache directives and intermediary behavior when personalized content is involved.",
    });
  }

  if (headerValues(headers, "content-encoding").length) {
    diagnostics.push({
      severity: "note",
      title: "Content-Encoding is present",
      message:
        "The pasted body may already have been decompressed by DevTools, a proxy, or an HTTP client. This formatter does not reconstruct compressed wire bytes.",
    });
  }

  return diagnostics;
}

function parseHttpResponse(
  source: string,
  options: {
    bodyMode: BodyMode;
  }
): ParsedResponse {
  const normalized = source.replace(/\r\n?/g, "\n");
  const separator = normalized.indexOf("\n\n");
  const head = separator === -1 ? normalized : normalized.slice(0, separator);
  const body = separator === -1 ? "" : normalized.slice(separator + 2);
  const lines = head.split("\n");

  if (!lines.length || !lines[0].trim()) {
    throw new Error("Response is missing a status line.");
  }

  const statusLine = lines[0].trim();
  const statusMatch = statusLine.match(
    /^(HTTP\/(?:1\.0|1\.1|2(?:\.0)?|3(?:\.0)?))\s+(\d{3})(?:\s+(.*))?$/
  );

  if (!statusMatch) {
    throw new Error(
      "Status line should look like HTTP/1.1 200 OK or a human-readable HTTP/2 200 capture."
    );
  }

  const protocol = statusMatch[1];
  const statusCode = Number(statusMatch[2]);
  const reason = statusMatch[3] || "";

  if (statusCode < 100 || statusCode > 999) {
    throw new Error("HTTP status code must contain three decimal digits.");
  }

  const parsedHeaders = parseHeaders(lines.slice(1));
  const contentType = firstHeader(parsedHeaders.headers, "content-type");
  const parsedBody = bodyInfo(body, contentType, options.bodyMode);
  const diagnostics = parsedHeaders.diagnostics
    .concat(parsedBody.diagnostics)
    .concat(
      buildDiagnostics(
        protocol,
        statusCode,
        parsedHeaders.headers,
        body,
        parsedBody.bodyBytes
      )
    );

  return {
    protocol,
    statusCode,
    reason,
    category: statusCategory(statusCode),
    headers: parsedHeaders.headers,
    cookies: parseCookies(parsedHeaders.headers),
    body,
    formattedBody: parsedBody.formattedBody,
    bodyType: parsedBody.bodyType,
    bodyBytes: parsedBody.bodyBytes,
    contentType,
    contentLength: firstHeader(parsedHeaders.headers, "content-length"),
    transferEncoding: firstHeader(parsedHeaders.headers, "transfer-encoding"),
    location: firstHeader(parsedHeaders.headers, "location"),
    diagnostics,
  };
}

function redactHeaderValue(header: HeaderEntry, hideCookieValues: boolean) {
  if (hideCookieValues && header.lowerName === "set-cookie") {
    return "[hidden]";
  }

  return header.value;
}

function formatResponse(
  response: ParsedResponse,
  options: {
    outputMode: OutputMode;
    hideCookieValues: boolean;
  }
) {
  if (options.outputMode === "headers") {
    return [
      `${response.protocol} ${response.statusCode}${
        response.reason ? ` ${response.reason}` : ""
      }`,
      ...response.headers.map(
        (header) =>
          `${header.name}: ${redactHeaderValue(
            header,
            options.hideCookieValues
          )}`
      ),
    ].join("\n");
  }

  if (options.outputMode === "summary") {
    const lines = [
      `Status: ${response.statusCode}${
        response.reason ? ` ${response.reason}` : ""
      }`,
      `Protocol: ${response.protocol}`,
      `Category: ${response.category}`,
      `Headers: ${response.headers.length}`,
      `Set-Cookie fields: ${response.cookies.length}`,
      `Body: ${response.bodyType}`,
      `Pasted body bytes: ${response.bodyBytes}`,
    ];

    if (response.contentType) {
      lines.push(`Content-Type: ${response.contentType}`);
    }

    if (response.contentLength) {
      lines.push(`Content-Length: ${response.contentLength}`);
    }

    if (response.transferEncoding) {
      lines.push(`Transfer-Encoding: ${response.transferEncoding}`);
    }

    if (response.location) {
      lines.push(`Location: ${response.location}`);
    }

    return lines.join("\n");
  }

  const lines = [
    `${response.protocol} ${response.statusCode}${
      response.reason ? ` ${response.reason}` : ""
    }`,
    ...response.headers.map(
      (header) =>
        `${header.name}: ${redactHeaderValue(
          header,
          options.hideCookieValues
        )}`
    ),
    "",
  ];

  if (response.body) {
    lines.push(response.formattedBody);
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [bodyMode, setBodyMode] = useState<BodyMode>("auto");
  const [outputMode, setOutputMode] = useState<OutputMode>("formatted");
  const [hideCookieValues, setHideCookieValues] = useState(true);
  const [result, setResult] = useState<ParsedResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(
    () =>
      result
        ? formatResponse(result, {
            outputMode,
            hideCookieValues,
          })
        : "",
    [result, outputMode, hideCookieValues]
  );

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const format = () => {
    if (!input.trim()) {
      setError("Paste a textual HTTP response to format.");
      setResult(null);
      return;
    }

    try {
      setResult(
        parseHttpResponse(input, {
          bodyMode,
        })
      );
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setCopied(false);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to parse this HTTP response."
      );
    }
  };

  const loadExample = () => {
    setInput(SAMPLE_RESPONSE);
    setBodyMode("auto");
    setOutputMode("formatted");
    setHideCookieValues(true);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setBodyMode("auto");
    setOutputMode("formatted");
    setHideCookieValues(true);
    clearResult();
  };

  const copy = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError(
        "The formatted response could not be copied. Select and copy it manually."
      );
    }
  };

  const warningCount = result
    ? result.diagnostics.filter((item) => item.severity === "warning").length
    : 0;

  return (
    <ToolShell
      title="HTTP Response Formatter"
      description="Format a textual HTTP response capture, preserve repeated fields, inspect cookies and body media types, and surface framing or status inconsistencies without replaying the original request."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block text-sm font-semibold text-gray-900">
          Raw HTTP response
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => {
            setInput(event.target.value);
            clearResult();
          }}
          placeholder={SAMPLE_RESPONSE}
          spellCheck={false}
          className="mt-3 min-h-[400px] w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Best for HTTP/1.x captures and human-readable HTTP/2/3 summaries from
          DevTools, logs, proxies and API clients. HTTP/2 and HTTP/3 do not use
          this textual format on the wire.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <YoryantraSelect
          label="Body formatting"
          value={bodyMode}
          onChange={(value: string) => {
            setBodyMode(value as BodyMode);
            clearResult();
          }}
          options={[
            { label: "Auto", value: "auto" },
            { label: "Force JSON", value: "json" },
            { label: "Keep as text", value: "text" },
          ]}
        />

        <YoryantraSelect
          label="Copied output"
          value={outputMode}
          onChange={(value: string) => {
            setOutputMode(value as OutputMode);
            setCopied(false);
          }}
          options={[
            { label: "Formatted response", value: "formatted" },
            { label: "Summary", value: "summary" },
            { label: "Status + headers only", value: "headers" },
          ]}
        />
      </div>

      <label className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        <input
          type="checkbox"
          checked={hideCookieValues}
          onChange={(event: { target: { checked: boolean } }) => {
            setHideCookieValues(event.target.checked);
            setCopied(false);
          }}
          className="mt-1"
        />
        <span>
          <strong>Hide Set-Cookie values in rendered/copy output.</strong>{" "}
          Cookie names and attributes remain visible for debugging.
        </span>
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={format} className="yoryantra-btn">
          Format Response
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
            <Stat
              label="Status"
              value={`${result.statusCode}${result.reason ? ` ${result.reason}` : ""}`}
            />
            <Stat label="Category" value={result.category} />
            <Stat label="Headers" value={String(result.headers.length)} />
            <Stat label="Body" value={result.bodyType} />
            <Stat label="Warnings" value={String(warningCount)} />
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Formatted output
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Repeated header lines remain repeated; Set-Cookie is never
                  comma-combined.
                </p>
              </div>
              <button
                type="button"
                onClick={copy}
                className="yoryantra-btn-outline whitespace-nowrap"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="yoryantra-output mt-4 min-h-[320px] max-h-[680px] overflow-auto whitespace-pre-wrap break-words font-mono text-sm">
              {output}
            </pre>
          </div>

          {result.cookies.length ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Set-Cookie fields
              </h3>
              <div className="mt-4 space-y-4">
                {result.cookies.map((cookie, index) => (
                  <div
                    key={`${cookie.name}-${index}`}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <Info label="Cookie name" value={cookie.name || "(empty)"} />
                      <Info
                        label="Cookie value"
                        value={hideCookieValues ? "[hidden]" : cookie.value}
                      />
                    </div>
                    {cookie.attributes.length ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {cookie.attributes.map((attribute, attributeIndex) => (
                          <Info
                            key={`${attribute.name}-${attributeIndex}`}
                            label={attribute.name || "(empty attribute)"}
                            value={attribute.value || "flag"}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {result.diagnostics.length ? (
            <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="font-semibold text-yellow-900">
                Response diagnostics
              </h3>
              <div className="mt-4 space-y-3">
                {result.diagnostics.map((item, index) => (
                  <div
                    key={`${item.title}-${index}`}
                    className="rounded-xl border border-yellow-200 bg-white/60 p-4 text-sm leading-relaxed text-yellow-900"
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
          Parsed status, headers, cookies, body formatting and framing
          diagnostics will appear here.
        </pre>
      )}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Formatting happens on the pasted text in your browser. The tool does not
        replay a request, contact the response origin, verify TLS, or reconstruct
        compressed/chunked wire bytes. Site-wide analytics or advertising
        scripts, if enabled, are separate from this formatting operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Read the Status Code First; Treat the Reason Phrase as Commentary
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            In an HTTP/1.1 line such as{" "}
            <code>HTTP/1.1 404 Not Found</code>, the three-digit status code
            carries the protocol meaning. The reason phrase is optional human
            text and can be changed or omitted by intermediaries.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The formatter displays the phrase because it helps humans read a
            capture, but classifies the response from the numeric code rather
            than from words like “OK” or “Not Found.”
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            JSON-Looking Text Is Not Automatically Valid JSON
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            A response can advertise <code>application/json</code> and still
            contain a truncated object, HTML error page or malformed JSON.
            Earlier formatters often attempted pretty-printing and then still
            labelled a failed body as JSON.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            This version keeps the original body and labels it{" "}
            <strong>invalid JSON</strong> when the media type claims JSON but
            parsing fails. That distinction matters when debugging API gateways
            that return non-JSON errors behind a JSON-oriented endpoint.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Repeated Response Fields Are Part of the Evidence
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTTP field names compare case-insensitively, but a response can
            contain repeated field lines. Some fields can be combined according
            to their own semantics; <code>Set-Cookie</code> is the famous
            exception that must remain separate.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This formatter never reduces the header block to a single-value
            object. That keeps duplicate Content-Length, Content-Type, Location
            and cookie lines visible when they are exactly the issue you need to
            investigate.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Content-Length and the Pasted Body Size Answer Different Questions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Content-Length is message framing metadata. The size shown here is
            the UTF-8 size of the text currently in your browser textarea.
            DevTools or an HTTP client can already have decompressed content,
            decoded transfer framing, normalized line endings or converted
            bytes into Unicode text before you copied it.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A mismatch is therefore a diagnostic clue, not an automatic verdict
            that the origin server sent an invalid response.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-xl font-semibold text-red-900">
            Transfer-Encoding Plus Content-Length Is a Security-Sensitive Framing Combination
          </h2>
          <p className="mt-4 leading-relaxed text-red-900/90">
            HTTP/1.1 has explicit precedence and recipient rules for message
            framing because different parsers disagreeing about where a message
            ends can create serious intermediary vulnerabilities.
          </p>
          <p className="mt-4 leading-relaxed text-red-900/90">
            The formatter flags both fields appearing together and preserves
            duplicate values. If the capture comes from a proxy-chain security
            incident, use raw protocol-aware tooling instead of relying on a
            forgiving text formatter to settle ambiguous bytes.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            1xx, 204 and 304 Have Special Message-Content Semantics
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Informational responses, 204 No Content and 304 Not Modified do not
            carry ordinary response content in the way a 200 response does. A
            pasted “body” after one of these status lines can be another
            response, a logging annotation or a tool reconstruction.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            HEAD is another special case: whether content is expected depends on
            the request method, and a response capture alone may not include that
            context. This tool therefore does not guess HEAD semantics.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Redirect Status and Location Need to Be Read Together
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A 301, 302, 303, 307 or 308 tells you a redirect-class response
            occurred, while Location identifies the target. The status also
            affects method rewriting/preservation rules, so “there is a
            Location header” is not the whole redirect story.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This formatter surfaces missing or repeated Location values, but it
            does not follow the redirect. Use a redirect-chain tool when you
            need the actual sequence and final destination.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            HTTP/2 and HTTP/3 Can Be Displayed Like Text Without Being Text Protocols
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            DevTools and command-line clients often print a readable line such
            as <code>HTTP/2 200</code>. That is a human presentation. HTTP/2 and
            HTTP/3 use framed field representations rather than the HTTP/1.1
            status-line/header-block wire syntax.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Yoryantra accepts those readable summaries for debugging while
            keeping the limitation visible so the formatted output is not
            mistaken for packet-level reconstruction.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <ReferenceCard
            title="RFC 9110 — HTTP Semantics"
            href="https://www.rfc-editor.org/rfc/rfc9110"
            text="Defines status-code semantics, fields, representations, redirects and message-content rules shared across HTTP versions."
          />
          <ReferenceCard
            title="RFC 9112 — HTTP/1.1"
            href="https://www.rfc-editor.org/rfc/rfc9112"
            text="Defines HTTP/1.1 textual response syntax, field parsing and message framing."
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/http-response-formatter" />
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2 break-words font-mono text-xs leading-relaxed text-gray-800">
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
