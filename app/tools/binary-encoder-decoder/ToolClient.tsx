"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import {
  ToolContent,
  ToolExampleCard,
  ToolInsightBox,
} from "@/app/components/ToolContent";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const encodeBinary = () => {
    if (!input.trim()) {
      setError("Please enter text to encode.");
      setOutput("");
      return;
    }

    try {
      const encoded = Array.from(new TextEncoder().encode(input))
        .map((byte) => byte.toString(2).padStart(8, "0"))
        .join(" ");

      setOutput(encoded);
      setError("");
    } catch {
      setError("Unable to encode this text to binary.");
      setOutput("");
    }
  };

  const decodeBinary = () => {
    const cleaned = input.trim();

    if (!cleaned) {
      setError("Please enter binary values to decode.");
      setOutput("");
      return;
    }

    const values = cleaned
      .split(/[\s,]+/)
      .filter(Boolean);

    const invalidValue = values.find((value) => !/^[01]+$/.test(value));

    if (invalidValue) {
      setError("Binary input can only contain 0 and 1 values.");
      setOutput("");
      return;
    }

    const invalidLength = values.find((value) => value.length !== 8);

    if (invalidLength) {
      setError("Each binary byte should contain exactly 8 bits.");
      setOutput("");
      return;
    }

    try {
      const bytes = new Uint8Array(
        values.map((value) => parseInt(value, 2))
      );

      const decoded = new TextDecoder().decode(bytes);

      setOutput(decoded);
      setError("");
    } catch {
      setError("Unable to decode this binary value.");
      setOutput("");
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    await navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    setInput("01011001 01101111 01110010 01111001 01100001 01101110 01110100 01110010 01100001");
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
      inputLength: input.length,
      outputLength: output.length,
    };
  }, [input, output]);

  return (
    <ToolShell
      title="Binary Encoder Decoder"
      description="Encode text to binary and decode binary values back into readable text for debugging, learning, encoding workflows, and data inspection."
    >
      {/* INPUT */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text or Binary
        </label>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={7}
          placeholder="Example: 01011001 01101111 01110010 01111001 01100001 01101110 01110100 01110010 01100001"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={decodeBinary}
          className="yoryantra-btn"
        >
          Decode Binary
        </button>

        <button
          onClick={encodeBinary}
          className="yoryantra-btn-outline"
        >
          Encode to Binary
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
				Converted Output
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
			  "Binary conversion output will appear here."}
		  </pre>
		</div>

      {/* SEO CONTENT */}
      <ToolContent>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Reading Binary Values as Text
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Binary values appear in computer science examples, byte-level
            debugging, encoded text, learning material, and simple data
            inspection workflows. They are useful for understanding how text can
            be represented as bytes, but long binary strings are difficult to
            read without conversion.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Binary Encoder Decoder converts readable text into 8-bit binary
            bytes and decodes binary bytes back into normal text.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            How to Use the Binary Encoder Decoder
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste text or binary bytes into the input box.</li>
            <li>Use <strong>Decode Binary</strong> when binary should become readable text.</li>
            <li>Use <strong>Encode to Binary</strong> when text should become 8-bit binary output.</li>
            <li>Copy the result for notes, examples, debugging, or learning material.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Binary Byte Examples You Can Recognize
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This tool expects binary text in 8-bit byte groups. Spaces or commas
            can separate each byte.
          </p>

          <ToolExampleCard>
            <div className="text-sm leading-7 text-gray-700">
              <p>
                <strong>01001000 01100101 01101100 01101100 01101111</strong> → Hello
              </p>

              <p className="mt-3">
                <strong>01000001 01010000 01001001</strong> → API
              </p>

              <p className="mt-3">
                <strong>01011001 01101111 01110010 01111001 01100001 01101110 01110100 01110010 01100001</strong> → Yoryantra
              </p>
            </div>
          </ToolExampleCard>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Where Binary Conversion Helps
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                Decoding binary strings copied from examples, lessons, or notes.
              </li>

              <li>
                Turning short text into binary for teaching or demonstration.
              </li>

              <li>
                Checking byte-level output while learning encoding concepts.
              </li>

              <li>
                Comparing binary, ASCII, hex, and Unicode representations.
              </li>
            </ul>
          </ToolInsightBox>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reading Binary Input Correctly
          </h2>

          <ToolInsightBox>
            <ul className="space-y-3">
              <li>
                <strong>8-bit groups:</strong>{" "}
                Each binary byte should contain exactly eight 0 or 1 characters.
              </li>

              <li>
                <strong>Separators:</strong>{" "}
                Use spaces or commas between bytes for cleaner decoding.
              </li>

              <li>
                <strong>Text output:</strong>{" "}
                Decoding uses UTF-8 so common text characters can be read correctly.
              </li>

              <li>
                <strong>Invalid input:</strong>{" "}
                Any character other than 0 or 1 will be rejected for decoding.
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
                What is binary encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Binary encoding represents data using 0 and 1 values. Text can
                be represented as bytes, where each byte is commonly shown as an
                8-bit binary group.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why does each binary value need 8 bits?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                This tool decodes binary as bytes. A byte contains 8 bits, so
                each group should contain exactly eight 0 or 1 characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this decode comma-separated binary?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Binary values can be separated by spaces or commas.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this upload my text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Encoding and decoding happen directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <YoryantraRelatedTools currentHref="/tools/binary-encoder-decoder" />
        </div>
      </ToolContent>
    </ToolShell>
  );
}
