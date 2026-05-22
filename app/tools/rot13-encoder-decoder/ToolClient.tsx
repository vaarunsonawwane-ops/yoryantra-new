"use client";

import { useMemo, useState } from "react";
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

  const transformRot13 = (value: string) => {
    return value.replace(/[a-zA-Z]/g, (char) => {
      const base = char <= "Z" ? 65 : 97;
      const code = char.charCodeAt(0);

      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
  };

  const convertRot13 = () => {
    setOutput(transformRot13(input));
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    setInput("Yoryantra tools make small text tasks easier.");
    setOutput("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
  };

  const stats = useMemo(() => {
    const letters = input.match(/[a-zA-Z]/g)?.length || 0;

    return {
      letters,
      outputLength: output.length,
    };
  }, [input, output]);

  return (
    <ToolShell
      title="ROT13 Encoder Decoder"
      description="Encode and decode ROT13 text for simple letter substitution, puzzles, examples, lightweight obfuscation, and text transformation workflows."
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
          placeholder="Example: Yoryantra tools make small text tasks easier."
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertRot13}
          className="yoryantra-btn"
        >
          Convert ROT13
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
			<div>
			  <h3 className="text-lg font-semibold text-gray-900">
				ROT13 Output
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
			  "ROT13 converted text will appear here."}
		  </pre>
		</div>

      {/* SEO CONTENT */}
      <ToolContent>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Rotating Letters With the ROT13 Cipher
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            ROT13 is a simple letter substitution method that shifts each
            alphabet letter by 13 places. Because the English alphabet has 26
            letters, applying ROT13 a second time returns the original text.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This makes ROT13 useful for puzzles, examples, lightweight
            obfuscation, forum-style hidden text, and quick demonstrations of
            substitution ciphers. It is not encryption, but it is handy for
            simple text transformation.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the ROT13 Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste normal text or ROT13 text into the input box.</li>
            <li>Click <strong>Convert ROT13</strong> to rotate all letters by 13 positions.</li>
            <li>Run the same action again on the output to recover the original text.</li>
            <li>Copy the result for examples, puzzles, notes, or text transformation workflows.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            ROT13 Examples You Can Check Quickly
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            ROT13 changes letters while keeping numbers, spaces, punctuation,
            and symbols unchanged. Uppercase and lowercase letters keep their
            case style.
          </p>

          <ToolExampleCard>
            <div className="text-sm leading-7 text-gray-700">
              <p>
                <strong>Hello</strong> → Uryyb
              </p>

              <p className="mt-3">
                <strong>Yoryantra</strong> → Lbelnagen
              </p>

              <p className="mt-3">
                <strong>API test 123</strong> → NVC grfg 123
              </p>
            </div>
          </ToolExampleCard>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where ROT13 Conversion Helps
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                Hiding simple spoilers or puzzle hints without strong security.
              </li>

              <li>
                Demonstrating how substitution ciphers transform text.
              </li>

              <li>
                Decoding ROT13 strings found in old examples, forums, or notes.
              </li>

              <li>
                Creating quick encoded text samples for learning or documentation.
              </li>
            </ul>
          </ToolInsightBox>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading ROT13 Output Correctly
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                <strong>Letters only:</strong>{" "}
                ROT13 changes A-Z and a-z letters.
              </li>

              <li>
                <strong>Numbers stay the same:</strong>{" "}
                Digits are not rotated or modified.
              </li>

              <li>
                <strong>Punctuation stays the same:</strong>{" "}
                Spaces, commas, periods, and symbols remain untouched.
              </li>

              <li>
                <strong>Same action both ways:</strong>{" "}
                ROT13 is its own decoder, so converting twice restores the original text.
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
                What is ROT13?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                ROT13 is a simple substitution cipher that replaces each letter
                with the letter 13 positions after it in the alphabet.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is ROT13 encryption?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. ROT13 is not secure encryption. It is a simple text
                transformation used for examples, puzzles, and light
                obfuscation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does the same button encode and decode?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                ROT13 shifts letters by 13 places. Since the alphabet has 26
                letters, applying the same conversion twice returns the original
                text.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. ROT13 conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            ROT13 often connects with text conversion, Morse code, binary,
            Base64, and other simple encoding workflows.
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
              href="/tools/binary-encoder-decoder"
              className="yoryantra-btn-outline"
            >
              Binary Encoder Decoder
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
