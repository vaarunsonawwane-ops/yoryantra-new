"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const parseQueryParams = () => {
    try {
      if (!input.trim()) {
        setError("Please enter a URL or query string.");
        setOutput("");
        return;
      }

      let query = input.trim();

      if (query.includes("?")) {
        query = query.split("?")[1];
      }

      const params = new URLSearchParams(query);
      const parsed: Record<string, string> = {};

      params.forEach((value, key) => {
        parsed[key] = value;
      });

      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Unable to parse query parameters.");
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
      title="URL Query Params Parser"
      description="Parse URL query parameters instantly with this free online URL Query Params Parser."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          URL or Query String
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com?utm_source=google&utm_campaign=test"
          className="w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseQueryParams} className="yoryantra-btn">
          Parse Query Params
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
            Parsed Query Parameters
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
          {output || "Parsed query parameters will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Understanding URL Query Parameters
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            URL query parameters are values appended to URLs after the question
            mark symbol. Websites, APIs, analytics platforms, search systems,
            authentication flows, and frontend applications often use query
            strings to pass dynamic request data.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During debugging workflows, long URLs containing tracking values,
            filters, pagination data, tokens, redirects, and campaign
            parameters can become difficult to inspect manually. This parser
            converts query strings into structured JSON for easier analysis.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for API debugging, frontend routing inspection,
            UTM tracking analysis, redirect troubleshooting, and browser-based
            development workflows directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the URL Query Params Parser
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a full URL or query string into the input box.</li>

            <li>
              Click <strong>Parse Query Params</strong>.
            </li>

            <li>
              Review the extracted query parameters in structured JSON format.
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
            <li>Parsing UTM marketing and analytics tracking links.</li>

            <li>Debugging frontend routing and redirect parameters.</li>

            <li>Inspecting API request query strings.</li>

            <li>Reviewing pagination, sorting, and filtering URLs.</li>

            <li>Analyzing OAuth callback and authentication URLs.</li>

            <li>Converting long query strings into readable JSON.</li>

            <li>Inspecting tracking links copied from ads or campaigns.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Query String
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p>URL with query parameters:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`https://example.com/products?
utm_source=google&
utm_campaign=summer_sale&
page=2&
sort=price`}
            </pre>

            <p className="mt-4">Parsed result:</p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "utm_source": "google",
  "utm_campaign": "summer_sale",
  "page": "2",
  "sort": "price"
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common URL Query Parameters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>utm_source</strong> identifies where traffic originated.
              </li>

              <li>
                <strong>utm_campaign</strong> tracks marketing campaigns and ads.
              </li>

              <li>
                <strong>page</strong> is commonly used for pagination.
              </li>

              <li>
                <strong>sort</strong> controls sorting behavior in search or product listings.
              </li>

              <li>
                <strong>token</strong> is often used in authentication or callback URLs.
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
                What are URL query parameters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Query parameters are key-value pairs appended to URLs that help
                websites and APIs pass dynamic request data such as filters,
                tracking values, tokens, search queries, or pagination details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why inspect query strings?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Developers inspect query strings while debugging APIs,
                redirects, frontend routing, analytics tracking, authentication
                callbacks, and search filtering systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool parse full URLs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. You can paste either a complete URL or only the query
                string. The parser automatically extracts the query parameters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this support URL encoded values?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Encoded query parameter values are automatically decoded
                when possible.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is query parameter parsing processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. All parsing happens directly inside your browser. Your URLs
                and query parameters are never uploaded to a server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Query parameter debugging often connects with redirects, API
            requests, HTTP headers, tracking links, cookies, and frontend
            routing workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/url-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/http-headers-parser"
              className="yoryantra-btn-outline"
            >
              HTTP Headers Parser
            </Link>

            <Link
              href="/tools/curl-command-builder"
              className="yoryantra-btn-outline"
            >
              CURL Command Builder
            </Link>

            <Link
              href="/tools/cookie-parser"
              className="yoryantra-btn-outline"
            >
              Cookie Parser
            </Link>

            <Link
              href="/tools/cors-header-checker"
              className="yoryantra-btn-outline"
            >
              CORS Header Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}