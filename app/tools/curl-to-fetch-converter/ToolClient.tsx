"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

type ParsedCurl = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
};

const sampleCurl = `curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer token_here" \\
  -d '{"name":"Yoryantra","role":"developer"}'`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const convertCurl = () => {
    if (!input.trim()) {
      setError("Please enter a cURL command to convert.");
      setOutput("");
      return;
    }

    try {
      const parsed = parseCurlCommand(input);
      const fetchCode = generateFetchCode(parsed);

      setOutput(fetchCode);
      setError("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to convert this cURL command.";

      setError(message);
      setOutput("");
    }
  };

  const loadExample = () => {
    setInput(sampleCurl);
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
      title="CURL to Fetch Converter"
      description="Convert cURL commands to JavaScript fetch code for API requests, headers, methods, and body data."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          cURL Command
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={sampleCurl}
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste a cURL command copied from documentation, browser DevTools, or an API client.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertCurl} className="yoryantra-btn">
          Convert to Fetch
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
            JavaScript Fetch Code
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
          {output || "Converted fetch code will appear here."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting cURL Commands Into JavaScript Fetch Requests
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            cURL commands are often used in API documentation, terminal examples,
            browser DevTools, and backend debugging. When you need to use the
            same request in JavaScript, rewriting headers, request methods, and
            body data manually can take extra time.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This CURL to Fetch Converter helps you convert cURL commands into
            JavaScript fetch code, including common headers, HTTP methods,
            request bodies, JSON payloads, and API request values directly in
            your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preparing API Requests for Frontend or Node.js Code
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a cURL command into the input box.</li>
            <li>
              Click <strong>Convert to Fetch</strong>.
            </li>
            <li>Review the generated JavaScript fetch request.</li>
            <li>Copy the code and adjust tokens, URLs, or payload values if needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common cURL to Fetch Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting API documentation examples into JavaScript code.</li>
            <li>Turning browser DevTools cURL requests into fetch requests.</li>
            <li>Preparing frontend API calls from tested terminal commands.</li>
            <li>Checking request headers and JSON body values before coding.</li>
            <li>Creating quick fetch examples for debugging or testing APIs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example cURL Command
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{sampleCurl}
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
                What does a cURL to Fetch converter do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It converts a cURL command into JavaScript fetch code. This can
                include the URL, HTTP method, headers, and request body when the
                cURL command uses common options.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this convert headers and JSON body data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The converter supports common header options such as
                <strong> -H</strong> and body options such as
                <strong> -d</strong>, <strong> --data</strong>, and
                <strong> --data-raw</strong>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support every cURL option?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool focuses on common API request options used in everyday
                development. Advanced cURL features may need manual adjustment
                after conversion.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my cURL command uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The conversion happens directly in your browser. Your cURL
                command and generated fetch code are not uploaded to a server.
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
              href="/tools/curl-command-builder"
              className="yoryantra-btn-outline"
            >
              CURL Command Builder
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/http-headers-checker"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function parseCurlCommand(command: string): ParsedCurl {
  const tokens = tokenizeCurl(command.replace(/\\\n/g, " ").replace(/\r?\n/g, " "));

  if (!tokens.length || tokens[0].toLowerCase() !== "curl") {
    throw new Error("The command should start with curl.");
  }

  let url = "";
  let method = "";
  let body = "";
  const headers: Record<string, string> = {};

  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token === "-X" || token === "--request") {
      method = tokens[index + 1]?.toUpperCase() || "";
      index += 1;
      continue;
    }

    if (token.startsWith("-X") && token.length > 2) {
      method = token.slice(2).toUpperCase();
      continue;
    }

    if (token === "-H" || token === "--header") {
      const header = tokens[index + 1] || "";
      const colonIndex = header.indexOf(":");

      if (colonIndex > 0) {
        const key = header.slice(0, colonIndex).trim();
        const value = header.slice(colonIndex + 1).trim();

        headers[key] = value;
      }

      index += 1;
      continue;
    }

    if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary"
    ) {
      body = tokens[index + 1] || "";
      index += 1;
      continue;
    }

    if (token.startsWith("http://") || token.startsWith("https://")) {
      url = token;
    }
  }

  if (!url) {
    throw new Error("Could not find a URL in this cURL command.");
  }

  if (!method) {
    method = body ? "POST" : "GET";
  }

  return {
    url,
    method,
    headers,
    body,
  };
}

function generateFetchCode(parsed: ParsedCurl) {
  const headersCode = Object.keys(parsed.headers).length
    ? JSON.stringify(parsed.headers, null, 2)
    : "{}";

  const lines = [
    `const response = await fetch(${JSON.stringify(parsed.url)}, {`,
    `  method: ${JSON.stringify(parsed.method)},`,
  ];

  if (Object.keys(parsed.headers).length) {
    lines.push(`  headers: ${headersCode.replace(/\n/g, "\n  ")},`);
  }

  if (parsed.body) {
    lines.push(`  body: ${formatBody(parsed.body)},`);
  }

  lines.push("});");
  lines.push("");
  lines.push("const data = await response.json();");
  lines.push("console.log(data);");

  return lines.join("\n");
}

function formatBody(body: string) {
  const trimmed = body.trim();

  try {
    const parsed = JSON.parse(trimmed);
    return `JSON.stringify(${JSON.stringify(parsed, null, 2)})`;
  } catch {
    return JSON.stringify(trimmed);
  }
}

function tokenizeCurl(command: string) {
  const tokens: string[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let escaped = false;

  for (const char of command) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if ((char === "'" || char === '"') && !quote) {
      quote = char;
      continue;
    }

    if (char === quote) {
      quote = null;
      continue;
    }

    if (/\s/.test(char) && !quote) {
      if (current) {
        tokens.push(current);
        current = "";
      }

      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}
