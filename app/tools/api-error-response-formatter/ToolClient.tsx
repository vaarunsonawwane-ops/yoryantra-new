"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "json" | "http";
type OutputMode = "formatted" | "summary" | "cleanJson";
type ParsedField = {
  label: string;
  value: string;
};

type ValidationIssue = {
  field: string;
  message: string;
  code: string;
};

type ParsedAPIError = {
  statusCode: string;
  bodyStatusCode: string;
  statusText: string;
  errorCode: string;
  problemType: string;
  message: string;
  details: string;
  requestId: string;
  traceId: string;
  path: string;
  instance: string;
  timestamp: string;
  method: string;
  rawBody: string;
  formattedJson: string;
  cleanJson: string;
  compactCleanJson: boolean;
  jsonValue: unknown;
  validationIssues: ValidationIssue[];
  headers: ParsedField[];
  detectedShape: string;
};

type ErrorNote = {
  severity: "info" | "warning";
  title: string;
  message: string;
};

const sampleErrorResponse = `HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json
X-Request-ID: req_12345

{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request body has validation errors.",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "code": "required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "code": "min_length"
      }
    ]
  },
  "path": "/v1/users",
  "traceId": "trace_abc123",
  "timestamp": "2026-05-30T12:00:00Z"
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("http");
  const [outputMode, setOutputMode] = useState<OutputMode>("formatted");
  const [hideTraceValues, setHideTraceValues] = useState(false);
  const [compactCleanJson, setCompactCleanJson] = useState(false);
  const [parsedError, setParsedError] = useState<ParsedAPIError | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (parsedError ? getErrorNotes(parsedError) : []),
    [parsedError]
  );

  const keyFields = useMemo(
    () => (parsedError ? getKeyFields(parsedError, hideTraceValues) : []),
    [parsedError, hideTraceValues]
  );

  const formatErrorResponse = () => {
    if (!input.trim()) {
      setError("Please paste an API error response.");
      setParsedError(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextParsed = parseAPIErrorResponse(input, {
        inputMode,
        compactCleanJson,
      });

      const nextOutput = buildOutput(nextParsed, {
        outputMode,
        hideTraceValues,
      });

      setParsedError(nextParsed);
      setOutput(nextOutput);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to format this API error response."
      );
      setParsedError(null);
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
    setInput(sampleErrorResponse);
    setInputMode("http");
    setOutputMode("formatted");
    setHideTraceValues(false);
    setCompactCleanJson(false);
    setParsedError(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setInputMode("http");
    setOutputMode("formatted");
    setHideTraceValues(false);
    setCompactCleanJson(false);
    setParsedError(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="API Error Response Formatter"
      description="Parse JSON API errors or raw HTTP responses into readable fields, validation details, and shareable summaries."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          API Error Response
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setParsedError(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleErrorResponse}
          className="w-full min-h-[380px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a raw HTTP error response or JSON error body copied from logs,
          API clients, browser DevTools, support tickets, or backend debugging.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Formatting Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input Type"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              setParsedError(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Raw HTTP response",
                value: "http",
              },
              {
                label: "JSON body only",
                value: "json",
              },
            ]}
          />

          <YoryantraSelect
            label="Output Type"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Formatted report",
                value: "formatted",
              },
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "JSON body",
                value: "cleanJson",
              },
            ]}
          />


        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideTraceValues}
              onChange={(event) => {
                setHideTraceValues(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Mask trace identifiers
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Replace request, trace, and correlation ID fields in generated
                output. Other secrets are not automatically removed.
              </span>
            </span>
          </label>

          <label className="flex self-start cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={compactCleanJson}
              onChange={(event) => {
                setCompactCleanJson(event.target.checked);
                setParsedError(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Compact clean JSON
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Use compact JSON output instead of indented clean JSON.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatErrorResponse} className="yoryantra-btn whitespace-nowrap">
          Format API Error
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

      {parsedError && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Status"
            value={
              parsedError.statusCode
                ? `${parsedError.statusCode} ${parsedError.statusText}`
                : "not found"
            }
          />
          <SummaryCard
            label="Error Code"
            value={parsedError.errorCode || "not found"}
          />
          <SummaryCard
            label="Validation Issues"
            value={parsedError.validationIssues.length.toLocaleString()}
          />
          <SummaryCard label="Shape" value={parsedError.detectedShape} />
        </div>
      )}

      {parsedError && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Error Details
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Useful fields pulled out from the error response.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {keyFields.map((field) => (
              <DetailCard
                key={field.label}
                label={field.label}
                value={field.value || "(not found)"}
              />
            ))}
          </div>
        </div>
      )}

      {parsedError && parsedError.validationIssues.length > 0 && (
        <ParsedTable
          title="Validation Errors"
          description="Field-level validation issues found inside the response."
          columns={["Field", "Message", "Code"]}
          rows={parsedError.validationIssues.map((issue) => [
            issue.field || "(unknown)",
            issue.message || "(not provided)",
            issue.code || "(not provided)",
          ])}
        />
      )}

      {parsedError && parsedError.headers.length > 0 && (
        <ParsedTable
          title="Response Headers"
          description="Headers parsed from the raw HTTP error response."
          columns={["Header", "Value"]}
          rows={parsedError.headers.map((header) => [header.label, header.value])}
        />
      )}

      {notes.some((note) => note.severity === "warning") && (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Response cautions</h3>
          <div className="mt-3 space-y-3">
            {notes
              .filter((note) => note.severity === "warning")
              .map((note) => (
                <div key={note.title}>
                  <p className="text-sm font-semibold text-amber-900">{note.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-amber-800">{note.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {notes.some((note) => note.severity === "info") && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Response observations</h3>
          <div className="mt-3 space-y-3">
            {notes
              .filter((note) => note.severity === "info")
              .map((note) => (
                <div key={note.title}>
                  <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-700">{note.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {parsedError && parsedError.formattedJson && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Formatted Error JSON
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            The response body formatted for easier reading.
          </p>

          <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[240px] whitespace-pre-wrap break-words">
            {formatJsonForDisplay(parsedError.jsonValue, hideTraceValues)}
          </pre>
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
              className="yoryantra-btn-outline text-sm whitespace-nowrap"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Formatted API error output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing happens in this browser session. The page does not send the pasted response to an API,
        but copied logs can still contain credentials, personal data, internal URLs, or other sensitive values.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Read the Error Shape Before Chasing the Stack Trace
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            APIs do not share one universal error schema. Some return a flat object with <code>message</code> and <code>code</code>;
            others nest an <code>error</code> object or attach field-level validation arrays. The formatter looks for those common
            shapes and labels what it finds, but the extraction is heuristic rather than schema validation.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A field called <code>code</code> is not automatically treated as an HTTP status. HTTP status extraction accepts only
            numeric 100–599 values from status-oriented fields, which avoids turning application codes such as
            <code>VALIDATION_FAILED</code> into a fake HTTP status.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Raw HTTP Response or JSON Body?
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw HTTP mode expects a status line, header lines, a blank line, then a JSON body. JSON mode expects only the body.
            Header names and values are shown separately so transport metadata is not confused with fields inside the JSON.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The raw parser is intentionally a textual debugging parser, not a packet decoder. It does not decode chunked
            transfer coding, decompress content encodings, follow redirects, or reconstruct binary bodies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            RFC 9457 Problem Details
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            When an object contains the standard Problem Details members such as <code>type</code>, <code>title</code>,
            <code>status</code>, <code>detail</code>, and <code>instance</code>, the formatter identifies that shape separately.
            RFC 9457 defines <code>application/problem+json</code> for interoperable HTTP API errors and allows extension members
            for application-specific information.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            See the <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc9457" target="_blank" rel="noreferrer">RFC 9457 specification</a>
            for the Problem Details model and <a className="font-medium text-[var(--green)] underline underline-offset-2" href="https://www.rfc-editor.org/rfc/rfc9110" target="_blank" rel="noreferrer">RFC 9110</a>
            for HTTP status and field semantics.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Validation Arrays and Trace Identifiers
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Validation details are discovered from familiar keys such as <code>errors</code>, <code>details</code>,
            <code>violations</code>, and <code>validationErrors</code>. A custom API can use completely different names, so a
            zero count means “not recognized by these heuristics,” not “the response contains no validation information.”
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Request IDs, trace IDs, and correlation IDs can be masked in generated output. That masking is deliberately narrow:
            it does not promise to detect access tokens, cookies, email addresses, database values, or secrets hidden under custom keys.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Before Sharing an Error Response
          </h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Keep the HTTP status and application error code; they answer different questions.</li>
            <li>Preserve a trace ID when the recipient needs to correlate the failure with backend logs.</li>
            <li>Remove credentials, cookies, personal data, private URLs, and production identifiers before posting publicly.</li>
            <li>Do not treat a formatted response as proof of the root cause; server logs and API documentation still decide semantics.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/api-error-response-formatter" />
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

function parseAPIErrorResponse(
  input: string,
  options: {
    inputMode: InputMode;
    compactCleanJson: boolean;
  }
): ParsedAPIError {
  if (input.length > 2000000) {
    throw new Error("Input is limited to 2,000,000 UTF-16 code units to keep browser parsing manageable.");
  }

  const normalized = input.replace(/\r\n?/g, "\n").replace(/^\s+/, "");
  let statusCode = "";
  let statusText = "";
  let headers: ParsedField[] = [];
  let body = normalized.trim();

  if (options.inputMode === "http" || normalized.startsWith("HTTP/")) {
    const parsedHTTP = splitHTTPResponse(normalized);
    statusCode = parsedHTTP.statusCode;
    statusText = parsedHTTP.statusText;
    headers = parsedHTTP.headers;
    body = parsedHTTP.body;
  }

  if (!body.trim()) {
    throw new Error("The response does not contain a JSON body.");
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(body);
  } catch {
    throw new Error("The response body is not valid JSON.");
  }

  const bodyStatusCode = findStatusCode(parsedJson);
  const formattedJson = JSON.stringify(parsedJson, null, 2);
  const cleanJson = JSON.stringify(parsedJson, null, options.compactCleanJson ? 0 : 2);
  const validationIssues = findValidationIssues(parsedJson);
  const detectedShape = detectShape(parsedJson);
  const instance = findPreferredStringValue(parsedJson, ["instance"]);

  return {
    statusCode: statusCode || bodyStatusCode,
    bodyStatusCode,
    statusText,
    errorCode: findErrorCode(parsedJson),
    problemType: findProblemType(parsedJson),
    message: findMessage(parsedJson),
    details: findDetails(parsedJson),
    requestId: findPreferredStringValue(parsedJson, [
      "requestId",
      "request_id",
      "x-request-id",
      "correlationId",
      "correlation_id",
    ]),
    traceId: findPreferredStringValue(parsedJson, [
      "traceId",
      "trace_id",
      "trace",
      "traceID",
    ]),
    path: findPreferredStringValue(parsedJson, ["path", "url", "endpoint"]) || instance,
    instance,
    timestamp: findPreferredStringValue(parsedJson, ["timestamp", "time", "date"]),
    method: findPreferredStringValue(parsedJson, ["method", "httpMethod"]),
    rawBody: body,
    formattedJson,
    cleanJson,
    compactCleanJson: options.compactCleanJson,
    jsonValue: parsedJson,
    validationIssues,
    headers,
    detectedShape,
  };
}

function splitHTTPResponse(input: string) {
  const separatorIndex = input.indexOf("\n\n");

  if (separatorIndex === -1) {
    throw new Error("Raw HTTP input needs a blank line between the headers and JSON body.");
  }

  const headPart = input.slice(0, separatorIndex);
  const body = input.slice(separatorIndex + 2).trim();
  const headLines = headPart.split("\n");
  const statusLine = headLines[0] || "";
  const match = statusLine.match(/^HTTP\/(?:1\.0|1\.1|2(?:\.0)?|3(?:\.0)?)\s+(\d{3})(?:\s+(.*))?$/i);

  if (!match) {
    throw new Error("Raw HTTP response should start with a status line such as HTTP/1.1 400 Bad Request.");
  }

  const headers: ParsedField[] = [];

  for (const line of headLines.slice(1)) {
    if (!line) {
      continue;
    }

    if (/^[ \t]/.test(line)) {
      throw new Error("Folded HTTP header lines are not supported. Paste each header on one line.");
    }

    const colonIndex = line.indexOf(":");

    if (colonIndex <= 0) {
      throw new Error(`Malformed HTTP header line: ${line}`);
    }

    const label = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (!isHttpFieldName(label)) {
      throw new Error(`Invalid HTTP header name: ${label}`);
    }

    headers.push({ label, value });
  }

  return {
    statusCode: match[1],
    statusText: (match[2] || "").trim(),
    headers,
    body,
  };
}

function findStatusCode(value: unknown): string {
  let candidate = findOwnStringValue(value, ["status", "statusCode", "httpStatus", "http_status"]);

  if (!candidate && isRecord(value) && isRecord(value.error)) {
    candidate = findOwnStringValue(value.error, ["status", "statusCode", "httpStatus", "http_status"]);
  }

  if (!/^\d{3}$/.test(candidate)) {
    return "";
  }

  const status = Number(candidate);
  return status >= 100 && status <= 599 ? candidate : "";
}

function findProblemType(value: unknown): string {
  if (!isRecord(value)) {
    return "";
  }

  const type = value.type;
  return typeof type === "string" ? type : "";
}

function isHttpFieldName(value: string) {
  return /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(value);
}

function findErrorCode(value: unknown): string {
  const direct = findOwnStringValue(value, ["errorCode", "error_code", "code"]);

  if (direct && !/^\d{3}$/.test(direct)) {
    return direct;
  }

  if (isRecord(value)) {
    const error = value.error;

    if (isRecord(error)) {
      return findOwnStringValue(error, ["code", "errorCode", "error_code"]);
    }

    if (typeof error === "string") {
      return error;
    }
  }

  return "";
}

function findMessage(value: unknown): string {
  const direct = findOwnStringValue(value, ["message", "detail", "title", "errorMessage", "error_message"]);

  if (direct) {
    return direct;
  }

  if (isRecord(value)) {
    const error = value.error;

    if (isRecord(error)) {
      const nested = findOwnStringValue(error, ["message", "detail", "title", "errorMessage", "error_message"]);
      if (nested) {
        return nested;
      }
    }

    if (typeof error === "string") {
      return error;
    }
  }

  return findStringValue(value, ["message", "detail", "title", "errorMessage", "error_message"]);
}

function findDetails(value: unknown): string {
  const direct = findOwnStringValue(value, ["detail", "details", "description"]);

  if (direct) {
    return direct;
  }

  if (isRecord(value) && isRecord(value.error)) {
    const nested = findOwnStringValue(value.error, ["detail", "details", "description"]);
    if (nested) {
      return nested;
    }
  }

  return "";
}

function findOwnStringValue(value: unknown, keys: string[]): string {
  if (!isRecord(value)) {
    return "";
  }

  const lowerKeys = keys.map((key) => key.toLowerCase());

  for (const [key, item] of Object.entries(value)) {
    if (!lowerKeys.includes(key.toLowerCase())) {
      continue;
    }

    if (typeof item === "string" || typeof item === "number") {
      return String(item);
    }

    if (Array.isArray(item)) {
      return `${item.length} item${item.length === 1 ? "" : "s"}`;
    }
  }

  return "";
}

function findPreferredStringValue(value: unknown, keys: string[]): string {
  const direct = findOwnStringValue(value, keys);
  return direct || findStringValue(value, keys);
}

function findStringValue(value: unknown, keys: string[]): string {
  if (!isRecord(value)) {
    return "";
  }

  const own = findOwnStringValue(value, keys);
  if (own) {
    return own;
  }

  for (const item of Object.values(value)) {
    if (isRecord(item)) {
      const found = findStringValue(item, keys);

      if (found) {
        return found;
      }
    }
  }

  return "";
}

function findValidationIssues(value: unknown): ValidationIssue[] {
  const candidates = findArrays(value, [
    "errors",
    "details",
    "violations",
    "validationErrors",
    "validation_errors",
    "fieldErrors",
    "field_errors",
  ]);

  const issues: ValidationIssue[] = [];

  candidates.forEach((candidate) => {
    candidate.forEach((item) => {
      if (!isRecord(item)) {
        return;
      }

      const field = findStringValue(item, [
        "field",
        "name",
        "path",
        "property",
        "param",
        "parameter",
      ]);
      const message = findStringValue(item, [
        "message",
        "reason",
        "detail",
        "description",
        "error",
      ]);
      const code = findStringValue(item, ["code", "type", "rule"]);

      if (field || message || code) {
        issues.push({
          field,
          message,
          code,
        });
      }
    });
  });

  return issues;
}

function findArrays(value: unknown, keys: string[]): unknown[][] {
  const results: unknown[][] = [];

  if (!isRecord(value)) {
    return results;
  }

  const lowerKeys = keys.map((key) => key.toLowerCase());

  Object.entries(value).forEach(([key, item]) => {
    if (Array.isArray(item) && lowerKeys.includes(key.toLowerCase())) {
      results.push(item);
    }

    if (isRecord(item)) {
      results.push(...findArrays(item, keys));
    }
  });

  return results;
}

function detectShape(value: unknown) {
  if (!isRecord(value)) {
    return "JSON value";
  }

  if (
    ("title" in value && "detail" in value) ||
    (("type" in value || "instance" in value) && ("title" in value || "detail" in value || "status" in value))
  ) {
    return "RFC 9457 problem details";
  }

  if ("error" in value && isRecord(value.error)) {
    return "nested error object";
  }

  if ("errors" in value && Array.isArray(value.errors)) {
    return "errors array";
  }

  if ("message" in value && ("code" in value || "status" in value)) {
    return "flat error object";
  }

  return "JSON object";
}

function buildOutput(
  parsed: ParsedAPIError,
  options: {
    outputMode: OutputMode;
    hideTraceValues: boolean;
  }
) {
  if (options.outputMode === "cleanJson") {
    const jsonValue = options.hideTraceValues
      ? maskTraceIdentifiers(parsed.jsonValue)
      : parsed.jsonValue;
    return JSON.stringify(jsonValue, null, parsed.compactCleanJson ? 0 : 2);
  }

  const requestId =
    options.hideTraceValues && parsed.requestId ? "[hidden]" : parsed.requestId;
  const traceId =
    options.hideTraceValues && parsed.traceId ? "[hidden]" : parsed.traceId;

  if (options.outputMode === "summary") {
    return [
      parsed.statusCode ? `Status: ${parsed.statusCode} ${parsed.statusText}` : "",
      parsed.errorCode ? `Error code: ${parsed.errorCode}` : "",
      parsed.message ? `Message: ${parsed.message}` : "",
      parsed.path ? `Path: ${parsed.path}` : "",
      requestId ? `Request ID: ${requestId}` : "",
      traceId ? `Trace ID: ${traceId}` : "",
      `Validation issues: ${parsed.validationIssues.length}`,
      `Detected shape: ${parsed.detectedShape}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "API Error Response",
    "------------------",
    parsed.statusCode ? `Status: ${parsed.statusCode} ${parsed.statusText}` : "",
    parsed.errorCode ? `Error code: ${parsed.errorCode}` : "",
    parsed.message ? `Message: ${parsed.message}` : "",
    parsed.details ? `Details: ${parsed.details}` : "",
    parsed.path ? `Path: ${parsed.path}` : "",
    parsed.method ? `Method: ${parsed.method}` : "",
    parsed.timestamp ? `Timestamp: ${parsed.timestamp}` : "",
    requestId ? `Request ID: ${requestId}` : "",
    traceId ? `Trace ID: ${traceId}` : "",
    `Detected shape: ${parsed.detectedShape}`,
    "",
    parsed.validationIssues.length > 0 ? "Validation issues:" : "",
    ...parsed.validationIssues.map(
      (issue, index) =>
        `${index + 1}. ${issue.field || "(unknown field)"} - ${
          issue.message || "(no message)"
        }${issue.code ? ` [${issue.code}]` : ""}`
    ),
    "",
    "Formatted JSON:",
    parsed.formattedJson,
  ]
    .filter((line) => line !== undefined)
    .join("\n");
}

