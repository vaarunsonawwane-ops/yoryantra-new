"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type ConversionMode = "upper" | "lower" | "title" | "sentence";

const sampleText = "straße and NASA APIs. welcome to Yoryantra tools!";

function toSimpleTitleCase(value: string): string {
  return value
    .split(/(\s+)/u)
    .map((part) => {
      if (!part || /^\s+$/u.test(part)) return part;
      const lower = part.toLowerCase();
      return lower.replace(/\p{L}/u, (letter) => letter.toUpperCase());
    })
    .join("");
}

function toSentenceCase(value: string): string {
  const lower = value.toLowerCase();
  let capitalizeNext = true;
  let result = "";

  for (const character of Array.from(lower)) {
    if (/[.!?]/u.test(character) || character === "\n") {
      result += character;
      capitalizeNext = true;
      continue;
    }

    if (capitalizeNext && /\p{L}/u.test(character)) {
      result += character.toUpperCase();
      capitalizeNext = false;
      continue;
    }

    result += character;

    if (capitalizeNext && /\p{N}/u.test(character)) {
      capitalizeNext = false;
    }
  }

  return result;
}

function convertText(value: string, mode: ConversionMode): string {
  switch (mode) {
    case "upper":
      return value.toUpperCase();
    case "lower":
      return value.toLowerCase();
    case "title":
      return toSimpleTitleCase(value);
    case "sentence":
      return toSentenceCase(value);
  }
}

const modeLabel: Record<ConversionMode, string> = {
  upper: "UPPERCASE",
  lower: "lowercase",
  title: "Title Case",
  sentence: "Sentence case",
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [lastMode, setLastMode] = useState<ConversionMode | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const inputCodePoints = useMemo(() => Array.from(input).length, [input]);
  const outputCodePoints = useMemo(() => Array.from(output).length, [output]);

  const clearResult = () => {
    setOutput("");
    setLastMode(null);
    setError("");
    setCopied(false);
  };

  const applyMode = (mode: ConversionMode) => {
    if (!input) {
      setError("Enter some text before choosing a case conversion.");
      setOutput("");
      setLastMode(null);
      return;
    }

    setOutput(convertText(input, mode));
    setLastMode(mode);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The browser could not copy the converted text to the clipboard.");
    }
  };

  const loadExample = () => {
    setInput(sampleText);
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    clearResult();
  };

  return (
    <ToolShell
      title="Text Case Converter"
      description="Change text between uppercase, lowercase, simple title case, and sentence case with Unicode-aware casing."
    >
      <div>
        <label className="block text-sm font-semibold text-gray-900">Text Input</label>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Line breaks and punctuation are preserved. Case mapping can change the number of Unicode code points.
        </p>
        <textarea
          className="mt-3 w-full min-h-[240px] rounded-xl border border-gray-300 p-4 text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          placeholder="Paste or type text here..."
          value={input}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
            setInput(event.target.value);
            clearResult();
          }}
        />
        <div className="mt-2 text-xs text-gray-500">{inputCodePoints.toLocaleString()} Unicode code points</div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={() => applyMode("upper")} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          UPPERCASE
        </button>
        <button onClick={() => applyMode("lower")} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          lowercase
        </button>
        <button onClick={() => applyMode("title")} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Title Case
        </button>
        <button onClick={() => applyMode("sentence")} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Sentence case
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-9">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Converted Output</h3>
            {lastMode && (
              <p className="mt-1 text-xs text-gray-500">
                {modeLabel[lastMode]} · {outputCodePoints.toLocaleString()} Unicode code points
              </p>
            )}
          </div>
          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy Output"}
            </button>
          )}
        </div>
        <pre className="yoryantra-output min-h-[220px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Converted text will appear here."}
        </pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What each conversion actually changes</h2>
          <dl className="mt-5 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="p-5">
              <dt className="font-semibold text-gray-900">UPPERCASE and lowercase</dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-600">These use JavaScript&apos;s default Unicode case mappings on the underlying string. They are mechanical transformations, not CSS styling, and a mapping can change the number of code points.</dd>
            </div>
            <div className="p-5">
              <dt className="font-semibold text-gray-900">Simple Title Case</dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-600">Each whitespace-separated token is lowercased and then its first letter is uppercased. It does not implement AP, Chicago, MLA, or another publication style, and it does not preserve acronyms automatically.</dd>
            </div>
            <div className="p-5">
              <dt className="font-semibold text-gray-900">Sentence case</dt>
              <dd className="mt-2 text-sm leading-relaxed text-gray-600">The text is lowercased first, then the next letter is capitalized at the start, after a line break, or after <code className="rounded bg-gray-100 px-1 py-0.5">.</code>, <code className="rounded bg-gray-100 px-1 py-0.5">!</code>, or <code className="rounded bg-gray-100 px-1 py-0.5">?</code>. Abbreviations and quoted punctuation can make those guessed boundaries wrong.</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Case mapping rewrites text, and language can affect the result</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A CSS rule such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">text-transform</code> changes how text is displayed; these buttons create a new string that will be copied and stored as the converted value. Unicode mappings are not always one code point in and one code point out. German <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">ß</code>, for example, can expand when uppercased, so character counts, byte lengths, fixed-width fields, and database limits should be checked after conversion rather than assumed to stay constant.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The uppercase and lowercase buttons are locale-insensitive. Natural-language casing can differ by locale; Turkish dotted and dotless I are the familiar example. JavaScript exposes locale-sensitive methods separately, but this page does not ask which locale you are writing for. Names, acronyms, product spelling, scientific notation, code, and editorial title style therefore still need human judgement.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            References: {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://tc39.es/ecma262/multipage/text-processing.html" target="_blank" rel="noreferrer">
              ECMAScript string case conversion
            </a>{" "}
            and {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://www.unicode.org/faq/casemap_charprop.html" target="_blank" rel="noreferrer">
              Unicode case-mapping guidance
            </a>.
          </p>
        </div>

        <div className="mt-10 self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Do not use display-case conversion to normalize identifiers</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            Lowercasing visible text is not the same as Unicode case folding, canonical normalization, locale-aware comparison, or an application&apos;s username policy. Login names, security-sensitive identifiers, file names, database keys, and duplicate detection need comparison rules designed for that system. A copied lowercase result can look consistent while still being the wrong normalization strategy.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/text-case-converter" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
