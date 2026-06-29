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
  statusText: string;
  errorCode: string;
  message: string;
  details: string;
  requestId: string;
  traceId: string;
  path: string;
  timestamp: string;
  method: string;
  rawBody: string;
  formattedJson: string;
  cleanJson: string;
  validationIssues: ValidationIssue[];
  headers: ParsedField[];
  detectedShape: string;
};

type ErrorNote = {
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
      description="Format API error responses, extract error codes, messages, validation errors, traces, and useful debugging details directly in your browser."
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
            label="Input"
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
            label="Output"
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
                label: "Clean JSON",
                value: "cleanJson",
              },
            ]}
          />


        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
                Hide trace values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Hide request IDs, trace IDs, and correlation IDs in copied
                output.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
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
        <button onClick={formatErrorResponse} className="yoryantra-btn">
          Format API Error
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

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Error response notes
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

      {parsedError && parsedError.formattedJson && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Formatted Error JSON
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            The response body formatted for easier reading.
          </p>

          <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[240px] whitespace-pre-wrap break-words">
            {parsedError.formattedJson}
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
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Formatted API error output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        API error formatting happens directly in your browser. Your response
        body, headers, trace IDs, and error details are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting API Error Responses for Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            API error responses often contain useful information, but it is not
            always easy to read when it is copied from logs, browser DevTools,
            backend traces, or API clients. The status code, error code, message,
            validation fields, request ID, and trace ID can be buried inside a
            large JSON object.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This API Error Response Formatter pulls out the important parts and
            formats the response into a cleaner view. It helps when you are
            debugging failed API calls, preparing support notes, or sharing an
            error response with another developer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading an API Error Without Searching Through JSON
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a raw HTTP error response or JSON error body.</li>
            <li>Choose whether the input includes headers or only JSON.</li>
            <li>Hide trace values if you plan to copy or share the output.</li>
            <li>Review the status, error code, message, and validation issues.</li>
            <li>Copy the formatted report, summary, or clean JSON output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common API Error Formatter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting messy JSON error bodies from API responses.</li>
            <li>Reading validation errors field by field.</li>
            <li>Finding error codes, trace IDs, and request IDs quickly.</li>
            <li>Cleaning API error examples before adding them to tickets.</li>
            <li>Checking whether a response is a 400, 401, 403, 404, 422, or 500 error.</li>
            <li>Preparing safer output before sharing logs or debugging notes.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example API Error Response
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The request body has validation errors.",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "traceId": "trace_abc123"
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Trace IDs, Request IDs, and Shared Error Logs
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Trace IDs and request IDs are useful because they help connect an API
            error to backend logs. They are often safe to share inside a team,
            but you may still want to hide them before posting output publicly or
            sending it outside your project.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            If the response contains user data, tokens, private URLs, or
            production details, replace those values with safe examples before
            sharing the formatted output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an API error response formatter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It formats an API error response and extracts useful fields such
                as status code, error code, message, validation errors, request
                ID, and trace ID.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this format validation errors?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It looks for common validation error arrays and shows them
                as field, message, and code rows when possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this send the error response anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The response is formatted directly in your browser.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this read raw HTTP error responses?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It can read a raw HTTP response with a status line, headers,
                and JSON body.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my API error data uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Formatting happens directly in your browser, and your error
                response is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/api-error-response-formatter" />
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
  const normalized = input.replace(/\r\n/g, "\n").trim();
  let statusCode = "";
  let statusText = "";
  let headers: ParsedField[] = [];
  let body = normalized;

  if (options.inputMode === "http" || normalized.startsWith("HTTP/")) {
    const parsedHTTP = splitHTTPResponse(normalized);
    statusCode = parsedHTTP.statusCode;
    statusText = parsedHTTP.statusText;
    headers = parsedHTTP.headers;
    body = parsedHTTP.body;
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(body);
  } catch {
    throw new Error("The response body is not valid JSON.");
  }

  const formattedJson = JSON.stringify(parsedJson, null, 2);
  const cleanJson = JSON.stringify(parsedJson, null, options.compactCleanJson ? 0 : 2);
  const validationIssues = findValidationIssues(parsedJson);
  const detectedShape = detectShape(parsedJson);

  return {
    statusCode: statusCode || findStringValue(parsedJson, ["status", "statusCode", "code"]),
    statusText: statusText || findStringValue(parsedJson, ["statusText", "reason", "title"]),
    errorCode: findErrorCode(parsedJson),
    message: findMessage(parsedJson),
    details: findDetails(parsedJson),
    requestId: findStringValue(parsedJson, [
      "requestId",
      "request_id",
      "x-request-id",
      "correlationId",
      "correlation_id",
    ]),
    traceId: findStringValue(parsedJson, [
      "traceId",
      "trace_id",
      "trace",
      "traceID",
    ]),
    path: findStringValue(parsedJson, ["path", "url", "endpoint", "instance"]),
    timestamp: findStringValue(parsedJson, ["timestamp", "time", "date"]),
    method: findStringValue(parsedJson, ["method", "httpMethod"]),
    rawBody: body,
    formattedJson,
    cleanJson,
    validationIssues,
    headers,
    detectedShape,
  };
}

