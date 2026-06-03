"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatXML = () => {
    try {
      const parser = new DOMParser();

      const xml = parser.parseFromString(
        input,
        "application/xml"
      );

      const parserError =
        xml.getElementsByTagName(
          "parsererror"
        );

      if (parserError.length > 0) {
        setError(
          "Invalid XML. Please check your input."
        );

        setOutput("");
        return;
      }

      const formatted =
        formatXMLString(input);

      setOutput(formatted);
      setError("");
    } catch {
      setError(
        "Unable to format XML."
      );

      setOutput("");
    }
  };

  const formatXMLString = (
    xml: string
  ) => {
    const reg = /(>)(<)(\/*)/g;

    let formatted = "";
    let pad = 0;

    xml = xml.replace(
      reg,
      "$1\r\n$2$3"
    );

    xml
      .split("\r\n")
      .forEach((node) => {
        let indent = 0;

        if (
          node.match(/^<\/\w/)
        ) {
          if (pad > 0) {
            pad -= 1;
          }
        }

        for (
          let i = 0;
          i < pad;
          i++
        ) {
          indent += 2;
        }

        formatted +=
          " ".repeat(indent) +
          node +
          "\r\n";

        if (
          node.match(
            /^<\w([^>]*[^/])?>.*$/
          )
        ) {
          pad += 1;
        }
      });

    return formatted.trim();
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="XML Formatter"
      description="Format and beautify XML instantly with this free online XML Formatter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          XML Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste XML here..."
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={formatXML}
          className="yoryantra-btn"
        >
          Format XML
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
            Formatted XML
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output ||
            "Formatted XML will appear here..."}
        </pre>
      </div>

      {/* PRIVACY NOTE */}
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">
          Privacy Note
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          XML formatting and validation happen locally inside your browser.
          Your XML data is not uploaded, stored, or processed on any server.
        </p>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Formatting XML So Nested Tags Are Easier to Read
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML formatting helps organize messy XML documents into a clean,
            properly indented structure that is easier to inspect, debug,
            validate, and maintain during development workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML is still widely used in APIs, RSS feeds, SOAP services,
            configuration files, sitemaps, enterprise systems, integrations,
            Android manifests, and structured data workflows. Raw XML copied
            from APIs or applications often appears compressed into a single
            unreadable line.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This XML Formatter helps beautify nested tags instantly while also
            checking whether the XML structure is valid before formatting the
            output directly inside your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the XML Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Paste XML data into the editor.
            </li>

            <li>
              Click <strong>Format XML</strong>.
            </li>

            <li>
              Review the beautified XML structure instantly.
            </li>

            <li>
              Copy the formatted XML output for your project or workflow.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              Beautifying XML API responses for debugging.
            </li>

            <li>
              Formatting sitemap and RSS feed XML files.
            </li>

            <li>
              Organizing SOAP request and response data.
            </li>

            <li>
              Validating XML before deployment or integration.
            </li>

            <li>
              Improving readability for configuration files.
            </li>

            <li>
              Inspecting nested XML structures more easily.
            </li>

            <li>
              Debugging structured data workflows.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example XML Formatting
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <p className="font-medium text-gray-900">
              Before formatting:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`<users><user><name>Asha</name></user></users>`}
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              After formatting:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`<users>
  <user>
    <name>Asha</name>
  </user>
</users>`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why XML Formatting Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better readability:</strong> Proper indentation makes
                nested XML structures easier to inspect.
              </li>

              <li>
                <strong>Faster debugging:</strong> Structured XML helps identify
                broken tags and invalid nesting quickly.
              </li>

              <li>
                <strong>Cleaner integrations:</strong> Formatted XML simplifies
                API and system integration workflows.
              </li>

              <li>
                <strong>Improved maintenance:</strong> Readable XML documents are
                easier to update later.
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
                What is an XML Formatter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An XML Formatter organizes XML data into a properly indented and
                readable structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does formatting change XML content?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. XML formatting changes whitespace and indentation only while
                preserving the actual XML structure and data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this tool detect invalid XML?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The formatter validates XML structure before generating
                formatted output.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is XML still used in APIs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. XML is still widely used in SOAP APIs, RSS feeds,
                enterprise systems, sitemaps, and configuration files.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is XML formatting processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. XML formatting happens locally inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            XML formatting often connects with APIs, JSON workflows, structured
            data debugging, sitemap management, and backend integrations.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
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
              href="/tools/html-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              HTML Encoder Decoder
            </Link>

            <Link
              href="/tools/sql-formatter"
              className="yoryantra-btn-outline"
            >
              SQL Formatter
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