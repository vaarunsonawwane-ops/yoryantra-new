"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

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
          placeholder={`Authorization: Bearer eyJhbGciOi...
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
  "name": "Yoryantra",
  "role": "developer"
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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Working With CURL Commands
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            CURL is one of the most widely used command-line tools for making
            HTTP requests and testing APIs. Developers often use CURL while
            debugging authentication systems, testing REST APIs, checking
            response headers, troubleshooting servers, and reproducing browser
            requests directly from the terminal.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Writing CURL commands manually can become repetitive when request
            headers, JSON payloads, authentication tokens, cookies, and custom
            methods are involved. This builder helps generate properly formatted
            CURL commands instantly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for API testing, backend development, debugging
            frontend requests, automation workflows, server troubleshooting, and
            sharing reproducible API examples.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the CURL Command Builder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Select the HTTP request method.</li>

            <li>
              Enter the API or request URL.
            </li>

            <li>
              Add request headers such as Authorization or Content-Type.
            </li>

            <li>
              Paste the request body for POST, PUT, or PATCH requests.
            </li>

            <li>
              Copy the generated CURL command for terminal usage.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Testing REST APIs directly from the terminal.</li>

            <li>Debugging authentication and bearer token requests.</li>

            <li>Reproducing browser API requests manually.</li>

            <li>Generating reusable API request examples.</li>

            <li>Working with JSON payloads and custom headers.</li>

            <li>Debugging CORS, cookies, and server responses.</li>

            <li>Sharing API examples during development workflows.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example CURL Command
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p>Generated command:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`curl -X POST "https://api.example.com/users" \\
  -H "Authorization: Bearer eyJhbGciOi..." \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Yoryantra","role":"developer"}'`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common CURL Request Parts
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>-X</strong> defines the HTTP method such as GET, POST,
                PUT, PATCH, or DELETE.
              </li>

              <li>
                <strong>-H</strong> adds request headers such as Authorization
                or Content-Type.
              </li>

              <li>
                <strong>-d</strong> sends request body data, commonly used with
                JSON APIs.
              </li>

              <li>
                <strong>URL</strong> specifies the API endpoint or resource
                being requested.
              </li>
            </ul>
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
                CURL is a command-line tool used to transfer data and make HTTP
                requests to APIs, servers, and web services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why use CURL commands for APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                CURL commands help developers test APIs, debug authentication
                flows, automate requests, reproduce browser traffic, and inspect
                server responses directly from the terminal.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support custom headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can include custom request headers such as
                Authorization, Content-Type, Cookie, Accept, and many others.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I generate POST requests with JSON data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can include JSON request bodies and generate POST,
                PUT, or PATCH CURL commands.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is CURL generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. CURL command generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/curl-command-builder" />
        </div>
      </section>
    </ToolShell>
  );
}