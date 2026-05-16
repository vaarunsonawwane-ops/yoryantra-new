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
    const cleaned = extension.trim().replace(".", "").toLowerCase();

    if (!cleaned) {
      setOutput("");
      return;
    }

    setOutput(mimeTypes[cleaned] || "MIME type not found in common list.");
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
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          File Extension
        </label>

        <input
          value={extension}
          onChange={(e) => setExtension(e.target.value)}
          placeholder="json"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={findMimeType} className="yoryantra-btn">
          Find MIME Type
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            MIME Type Result
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

        <div className="yoryantra-output min-h-[140px] flex items-center text-sm break-words">
          {output || "MIME type result will appear here..."}
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
  {/* ABOUT */}
  <div>
    <h2 className="text-2xl font-semibold text-gray-900">
      What is MIME Type Finder?
    </h2>

    <p className="mt-4 text-gray-600 leading-relaxed">
      MIME Type Finder helps developers quickly identify MIME types
      from file extensions. It is useful for HTTP response headers, file
      uploads, APIs, CDN configuration, browser file handling, backend
      development, and content delivery workflows.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      MIME types, also known as media types or content types, tell
      browsers and servers how files should be interpreted and processed.
      Correct MIME types are important for security, browser rendering,
      downloads, API responses, and caching behavior.
    </p>

    <p className="mt-4 text-gray-600 leading-relaxed">
      This tool helps you quickly find common MIME types for web assets,
      documents, APIs, media files, scripts, and static resources
      directly inside your browser.
    </p>
  </div>

  {/* HOW TO USE */}
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
        Review the detected MIME type for the provided extension.
      </li>

      <li>
        Copy the MIME type for use in HTTP headers, uploads, or APIs.
      </li>
    </ol>
  </div>

  {/* COMMON USE CASES */}
  <div>
    <h2 className="text-xl font-semibold text-gray-900">
      Common Use Cases 
    </h2>

    <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
      <li>Checking Content-Type HTTP response headers.</li>

      <li>Debugging file upload validation systems.</li>

      <li>Configuring CDN and server file handling.</li>

      <li>Working with API response content types.</li>

      <li>Inspecting browser media handling behavior.</li>

      <li>Finding MIME types for static assets.</li>

      <li>Debugging download and rendering issues.</li>
    </ul>
  </div>

  {/* EXAMPLE */}
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
css → text/css`}
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
          What is a MIME type?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          A MIME type identifies the format and nature of a file or
          resource transferred over the internet. Browsers and servers
          use MIME types to determine how content should be handled.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Why are MIME types important?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          Correct MIME types help browsers render files properly,
          improve security, support downloads, and ensure APIs return
          expected content formats.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          What is the Content-Type header?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          The Content-Type HTTP header specifies the MIME type of a
          response body so browsers and applications know how to process
          the content.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Is MIME type lookup processed on the server?
        </h3>

        <p className="mt-2 text-gray-600 leading-relaxed">
          No. MIME type lookup happens directly inside your browser.
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
        href="/tools/ip-address-inspector"
        className="yoryantra-btn-outline"
      >
        IP Address Inspector
      </Link>

      <Link
        href="/tools/http-status-code-explorer"
        className="yoryantra-btn-outline"
      >
        HTTP Status Code Explorer
      </Link>
    </div>
  </div>
</section>
    </ToolShell>
  );
}