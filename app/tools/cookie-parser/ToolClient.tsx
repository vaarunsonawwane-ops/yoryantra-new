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

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseCookies} className="yoryantra-btn">
          Parse Cookies
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

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

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
  {/* ABOUT */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">
      About This Cookie Parser
    </h2>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This Cookie Parser helps developers parse HTTP cookie headers into
      readable JSON instantly. It is useful for debugging authentication
      sessions, browser cookies, tracking systems, API requests, login
      workflows, and web application storage mechanisms.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      Cookies are commonly used to store session identifiers,
      authentication tokens, user preferences, analytics values, and
      browser state information. Long cookie headers can become difficult
      to inspect manually, especially during API debugging and browser
      development workflows.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This tool converts raw cookie strings into structured key-value
      pairs for easier analysis directly inside your browser.
    </p>
  </div>

  {/* HOW TO USE */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      How to Use the Cookie Parser
    </h2>

    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
      <li>Paste the HTTP cookie header into the input box.</li>

      <li>
        Click <strong>Parse Cookies</strong>.
      </li>

      <li>
        Review the parsed cookie values displayed in JSON format.
      </li>

      <li>
        Copy the parsed output for debugging or development workflows.
      </li>
    </ol>
  </div>

  {/* COMMON USE CASES */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Common Use Cases
    </h2>

    <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
      <li>Debugging authentication cookies and sessions.</li>

      <li>Inspecting browser cookie storage.</li>

      <li>Analyzing API request cookie headers.</li>

      <li>Reviewing tracking and analytics cookies.</li>

      <li>Formatting cookie strings into JSON.</li>

      <li>Testing session-based authentication systems.</li>

      <li>Inspecting encoded cookie values.</li>
    </ul>
  </div>

  {/* EXAMPLE */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Example Cookie Header
    </h2>

    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
      <pre className="whitespace-pre-wrap break-words">
{`session_id=abc123;
theme=dark;
user_id=42;
auth_token=jwt_token_here`}
      </pre>
    </div>
  </div>

  {/* FAQ */}
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
          websites to maintain sessions, authentication states, user
          preferences, analytics tracking, and application behavior.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Why parse cookie headers?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Cookie headers often contain multiple encoded values in a single
          string. Parsing them makes debugging and inspection much easier
          for developers and backend engineers.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Can this tool decode URL encoded cookie values?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Yes. The parser automatically decodes encoded cookie values
          where possible.
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

  {/* RELATED TOOLS */}
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