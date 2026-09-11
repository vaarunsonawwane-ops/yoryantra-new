"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const ituTextToMorse: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  É: "..-..",
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
  ":": "---...",
  "?": "..--..",
  "'": ".----.",
  "-": "-....-",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  '"': ".-..-.",
  "=": "-...-",
  "+": ".-.-.",
  "×": "-..-",
  "@": ".--.-.",
};

const commonExtensions: Record<string, string> = {
  "!": "-.-.--",
  "&": ".-...",
  ";": "-.-.-.",
  _: "..--.-",
  $: "...-..-",
};

const ituMorseToText = Object.entries(ituTextToMorse).reduce<Record<string, string>>(
  (map, [character, code]) => {
    if (!(code in map)) map[code] = character;
    return map;
  },
  {},
);

const extensionMorseToText = Object.entries(commonExtensions).reduce<Record<string, string>>(
  (map, [character, code]) => {
    map[code] = character;
    return map;
  },
  {},
);

type TranslationResult = {
  direction: "text-to-morse" | "morse-to-text";
  groups: number;
  words: number;
  extensionCount: number;
};

function normalizeTextCharacter(character: string) {
  if (character >= "a" && character <= "z") return character.toUpperCase();
  if (character === "é") return "É";
  if (character === "’" || character === "‘") return "'";
  if (character === "“" || character === "”") return '"';
  if (character === "–" || character === "—" || character === "−") return "-";
  return character;
}

