"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] =
    useState("");

  const [output, setOutput] =
    useState("");

  const [error, setError] =
    useState("");

  const xmlToJson = () => {
    try {
      const parser =
        new DOMParser();

      const xmlDoc =
        parser.parseFromString(
          input,
          "application/xml"
        );

      const parserError =
        xmlDoc.getElementsByTagName(
          "parsererror"
        )[0];

      if (parserError) {
        throw new Error(
          "Invalid XML input."
        );
      }

      const xmlToObject = (
        node: Element
      ): any => {
        const obj: Record<
          string,
          any
        > = {};

        if (
          node.children.length === 0
        ) {
          return node.textContent;
        }

        Array.from(
          node.children
        ).forEach((child) => {
          const childObj =
            xmlToObject(child);

          if (
            obj[child.nodeName]
          ) {
            if (
              !Array.isArray(
                obj[
                  child.nodeName
                ]
              )
            ) {
              obj[
                child.nodeName
              ] = [
                obj[
                  child.nodeName
                ],
              ];
            }

            obj[
              child.nodeName
            ].push(childObj);
          } else {
            obj[
              child.nodeName
            ] = childObj;
          }
        });

        return obj;
      };

      const result = {
        [
          xmlDoc.documentElement
            .nodeName
        ]: xmlToObject(
          xmlDoc.documentElement
        ),
      };

      setOutput(
        JSON.stringify(
          result,
          null,
          2
        )
      );

      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Unable to convert XML to JSON."
        );
      }

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
      title="XML to JSON Converter"
      description="Convert XML into readable JSON instantly with this free online XML to JSON Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          XML Input
        </label>

        <textarea
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          placeholder="Paste XML here..."
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={xmlToJson}
          className="yoryantra-btn"
        >
          Convert to JSON
        </button>

        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 overflow-auto">
          {error}
        </div>
      )}

      {/* OUTPUT */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            JSON Output
          </h3>

          {output && (
            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  output
                )
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <div className="yoryantra-output min-h-[220px] text-sm whitespace-pre-wrap break-words overflow-auto">
          {output ||
            "Converted JSON output will appear here..."}
        </div>
      </div>

      {/* PRIVACY */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          XML to JSON conversion happens locally inside your browser. Your XML
          feeds, API responses, and structured data are not uploaded, stored, or
          processed on any external server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting XML Responses Into JSON for API Work
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML to JSON conversion helps developers transform XML API responses,
            enterprise feeds, configuration files, SOAP payloads, RSS feeds,
            structured documents, and legacy system outputs into readable JSON
            format for modern applications and APIs.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML is commonly used in enterprise systems, banking systems,
            configuration management, feeds, and older integrations, while JSON
            is preferred in modern APIs, JavaScript applications, frontend
            systems, and backend services.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This XML to JSON Converter transforms structured XML directly inside
            your browser without requiring backend processing or external APIs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the XML to JSON Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste your XML content
              into the editor.
            </li>

            <li>
              Click{" "}
              <strong>
                Convert to JSON
              </strong>.
            </li>

            <li>
              Review the generated
              JSON output instantly.
            </li>

            <li>
              Copy the converted JSON
              if needed.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Converting XML API
              responses into JSON.
            </li>

            <li>
              Transforming enterprise
              XML feeds for modern
              applications.
            </li>

            <li>
              Working with SOAP and
              legacy integrations.
            </li>

            <li>
              Converting XML
              configuration data.
            </li>

            <li>
              Testing XML and JSON
              interoperability.
            </li>

            <li>
              Debugging structured API
              payloads.
            </li>

            <li>
              Modernizing older XML
              workflows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example XML to JSON Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              XML input:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`<tool>
  <name>Yoryantra</name>
</tool>`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              JSON output:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`{
  "tool": {
    "name": "Yoryantra"
  }
}`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why XML to JSON Conversion Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>
                  Modern API workflows:
                </strong>{" "}
                JSON is easier to use in
                frontend and backend
                applications.
              </li>

              <li>
                <strong>
                  Cleaner debugging:
                </strong>{" "}
                Structured JSON is often
                easier to inspect than
                XML.
              </li>

              <li>
                <strong>
                  Better interoperability:
                </strong>{" "}
                Convert legacy XML
                systems into modern data
                workflows.
              </li>

              <li>
                <strong>
                  Easier development:
                </strong>{" "}
                JSON integrates naturally
                with JavaScript and API
                ecosystems.
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
                What is XML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                XML is a structured markup language commonly used for enterprise
                systems, feeds, integrations, and configuration workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why convert XML to JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON is easier to work with in modern APIs, JavaScript
                applications, and structured web development workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool validate XML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Invalid XML structures display an error during conversion.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. XML to JSON conversion is commonly used while debugging
                APIs, SOAP services, integrations, and enterprise systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is conversion processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. XML to JSON conversion happens entirely inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            XML conversion often connects with API debugging, structured data
            workflows, enterprise integrations, configuration management, and
            backend development.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/xml-formatter"
              className="yoryantra-btn-outline"
            >
              XML Formatter
            </Link>

            <Link
              href="/tools/json-formatter"
              className="yoryantra-btn-outline"
            >
              JSON Formatter
            </Link>

            <Link
              href="/tools/json-validator"
              className="yoryantra-btn-outline"
            >
              JSON Validator
            </Link>

            <Link
              href="/tools/json-to-yaml-converter"
              className="yoryantra-btn-outline"
            >
              JSON to YAML Converter
            </Link>

            <Link
              href="/tools/json-diff-checker"
              className="yoryantra-btn-outline"
            >
              JSON Diff Checker
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}