"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type SegmentRecord = {
  segment: string;
  isWordLike?: boolean;
};

type SegmenterLike = {
  segment(input: string): Iterable<SegmentRecord>;
};

type SegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity: "grapheme" | "word" | "sentence" }
) => SegmenterLike;

type TextStats = {
  words: number;
  characters: number;
  charactersWithoutWhitespace: number;
  sentences: number;
  readingMinutes: number;
  readingSeconds: number;
  segmentation: "Intl.Segmenter" | "fallback";
};

const READING_WORDS_PER_MINUTE = 200;

export default function ToolClient() {
  const [text, setText] = useState("");

  const stats = useMemo(() => analyzeText(text), [text]);

  const resetAll = () => {
    setText("");
  };

  return (
    <ToolShell
      title="Word Counter"
      description="Count locale-aware words, grapheme characters, sentences, and estimated reading time while keeping text in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Text Input
        </label>
        <textarea
          className="min-h-[320px] w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder="Paste or type text here..."
          value={text}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            setText(event.target.value)
          }
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Counts update as the text changes. Spaces are included in the main
          character count and shown separately in the no-whitespace count.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Words" value={stats.words.toLocaleString()} />
        <StatCard label="Characters" value={stats.characters.toLocaleString()} />
        <StatCard
          label="No whitespace"
          value={stats.charactersWithoutWhitespace.toLocaleString()}
        />
        <StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
        <StatCard
          label="Reading time"
          value={formatReadingTime(stats.readingMinutes, stats.readingSeconds)}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <p className="font-semibold text-gray-900">How text is segmented</p>
          <p className="mt-1">
            {stats.segmentation === "Intl.Segmenter"
              ? "This browser supports Intl.Segmenter, so words, sentences, and visible characters use locale-sensitive segmentation instead of whitespace splitting alone."
              : "This browser does not expose Intl.Segmenter, so the page uses simpler fallback rules. Counts can differ more for languages without spaces and for combined emoji."}
          </p>
        </div>
        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
          <p className="font-semibold">Counts can differ between editors</p>
          <p className="mt-1">
            Word and sentence boundaries are language-sensitive. Hyphenated terms,
            abbreviations, URLs, emoji, and mixed-language text may be counted
            differently by another editor or publishing platform.
          </p>
        </div>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            A word count is a segmentation decision
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Splitting text only on spaces works reasonably for simple English prose,
            but it breaks down for languages that do not place spaces between every
            word. Modern browsers can expose locale-sensitive word and sentence
            boundaries through <code>Intl.Segmenter</code>, which this page uses when
            available.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            That still does not create one universal count. Editorial systems may
            define hyphenated words, abbreviations, contractions, URLs, and numbers
            differently, so match the counting rules of a specific platform when an
            exact limit matters.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Characters are counted as grapheme clusters when possible
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            JavaScript&apos;s <code>String.length</code> measures UTF-16 code units,
            which can count one visible emoji as two or more units. With
            <code>Intl.Segmenter</code>, the main character statistic uses grapheme
            boundaries so combined characters and many emoji sequences better match
            what a person sees as one character.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sentence count is an estimate, not grammar analysis
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Sentence segmentation uses the browser&apos;s internationalization rules
            where supported. It does not understand the meaning of the text, and
            abbreviations or unusual punctuation can still create boundaries that
            differ from an editor&apos;s judgment.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading time uses a visible assumption
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The estimate uses {READING_WORDS_PER_MINUTE} words per minute. It is a
            planning number, not a prediction for every reader. Technical material,
            code samples, unfamiliar vocabulary, tables, and accessibility needs can
            make real reading time substantially different.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Browser-local processing</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The text is analyzed in the browser as you type or paste it. This page does
            not need to send the text to Yoryantra to calculate the displayed counts.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Text segmentation reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            <code>Intl.Segmenter</code> is standardized by ECMA-402 for locale-sensitive
            grapheme, word, and sentence segmentation. MDN also documents the browser
            behavior and its usefulness for text that cannot be counted correctly by
            whitespace splitting alone.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a
              href="https://tc39.es/ecma402/#segmenter-objects"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              ECMA-402: Segmenter objects
            </a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--green)] hover:underline"
            >
              MDN: Intl.Segmenter
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/word-counter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
      <h3 className="text-sm font-medium text-gray-600">{label}</h3>
      <p className="mt-2 break-words text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function analyzeText(text: string): TextStats {
  if (!text) {
    return {
      words: 0,
      characters: 0,
      charactersWithoutWhitespace: 0,
      sentences: 0,
      readingMinutes: 0,
      readingSeconds: 0,
      segmentation: getSegmenterConstructor() ? "Intl.Segmenter" : "fallback",
    };
  }

  const Segmenter = getSegmenterConstructor();
  let words: number;
  let characters: number;
  let sentences: number;
  let charactersWithoutWhitespace: number;
  let segmentation: TextStats["segmentation"];

  if (Segmenter) {
    const wordSegmenter = new Segmenter(undefined, { granularity: "word" });
    const graphemeSegmenter = new Segmenter(undefined, { granularity: "grapheme" });
    const sentenceSegmenter = new Segmenter(undefined, { granularity: "sentence" });

    words = Array.from(wordSegmenter.segment(text)).filter(
      (segment) => segment.isWordLike === true
    ).length;
    const graphemes = Array.from(graphemeSegmenter.segment(text));
    characters = graphemes.length;
    charactersWithoutWhitespace = graphemes.filter(
      (segment) => !/^\s+$/.test(segment.segment)
    ).length;
    sentences = Array.from(sentenceSegmenter.segment(text)).filter(
      (segment) => segment.segment.trim().length > 0
    ).length;
    segmentation = "Intl.Segmenter";
  } else {
    words = fallbackWordCount(text);
    const codePoints = Array.from(text);
    characters = codePoints.length;
    charactersWithoutWhitespace = codePoints.filter(
      (character) => !/\s/.test(character)
    ).length;
    sentences = fallbackSentenceCount(text);
    segmentation = "fallback";
  }

  const readingSeconds =
    words > 0 ? Math.max(1, Math.ceil((words / READING_WORDS_PER_MINUTE) * 60)) : 0;
  const readingMinutes = readingSeconds > 0 ? Math.ceil(readingSeconds / 60) : 0;

  return {
    words,
    characters,
    charactersWithoutWhitespace,
    sentences,
    readingMinutes,
    readingSeconds,
    segmentation,
  };
}

function getSegmenterConstructor(): SegmenterConstructor | null {
  const intlWithSegmenter = Intl as typeof Intl & {
    Segmenter?: SegmenterConstructor;
  };
  return intlWithSegmenter.Segmenter ?? null;
}

function fallbackWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((token) => /[A-Za-z0-9\u00c0-\uffff]/.test(token)).length;
}

function fallbackSentenceCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  const parts = trimmed
    .split(/[.!?\u3002\uff01\uff1f]+(?:\s+|$)/)
    .filter((part) => part.trim().length > 0);

  return Math.max(1, parts.length);
}

function formatReadingTime(minutes: number, seconds: number): string {
  if (seconds === 0) {
    return "0 min";
  }

  if (seconds < 60) {
    return `<1 min`;
  }

  return `${minutes} min`;
}
