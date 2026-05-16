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

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This MIME Type Finder
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This MIME Type Finder helps you find common MIME types from file
            extensions instantly. It is useful for developers working with file
            uploads, APIs, HTTP headers, content delivery, and browser file
            handling.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            MIME types tell browsers and servers how to handle files such as
            JSON, images, PDFs, scripts, stylesheets, and media files.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking content types for HTTP responses.</li>
            <li>Debugging file upload validation.</li>
            <li>Setting correct response headers.</li>
            <li>Working with static assets and APIs.</li>
            <li>Finding MIME types for common file formats.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/http-headers-parser" className="yoryantra-btn-outline">
              HTTP Headers Parser
            </Link>

            <Link href="/tools/curl-command-builder" className="yoryantra-btn-outline">
              CURL Command Builder
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/url-query-params-parser" className="yoryantra-btn-outline">
              URL Query Params Parser
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}