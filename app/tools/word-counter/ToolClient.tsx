"use client";

import { useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";

export default function ToolClient() {
  const [text, setText] = useState("");

  const words = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  const characters = text.length;

  const sentences = text.trim()
    ? text.split(/[.!?]+/).filter(Boolean).length
    : 0;

  const readingTime = words > 0
  ? Math.ceil(words / 200)
  : 0;

  const resetAll = () => {
    setText("");
  };

  return (
    <ToolShell
      title="Word Counter"
      description="Count words, characters, sentences, and reading time instantly with this free online Word Counter."
    >
      {/* INPUT */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Text Input
        </label>

        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder="Paste or type text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Words
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {words}
          </p>
        </div>

        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Characters
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {characters}
          </p>
        </div>

        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Sentences
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {sentences}
          </p>
        </div>

        <div className="yoryantra-output p-5 text-center">
          <h3 className="text-sm font-medium text-gray-600">
            Reading Time
          </h3>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {readingTime} min
          </p>
        </div>
      </div>

      {/* SEO CONTENT */}
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            What is Word Counter?
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Word Counter helps you instantly calculate word count,
            character count, sentence count, and estimated reading time.
            It is useful for writers, bloggers, students, SEO professionals,
            marketers, and anyone working with written content.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Instead of manually counting text statistics, you can quickly
            analyze content length and readability in real time while typing
            or editing text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Word Counter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste or type your content into the text area.</li>
            <li>View the word, character, and sentence counts instantly.</li>
            <li>Check the estimated reading time automatically.</li>
            <li>Use the statistics while editing or optimizing content.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What This Tool Counts
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><strong>Words</strong> — total number of words in the text.</li>
            <li><strong>Characters</strong> — total number of characters including spaces.</li>
            <li><strong>Sentences</strong> — estimated number of sentences.</li>
            <li><strong>Reading Time</strong> — estimated reading duration based on average reading speed.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking article and blog post length.</li>
            <li>Monitoring SEO content word count.</li>
            <li>Tracking assignment or essay length.</li>
            <li>Estimating reading time for content pages.</li>
            <li>Improving content readability and structure.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">
              Sample text:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
              Welcome to Yoryantra. This is a simple word counter example.
            </pre>

            <p className="mt-4 font-medium text-gray-900">
              Statistics:
            </p>

            <pre className="mt-2 whitespace-pre-wrap break-words">
{`Words: 10
Characters: 66
Sentences: 2
Reading Time: 1 min`}
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
                What is a word counter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A word counter is a tool that calculates the number of words,
                characters, sentences, and other text statistics automatically.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How is reading time calculated?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Reading time is estimated using an average reading speed of
                around 200 words per minute.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this tool count spaces as characters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Character count includes spaces and visible text symbols.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Word Counter secure?
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
            <Link href="/tools/text-case-converter" className="yoryantra-btn-outline">
              Text Case Converter
            </Link>

            <Link href="/tools/slug-generator" className="yoryantra-btn-outline">
              Slug Generator
            </Link>

            <Link href="/tools/regex-tester" className="yoryantra-btn-outline">
              Regex Tester
            </Link>

            <Link href="/tools/json-formatter" className="yoryantra-btn-outline">
              JSON Formatter
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
