"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [uuid, setUuid] = useState("");

  const generateUUID = () => {
    const value = crypto.randomUUID();
    setUuid(value);
  };

  const resetAll = () => {
    setUuid("");
  };

  return (
    <ToolShell
      title="UUID Generator"
      description="Generate random UUID v4 values instantly with this free online UUID Generator."
    >
      {/* ACTIONS */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={generateUUID}
          className="yoryantra-btn"
        >
          Generate UUID
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
            Generated UUID
          </h3>

          {uuid && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(uuid)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[140px] whitespace-pre-wrap break-words">
          {uuid || "Generated UUID will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            About This UUID Generator
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This UUID Generator helps you instantly generate random UUID v4
            identifiers directly in your browser. UUIDs are commonly used in
            databases, APIs, authentication systems, distributed applications,
            and software development workflows where unique identifiers are
            required.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            UUID stands for Universally Unique Identifier. A UUID v4 is randomly
            generated and designed to provide a very low chance of duplication.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the UUID Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Click the <strong>Generate UUID</strong> button.</li>
            <li>A random UUID v4 value will be created instantly.</li>
            <li>Copy the UUID using the copy button.</li>
            <li>Use it in your application, database, or workflow.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Generating unique database IDs.</li>
            <li>Creating API request identifiers.</li>
            <li>Assigning unique session or user tokens.</li>
            <li>Building distributed systems and applications.</li>
            <li>Testing software workflows with unique values.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example UUID
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <pre className="whitespace-pre-wrap break-words">
              550e8400-e29b-41d4-a716-446655440000
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
                What is a UUID?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A UUID is a Universally Unique Identifier used to uniquely
                identify records, sessions, users, or resources in software
                systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is UUID v4?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                UUID v4 is a randomly generated UUID format commonly used in
                modern applications and APIs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are generated UUIDs unique?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                UUID v4 values are designed to have an extremely low probability
                of duplication.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this UUID Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. UUIDs are generated directly in your browser using the
                built-in crypto API.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/jwt-decoder" className="yoryantra-btn-outline">
              JWT Decoder
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="yoryantra-btn-outline">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/timestamp-converter" className="yoryantra-btn-outline">
              Timestamp Converter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}