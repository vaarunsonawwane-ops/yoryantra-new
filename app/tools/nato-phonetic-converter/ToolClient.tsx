"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import ToolShell from "@/app/components/ToolShell";
import { ToolContent } from "@/app/components/ToolContent";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

const natoLetterMap: Record<string, string> = {
  A: "Alfa",
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
};

const digitWordMap: Record<string, string> = {
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

const digitPronunciationMap: Record<string, string> = {
  "0": "ZE-RO",
  "1": "WUN",
  "2": "TOO",
  "3": "TREE",
  "4": "FOW-ER",
  "5": "FIFE",
  "6": "SIX",
  "7": "SEV-EN",
  "8": "AIT",
  "9": "NIN-ER",
};

type DigitStyle = "words" | "pronunciation";

const letterPairs = [
  ["A", "Alfa", "N", "November"],
  ["B", "Bravo", "O", "Oscar"],
  ["C", "Charlie", "P", "Papa"],
  ["D", "Delta", "Q", "Quebec"],
  ["E", "Echo", "R", "Romeo"],
  ["F", "Foxtrot", "S", "Sierra"],
  ["G", "Golf", "T", "Tango"],
  ["H", "Hotel", "U", "Uniform"],
  ["I", "India", "V", "Victor"],
  ["J", "Juliett", "W", "Whiskey"],
  ["K", "Kilo", "X", "X-ray"],
  ["L", "Lima", "Y", "Yankee"],
  ["M", "Mike", "Z", "Zulu"],
] as const;

const digitReference = [
  ["0", "Zero", "ZE-RO"],
  ["1", "One", "WUN"],
  ["2", "Two", "TOO"],
  ["3", "Three", "TREE"],
  ["4", "Four", "FOW-ER"],
  ["5", "Five", "FIFE"],
  ["6", "Six", "SIX"],
  ["7", "Seven", "SEV-EN"],
  ["8", "Eight", "AIT"],
  ["9", "Nine", "NIN-ER"],
] as const;

function isAsciiLetter(char: string) {
  return /^[A-Za-z]$/.test(char);
}

function isAsciiDigit(char: string) {
  return /^[0-9]$/.test(char);
}

function convertNatoInput(
  input: string,
  keepUnsupported: boolean,
  digitStyle: DigitStyle,
) {
  const tokens: string[] = [];
  let previousWasBoundary = false;
  let converted = 0;

  for (const char of Array.from(input)) {
    if (/\s/u.test(char)) {
      if (!previousWasBoundary && tokens.length > 0) {
        tokens.push("/");
        previousWasBoundary = true;
      }
      continue;
    }

    if (isAsciiLetter(char)) {
      tokens.push(natoLetterMap[char.toUpperCase()]);
      converted += 1;
      previousWasBoundary = false;
      continue;
    }

    if (isAsciiDigit(char)) {
      tokens.push(
        digitStyle === "pronunciation"
          ? digitPronunciationMap[char]
          : digitWordMap[char],
      );
      converted += 1;
      previousWasBoundary = false;
      continue;
    }

    if (keepUnsupported) {
      tokens.push(char);
      previousWasBoundary = false;
    }
  }

  while (tokens[tokens.length - 1] === "/") {
    tokens.pop();
  }

  return { output: tokens.join(" "), converted };
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [keepUnsupported, setKeepUnsupported] = useState(true);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("words");

  const stats = useMemo(() => {
    let letters = 0;
    let digits = 0;
    let unsupported = 0;

    for (const char of Array.from(input)) {
      if (isAsciiLetter(char)) {
        letters += 1;
      } else if (isAsciiDigit(char)) {
        digits += 1;
      } else if (!/\s/u.test(char)) {
        unsupported += 1;
      }
    }

    return { letters, digits, unsupported, converted: letters + digits };
  }, [input]);

  const convertToNato = () => {
    if (!input.trim()) {
      setError("Enter at least one letter or digit to convert.");
      setOutput("");
      return;
    }

    if (stats.converted === 0) {
      setError("No A–Z letters or 0–9 digits were found to convert.");
      setOutput("");
      return;
    }

    const result = convertNatoInput(input, keepUnsupported, digitStyle);
    setOutput(result.output);
    setError("");
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    setInput("Yoryantra 2026");
    setOutput("");
    setError("");
    setKeepUnsupported(true);
    setDigitStyle("words");
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setKeepUnsupported(true);
    setDigitStyle("words");
  };

  return (
    <ToolShell
      title="NATO Phonetic Alphabet Converter"
      description="Spell letters with official NATO/ICAO code words and optional radiotelephony digit pronunciations."
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
          rows={7}
          placeholder="Example: Yoryantra 2026"
          className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label
            htmlFor="digit-style"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Digit Output
          </label>
          <select
            id="digit-style"
            value={digitStyle}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setDigitStyle(event.target.value as DigitStyle)
            }
            className="min-h-[44px] w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          >
            <option value="words">Written words — One, Two, Three</option>
            <option value="pronunciation">
              Radiotelephony — WUN, TOO, TREE
            </option>
          </select>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            The pronunciation option follows ICAO-style spoken number forms.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={keepUnsupported}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setKeepUnsupported(event.target.checked)}
              className="mt-1 accent-[var(--green)]"
            />
            <span>
              Keep punctuation, accented letters, emoji, and other unsupported
              characters as literal symbols.
            </span>
          </label>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            Literal symbols are preserved, not converted into spoken code words.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={convertToNato}
          className="yoryantra-btn min-h-[44px] whitespace-nowrap"
        >
          Convert to NATO
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
            <h3 className="text-lg font-semibold text-gray-900">
              Phonetic Output
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {stats.converted > 0
                ? `${stats.letters} letter${stats.letters === 1 ? "" : "s"} and ${stats.digits} digit${stats.digits === 1 ? "" : "s"} available to convert`
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
          {output || "NATO/ICAO spelling output will appear here."}
        </pre>
      </div>

      <ToolContent>
        <section>
          <h2 className="text-2xl font-semibold text-gray-900">
            “Alfa” and “Juliett” are not typos
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The international spelling alphabet deliberately uses <strong>Alfa</strong>
            {" "}with an <em>f</em> and <strong>Juliett</strong> with two final t
            letters. ICAO chose spellings that would be pronounced more
            consistently across languages, and NATO adopted the same alphabet in
            1956. That is why a standards-aligned converter should not silently
            substitute the everyday English spelling “Alpha.”
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            NATO publishes the current A–Z sequence and its history on the{" "}
            <a
              href="https://www.nato.int/en/about-us/nato-history/history-by-theme/symbols-of-nato/nato-phonetic-alphabet"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              NATO phonetic alphabet reference
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Official A–Z code words at a glance
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            The spelling alphabet assigns one code word to each Latin letter.
            Case does not matter: <strong>a</strong> and <strong>A</strong> both
            become <strong>Alfa</strong>.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Letter</th>
                  <th className="px-4 py-3 font-semibold">Code word</th>
                  <th className="px-4 py-3 font-semibold">Letter</th>
                  <th className="px-4 py-3 font-semibold">Code word</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {letterPairs.map(([leftLetter, leftWord, rightLetter, rightWord]) => (
                  <tr key={leftLetter}>
                    <td className="px-4 py-3 font-mono">{leftLetter}</td>
                    <td className="px-4 py-3">{leftWord}</td>
                    <td className="px-4 py-3 font-mono">{rightLetter}</td>
                    <td className="px-4 py-3">{rightWord}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Digits have words and radio pronunciations
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Digits are not additional NATO alphabet letters. Radiotelephony
            guidance gives them ordinary written labels such as <strong>Three</strong>
            {" "}and <strong>Nine</strong>, but specifies pronunciations such as
            {" "}<strong>TREE</strong> and <strong>NIN-ER</strong> to reduce
            ambiguity over radio. The output selector exposes both forms rather
            than pretending they are the same thing.
          </p>
          <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">Digit</th>
                  <th className="px-4 py-3 font-semibold">Written word</th>
                  <th className="px-4 py-3 font-semibold">
                    Radiotelephony pronunciation
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {digitReference.map(([digit, word, pronunciation]) => (
                  <tr key={digit}>
                    <td className="px-4 py-3 font-mono">{digit}</td>
                    <td className="px-4 py-3">{word}</td>
                    <td className="px-4 py-3 font-mono">{pronunciation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            The pronunciation forms above match the ICAO phonetics table
            published in the{" "}
            <a
              href="https://www.faa.gov/air_traffic/publications/atpubs/atc_html/chap2_section_4.html"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              FAA Air Traffic Control manual
            </a>
            .
          </p>
        </section>

        <section className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Written spelling is not a complete radio procedure
          </h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            The generated line is a character-by-character spelling aid. It does
            not provide call-sign rules, aviation phraseology, readback
            requirements, distress procedure, or context-specific number
            transmission. The slash shown between input words is only a visual
            separator on this page; do not treat it as prescribed spoken
            phraseology.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">
            Characters outside A–Z and 0–9 stay outside the standard mapping
          </h2>
          <p className="mt-3 leading-relaxed text-gray-600">
            Accented letters, non-Latin scripts, punctuation, and emoji do not
            have code words in the 26-letter NATO/ICAO spelling alphabet. When
            “keep unsupported characters” is enabled, they remain literal and
            keep their original Unicode form; they are not uppercased, expanded,
            or assigned invented pronunciations. Turning the option off removes
            those literal symbols from the generated line.
          </p>
          <p className="mt-3 leading-relaxed text-gray-600">
            Conversion runs in the browser. The page does not need to transmit
            the entered spelling string to produce the result.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/nato-phonetic-converter" />
          </div>
        </section>
      </ToolContent>
    </ToolShell>
  );
}