function getKeyFields(
  parsed: ParsedAPIError,
  hideTraceValues: boolean
): ParsedField[] {
  return [
    {
      label: "Status",
      value: parsed.statusCode
        ? `${parsed.statusCode} ${parsed.statusText}`
        : "",
    },
    {
      label: "Error Code",
      value: parsed.errorCode,
    },
    {
      label: "Message",
      value: parsed.message,
    },
    {
      label: "Details",
      value: parsed.details,
    },
    {
      label: "Problem Type",
      value: parsed.problemType,
    },
    {
      label: "Path",
      value: parsed.path,
    },
    {
      label: "Method",
      value: parsed.method,
    },
    {
      label: "Request ID",
      value: hideTraceValues && parsed.requestId ? "[hidden]" : parsed.requestId,
    },
    {
      label: "Trace ID",
      value: hideTraceValues && parsed.traceId ? "[hidden]" : parsed.traceId,
    },
  ];
}

function getErrorNotes(parsed: ParsedAPIError): ErrorNote[] {
  const notes: ErrorNote[] = [];

  const statusNumber = Number(parsed.statusCode);

  if (parsed.bodyStatusCode && parsed.statusCode && parsed.bodyStatusCode !== parsed.statusCode) {
    notes.push({
      severity: "warning",
      title: "HTTP status and body status differ",
      message: `The status line says ${parsed.statusCode}, while the JSON body says ${parsed.bodyStatusCode}. Check which value your API contract treats as authoritative.`,
    });
  }

  if (parsed.detectedShape === "RFC 9457 problem details") {
    notes.push({
      severity: "info",
      title: "Problem Details shape detected",
      message: "The body resembles RFC 9457 Problem Details. Its type, title, status, detail, instance, and extension members still need to be interpreted using the API's documentation.",
    });
  }

  if (statusNumber === 401) {
    notes.push({
      severity: "info",
      title: "Authentication error",
      message:
        "401 usually means the request is missing valid authentication or the token is expired.",
    });
  }

  if (statusNumber === 403) {
    notes.push({
      severity: "info",
      title: "Permission error",
      message:
        "403 usually means the request was understood, but the caller is not allowed to perform the action.",
    });
  }

  if (statusNumber === 404) {
    notes.push({
      severity: "info",
      title: "Not found",
      message:
        "404 usually means the path, resource ID, or route does not exist.",
    });
  }

  if (statusNumber === 422 || parsed.validationIssues.length > 0) {
    notes.push({
      severity: "info",
      title: "Validation issue",
      message:
        "This response looks like a validation error. Check required fields, data types, and field names.",
    });
  }

  if (statusNumber >= 500) {
    notes.push({
      severity: "info",
      title: "Server-side error",
      message:
        "5xx errors usually need backend logs or service health checks to understand the failure.",
    });
  }

  if (parsed.requestId || parsed.traceId) {
    notes.push({
      severity: "info",
      title: "Trace value found",
      message:
        "Request IDs and trace IDs are useful for finding the same error in backend logs.",
    });
  }

  return notes;
}

function maskTraceIdentifiers(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(maskTraceIdentifiers);
  }

  if (!isRecord(value)) {
    return value;
  }

  const traceKeys = new Set([
    "requestid",
    "request_id",
    "x-request-id",
    "traceid",
    "trace_id",
    "trace",
    "correlationid",
    "correlation_id",
  ]);

  const masked: Record<string, unknown> = {};

  Object.entries(value).forEach(([key, item]) => {
    masked[key] = traceKeys.has(key.toLowerCase())
      ? "[hidden]"
      : maskTraceIdentifiers(item);
  });

  return masked;
}

function formatJsonForDisplay(value: unknown, hideTraceValues: boolean) {
  return JSON.stringify(hideTraceValues ? maskTraceIdentifiers(value) : value, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
