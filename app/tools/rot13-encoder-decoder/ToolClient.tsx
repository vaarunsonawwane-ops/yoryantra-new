"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import { ToolContent } from "@/app/components/ToolContent";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

function transformRot13(value: string) {
  return value.replace(/[A-Za-z]/g, (char) => {
    const code = char.charCodeAt(0);
    const base = code <= 90 ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

const examples = [
  ["Hello", "Uryyb", "Every ASCII letter rotates."],
  ["API test 123", "NCV grfg 123", "Digits and spaces stay unchanged."],
  ["café ☕", "pnsé ☕", "é and the emoji remain untouched."],
] as const;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const asciiLetters = input.match(/[A-Za-z]/g)?.length ?? 0;
    return {
      asciiLetters,
      inputLength: Array.from(input).length,
      outputLength: Array.from(output).length,
    };
  }, [input, output]);

  const convertRot13 = () => {
    if (!input.trim()) {
      setError("Enter text containing at least one visible character.");
      setOutput("");
      return;
    }

    setOutput(transformRot13(input));
    setError("");
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    setInput("Yoryantra tools: café 2026 🔐");
    setOutput("");
    setError("");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  return (
    <ToolShell
      title="ROT13 Encoder Decoder"
      description="Rotate ASCII letters by 13 places while preserving numbers, punctuation, and other Unicode text."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
          rows={7}
          placeholder="Example: Yoryantra tools: café 2026 🔐"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          ROT13 changes only ASCII A–Z and a–z. Everything else is preserved exactly.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertRot13}
          className="yoryantra-btn min-h-[44px] whitespace-nowrap"
        >
          Convert ROT13
        </button>
        <button
          onClick={loadExample}
          className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
        >
          Load Example
        </button>
        <button
          onClick={resetAll}
          className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap"
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">ROT13 Output</h3>
            <p className="mt-1 text-sm text-gray-500">
              {output
                ? `${stats.asciiLetters} ASCII letter${stats.asciiLetters === 1 ? "" : "s"} rotated · ${stats.outputLength} output character${stats.outputLength === 1 ? "" : "s"}`
                : stats.inputLength > 0
                  ? `${stats.asciiLetters} ASCII letter${stats.asciiLetters === 1 ? "" : "s"} will change`
                  : "Output will appear below"}
            </p>
          </div>
          <button
            onClick={copyOutput}
            disabled={!output}
            className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Output
          </button>
        </div>

        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "ROT13 converted text will appear here."}
        </pre>
      </div>

      <ToolContent>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            ROT13 decodes itself because 13 is half of 26
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            ROT13 is a fixed Caesar-style substitution over the 26 ASCII Latin
            letters. A moves to N, B moves to O, and so on. Running the same
            substitution again advances another 13 positions, completing the
            alphabet and returning the original letter. There is no separate
            decrypt operation or secret key.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="min-w-[620px] font-mono text-sm leading-8 text-gray-700">
              <div>A B C D E F G H I J K L M</div>
              <div>N O P Q R S T U V W X Y Z</div>
              <div className="mt-2">N O P Q R S T U V W X Y Z</div>
              <div>A B C D E F G H I J K L M</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            The exact boundary is ASCII letters, not “all text”
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Digits, punctuation, whitespace, accented letters, non-Latin scripts,
            and emoji pass through unchanged. That narrow rule matters for
            interoperability: a ROT13 implementation should not normalize Unicode,
            strip accents, change case, or rotate characters merely because they
            look alphabetic in another writing system.
          </p>
          <div className="mt-5 space-y-3">
            {examples.map(([source, result, note]) => (
              <div
                key={source}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                  <code className="font-mono text-sm text-gray-900">{source}</code>
                  <span className="text-gray-400" aria-hidden="true">→</span>
                  <code className="font-mono text-sm text-gray-900">{result}</code>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {note}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Obfuscation is not confidentiality
          </h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            ROT13 has no key and reverses with the same public operation. Anyone
            who recognizes it can recover the original text immediately. It is
            suitable for spoilers, puzzles, demonstrations, and deliberately mild
            obfuscation—not passwords, API keys, access tokens, personal records,
            or any data that actually needs protection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Other implementations should produce the same letter mapping
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Python documents <code className="font-mono">rot_13</code> as a
            text-to-text transform, and the IETF Internet Security Glossary
            describes ROT13 as a Caesar cipher with a rotation of 13. Those
            references are useful interoperability checks even though ROT13 is
            not a security protocol or modern encryption standard.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            See the{" "}
            <a
              href="https://docs.python.org/3/library/codecs.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Python codecs documentation
            </a>
            {" "}and{" "}
            <a
              href="https://www.rfc-editor.org/rfc/rfc4949"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              RFC 4949
            </a>
            . Transformation on this page runs in the browser; copying is the
            only action that writes the result elsewhere, through the browser
            clipboard API.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/rot13-encoder-decoder" />
          </div>
        </section>
      </ToolContent>
    </ToolShell>
  );
}
