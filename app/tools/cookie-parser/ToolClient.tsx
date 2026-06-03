"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseCookies = () => {
    try {
      if (!input.trim()) {
        setError("Please enter cookie header content.");
        setOutput("");
        return;
      }

      const parsed: Record<string, string> = {};

      input.split(";").forEach((cookie) => {
        const index = cookie.indexOf("=");

        if (index === -1) return;

        const key = cookie.slice(0, index).trim();
        const value = cookie.slice(index + 1).trim();

        parsed[key] = decodeURIComponent(value);
      });

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Unable to parse cookie header.");
      setOutput("");
    }
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="Cookie Parser"
      description="Parse HTTP cookies into readable key-value pairs instantly with this free online Cookie Parser."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Cookie Header
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="session_id=abc123; theme=dark; user_id=42"
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseCookies} className="yoryantra-btn">
          Parse Cookies
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Parsed Cookies
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

        <div className="yoryantra-output min-h-[200px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output || "Parsed cookie output will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding HTTP Cookies
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            HTTP cookies help websites remember sessions, authentication
            states, user preferences, analytics data, shopping carts, and other
            browser-related information. Modern websites and APIs often rely on
            cookies for login systems and session management.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During debugging workflows, cookie headers can become difficult to
            inspect manually because multiple values are packed into a single
            string. This parser converts raw cookie headers into structured
            key-value pairs so they are easier to read, analyze, and debug.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool works entirely inside your browser and is useful for API
            testing, authentication debugging, browser inspection, frontend
            development, and session troubleshooting.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Cookie Parser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Copy the cookie header from your browser or API request.</li>

            <li>
              Paste the cookie string into the input box.
            </li>

            <li>
              Click <strong>Parse Cookies</strong>.
            </li>

            <li>
              Review the parsed cookie values in structured JSON format.
            </li>

            <li>
              Copy the parsed output for debugging or development workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Debugging login sessions and authentication systems.</li>

            <li>Inspecting browser cookie storage and session values.</li>

            <li>Analyzing cookies used in API requests and responses.</li>

            <li>Reviewing analytics and tracking cookie values.</li>

            <li>Debugging JWT-based authentication workflows.</li>

            <li>Inspecting URL encoded cookie values.</li>

            <li>Testing session-based applications and dashboards.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Cookie Header
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p>Raw cookie header:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`session_id=abc123;
theme=dark;
logged_in=true;
csrftoken=x7a91d;
auth_token=eyJhbGciOi...`}
            </pre>

            <p className="mt-4">Parsed output:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "session_id": "abc123",
  "theme": "dark",
  "logged_in": "true",
  "csrftoken": "x7a91d",
  "auth_token": "eyJhbGciOi..."
}`}
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
                What are HTTP cookies?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                HTTP cookies are small pieces of data stored by browsers and
                websites to maintain sessions, remember users, manage
                authentication, store preferences, and track browser behavior.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why inspect cookie headers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Developers often inspect cookies while debugging login systems,
                authentication flows, session handling, analytics tracking, and
                API requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool decode URL encoded cookie values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The parser automatically decodes URL encoded cookie values
                when possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Where can I copy cookie headers from?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Cookie headers can be copied from browser DevTools, network
                inspectors, API clients, server logs, or debugging tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is cookie parsing processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. All cookie parsing happens directly inside your browser.
                Your cookie data is never uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Cookie debugging often connects with authentication headers, JWT
            tokens, browser requests, CORS configuration, and API session
            handling.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/cors-header-checker"
              className="yoryantra-btn-outline"
            >
              CORS Header Checker
            </Link>

            <Link
              href="/tools/user-agent-parser"
              className="yoryantra-btn-outline"
            >
              User Agent Parser
            </Link>

            <Link
              href="/tools/url-query-params-parser"
              className="yoryantra-btn-outline"
            >
              URL Query Params Parser
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}