"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ParsedRequest = {
  method: string;
  path: string;
  protocol: string;
  headers: Record<string, string>;
  body: string;
  queryParams: Array<{ key: string; value: string }>;
};

const sampleRequest = `POST /api/users?source=web&active=true HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token_here
User-Agent: Yoryantra-Test

{"name":"Yoryantra","role":"developer"}`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatRequest = () => {
    if (!input.trim()) {
      setError("Please enter a raw HTTP request to format.");
      setOutput("");
      return;
    }

    try {
      const parsed = parseHttpRequest(input);
      const formatted = formatParsedRequest(parsed);

      setOutput(formatted);
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to format this HTTP request.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleRequest);
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
      title="HTTP Request Formatter"
      description="Format raw HTTP requests, inspect headers, query parameters, request methods, and body data in your browser."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Raw HTTP Request
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleRequest}
          className="w-full min-h-[260px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a raw HTTP request copied from logs, debugging tools, proxies,
          or API testing notes.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={formatRequest} className="yoryantra-btn">
          Format Request
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
            Formatted Request
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
          {output || "Formatted HTTP request details will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting Raw HTTP Requests for API Debugging
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Raw HTTP requests are often copied from logs, proxies, API testing
            tools, browser debugging sessions, or server notes. They can contain
            request methods, paths, query parameters, headers, authentication
            values, and body data in one block of text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This HTTP Request Formatter helps you parse raw HTTP requests,
            separate headers from body content, inspect query parameters, and
            review API request details directly in your browser before using
            them in debugging or documentation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading HTTP Methods, Headers, and Request Bodies
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a raw HTTP request into the input box.</li>
            <li>
              Click <strong>Format Request</strong>.
            </li>
            <li>Review the method, path, protocol, headers, query values, and body.</li>
            <li>Copy the formatted output for debugging, notes, or API work.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common HTTP Request Formatter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Reading raw HTTP requests copied from server logs.</li>
            <li>Checking request headers during API debugging.</li>
            <li>Inspecting query parameters from a request path.</li>
            <li>Separating JSON body content from request metadata.</li>
            <li>Preparing cleaner request details for documentation or testing.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Raw HTTP Request
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleRequest}
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
                What does an HTTP request formatter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It reads a raw HTTP request and separates important parts such
                as the method, path, protocol, headers, query parameters, and
                request body into a cleaner format.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool format JSON request bodies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. If the request body contains valid JSON, the formatter will
                pretty-print it in the output so it is easier to read.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this validate whether the API request will work?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. This tool formats and parses the request text. It does not
                send the request or confirm whether the API endpoint will accept
                it.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is the HTTP request uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The HTTP request formatting happens directly in your
                browser. Your request content is not uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/http-request-formatter" />
        </div>
      </section>
    </ToolShell>
  );
}

function parseHttpRequest(source: string): ParsedRequest {
  const normalized = source.replace(/\r\n/g, "\n");
  const [headPart, ...bodyParts] = normalized.split(/\n\s*\n/);
  const body = bodyParts.join("\n\n").trim();
  const lines = headPart
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("Request content is empty.");
  }

  const requestLine = lines[0];
  const requestMatch = requestLine.match(/^([A-Z]+)\s+(\S+)(?:\s+(HTTP\/\d(?:\.\d)?))?$/i);

  if (!requestMatch) {
    throw new Error("The first line should look like: GET /path HTTP/1.1");
  }

  const method = requestMatch[1].toUpperCase();
  const path = requestMatch[2];
  const protocol = requestMatch[3] || "HTTP/1.1";
  const headers: Record<string, string> = {};

  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    const colonIndex = line.indexOf(":");

    if (colonIndex <= 0) {
      throw new Error(`Invalid header line: ${line}`);
    }

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    headers[key] = value;
  }

  return {
    method,
    path,
    protocol,
    headers,
    body,
    queryParams: parseQueryParams(path),
  };
}

function formatParsedRequest(request: ParsedRequest) {
  const output = [
    "HTTP request formatted.",
    "",
    `Method: ${request.method}`,
    `Path: ${request.path}`,
    `Protocol: ${request.protocol}`,
    "",
    "Headers:",
  ];

  const headerEntries = Object.entries(request.headers);

  if (headerEntries.length) {
    headerEntries.forEach(([key, value]) => {
      output.push(`  ${key}: ${value}`);
    });
  } else {
    output.push("  No headers found.");
  }

  output.push("");
  output.push("Query parameters:");

  if (request.queryParams.length) {
    request.queryParams.forEach((param) => {
      output.push(`  ${param.key}: ${param.value}`);
    });
  } else {
    output.push("  No query parameters found.");
  }

  output.push("");
  output.push("Body:");

  if (request.body) {
    output.push(formatBody(request.body));
  } else {
    output.push("  No body found.");
  }

  return output.join("\n");
}

function parseQueryParams(path: string) {
  const queryIndex = path.indexOf("?");

  if (queryIndex === -1) {
    return [];
  }

  const query = path.slice(queryIndex + 1);

  return query
    .split("&")
    .filter(Boolean)
    .map((part) => {
      const [key, ...valueParts] = part.split("=");

      return {
        key: decodeValue(key),
        value: decodeValue(valueParts.join("=")),
      };
    });
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

function decodeValue(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value;
  }
}
