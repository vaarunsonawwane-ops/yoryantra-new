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
      const xml = parser.parseFromString(input, "application/xml");

      const parserError =
        xml.getElementsByTagName("parsererror");

      if (parserError.length > 0) {
        setError("Invalid XML. Please check your input.");
        setOutput("");
        return;
      }

      const formatted = formatXMLString(input);

      setOutput(formatted);
      setError("");
    } catch {
      setError("Unable to format XML.");
      setOutput("");
    }
  };

  const formatXMLString = (xml: string) => {
    const reg = /(>)(<)(\/*)/g;

    let formatted = "";
    let pad = 0;

    xml = xml.replace(reg, "$1\r\n$2$3");

    xml.split("\r\n").forEach((node) => {
      let indent = 0;

      if (node.match(/^<\/\w/)) {
        if (pad > 0) {
          pad -= 1;
        }
      }

      for (let i = 0; i < pad; i++) {
        indent += 2;
      }

      formatted +=
        " ".repeat(indent) + node + "\r\n";

      if (
        node.match(/^<\w([^>]*[^/])?>.*$/)
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
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste XML here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
        <p className="mt-4 text-sm font-medium text-red-500">
          {error}
        </p>
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
                navigator.clipboard.writeText(output)
              }
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {output || "Formatted XML will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is XML Formatter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            XML Formatter helps you beautify and organize XML data
            into a clean and readable structure. Properly formatted XML
            makes debugging, editing, and reviewing structured data much
            easier during development workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool also validates XML structure before formatting and
            displays an error if invalid XML is detected.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the XML Formatter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste XML data into the input box.</li>
            <li>Click <strong>Format XML</strong>.</li>
            <li>Review the beautified XML output.</li>
            <li>Copy the formatted XML for your project.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Beautifying XML API responses.</li>
            <li>Formatting XML configuration files.</li>
            <li>Improving XML readability for debugging.</li>
            <li>Reviewing structured XML documents.</li>
            <li>Validating XML syntax before use.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
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
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is an XML Formatter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                An XML Formatter organizes XML data into properly indented
                and readable structure for easier editing and debugging.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does formatting change XML data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Formatting only changes whitespace and indentation.
                The XML content itself remains unchanged.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this XML Formatter secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Formatting happens directly in your browser.
                Your XML data is not uploaded anywhere.
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

            <Link href="/tools/json-minifier" className="yoryantra-btn-outline">
              JSON Minifier
            </Link>

            <Link href="/tools/sql-formatter" className="yoryantra-btn-outline">
              SQL Formatter
            </Link>

            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">
              Regex Tester
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