function splitHTTPResponse(input: string) {
  const [headPart, ...bodyParts] = input.split(/\n\n/);
  const body = bodyParts.join("\n\n").trim();
  const headLines = headPart.split("\n").filter(Boolean);
  const statusLine = headLines[0] || "";
  const match = statusLine.match(/^HTTP\/\d(?:\.\d)?\s+(\d{3})(?:\s+(.*))?$/);

  if (!match) {
    throw new Error("Raw HTTP response should start with a status line like HTTP/1.1 400 Bad Request.");
  }

  const headers = headLines.slice(1).map((line) => {
    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      return {
        label: line.trim(),
        value: "",
      };
    }

    return {
      label: line.slice(0, colonIndex).trim(),
      value: line.slice(colonIndex + 1).trim(),
    };
  });

  return {
    statusCode: match[1],
    statusText: match[2] || "",
    headers,
    body,
  };
}

function findErrorCode(value: unknown): string {
  const direct = findStringValue(value, [
    "errorCode",
    "error_code",
    "code",
    "type",
  ]);

  if (direct && !/^\d+$/.test(direct)) {
    return direct;
  }

  if (isRecord(value)) {
    const error = value.error;

    if (isRecord(error)) {
      return findStringValue(error, ["code", "errorCode", "error_code", "type"]);
    }

    if (typeof error === "string") {
      return error;
    }
  }

  return direct;
}

function findMessage(value: unknown): string {
  const direct = findStringValue(value, [
    "message",
    "errorMessage",
    "error_message",
    "detail",
    "title",
    "description",
  ]);

  if (direct) {
    return direct;
  }

  if (isRecord(value)) {
    const error = value.error;

    if (isRecord(error)) {
      return findStringValue(error, [
        "message",
        "errorMessage",
        "error_message",
        "detail",
        "title",
        "description",
      ]);
    }

    if (typeof error === "string") {
      return error;
    }
  }

  return "";
}

function findDetails(value: unknown): string {
  const detail = findStringValue(value, ["details", "detail", "description"]);

  if (detail) {
    return detail;
  }

  if (isRecord(value) && isRecord(value.error)) {
    return findStringValue(value.error, ["details", "detail", "description"]);
  }

  return "";
}

function findStringValue(value: unknown, keys: string[]): string {
  if (!isRecord(value)) {
    return "";
  }

  const lowerKeys = keys.map((key) => key.toLowerCase());

  for (const [key, item] of Object.entries(value)) {
    if (lowerKeys.includes(key.toLowerCase())) {
      if (typeof item === "string" || typeof item === "number") {
        return String(item);
      }

      if (Array.isArray(item)) {
        return `${item.length} item${item.length === 1 ? "" : "s"}`;
      }
    }
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
    return "JSON error";
  }

  if ("error" in value && isRecord(value.error)) {
    return "nested error";
  }

  if ("errors" in value && Array.isArray(value.errors)) {
    return "errors array";
  }

  if ("message" in value && ("code" in value || "status" in value)) {
    return "flat error";
  }

  if ("title" in value && "detail" in value) {
    return "problem details";
  }

  return "JSON error";
}

function buildOutput(
  parsed: ParsedAPIError,
  options: {
    outputMode: OutputMode;
    hideTraceValues: boolean;
  }
) {
  if (options.outputMode === "cleanJson") {
    return parsed.cleanJson;
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

  if (statusNumber === 401) {
    notes.push({
      title: "Authentication error",
      message:
        "401 usually means the request is missing valid authentication or the token is expired.",
    });
  }

  if (statusNumber === 403) {
    notes.push({
      title: "Permission error",
      message:
        "403 usually means the request was understood, but the caller is not allowed to perform the action.",
    });
  }

  if (statusNumber === 404) {
    notes.push({
      title: "Not found",
      message:
        "404 usually means the path, resource ID, or route does not exist.",
    });
  }

  if (statusNumber === 422 || parsed.validationIssues.length > 0) {
    notes.push({
      title: "Validation issue",
      message:
        "This response looks like a validation error. Check required fields, data types, and field names.",
    });
  }

  if (statusNumber >= 500) {
    notes.push({
      title: "Server-side error",
      message:
        "5xx errors usually need backend logs or service health checks to understand the failure.",
    });
  }

  if (parsed.requestId || parsed.traceId) {
    notes.push({
      title: "Trace value found",
      message:
        "Request IDs and trace IDs are useful for finding the same error in backend logs.",
    });
  }

  return notes;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
