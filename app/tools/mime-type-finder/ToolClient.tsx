"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

const mimeTypes: Record<string, string> = {
  html: "text/html",
  css: "text/css",
  js: "application/javascript",
  json: "application/json",
  xml: "application/xml",
  txt: "text/plain",
  csv: "text/csv",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  webp: "image/webp",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  zip: "application/zip",
  gz: "application/gzip",
  wasm: "application/wasm",
};

export default function ToolClient() {
  const [extension, setExtension] = useState("");
  const [output, setOutput] = useState("");

  const findMimeType = () => {
    const cleaned = extension
      .trim()
      .replace(".", "")
      .toLowerCase();

    if (!cleaned) {
      setOutput("");
      return;
    }

    setOutput(
      mimeTypes[cleaned] ||
        "MIME type not found in common list."
    );
  };

  const resetAll = () => {
    setExtension("");
    setOutput("");
  };

  return (
    <ToolShell
      title="MIME Type Finder"
      description="Find MIME types by file extension instantly with this free online MIME Type Finder."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          File Extension
        </label>

        <input
          value={extension}
          onChange={(e) =>
            setExtension(e.target.value)
          }
          placeholder="json"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={findMimeType}
          className="yoryantra-btn"
        >
          Find MIME Type
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
            MIME Type Result
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output ||
            "MIME type result will appear here..."}
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Browsers Need MIME Types
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            MIME types help browsers, APIs, servers, CDNs, and applications
            understand what kind of content is being transferred. They tell
            browsers whether a file should be displayed as HTML, downloaded as
            a document, rendered as an image, executed as JavaScript, or parsed
            as JSON.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During development workflows, incorrect MIME types can cause broken
            scripts, failed API responses, rendering issues, blocked assets,
            download problems, and browser security errors. This finder helps
            quickly identify the correct Content-Type values for common file
            extensions.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool is useful for debugging HTTP response headers, configuring
            servers, validating uploads, working with APIs, CDN setups,
            frontend assets, and browser content handling directly inside your
            browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the MIME Type Finder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Enter a file extension into the input field.</li>

            <li>
              Click <strong>Find MIME Type</strong>.
            </li>

            <li>
              Review the detected MIME type for the file extension.
            </li>

            <li>
              Copy the MIME type for use in APIs, uploads, or HTTP headers.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking HTTP Content-Type response headers.</li>

            <li>Debugging file upload validation systems.</li>

            <li>Configuring CDN and server asset handling.</li>

            <li>Working with API response content types.</li>

            <li>Inspecting browser media rendering behavior.</li>

            <li>Finding MIME types for static frontend assets.</li>

            <li>Debugging download and file rendering issues.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example MIME Types
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`json → application/json
html → text/html
png → image/png
pdf → application/pdf
css → text/css
svg → image/svg+xml`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Content-Type Headers
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>application/json</strong> is commonly used for APIs and
                structured data responses.
              </li>

              <li>
                <strong>text/html</strong> tells browsers to render HTML pages.
              </li>

              <li>
                <strong>image/png</strong> identifies PNG image files.
              </li>

              <li>
                <strong>application/pdf</strong> is used for PDF documents and
                downloads.
              </li>

              <li>
                <strong>text/css</strong> identifies CSS stylesheet files.
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
                What is a MIME type?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A MIME type identifies the format and nature of content
                transferred between browsers, APIs, servers, and applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why are MIME types important?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Correct MIME types help browsers render files properly, improve
                security, support downloads, and ensure APIs return expected
                content formats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the Content-Type header?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The Content-Type HTTP header specifies the MIME type of a
                response body so browsers and applications know how the content
                should be processed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why do browsers block incorrect MIME types?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Browsers may block files with invalid MIME types to prevent
                security risks, rendering problems, or incorrect script
                execution.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is MIME type lookup processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. MIME type lookup happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            MIME type debugging often connects with HTTP headers, APIs, file
            uploads, browser rendering behavior, CDN configuration, and content
            delivery workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
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
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/http-status-code-explorer"
              className="yoryantra-btn-outline"
            >
              HTTP Status Code Explorer
            </Link>

            <Link
              href="/tools/redirect-checker"
              className="yoryantra-btn-outline"
            >
              Redirect Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}