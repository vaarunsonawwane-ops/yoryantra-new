"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type BodyFormatMode = "auto" | "json" | "text";
type OutputMode = "formatted" | "summary" | "headers";
type ParsedHeader = {
  name: string;
  value: string;
};

type ParsedCookie = {
  name: string;
  value: string;
  attributes: ParsedHeader[];
};

type ParsedResponse = {
  protocol: string;
  statusCode: number;
  statusText: string;
  statusCategory: string;
  headers: ParsedHeader[];
  cookies: ParsedCookie[];
  body: string;
  formattedBody: string;
  bodyType: string;
  contentType: string;
  cacheControl: string;
  location: string;
  server: string;
  contentLength: number;
};

type ResponseNote = {
  title: string;
  message: string;
};

const sampleResponse = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure; SameSite=Lax
X-Request-ID: req_12345

{
  "success": true,
  "message": "Response formatted with Yoryantra",
  "items": [1, 2, 3]
}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsedResponse, setParsedResponse] = useState<ParsedResponse | null>(
    null
  );
  const [error, setError] = useState("");
  const [bodyFormatMode, setBodyFormatMode] =
    useState<BodyFormatMode>("auto");
  const [outputMode, setOutputMode] = useState<OutputMode>("formatted");
  const [hideCookieValues, setHideCookieValues] = useState(true);
  const [copied, setCopied] = useState(false);

  const notes = useMemo(
    () => (parsedResponse ? getResponseNotes(parsedResponse) : []),
    [parsedResponse]
  );

  const formatResponse = () => {
    if (!input.trim()) {
      setError("Please paste a raw HTTP response.");
      setOutput("");
      setParsedResponse(null);
      setCopied(false);
      return;
    }

    try {
      const parsed = parseHttpResponse(input, {
        bodyFormatMode,
      });

      const formatted = formatParsedResponse(parsed, {
        outputMode,
        hideCookieValues,
      });

      setParsedResponse(parsed);
      setOutput(formatted);
      setError("");
      setCopied(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to format this HTTP response.";

      setError(message);
      setOutput("");
      setParsedResponse(null);
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
    setInput(sampleResponse);
    setOutput("");
    setParsedResponse(null);
    setError("");
    setBodyFormatMode("auto");
    setOutputMode("formatted");
    setHideCookieValues(true);
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setParsedResponse(null);
    setError("");
    setBodyFormatMode("auto");
    setOutputMode("formatted");
    setHideCookieValues(true);
    setCopied(false);
  };

  return (
    <ToolShell
      title="HTTP Response Formatter"
      description="Format raw HTTP responses, clean JSON bodies, inspect status lines, headers, cookies, cache headers, and response details directly in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Raw HTTP Response
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setParsedResponse(null);
            setError("");
            setCopied(false);
          }}
          placeholder={sampleResponse}
          className="w-full min-h-[360px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a raw HTTP response from logs, DevTools, proxy tools, API
          clients, gateway traces, or debugging notes.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Formatting Options
        </h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Body Formatting"
            value={bodyFormatMode}
            onChange={(value) => {
              setBodyFormatMode(value as BodyFormatMode);
              setOutput("");
              setParsedResponse(null);
              setError("");
              setCopied(false);
            }}
            options={[
              {
                label: "Auto",
                value: "auto",
              },
              {
                label: "JSON",
                value: "json",
              },
              {
                label: "Text",
                value: "text",
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
                label: "Formatted Response",
                value: "formatted",
              },
              {
                label: "Summary",
                value: "summary",
              },
              {
                label: "Headers Only",
                value: "headers",
              },
            ]}
          />
        </div>

        <div className="mt-4">
          <label className="flex cursor-pointer gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <input
              type="checkbox"
              checked={hideCookieValues}
              onChange={(event) => {
                setHideCookieValues(event.target.checked);
                setOutput("");
                setCopied(false);
              }}
              className="mt-1 h-4 w-4 accent-[var(--light-gold)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-900">
                Hide cookie values
              </span>

              <span className="mt-1 block text-sm leading-relaxed text-gray-500">
                Hide Set-Cookie values in copied output so it is safer to share.
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatResponse} className="yoryantra-btn">
          Format HTTP Response
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

      {parsedResponse && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Status"
            value={`${parsedResponse.statusCode} ${parsedResponse.statusText}`}
          />
          <SummaryCard label="Protocol" value={parsedResponse.protocol} />
          <SummaryCard
            label="Headers"
            value={parsedResponse.headers.length.toLocaleString()}
          />
          <SummaryCard
            label="Body Size"
            value={`${parsedResponse.contentLength.toLocaleString()} chars`}
          />
        </div>
      )}

      {parsedResponse && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Response Details
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            A quick look at the status line and the most useful response fields.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <DetailCard label="Protocol" value={parsedResponse.protocol} />
            <DetailCard
              label="Status Code"
              value={parsedResponse.statusCode.toString()}
            />
            <DetailCard
              label="Status Text"
              value={parsedResponse.statusText || "(not provided)"}
            />
            <DetailCard
              label="Status Category"
              value={parsedResponse.statusCategory}
            />
            <DetailCard
              label="Content Type"
              value={parsedResponse.contentType || "(not provided)"}
            />
            <DetailCard
              label="Location"
              value={parsedResponse.location || "(not provided)"}
            />
            <DetailCard
              label="Cache-Control"
              value={parsedResponse.cacheControl || "(not provided)"}
            />
            <DetailCard
              label="Server"
              value={parsedResponse.server || "(not provided)"}
            />
          </div>
        </div>
      )}

      {parsedResponse && parsedResponse.headers.length > 0 && (
        <ParsedTable
          title="Headers"
          description="Response headers parsed from the raw HTTP response."
          columns={["Header", "Value"]}
          rows={parsedResponse.headers.map((header) => [
            header.name,
            hideCookieValues && header.name.toLowerCase() === "set-cookie"
              ? "[hidden]"
              : header.value,
          ])}
        />
      )}

      {parsedResponse && parsedResponse.cookies.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Set-Cookie Details
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Cookie values are hidden by default. Attributes such as Path,
            HttpOnly, Secure, and SameSite are shown separately.
          </p>

          <div className="mt-4 space-y-4">
            {parsedResponse.cookies.map((cookie, index) => (
              <div
                key={`${cookie.name}-${index}`}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailCard label="Cookie Name" value={cookie.name} />
                  <DetailCard
                    label="Cookie Value"
                    value={hideCookieValues ? "[hidden]" : cookie.value}
                  />
                </div>

                {cookie.attributes.length > 0 && (
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {cookie.attributes.map((attribute, attributeIndex) => (
                      <div
                        key={`${cookie.name}-${attribute.name}-${attributeIndex}`}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                      >
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {attribute.name}
                        </div>

                        <div className="mt-1 break-words font-mono text-xs text-gray-800">
                          {attribute.value || "true"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {parsedResponse && parsedResponse.body && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Body Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Body type detected as{" "}
            <span className="font-semibold text-gray-900">
              {parsedResponse.bodyType}
            </span>
            .
          </p>

          <pre className="mt-4 yoryantra-output overflow-auto text-sm min-h-[240px] whitespace-pre-wrap break-words">
            {parsedResponse.formattedBody || parsedResponse.body}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Response notes
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
            Formatted Output
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
          {output || "Formatted HTTP response output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        HTTP response formatting happens directly in your browser. Your response
        text, headers, cookies, and body are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting Raw HTTP Responses for Easier Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw HTTP responses are useful because they show exactly what came
            back from a server: status code, headers, cookies, cache behavior,
            redirect location, content type, and body data. But they can be hard
            to read when everything is copied from logs or proxy tools.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Response Formatter turns a raw response into a cleaner
            view. It formats JSON bodies, separates headers, highlights useful
            response details, and keeps cookie values hidden by default when you
            copy output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cleaning Up an HTTP Response
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a raw HTTP response into the input box.</li>
            <li>Choose how the response body should be formatted.</li>
            <li>Keep cookie values hidden if you plan to share the output.</li>
            <li>Review the status, headers, cookies, and body preview.</li>
            <li>Copy the formatted response, summary, or headers-only output.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HTTP Response Formatter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting API responses copied from logs or proxy tools.</li>
            <li>Cleaning JSON response bodies before sharing them.</li>
            <li>Checking status codes, content type, redirects, and cache headers.</li>
            <li>Inspecting Set-Cookie values and cookie attributes.</li>
            <li>Preparing a cleaner response example for tickets or notes.</li>
            <li>Debugging why an API response behaves differently than expected.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example HTTP Response
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure

{"success":true,"items":[1,2,3]}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Cookies, Headers, and Shared Debug Notes
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP responses can include Set-Cookie headers with real session
            values. This tool hides cookie values by default so copied output is
            safer to paste into a ticket, note, or chat message.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            If the response contains private user data, tokens, or production
            values, replace them with safe examples before sharing the output
            with anyone else.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an HTTP response formatter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It formats a raw HTTP response into a cleaner view with status,
                headers, cookies, and body content separated.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this format JSON response bodies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Auto mode detects JSON content types and JSON-looking
                bodies, then formats the body when possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this send the response anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The response is formatted directly in your browser.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are cookie values hidden?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Cookie values may contain session data. Hiding them makes copied
                output safer to share.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my HTTP response uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Formatting happens directly in your browser, and your
                response data is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-request-parser" className="yoryantra-btn-outline">
              HTTP Request Parser
            </Link>

            <Link href="/tools/curl-command-parser" className="yoryantra-btn-outline">
              cURL Command Parser
            </Link>

            <Link href="/tools/security-headers-checker" className="yoryantra-btn-outline">
              Security Headers Checker
            </Link>

            <Link href="/tools/http-status-code-checker" className="yoryantra-btn-outline">
              HTTP Status Code Checker
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

function parseHttpResponse(
  input: string,
  options: {
    bodyFormatMode: BodyFormatMode;
  }
): ParsedResponse {
  const normalizedInput = input.replace(/\r\n/g, "\n");
  const [headPart, ...bodyParts] = normalizedInput.split(/\n\n/);
  const body = bodyParts.join("\n\n");
  const headLines = headPart.split("\n").filter((line) => line.trim() !== "");

  if (headLines.length === 0) {
    throw new Error("Response is missing a status line.");
  }

  const statusLine = headLines[0].trim();
  const statusMatch = statusLine.match(
    /^(HTTP\/\d(?:\.\d)?)\s+(\d{3})(?:\s+(.*))?$/
  );

  if (!statusMatch) {
    throw new Error("Status line should look like HTTP/1.1 200 OK.");
  }

  const protocol = statusMatch[1];
  const statusCode = Number(statusMatch[2]);
  const statusText = statusMatch[3] || "";
  const headers = parseHeaders(headLines.slice(1));
  const cookies = parseSetCookieHeaders(headers);
  const contentType = getHeaderValue(headers, "content-type");
  const formattedBody = formatResponseBody(body, contentType, options.bodyFormatMode);
  const bodyType = getBodyType(body, contentType, options.bodyFormatMode);

  return {
    protocol,
    statusCode,
    statusText,
    statusCategory: getStatusCategory(statusCode),
    headers,
    cookies,
    body,
    formattedBody,
    bodyType,
    contentType,
    cacheControl: getHeaderValue(headers, "cache-control"),
    location: getHeaderValue(headers, "location"),
    server: getHeaderValue(headers, "server"),
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

function parseSetCookieHeaders(headers: ParsedHeader[]): ParsedCookie[] {
  return headers
    .filter((header) => header.name.toLowerCase() === "set-cookie")
    .map((header) => parseSetCookie(header.value));
}

function parseSetCookie(value: string): ParsedCookie {
  const parts = value.split(";").map((part) => part.trim());
  const [nameValue, ...attributeParts] = parts;
  const equalsIndex = nameValue.indexOf("=");

  const name =
    equalsIndex === -1 ? nameValue : nameValue.slice(0, equalsIndex).trim();
  const cookieValue =
    equalsIndex === -1 ? "" : nameValue.slice(equalsIndex + 1).trim();

  const attributes = attributeParts.map((attribute) => {
    const attributeEqualsIndex = attribute.indexOf("=");

    if (attributeEqualsIndex === -1) {
      return {
        name: attribute,
        value: "",
      };
    }

    return {
      name: attribute.slice(0, attributeEqualsIndex).trim(),
      value: attribute.slice(attributeEqualsIndex + 1).trim(),
    };
  });

  return {
    name,
    value: cookieValue,
    attributes,
  };
}

function formatResponseBody(
  body: string,
  contentType: string,
  mode: BodyFormatMode
) {
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
      return JSON.stringify(JSON.parse(trimmedBody), null, 2);
    } catch {
      if (mode === "json") {
        throw new Error("Response body is not valid JSON.");
      }

      return body;
    }
  }

  return body;
}

function getBodyType(body: string, contentType: string, mode: BodyFormatMode) {
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

  return "text";
}

function formatParsedResponse(
  response: ParsedResponse,
  options: {
    outputMode: OutputMode;
    hideCookieValues: boolean;
  }
) {
  if (options.outputMode === "headers") {
    return [
      `${response.protocol} ${response.statusCode} ${response.statusText}`,
      ...response.headers.map(
        (header) =>
          `${header.name}: ${
            options.hideCookieValues &&
            header.name.toLowerCase() === "set-cookie"
              ? "[hidden]"
              : header.value
          }`
      ),
    ].join("\n");
  }

  if (options.outputMode === "summary") {
    return [
      `Status: ${response.statusCode} ${response.statusText}`,
      `Protocol: ${response.protocol}`,
      `Status category: ${response.statusCategory}`,
      `Headers: ${response.headers.length}`,
      `Cookies: ${response.cookies.length}`,
      `Body type: ${response.bodyType}`,
      `Body size: ${response.contentLength.toLocaleString()} characters`,
      response.contentType ? `Content-Type: ${response.contentType}` : "",
      response.location ? `Location: ${response.location}` : "",
      response.cacheControl ? `Cache-Control: ${response.cacheControl}` : "",
      response.server ? `Server: ${response.server}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    `${response.protocol} ${response.statusCode} ${response.statusText}`,
    "",
    ...response.headers.map(
      (header) =>
        `${header.name}: ${
          options.hideCookieValues &&
          header.name.toLowerCase() === "set-cookie"
            ? "[hidden]"
            : header.value
        }`
    ),
    response.formattedBody ? "" : "",
    response.formattedBody || "",
  ].join("\n");
}

function getResponseNotes(response: ParsedResponse): ResponseNote[] {
  const notes: ResponseNote[] = [];

  if (response.statusCode >= 300 && response.statusCode < 400 && !response.location) {
    notes.push({
      title: "Redirect without Location header",
      message:
        "This response is in the redirect range, but no Location header was found.",
    });
  }

  if (response.statusCode >= 400) {
    notes.push({
      title: "Error status response",
      message:
        "This response has a client or server error status. Check the body and headers for details.",
    });
  }

  if (response.cookies.length > 0) {
    notes.push({
      title: "Set-Cookie values found",
      message:
        "This response includes cookies. Hide or replace real cookie values before sharing output.",
    });
  }

  if (!response.contentType && response.body) {
    notes.push({
      title: "Body has no Content-Type",
      message:
        "The response has a body, but no Content-Type header was found. Body formatting may be less accurate.",
    });
  }

  if (response.cacheControl.toLowerCase().includes("public")) {
    notes.push({
      title: "Public cache response",
      message:
        "Cache-Control contains public. Make sure the response does not contain private user data.",
    });
  }

  return notes;
}

function getHeaderValue(headers: ParsedHeader[], name: string) {
  const header = headers.find(
    (item) => item.name.toLowerCase() === name.toLowerCase()
  );

  return header ? header.value : "";
}

function getStatusCategory(statusCode: number) {
  if (statusCode >= 100 && statusCode < 200) {
    return "Informational";
  }

  if (statusCode >= 200 && statusCode < 300) {
    return "Successful";
  }

  if (statusCode >= 300 && statusCode < 400) {
    return "Redirection";
  }

  if (statusCode >= 400 && statusCode < 500) {
    return "Client error";
  }

  if (statusCode >= 500 && statusCode < 600) {
    return "Server error";
  }

  return "Unknown";
}
