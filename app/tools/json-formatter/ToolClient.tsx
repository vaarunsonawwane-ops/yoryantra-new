"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);

      const formatted = JSON.stringify(parsed, null, 2);

      setOutput(formatted);
      setError("");
    } catch {
      setError("Invalid JSON format.");
      setOutput("");
    }
  };

  return (
    <ToolShell
      title="JSON Formatter"
      description="Format, validate, beautify, and organize JSON instantly with this free online JSON formatter."
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

        <button
          onClick={formatJSON}
          className="yoryantra-btn"
        >
          Format JSON
        </button>

        <button
          onClick={() => {
            setInput("");
            setOutput("");
            setError("");
          }}
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
            Formatted Output
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
          {output || "Formatted JSON output will appear here..."}
        </pre>

      </div>

      {/* SEO CONTENT */}
		<div className="mt-10 border-t border-gray-200 pt-8 space-y-10">

	  {/* ABOUT */}
	  <section>

		<h2 className="text-2xl font-semibold text-gray-900">
		  About JSON Formatter
		</h2>

		<p className="mt-4 text-gray-600 leading-relaxed">
		  JSON Formatter is a tool that helps clean, validate, and organize
		  cluttered JSON data into a readable format for debugging, APIs,
		  configuration files, and everyday development workflows.
		  It is useful for developers working with structured data,
		  API responses, and formatted JSON output.
		</p>

	  </section>

	  {/* HOW TO USE */}
	  <section>

		<h2 className="text-2xl font-semibold text-gray-900">
		  How to Use JSON Formatter
		</h2>

		<div className="mt-4 space-y-3 text-gray-600 leading-relaxed">

		  <p>
			1. Paste your JSON data into the input box.
		  </p>

		  <p>
			2. Click the Format JSON button.
		  </p>

		  <p>
			3. If the JSON is valid, the formatted output will appear below.
		  </p>

		  <p>
			4. Use Copy to quickly copy the formatted JSON output.
		  </p>

		</div>

	  </section>

	  {/* USE CASES */}
	  <section>

		<h2 className="text-2xl font-semibold text-gray-900">
		  Common Use Cases
		</h2>

		<ul className="mt-4 space-y-3 text-gray-600 leading-relaxed list-disc pl-6">

		  <li>
			Beautifying API responses for easier reading.
		  </li>

		  <li>
			Checking whether JSON data is valid or broken.
		  </li>

		  <li>
			Formatting configuration files before editing.
		  </li>

		  <li>
			Debugging structured data used in web applications.
		  </li>

		  <li>
			Cleaning cluttered JSON data copied from logs, APIs,
			or developer tools.
		  </li>

		</ul>

	  </section>

	  {/* FAQ */}
	  <section>

		<h2 className="text-2xl font-semibold text-gray-900">
		  Frequently Asked Questions
		</h2>

		<div className="mt-5 space-y-6">

		  <div>

			<h3 className="font-semibold text-gray-900">
			  What is a JSON Formatter?
			</h3>

			<p className="mt-2 text-gray-600 leading-relaxed">
			  A JSON Formatter converts compact or unorganized JSON
			  into a clean, readable, and properly indented structure.
			</p>

		  </div>

		  <div>

			<h3 className="font-semibold text-gray-900">
			  Does this tool validate JSON?
			</h3>

			<p className="mt-2 text-gray-600 leading-relaxed">
			  Yes. If your JSON contains syntax errors or invalid formatting,
			  the tool will show an error instead of formatting the output.
			</p>

		  </div>

		  <div>

			<h3 className="font-semibold text-gray-900">
			  Is my JSON data uploaded to a server?
			</h3>

			<p className="mt-2 text-gray-600 leading-relaxed">
			  No. All JSON formatting and validation happens directly
			  inside your browser. Your data is not uploaded or stored anywhere.
			</p>

		  </div>

    </div>

  </section>

</div>

      </div>

    </ToolShell>
  );
}