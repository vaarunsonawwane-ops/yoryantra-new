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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Changing Text Case Without Rewriting Everything
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Text case conversion helps writers, marketers, students,
            developers, and editors quickly format content without manually
            retyping everything. Different case formats are commonly used for
            headings, blog titles, documentation, social media captions,
            product names, SEO content, and publishing workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During content editing, inconsistent capitalization can reduce
            readability and create formatting issues across websites, articles,
            presentations, and UI content. This Text Case Converter helps
            instantly transform text into uppercase, lowercase, title case, and
            sentence case formats.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool works directly inside your browser and helps simplify text
            formatting while editing blogs, metadata, documentation, landing
            pages, and marketing content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Text Case Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste or type your text into the editor.</li>

            <li>
              Select the text case format you want to apply.
            </li>

            <li>
              Review the converted output instantly.
            </li>

            <li>
              Copy the formatted text for use anywhere.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Available Text Case Formats
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              <strong>UPPERCASE</strong> converts all letters into capital
              letters.
            </li>

            <li>
              <strong>lowercase</strong> converts all letters into small
              letters.
            </li>

            <li>
              <strong>Title Case</strong> capitalizes the first letter of every
              word.
            </li>

            <li>
              <strong>Sentence case</strong> capitalizes the beginning of the
              sentence while keeping remaining text lowercase.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Formatting blog titles and headings.</li>

            <li>Converting copied text into readable formats.</li>

            <li>Preparing social media captions and posts.</li>

            <li>Editing documentation and articles.</li>

            <li>Improving content formatting consistency.</li>

            <li>Creating properly formatted SEO metadata.</li>

            <li>Formatting UI text and landing page content.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Text Case Conversion
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
            Why Text Formatting Matters
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Better readability:</strong> Proper capitalization makes
                content easier to scan and understand.
              </li>

              <li>
                <strong>Improved consistency:</strong> Matching formatting
                styles creates cleaner content presentation.
              </li>

              <li>
                <strong>Professional appearance:</strong> Structured formatting
                improves content quality across websites and documents.
              </li>

              <li>
                <strong>Faster editing:</strong> Bulk case conversion saves time
                during content workflows.
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
                What is a text case converter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A text case converter changes text formatting between
                uppercase, lowercase, title case, and sentence case styles.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is title case?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Title case capitalizes the first letter of each word and is
                commonly used for headings and titles.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is sentence case?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Sentence case capitalizes only the beginning of a sentence while
                keeping the remaining text lowercase.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Text Case Converter useful for content writing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Writers, marketers, bloggers, and SEO professionals often
                use text case conversion while editing content and metadata.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is text conversion processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Text formatting happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Text formatting often connects with slug generation, content
            editing, SEO optimization, word counting, and publishing workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/slug-generator"
              className="yoryantra-btn-outline"
            >
              Slug Generator
            </Link>

            <Link
              href="/tools/word-counter"
              className="yoryantra-btn-outline"
            >
              Word Counter
            </Link>

            <Link
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>

            <Link
              href="/tools/url-encoder"
              className="yoryantra-btn-outline"
            >
              URL Encoder Decoder
            </Link>

            <Link
              href="/tools/open-graph-generator"
              className="yoryantra-btn-outline"
            >
              Open Graph Generator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}