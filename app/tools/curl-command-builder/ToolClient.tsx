"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [body, setBody] = useState("");

  const generatedCurl = useMemo(() => {
    if (!url.trim()) return "";

    let command = `curl -X ${method} "${url}"`;

    const headerLines = headers
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    headerLines.forEach((header) => {
      command += ` \\\n  -H "${header}"`;
    });

    if (body.trim()) {
      command += ` \\\n  -d '${body}'`;
    }

    return command;
  }, [method, url, headers, body]);

  const resetAll = () => {
    setMethod("GET");
    setUrl("");
    setHeaders("");
    setBody("");
  };

  return (
    <ToolShell
      title="CURL Command Builder"
      description="Build CURL commands for API requests instantly with this free online CURL Command Builder."
    >
      {/* METHOD + URL */}
      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            HTTP Method
          </label>

          <select
            value={method}
            onChange={(e) =>
              setMethod(e.target.value)
            }
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          >
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Request URL
          </label>

          <input
            type="url"
            value={url}
            onChange={(e) =>
              setUrl(e.target.value)
            }
            placeholder="https://api.example.com/users"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
        </div>
      </div>

      {/* HEADERS */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Headers
        </label>

        <textarea
          value={headers}
          onChange={(e) =>
            setHeaders(e.target.value)
          }
          placeholder={`Authorization: Bearer token
Content-Type: application/json`}
          className="w-full min-h-[140px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* BODY */}
      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Request Body
        </label>

        <textarea
          value={body}
          onChange={(e) =>
            setBody(e.target.value)
          }
          placeholder={`{
  "name": "Yoryantra"
}`}
          className="w-full min-h-[180px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={() =>
            navigator.clipboard.writeText(
              generatedCurl
            )
          }
          disabled={!generatedCurl}
          className="yoryantra-btn"
        >
          Copy CURL Command
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated CURL Command
          </h3>
        </div>

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {generatedCurl ||
            "Generated CURL command will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is CURL Command Builder?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CURL Command Builder helps you generate CURL commands for API
            requests instantly. It is useful for developers, backend engineers,
            API testing, debugging authentication flows, and command-line HTTP
            workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CURL is one of the most widely used command-line tools for making
            HTTP requests. This tool helps you quickly generate properly
            formatted CURL commands with methods, headers, and request bodies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CURL Command Builder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select the HTTP request method.</li>
            <li>Enter the API or request URL.</li>
            <li>Add request headers if needed.</li>
            <li>Paste the request body for POST or PUT requests.</li>
            <li>Copy the generated CURL command.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing REST APIs from the terminal.</li>
            <li>Debugging API authentication requests.</li>
            <li>Generating reusable CURL commands.</li>
            <li>Working with JSON API payloads.</li>
            <li>Sharing API request examples with teams.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example CURL Command
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`curl -X POST "https://api.example.com/users" \\
  -H "Authorization: Bearer token" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Yoryantra"}'`}
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
                What is CURL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CURL is a command-line tool used for transferring data and
                making HTTP requests to APIs and servers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why use CURL commands?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CURL commands are useful for API testing, automation, debugging,
                and backend development workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support request headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can include custom request headers such as
                Authorization and Content-Type.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is CURL generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. CURL command generation happens directly in your browser.
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
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/api-key-generator"
              className="yoryantra-btn-outline"
            >
              API Key Generator
            </Link>

            <Link
              href="/tools/jwt-signature-verifier"
              className="yoryantra-btn-outline"
            >
              JWT Signature Verifier
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
