"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const toUpperCase = () => {
    setOutput(input.toUpperCase());
  };

  const toLowerCase = () => {
    setOutput(input.toLowerCase());
  };

  const toTitleCase = () => {
    const result = input.replace(
      /\w\S*/g,
      (txt) =>
        txt.charAt(0).toUpperCase() +
        txt.slice(1).toLowerCase()
    );

    setOutput(result);
  };

  const toSentenceCase = () => {
    const result =
      input.charAt(0).toUpperCase() +
      input.slice(1).toLowerCase();

    setOutput(result);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolShell
      title="Text Case Converter"
      description="Convert text into uppercase, lowercase, title case, and sentence case instantly with this free online Text Case Converter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={toUpperCase}
          className="yoryantra-btn"
        >
          UPPERCASE
        </button>

        <button
          onClick={toLowerCase}
          className="yoryantra-btn-outline"
        >
          lowercase
        </button>

        <button
          onClick={toTitleCase}
          className="yoryantra-btn-outline"
        >
          Title Case
        </button>

        <button
          onClick={toSentenceCase}
          className="yoryantra-btn-outline"
        >
          Sentence case
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
            Converted Output
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
          {output || "Converted text will appear here..."}
        </pre>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Text Case Converter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Text Case Converter helps you quickly transform text into
            uppercase, lowercase, title case, and sentence case formats.
            It is useful for editing documents, formatting headings,
            improving readability, writing content, and managing text for
            websites or social media.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Instead of manually retyping text, you can instantly convert
            large blocks of text into the format you need with a single click.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Text Case Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste or type your text into the input area.</li>
            <li>Select the case format you want to apply.</li>
            <li>Review the converted output instantly.</li>
            <li>Copy the result for use anywhere.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Available Text Formats
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>UPPERCASE</strong> converts all letters into capital letters.</li>
            <li><strong>lowercase</strong> converts all letters into small letters.</li>
            <li><strong>Title Case</strong> capitalizes the first letter of every word.</li>
            <li><strong>Sentence case</strong> capitalizes only the beginning of the sentence.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting blog titles and headings.</li>
            <li>Converting copied text into readable formats.</li>
            <li>Preparing social media captions.</li>
            <li>Editing documentation and articles.</li>
            <li>Improving consistency in written content.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Original text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              welcome to yoryantra tools
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Title Case:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              Welcome To Yoryantra Tools
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
                What is a text case converter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A text case converter is a tool that changes text formatting
                between uppercase, lowercase, title case, and sentence case.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is title case?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Title case capitalizes the first letter of each word, commonly
                used for headings and titles.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is sentence case?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Sentence case capitalizes only the first letter of the sentence
                while keeping the remaining text lowercase.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Text Case Converter secure?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Everything runs directly in your browser. Your text is not
                uploaded to any server.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/slug-generator" className="yoryantra-btn-outline">
              Slug Generator
            </Link>

            <Link href="/tools/word-counter" className="yoryantra-btn-outline">
              Word Counter
            </Link>

            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">
              Regex Tester
            </Link>

            <Link href="/tools/url-encoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
