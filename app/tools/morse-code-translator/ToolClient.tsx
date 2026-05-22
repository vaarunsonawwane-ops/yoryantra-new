"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import {
  ToolContent,
  ToolExampleCard,
  ToolInsightBox,
} from "@/app/components/ToolContent";

const textToMorseMap: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  "_": "..--.-",
  '"': ".-..-.",
  "$": "...-..-",
  "@": ".--.-.",
};

const morseToTextMap = Object.fromEntries(
  Object.entries(textToMorseMap).map(([key, value]) => [value, key])
);

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const translateToMorse = () => {
    if (!input.trim()) {
      setError("Please enter text to convert to Morse code.");
      setOutput("");
      return;
    }

    try {
      const translated = input
        .toUpperCase()
        .split("")
        .map((char) => {
          if (char === " ") {
            return "/";
          }

          return textToMorseMap[char] || "";
        })
        .filter(Boolean)
        .join(" ");

      if (!translated) {
        setError("No supported text characters found to convert.");
        setOutput("");
        return;
      }

      setOutput(translated);
      setError("");
    } catch {
      setError("Unable to translate this text to Morse code.");
      setOutput("");
    }
  };

  const translateToText = () => {
    if (!input.trim()) {
      setError("Please enter Morse code to decode.");
      setOutput("");
      return;
    }

    try {
      const translated = input
        .trim()
        .split(" ")
        .map((code) => {
          if (code === "/" || code === "|") {
            return " ";
          }

          return morseToTextMap[code] || "";
        })
        .join("")
        .replace(/\s+/g, " ")
        .trim();

      if (!translated) {
        setError("No supported Morse code patterns found to decode.");
        setOutput("");
        return;
      }

      setOutput(translated);
      setError("");
    } catch {
      setError("Unable to decode this Morse code.");
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    setInput("Yoryantra Tools");
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const stats = useMemo(() => {
    return {
      outputLength: output.length,
    };
  }, [output]);

  return (
    <ToolShell
      title="Morse Code Translator"
      description="Translate text to Morse code and decode Morse code back into readable text for messages, learning, encoded text checks, and simple communication workflows."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text or Morse Code
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Example: Yoryantra Tools or -.-- --- .-. -.-- .- -. - .-. .- / - --- --- .-.. ..."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={translateToMorse}
          className="yoryantra-btn"
        >
          Text to Morse
        </button>

        <button
          onClick={translateToText}
          className="yoryantra-btn-outline"
        >
          Morse to Text
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
				Translated Output
			  </h3>

			  <p className="mt-1 text-sm text-gray-500">
				{output
				  ? `${stats.outputLength} output character${
					  stats.outputLength === 1 ? "" : "s"
					}`
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
			  "Morse code or decoded text will appear here."}
		  </pre>
		</div>

      {/* SEO CONTENT */}
      <ToolContent>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Translating Between Text and Morse Code
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Morse code represents letters and numbers using short and long
            signals. It is often used for learning, simple encoded messages,
            radio communication examples, puzzles, and text transformation
            workflows.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Morse Code Translator converts readable text into Morse code
            and decodes Morse code back into text. Words are separated with a
            slash so the output stays easier to read and copy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Morse Code Translator
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text or Morse code into the input box.</li>
            <li>Use <strong>Text to Morse</strong> to convert readable text into dots and dashes.</li>
            <li>Use <strong>Morse to Text</strong> to decode Morse patterns into readable characters.</li>
            <li>Copy the output for messages, examples, puzzles, notes, or learning material.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Morse Patterns You May Recognize
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Morse code uses dot and dash combinations for letters, numbers, and
            some punctuation marks. Spaces separate letters, while slashes are
            commonly used to separate words.
          </p>

          <ToolExampleCard>
            <div className="text-sm leading-7 text-gray-700">
              <p>
                <strong>SOS:</strong> ... --- ...
              </p>

              <p className="mt-3">
                <strong>HELLO:</strong> .... . .-.. .-.. ---
              </p>

              <p className="mt-3">
                <strong>YORYANTRA TOOLS:</strong> -.-- --- .-. -.-- .- -. - .-. .- / - --- --- .-.. ...
              </p>
            </div>
          </ToolExampleCard>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where Morse Translation Helps
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                Turning short messages into Morse code for learning or practice.
              </li>

              <li>
                Decoding dots and dashes copied from puzzles, notes, or examples.
              </li>

              <li>
                Preparing simple encoded text for classroom or hobby projects.
              </li>

              <li>
                Checking Morse spacing before sharing or copying a message.
              </li>
            </ul>
          </ToolInsightBox>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading Morse Code Spacing
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                <strong>Dots and dashes:</strong>{" "}
                Each letter is made from a combination of short dots and longer dashes.
              </li>

              <li>
                <strong>Spaces:</strong>{" "}
                A single space separates individual letters in Morse code.
              </li>

              <li>
                <strong>Slashes:</strong>{" "}
                A slash separates words so decoded messages remain readable.
              </li>

              <li>
                <strong>Unsupported characters:</strong>{" "}
                Characters outside the supported Morse set are skipped during conversion.
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
                What is Morse code?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Morse code is a system that represents letters, numbers, and
                some punctuation marks using dots and dashes.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How should words be separated in Morse code?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool uses a slash between words. For example, HELLO WORLD
                becomes .... . .-.. .-.. --- / .-- --- .-. .-.. -..
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode numbers and punctuation?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The translator supports letters, numbers, and several
                common punctuation marks used in Morse code examples.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my message?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Translation happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Morse code translation often connects with text conversion, ASCII,
            Unicode, Base64, and other encoding workflows.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tools/text-case-converter"
              className="yoryantra-btn-outline"
            >
              Text Case Converter
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
              href="/tools/base64-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Base64 Encoder Decoder
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
