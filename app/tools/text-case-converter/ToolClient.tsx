"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import {
  ToolContent,
  ToolExampleCard,
  ToolInsightBox,
} from "@/app/components/ToolContent";

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
    const trimmed = input.trim();

    if (!trimmed) {
      setOutput("");
      return;
    }

    const result =
      trimmed.charAt(0).toUpperCase() +
      trimmed.slice(1).toLowerCase();

    setOutput(result);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    setInput("welcome to yoryantra tools");
    setOutput("");
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
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
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
          onClick={copyOutput}
          disabled={!output}
          className="yoryantra-btn-outline"
        >
          Copy Output
        </button>

        <button
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
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

	  <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
		{output || "Converted text will appear here."}
	  </pre>
	</div>

      {/* SEO CONTENT */}
      <ToolContent>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Changing Text Case Without Rewriting Everything
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Text case conversion helps clean up copied content, headings,
            metadata, UI labels, documentation, and publishing drafts without
            manually retyping every word. It is useful when the words are right,
            but the capitalization is not.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Text Case Converter keeps the workflow simple: paste your text,
            choose the format, and copy the cleaned output for websites,
            articles, social posts, documentation, product pages, or SEO work.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Text Case Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste or type your text into the input box.</li>
            <li>Choose uppercase, lowercase, title case, or sentence case.</li>
            <li>Review the converted text in the output area.</li>
            <li>Copy the formatted text and use it wherever needed.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Ways People Usually Reformat Text
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Different writing and publishing workflows need different
            capitalization styles. A headline, a button label, a copied
            paragraph, and an SEO title may all need slightly different casing.
          </p>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                <strong>UPPERCASE:</strong>{" "}
                Useful for short labels, warnings, emphasis, or text that needs
                to stand out.
              </li>

              <li>
                <strong>lowercase:</strong>{" "}
                Useful for cleaning copied text, preparing tags, or normalizing
                rough drafts.
              </li>

              <li>
                <strong>Title Case:</strong>{" "}
                Useful for headings, article titles, tool names, and page
                sections.
              </li>

              <li>
                <strong>Sentence case:</strong>{" "}
                Useful for readable paragraphs, descriptions, captions, and
                natural UI copy.
              </li>
            </ul>
          </ToolInsightBox>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Small Editing Tasks This Helps With
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                Cleaning copied text before adding it to a page, document, or
                editor.
              </li>

              <li>
                Formatting blog titles, headings, descriptions, and metadata.
              </li>

              <li>
                Preparing social captions, product text, or UI labels.
              </li>

              <li>
                Making capitalization consistent across landing pages,
                documentation, and content drafts.
              </li>

              <li>
                Quickly testing different title or sentence styles before
                publishing.
              </li>
            </ul>
          </ToolInsightBox>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            See Text Conversion in Practice
          </h2>

          <ToolExampleCard>
            <div className="text-sm leading-7 text-gray-700">
              <p className="font-medium text-gray-900">
                Original text:
              </p>

              <pre className="mt-2 whitespace-pre-wrap break-words">
welcome to yoryantra tools
              </pre>

              <p className="mt-5 font-medium text-gray-900">
                Title Case:
              </p>

              <pre className="mt-2 whitespace-pre-wrap break-words">
Welcome To Yoryantra Tools
              </pre>

              <p className="mt-5 font-medium text-gray-900">
                UPPERCASE:
              </p>

              <pre className="mt-2 whitespace-pre-wrap break-words">
WELCOME TO YORYANTRA TOOLS
              </pre>
            </div>
          </ToolExampleCard>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Why Better Formatting Improves Readability
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                <strong>Cleaner scanning:</strong>{" "}
                Consistent capitalization helps readers move through headings,
                descriptions, and labels faster.
              </li>

              <li>
                <strong>Less editing friction:</strong>{" "}
                Bulk conversion saves time when a long block of copied text has
                the wrong case.
              </li>

              <li>
                <strong>More consistent publishing:</strong>{" "}
                Matching case styles make websites, articles, documentation,
                and marketing pages feel more polished.
              </li>

              <li>
                <strong>Fewer manual mistakes:</strong>{" "}
                Automated conversion reduces small capitalization errors during
                content cleanup.
              </li>
            </ul>
          </ToolInsightBox>
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
                A text case converter changes capitalization styles, such as
                uppercase, lowercase, title case, and sentence case, without
                rewriting the text manually.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is title case used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Title case is commonly used for headings, article titles, page
                names, tool names, and short editorial labels.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is sentence case best for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Sentence case is often better for descriptions, captions, UI
                messages, and natural-sounding text because it feels less
                heavy than title case.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use this for SEO titles and meta descriptions?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. It is useful when preparing headings, page titles, meta
                descriptions, and content drafts that need consistent
                capitalization.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Text conversion happens directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Text formatting often connects with slug generation, content
            editing, SEO metadata, word counting, and publishing workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
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
              href="/tools/url-encoder-decoder"
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
      </ToolContent>
    </ToolShell>
  );
}
