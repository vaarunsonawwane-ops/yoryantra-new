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

  const readingTime =
    words > 0
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
      <section className="mt-12 border-t border-gray-200 pt-10 space-y-12">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Word Count Before Publishing Content
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Word count helps writers, bloggers, marketers, students, and SEO
            professionals measure content length quickly while writing or
            editing. Content length can affect readability, search optimization,
            reading experience, assignment requirements, and publishing
            guidelines across websites and platforms.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            During content creation workflows, manually counting words,
            characters, and sentences wastes time and increases editing
            friction. This Word Counter automatically calculates text statistics
            in real time while you type or paste content into the editor.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The tool also estimates reading time, making it useful for blog
            posts, landing pages, newsletters, essays, SEO articles, social
            content, documentation, and publishing workflows directly inside
            your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Word Counter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste or type text into the editor.</li>

            <li>
              View the live word count instantly.
            </li>

            <li>
              Check character count, sentence count, and reading time.
            </li>

            <li>
              Use the statistics while editing or optimizing content.
            </li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What This Word Counter Measures
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              <strong>Words:</strong> Total number of detected words.
            </li>

            <li>
              <strong>Characters:</strong> Character count including spaces.
            </li>

            <li>
              <strong>Sentences:</strong> Estimated sentence count based on
              punctuation.
            </li>

            <li>
              <strong>Reading Time:</strong> Estimated reading duration using an
              average reading speed.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking SEO article word count.</li>

            <li>Tracking blog post and landing page length.</li>

            <li>Estimating reading time for content pages.</li>

            <li>Monitoring essay and assignment length.</li>

            <li>Improving content readability and structure.</li>

            <li>Checking social media and newsletter content size.</li>

            <li>Editing documentation and technical content.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Content Statistics
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
            Why Word Count Matters for Content
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <ul className="space-y-3">
              <li>
                <strong>Content planning:</strong> Word count helps organize
                article structure and publishing goals.
              </li>

              <li>
                <strong>SEO workflows:</strong> Content length often matters
                during search optimization.
              </li>

              <li>
                <strong>Readability:</strong> Sentence count and reading time
                help improve user experience.
              </li>

              <li>
                <strong>Publishing limits:</strong> Many platforms and
                assignments have content length requirements.
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
                What is a word counter?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                A word counter automatically calculates text statistics such as
                word count, character count, sentence count, and estimated
                reading time.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How is reading time calculated?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Reading time is estimated using an average reading speed of
                approximately 200 words per minute.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does character count include spaces?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Character count includes spaces and visible text symbols.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this Word Counter useful for SEO writing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. SEO writers often use word count and readability statistics
                while planning articles and optimizing content structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is word counting processed on the server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. All calculations happen directly inside your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-3 text-gray-600 leading-relaxed">
            Word counting often connects with slug generation, text formatting,
            SEO optimization, content editing, and publishing workflows.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/tools/slug-generator"
              className="yoryantra-btn-outline"
            >
              Slug Generator
            </Link>

            <Link
              href="/tools/meta-tag-generator"
              className="yoryantra-btn-outline"
            >
              Meta Tag Generator
            </Link>

            <Link
              href="/tools/text-case-converter"
              className="yoryantra-btn-outline"
            >
              Text Case Converter
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