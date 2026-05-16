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

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={parseQueryParams} className="yoryantra-btn">
          Parse Query Params
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

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
  {/* ABOUT */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">
      About This URL Query Params Parser
    </h2>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This URL Query Params Parser helps developers extract and analyze
      URL query parameters instantly. It is useful for debugging API
      requests, UTM tracking links, search URLs, redirects, analytics
      parameters, frontend routing, and marketing campaign URLs.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      Query parameters are commonly used to pass dynamic values inside
      URLs. These values may include search filters, pagination data,
      authentication tokens, campaign tracking parameters, or API request
      inputs.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This tool converts long query strings into readable JSON format for
      easier inspection, debugging, and development workflows directly in
      your browser.
    </p>
  </div>

  {/* HOW TO USE */}
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
        Review the extracted query parameters in JSON format.
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
      <li>Parsing UTM marketing campaign links.</li>

      <li>Debugging frontend routing parameters.</li>

      <li>Inspecting API request query strings.</li>

      <li>Reviewing search and filter URLs.</li>

      <li>Converting query parameters into JSON.</li>

      <li>Analyzing redirect and tracking links.</li>

      <li>Inspecting authentication or callback URLs.</li>
    </ul>
  </div>

  {/* EXAMPLE */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Example Query String
    </h2>

    <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
      <pre className="whitespace-pre-wrap break-words">
{`https://example.com/products?
utm_source=google&
utm_campaign=summer_sale&
page=2&
sort=price`}
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
          What are URL query parameters?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          URL query parameters are key-value pairs appended to URLs after
          the question mark symbol. They are commonly used to pass data,
          filters, tracking information, and dynamic request values.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Why parse query strings?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Long URLs can become difficult to inspect manually. Parsing
          query strings makes debugging and analyzing URL parameters much
          easier.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Can this tool parse full URLs?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Yes. You can paste either a full URL or only the query string.
          The parser automatically extracts the query parameters.
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

  {/* RELATED TOOLS */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Related Tools
    </h2>

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