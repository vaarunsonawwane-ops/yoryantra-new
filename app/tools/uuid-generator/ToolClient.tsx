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
                navigator.clipboard.writeText(
                  uuid
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[160px] whitespace-pre-wrap break-words">
          {uuid ||
            "Generated UUID will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          UUID generation happens locally inside your browser using the built-in
          crypto API. No generated identifiers are uploaded or stored on any
          server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generating UUIDs for APIs, Databases, and Testing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            UUID generation helps developers create unique identifiers for
            databases, APIs, authentication systems, distributed applications,
            background jobs, sessions, testing workflows, and cloud-based
            systems.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            UUID stands for Universally Unique Identifier. UUID v4 values are
            randomly generated identifiers designed to have an extremely low
            probability of duplication, making them useful for modern software
            systems where globally unique IDs are required.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This UUID Generator creates random UUID v4 values instantly inside
            your browser without requiring server-side processing or external
            API calls.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the UUID Generator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Click <strong>Generate UUID</strong>.
            </li>

            <li>
              A random UUID v4 value will be created instantly.
            </li>

            <li>
              Copy the generated UUID using the copy button.
            </li>

            <li>
              Use the identifier inside APIs, databases, or development
              workflows.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Generating unique database record IDs.
            </li>

            <li>
              Creating API request identifiers and correlation IDs.
            </li>

            <li>
              Assigning session and authentication tokens.
            </li>

            <li>
              Building distributed applications and services.
            </li>

            <li>
              Testing software workflows with random identifiers.
            </li>

            <li>
              Creating unique resource references in cloud systems.
            </li>

            <li>
              Generating identifiers for logs and analytics events.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example UUID v4
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`550e8400-e29b-41d4-a716-446655440000`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why UUIDs Matter in Modern Applications
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Globally unique identifiers:</strong> UUIDs help reduce
                ID collision risks across systems and databases.
              </li>

              <li>
                <strong>Better scalability:</strong> Distributed applications can
                generate identifiers independently.
              </li>

              <li>
                <strong>API reliability:</strong> Unique request identifiers help
                debugging and tracing workflows.
              </li>

              <li>
                <strong>Flexible integration:</strong> UUIDs work across
                databases, services, cloud systems, and applications.
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
                What is a UUID?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A UUID is a Universally Unique Identifier used to uniquely
                identify records, users, sessions, requests, resources, and
                objects in software systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is UUID v4?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                UUID v4 is a randomly generated UUID format commonly used in
                APIs, databases, and modern applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are generated UUIDs truly unique?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                UUID v4 values are designed to have an extremely low probability
                of duplication, making them suitable for most applications.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this UUID Generator secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. UUIDs are generated locally using the browser crypto API
                without sending data to a server.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is UUID generation processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. UUID generation happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            UUID generation often connects with APIs, authentication systems,
            structured data workflows, backend debugging, and database
            development.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/jwt-decoder"
              className="yoryantra-btn-outline"
            >
              JWT Decoder
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
            </Link>

            <Link
              href="/tools/timestamp-converter"
              className="yoryantra-btn-outline"
            >
              Timestamp Converter
            </Link>

            <Link
              href="/tools/regex-tester"
              className="yoryantra-btn-outline"
            >
              Regex Tester
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}