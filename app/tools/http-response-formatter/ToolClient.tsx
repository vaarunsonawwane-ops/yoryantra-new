"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type ParsedResponse = {
  protocol: string;
  statusCode: string;
  statusText: string;
  headers: Record<string, string[]>;
  body: string;
};

const sampleResponse = `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Cache-Control: no-cache
Set-Cookie: session=abc123; HttpOnly; Secure
X-Request-ID: req_12345

{"success":true,"message":"Response formatted with Yoryantra","items":[1,2,3]}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatResponse = () => {
    if (!input.trim()) {
      setError("Please enter a raw HTTP response to format.");
      setOutput("");
      return;
    }

    try {
      const parsed = parseHttpResponse(input);
      const formatted = formatParsedResponse(parsed);

      setOutput(formatted);
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to format this HTTP response.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleResponse);
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="HTTP Response Formatter"
      description="Format raw HTTP responses, inspect status codes, response headers, cookies, redirects, and body data in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Raw HTTP Response
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleResponse}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a raw HTTP response copied from logs, API debugging tools,
          proxies, browser tools, or server output.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatResponse} className="yoryantra-btn">
          Format Response
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

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Formatted Response
          </h3>

          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[260px] whitespace-pre-wrap break-words">
          {output || "Formatted HTTP response details will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting Raw HTTP Responses for API Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw HTTP responses are often copied from API tools, browser
            debugging sessions, proxies, server logs, and backend output. They
            can include status codes, response headers, cookies, redirects,
            cache rules, content types, and body data in one block of text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Response Formatter helps you parse raw HTTP responses,
            inspect headers, check status code details, review cookies, and
            format JSON response bodies directly in your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading Status Codes, Headers, and Response Bodies
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a raw HTTP response into the input box.</li>
            <li>
              Click <strong>Format Response</strong>.
            </li>
            <li>Review the status code, headers, cookies, redirects, and body.</li>
            <li>Copy the formatted output for debugging, notes, or API testing.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HTTP Response Formatter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Reading raw HTTP responses copied from API tools.</li>
            <li>Checking response headers during API debugging.</li>
            <li>Inspecting status codes and redirect responses.</li>
            <li>Reviewing cache headers, content type, and cookies.</li>
            <li>Formatting JSON response bodies for easier reading.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Raw HTTP Response
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleResponse}
            </pre>
          </div>
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
                It reads a raw HTTP response and separates important parts such
                as the protocol, status code, status text, headers, cookies, and
                response body into a cleaner format.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool format JSON response bodies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. If the response body contains valid JSON, the formatter
                will pretty-print it so the response data is easier to read.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this send the response anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The response formatting happens directly in your browser.
                Your HTTP response text is not uploaded to a server.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this verify whether an API response is correct?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool formats and explains the response text. It does not
                contact the API or verify whether the response is correct for
                your application.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-request-formatter"
              className="yoryantra-btn-outline"
            >
              HTTP Request Formatter
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/http-status-code-explorer"
              className="yoryantra-btn-outline"
            >
              HTTP Status Code Explorer
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function parseHttpResponse(source: string): ParsedResponse {
  const normalized = source.replace(/\r\n/g, "\n");
  const [headPart, ...bodyParts] = normalized.split(/\n\s*\n/);
  const body = bodyParts.join("\n\n").trim();
  const lines = headPart
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("Response content is empty.");
  }

  const statusLine = lines[0];
  const statusMatch = statusLine.match(/^(HTTP\/\d(?:\.\d)?)\s+(\d{3})(?:\s+(.*))?$/i);

  if (!statusMatch) {
    throw new Error("The first line should look like: HTTP/1.1 200 OK");
  }

  const protocol = statusMatch[1];
  const statusCode = statusMatch[2];
  const statusText = statusMatch[3] || getStatusText(statusCode);
  const headers: Record<string, string[]> = {};

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    const colonIndex = line.indexOf(":");

    if (colonIndex <= 0) {
      throw new Error(`Invalid header line: ${line}`);
    }

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (!headers[key]) {
      headers[key] = [];
    }

    headers[key].push(value);
  }

  return {
    protocol,
    statusCode,
    statusText,
    headers,
    body,
  };
}

function formatParsedResponse(response: ParsedResponse) {
  const output = [
    "HTTP response formatted.",
    "",
    `Protocol: ${response.protocol}`,
    `Status: ${response.statusCode} ${response.statusText}`,
    `Status group: ${getStatusGroup(response.statusCode)}`,
    "",
    "Headers:",
  ];

  const headerEntries = Object.entries(response.headers);

  if (headerEntries.length) {
    headerEntries.forEach(([key, values]) => {
      values.forEach((value) => {
        output.push(`  ${key}: ${value}`);
      });
    });
  } else {
    output.push("  No headers found.");
  }

  output.push("");
  output.push("Important signals:");
  output.push(`  Content-Type: ${getHeaderValue(response.headers, "content-type") || "Not found"}`);
  output.push(`  Cache-Control: ${getHeaderValue(response.headers, "cache-control") || "Not found"}`);
  output.push(`  Location: ${getHeaderValue(response.headers, "location") || "Not found"}`);
  output.push(`  Set-Cookie: ${getHeaderValue(response.headers, "set-cookie") || "Not found"}`);

  output.push("");
  output.push("Body:");

  if (response.body) {
    output.push(formatBody(response.body));
  } else {
    output.push("  No body found.");
  }

  return output.join("\n");
}

function formatBody(body: string) {
  const trimmed = body.trim();

  if (!trimmed) {
    return "  No body found.";
  }

  try {
    return JSON.stringify(JSON.parse(trimmed), null, 2);
  } catch {
    return trimmed;
  }
}

function getHeaderValue(headers: Record<string, string[]>, name: string) {
  const foundKey = Object.keys(headers).find(
    (key) => key.toLowerCase() === name.toLowerCase()
  );

  if (!foundKey) {
    return "";
  }

  return headers[foundKey].join(", ");
}

function getStatusGroup(statusCode: string) {
  const firstDigit = statusCode.charAt(0);

  if (firstDigit === "1") {
    return "Informational response";
  }

  if (firstDigit === "2") {
    return "Success response";
  }

  if (firstDigit === "3") {
    return "Redirection response";
  }

  if (firstDigit === "4") {
    return "Client error response";
  }

  if (firstDigit === "5") {
    return "Server error response";
  }

  return "Unknown response type";
}

function getStatusText(statusCode: string) {
  const knownStatuses: Record<string, string> = {
    "200": "OK",
    "201": "Created",
    "204": "No Content",
    "301": "Moved Permanently",
    "302": "Found",
    "304": "Not Modified",
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not Found",
    "409": "Conflict",
    "422": "Unprocessable Entity",
    "429": "Too Many Requests",
    "500": "Internal Server Error",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
  };

  return knownStatuses[statusCode] || "Unknown";
}
