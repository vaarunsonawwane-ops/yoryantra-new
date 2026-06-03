"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import {
  ToolContent,
  ToolExampleCard,
  ToolInsightBox,
} from "@/app/components/ToolContent";

const natoMap: Record<string, string> = {
  A: "Alpha",
  B: "Bravo",
  C: "Charlie",
  D: "Delta",
  E: "Echo",
  F: "Foxtrot",
  G: "Golf",
  H: "Hotel",
  I: "India",
  J: "Juliett",
  K: "Kilo",
  L: "Lima",
  M: "Mike",
  N: "November",
  O: "Oscar",
  P: "Papa",
  Q: "Quebec",
  R: "Romeo",
  S: "Sierra",
  T: "Tango",
  U: "Uniform",
  V: "Victor",
  W: "Whiskey",
  X: "X-ray",
  Y: "Yankee",
  Z: "Zulu",
  "0": "Zero",
  "1": "One",
  "2": "Two",
  "3": "Three",
  "4": "Four",
  "5": "Five",
  "6": "Six",
  "7": "Seven",
  "8": "Eight",
  "9": "Nine",
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [keepUnsupported, setKeepUnsupported] = useState(true);

  const convertToNato = () => {
    if (!input.trim()) {
      setError("Please enter text to convert.");
      setOutput("");
      return;
    }

    try {
      const converted = input
        .toUpperCase()
        .split("")
        .map((char) => {
          if (char === " ") {
            return "/";
          }

          if (natoMap[char]) {
            return natoMap[char];
          }

          return keepUnsupported ? char : "";
        })
        .filter(Boolean)
        .join(" ");

      if (!converted) {
        setError("No supported letters or numbers found to convert.");
        setOutput("");
        return;
      }

      setOutput(converted);
      setError("");
    } catch {
      setError("Unable to convert this text.");
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    setInput("Yoryantra 2026");
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setKeepUnsupported(true);
  };

  const stats = useMemo(() => {
    const lettersAndNumbers = input
      .toUpperCase()
      .split("")
      .filter((char) => natoMap[char]).length;

    return {
      translatedCount: lettersAndNumbers,
    };
  }, [input]);

  return (
    <ToolShell
      title="NATO Phonetic Alphabet Converter"
      description="Convert text into NATO phonetic alphabet words for clearer spelling, calls, support, radio-style communication, and text encoding workflows."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Example: Yoryantra 2026"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* OPTIONS */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={keepUnsupported}
            onChange={(e) => setKeepUnsupported(e.target.checked)}
            className="mt-1 accent-[var(--green)]"
          />

          <span>
            Keep punctuation and unsupported characters in the output.
          </span>
        </label>
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertToNato}
          className="yoryantra-btn"
        >
          Convert to NATO
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

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

		{/* OUTPUT */}
		<div className="mt-8">
		  <div className="flex items-center justify-between mb-3">
			<div>
			  <h3 className="text-lg font-semibold text-gray-900">
				Phonetic Output
			  </h3>

			  <p className="mt-1 text-sm text-gray-500">
				{stats.translatedCount > 0
				  ? `${stats.translatedCount} character${
					  stats.translatedCount === 1 ? "" : "s"
					} converted`
				  : "Output will appear below"}
			  </p>
			</div>

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
			  "NATO phonetic output will appear here."}
		  </pre>
		</div>

      {/* SEO CONTENT */}
      <ToolContent>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Spelling Text Clearly With the NATO Phonetic Alphabet
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The NATO phonetic alphabet helps spell letters clearly when normal
            speech may be misunderstood. Instead of saying “B” and risking
            confusion with “D” or “P,” each letter is represented by a distinct
            word such as Bravo, Delta, or Papa.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This converter turns text into phonetic words so names, codes,
            product IDs, support references, and short messages are easier to
            communicate clearly.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the NATO Phonetic Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste or type the text you want to spell out.</li>
            <li>Choose whether punctuation should stay in the output.</li>
            <li>Click <strong>Convert to NATO</strong> to generate phonetic words.</li>
            <li>Copy the output for calls, notes, support messages, or documentation.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Phonetic Spellings You May Recognize
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The converter uses the common NATO spelling alphabet for A to Z and
            keeps numbers readable with simple number words.
          </p>

          <ToolExampleCard>
            <div className="text-sm leading-7 text-gray-700">
              <p>
                <strong>API:</strong> Alpha Papa India
              </p>

              <p className="mt-3">
                <strong>JSON:</strong> Juliett Sierra Oscar November
              </p>

              <p className="mt-3">
                <strong>Yoryantra 2026:</strong> Yankee Oscar Romeo Yankee Alpha November Tango Romeo Alpha / Two Zero Two Six
              </p>
            </div>
          </ToolExampleCard>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where Phonetic Conversion Helps
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                Spelling names, codes, domains, or IDs over phone calls.
              </li>

              <li>
                Preparing support references that are easier to read aloud.
              </li>

              <li>
                Making short strings clearer in noisy or low-quality communication.
              </li>

              <li>
                Creating examples for documentation, training, or learning.
              </li>
            </ul>
          </ToolInsightBox>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading the NATO Alphabet Output
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                <strong>Letters:</strong>{" "}
                Each letter is converted into its NATO phonetic word.
              </li>

              <li>
                <strong>Numbers:</strong>{" "}
                Digits are converted into readable number words.
              </li>

              <li>
                <strong>Spaces:</strong>{" "}
                Spaces are shown as slashes so word boundaries stay clear.
              </li>

              <li>
                <strong>Punctuation:</strong>{" "}
                You can keep or remove unsupported characters depending on how clean you want the output.
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
                What is the NATO phonetic alphabet?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It is a spelling alphabet where each letter is represented by a
                clear word, such as Alpha for A, Bravo for B, and Charlie for C.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why is Juliett spelled with two T letters?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Juliett is the standard NATO spelling for the letter J. The
                double T helps avoid pronunciation confusion across languages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this convert numbers too?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Numbers are converted into readable number words such as
                Zero, One, Two, and Three.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Phonetic conversion often connects with text formatting, ASCII,
            Unicode, Morse code, and other simple encoding workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tools/text-case-converter"
              className="yoryantra-btn-outline"
            >
              Text Case Converter
            </Link>

            <Link
              href="/tools/morse-code-translator"
              className="yoryantra-btn-outline"
            >
              Morse Code Translator
            </Link>

            <Link
              href="/tools/ascii-converter"
              className="yoryantra-btn-outline"
            >
              ASCII Converter
            </Link>

            <Link
              href="/tools/unicode-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Unicode Encoder Decoder
            </Link>

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>
          </div>
        </div>
      </ToolContent>
    </ToolShell>
  );
}