function normalizeMorseGlyphs(value: string) {
  return value
    .replace(/[·•]/g, ".")
    .replace(/[−–—]/g, "-")
    .replace(/\r\n|\r|\n/g, " / ")
    .replace(/\|/g, "/");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [allowExtensions, setAllowExtensions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);

  const clearResult = () => {
    setOutput("");
    setError("");
    setWarning("");
    setCopied(false);
    setResult(null);
  };

  const translateToMorse = () => {
    if (!input.trim()) {
      setError("Enter text to translate to International Morse code.");
      setOutput("");
      setWarning("");
      setResult(null);
      return;
    }

    const words = input.trim().split(/\s+/);
    const unsupported = new Set<string>();
    let extensionCount = 0;
    let groups = 0;

    const translatedWords = words.map((word) => {
      const encodedCharacters: string[] = [];

      for (const rawCharacter of Array.from(word)) {
        const character = normalizeTextCharacter(rawCharacter);
        const ituCode = ituTextToMorse[character];

        if (ituCode) {
          encodedCharacters.push(ituCode);
          groups += 1;
          continue;
        }

        const extensionCode = commonExtensions[character];
        if (extensionCode && allowExtensions) {
          encodedCharacters.push(extensionCode);
          extensionCount += 1;
          groups += 1;
          continue;
        }

        unsupported.add(rawCharacter);
      }

      return encodedCharacters.join(" ");
    });

    if (unsupported.size > 0) {
      const characters = Array.from(unsupported)
        .slice(0, 8)
        .map((character) => JSON.stringify(character))
        .join(", ");
      const extensionHint = Array.from(unsupported).some(
        (character) => commonExtensions[normalizeTextCharacter(character)],
      )
        ? " Enable common software extensions if you intentionally need !, &, ;, _, or $."
        : "";

      setError(`Unsupported character${unsupported.size === 1 ? "" : "s"}: ${characters}.${extensionHint}`);
      setOutput("");
      setWarning("");
      setResult(null);
      return;
    }

    const translated = translatedWords.join(" / ");
    setOutput(translated);
    setError("");
    setCopied(false);
    setResult({
      direction: "text-to-morse",
      groups,
      words: words.length,
      extensionCount,
    });
    setWarning(
      extensionCount > 0
        ? `${extensionCount} character${extensionCount === 1 ? "" : "s"} used common software Morse extensions that are not written-character entries in ITU-R M.1677-1.`
        : "",
    );
  };

  const translateToText = () => {
    if (!input.trim()) {
      setError("Enter Morse notation to decode.");
      setOutput("");
      setWarning("");
      setResult(null);
      return;
    }

    const normalized = normalizeMorseGlyphs(input).trim();
    const rawWords = normalized.split(/\s*\/\s*|\s{2,}/).filter(Boolean);
    const invalid = new Set<string>();
    let extensionCount = 0;
    let groups = 0;

    const decodedWords = rawWords.map((word) => {
      const codes = word.trim().split(/\s+/).filter(Boolean);
      const characters = codes.map((code) => {
        if (!/^[.-]+$/.test(code)) {
          invalid.add(code);
          return "";
        }

        const ituCharacter = ituMorseToText[code];
        if (ituCharacter) {
          groups += 1;
          return ituCharacter;
        }

        const extensionCharacter = extensionMorseToText[code];
        if (extensionCharacter && allowExtensions) {
          extensionCount += 1;
          groups += 1;
          return extensionCharacter;
        }

        invalid.add(code);
        return "";
      });

      return characters.join("");
    });

    if (invalid.size > 0) {
      const patterns = Array.from(invalid).slice(0, 8).join(", ");
      const hasKnownExtension = Array.from(invalid).some(
        (code) => extensionMorseToText[code],
      );

      setError(
        `Unrecognized Morse pattern${invalid.size === 1 ? "" : "s"}: ${patterns}.${
          hasKnownExtension && !allowExtensions
            ? " Enable common software extensions if those patterns are intentional."
            : " Check dots, dashes, and character spacing."
        }`,
      );
      setOutput("");
      setWarning("");
      setResult(null);
      return;
    }

    const translated = decodedWords.join(" ");
    setOutput(translated);
    setError("");
    setCopied(false);
    setResult({
      direction: "morse-to-text",
      groups,
      words: rawWords.length,
      extensionCount,
    });
    setWarning(
      extensionCount > 0
        ? `${extensionCount} decoded pattern${extensionCount === 1 ? "" : "s"} used common software extensions rather than the ITU written-character table.`
        : "",
    );
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError("Clipboard access was blocked. Select and copy the output manually.");
    }
  };

  const loadExample = () => {
    setInput("Yoryantra Tools");
    setAllowExtensions(false);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setAllowExtensions(false);
    clearResult();
  };

  const resultLabel = useMemo(() => {
    if (!result) return "Translation details will appear after conversion.";

    const direction = result.direction === "text-to-morse" ? "Text → Morse" : "Morse → text";
    return `${direction} · ${result.groups} group${result.groups === 1 ? "" : "s"} · ${result.words} word${result.words === 1 ? "" : "s"}`;
  }, [result]);

  return (
    <ToolShell
      title="Morse Code Translator"
      description="Translate between text and International Morse notation with explicit spacing and optional software extensions."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Text or Morse Notation
        </label>
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            clearResult();
          }}
          rows={7}
          placeholder="Example: Yoryantra Tools or -.-- --- .-. -.-- .- -. - .-. .- / - --- --- .-.. ..."
          className="w-full rounded-xl border border-gray-300 p-4 font-mono text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm leading-6 text-gray-700">
        <input
          type="checkbox"
          checked={allowExtensions}
          onChange={(event) => {
            setAllowExtensions(event.target.checked);
            clearResult();
          }}
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--light-gold)]"
        />
        <span>
          <strong className="font-semibold text-gray-900">Allow common software extensions</strong>
          <span className="mt-1 block text-gray-500">
            Adds !, &amp;, ;, _, and $ mappings that are widely seen in software charts but are not
            written-character entries in ITU-R M.1677-1.
          </span>
        </span>
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={translateToMorse}
          className="min-h-[44px] whitespace-nowrap rounded-xl bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Text to Morse
        </button>
        <button
          type="button"
          onClick={translateToText}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-[var(--green)] px-5 py-2.5 text-sm font-semibold text-[var(--green)] transition hover:bg-green-50"
        >
          Morse to Text
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      ) : null}

      {warning ? (
        <div className="mt-6 self-start rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-gray-900">Extension mapping used</p>
          <p className="mt-1 text-sm leading-6 text-gray-700">{warning}</p>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Translated Output</h3>
            <p className="mt-1 text-sm text-gray-500">{resultLabel}</p>
          </div>
          <button
            type="button"
            onClick={copyOutput}
            disabled={!output}
            className="min-h-[44px] whitespace-nowrap rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? "Copied" : "Copy Output"}
          </button>
        </div>

        <pre className="mt-4 min-h-[180px] overflow-auto rounded-xl bg-gray-950 p-4 text-sm leading-6 text-gray-100 whitespace-pre-wrap break-words">
          {output || "Morse notation or decoded text will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Typed dots and dashes are a shorthand for timed signals
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            International Morse is defined by both a pattern and timing. ITU-R M.1677-1 specifies a
            dash as three dot lengths, a one-dot gap between elements of the same character, a
            three-dot gap between characters, and a seven-dot gap between words. A text box cannot
            transmit those timings, so translators need a written convention instead.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Here, one space separates Morse character groups and a slash separates words.
            When decoding, a vertical bar, a line break, or two or more spaces can also mark a word
            boundary. Typographic dot and dash glyphs such as · and − are normalized to the ASCII
            forms <code className="rounded bg-gray-100 px-1.5 py-0.5">.</code> and
            <code className="ml-1 rounded bg-gray-100 px-1.5 py-0.5">-</code>.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Primary reference: {" "}
            <a
              href="https://www.itu.int/rec/R-REC-M.1677/en"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              ITU-R M.1677-1 — International Morse code
            </a>
            . The recommendation remains in force and defines the character signals and their
            spacing for radiocommunication use.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            A slash between words is not the Morse signal for a slash character
          </h2>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Written notation</th>
                  <th className="px-4 py-3 font-semibold">Meaning here</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                <tr>
                  <td className="px-4 py-3 font-mono">.... . .-.. .-.. ---</td>
                  <td className="px-4 py-3">HELLO — spaces separate character groups.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">.... .. / - .... . .-. .</td>
                  <td className="px-4 py-3">HI THERE — the slash is a typed word boundary.</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono">-..-.</td>
                  <td className="px-4 py-3">The actual Morse pattern for the written slash or fraction bar.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              The ITU character table is smaller than many software charts
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed">
              The ITU recommendation lists A-Z, the accented letter É, digits 0-9, and a defined set
              of punctuation or miscellaneous written signs including period, comma, colon, question
              mark, apostrophe, hyphen, slash, parentheses, quotation marks, equals, plus,
              multiplication sign, and @. The default translator stays with those written-character
              mappings.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              Exclamation mark, ampersand, semicolon, underscore, and dollar-sign patterns are common
              in software Morse tables but are not written-character entries in M.1677-1. The
              extension checkbox makes that compatibility choice explicit instead of silently
              presenting every internet mapping as equally standardized.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="text-base font-semibold text-gray-900">Pattern collisions need context</h3>
            <p className="mt-2 text-sm leading-6 text-gray-700">
              Morse patterns can have operational meanings as well as written-character meanings.
              The multiplication sign uses the same <code className="rounded bg-white px-1.5 py-0.5">-..-</code>
              pattern as letter X, so text decoding chooses X for that ambiguous group. Likewise,
              some extension patterns overlap procedural signals. A plain-text translator cannot
              infer radio operating context from dots and dashes alone.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">
            Invalid characters stop the translation instead of disappearing
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Silently dropping an unsupported symbol changes the message without telling you. The
            encoder therefore reports unsupported text, and the decoder reports unknown Morse
            groups, rather than returning a partial result that looks complete. Curly apostrophes,
            typographic quotation marks, and common dash glyphs are normalized to the corresponding
            supported punctuation because their intent is usually unambiguous in copied text.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            This remains a symbolic translator, not a radio decoder. It does not listen to audio,
            measure words per minute, generate Farnsworth timing, identify prosigns from continuous
            keying, or decide whether a transmission follows an operating procedure. Those tasks
            require timing or contextual information that is absent from pasted notation.
          </p>
          <p className="mt-4 text-sm leading-6 text-gray-500">
            Translation is performed locally in the browser by this component; the message is not
            sent to a translation service.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/morse-code-translator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
