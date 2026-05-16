"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch {
      setError("Invalid JSON. Please check your input and try again.");
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
      title="JSON Minifier"
      description="Minify and compress JSON data instantly with this free online JSON Minifier."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          JSON Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={minifyJSON} className="yoryantra-btn">
          Minify JSON
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Minified Output
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Minified JSON output will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is JSON Minifier?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            JSON Minifier helps you compress JSON data by removing
            unnecessary spaces, line breaks, and indentation. Minified JSON is
            useful when sending data through APIs, storing configuration files,
            reducing payload size, or preparing JSON for production use.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool also validates your JSON before minifying it. If the input
            contains syntax errors, you will see an error message instead of an
            incorrect output.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the JSON Minifier
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste your JSON data into the input box.</li>
            <li>Click <strong>Minify JSON</strong>.</li>
            <li>Review the compressed JSON output.</li>
            <li>Copy the minified JSON for use in your project.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Reducing JSON size for API requests and responses.</li>
            <li>Preparing JSON files for production deployment.</li>
            <li>Compressing configuration data.</li>
            <li>Removing formatting from copied JSON data.</li>
            <li>Validating JSON before using it in code.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Before minifying:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "name": "Yoryantra",
  "type": "Developer Tools",
  "active": true
}`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              After minifying:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{"name":"Yoryantra","type":"Developer Tools","active":true}`}
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
                What does JSON minify mean?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Minifying JSON means removing unnecessary whitespace, line
                breaks, and indentation while keeping the actual data unchanged.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does minifying JSON change the data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON minification only changes the formatting. The keys,
                values, arrays, and objects remain the same.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this JSON Minifier secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The minification runs directly in your browser. Your JSON
                data is not uploaded to a server.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool detect invalid JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. If your JSON has a syntax error, the tool will show an
                invalid JSON message instead of generating output.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/html-encoder-decoder" className="yoryantra-btn-outline">
              HTML Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
