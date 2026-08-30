"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type UrlMode = "component" | "full" | "form";

const encodeRfc3986Component = (value: string) =>
  encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );

const encodeFullUrl = (value: string) => {
  const parts = value.split(/(%[0-9a-fA-F]{2})/g);

  return parts
    .map((part) => {
      if (/^%[0-9a-fA-F]{2}$/.test(part)) {
        return part.toUpperCase();
      }

      return encodeURI(part).replace(/%5B/gi, "[").replace(/%5D/gi, "]");
    })
    .join("");
};

const encodeFormValue = (value: string) => {
  const params = new URLSearchParams();
  params.set("value", value);
  return params.toString().slice("value=".length);
};

const findMalformedPercent = (value: string) => {
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "%") continue;

    const pair = value.slice(index + 1, index + 3);
    if (!/^[0-9a-fA-F]{2}$/.test(pair)) {
      return index;
    }

    index += 2;
  }

  return -1;
};

const encodeValue = (value: string, mode: UrlMode) => {
  if (mode === "component") return encodeRfc3986Component(value);
  if (mode === "full") return encodeFullUrl(value);
  return encodeFormValue(value);
};

const decodeValue = (value: string, mode: UrlMode) => {
  const malformedAt = findMalformedPercent(value);
  if (malformedAt >= 0) {
    throw new Error(
      `Malformed percent escape at character ${malformedAt + 1}. Every % must be followed by two hexadecimal digits.`
    );
  }

  if (mode === "component") return decodeURIComponent(value);
  if (mode === "full") return decodeURI(value);
  return decodeURIComponent(value.replace(/\+/g, " "));
};

const countPercentEscapes = (value: string) =>
  (value.match(/%[0-9a-fA-F]{2}/g) ?? []).length;

const modeDetails: Record<UrlMode, { label: string; note: string; example: string }> = {
  component: {
    label: "URL component / parameter value",
    note: "Encodes data for one URL component. Reserved delimiters such as /, ?, &, =, and # are encoded.",
    example: "hello world & tea/cake",
  },
  full: {
    label: "Full URL / URI",
    note: "Preserves URL structure such as ://, /, ?, &, =, and #. Existing valid %HH escapes are kept instead of double-encoded.",
    example: "https://example.com/search?q=hello world&lang=हिन्दी",
  },
  form: {
    label: "Form/query value (+ for space)",
    note: "Uses application/x-www-form-urlencoded behavior. Spaces encode as + instead of %20.",
    example: "hello world + tea",
  },
};

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<UrlMode>("component");
  const [hasResult, setHasResult] = useState(false);

  const runEncode = () => {
    if (input === "") {
      setError("Enter a URL, component, or query value to encode.");
      setOutput("");
      setHasResult(false);
      return;
    }

    try {
      setOutput(encodeValue(input, mode));
      setError("");
      setHasResult(true);
    } catch {
      setError(
        "Unable to encode this input. Check for an isolated UTF-16 surrogate or copy the original text again."
      );
      setOutput("");
      setHasResult(false);
    }
  };

  const runDecode = () => {
    if (input === "") {
      setError("Enter percent-encoded text to decode.");
      setOutput("");
      setHasResult(false);
      return;
    }

    try {
      setOutput(decodeValue(input, mode));
      setError("");
      setHasResult(true);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Invalid percent-encoded input.";
      setError(`Unable to decode this input. ${message}`);
      setOutput("");
      setHasResult(false);
    }
  };

  const loadExample = () => {
    setInput(modeDetails[mode].example);
    setOutput("");
    setError("");
    setHasResult(false);
  };

  const resetAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setHasResult(false);
  };

  const stats = useMemo(
    () => ({
      inputEscapes: countPercentEscapes(input),
      outputEscapes: countPercentEscapes(output),
      malformedPercentAt: findMalformedPercent(input),
    }),
    [input, output]
  );

  return (
    <ToolShell
      title="URL Encoder Decoder"
      description="Encode and decode full URLs, URL components, or form-style query values without treating every kind of URL text as the same encoding problem."
    >
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Encoding context
        </label>
        <select
          value={mode}
          onChange={(event) => {
            setMode(event.target.value as UrlMode);
            setOutput("");
            setError("");
            setHasResult(false);
          }}
          className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
        >
          <option value="component">URL component / parameter value</option>
          <option value="full">Full URL / URI</option>
          <option value="form">Form/query value (+ for space)</option>
        </select>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          {modeDetails[mode].note}
        </p>
      </div>

      <div className="mt-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Input
        </label>
        <textarea
          className="w-full h-64 rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          placeholder={modeDetails[mode].example}
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={runEncode} className="yoryantra-btn">
          Encode
        </button>
        <button onClick={runDecode} className="yoryantra-btn-outline">
          Decode
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {input && !error && stats.malformedPercentAt >= 0 && (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-800">
          The input contains a <code>%</code> that is not followed by two hexadecimal digits. Encoding can treat that percent sign as data, but decoding will reject it as malformed percent-encoding.
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Output</h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasResult
                ? `${stats.outputEscapes} percent escape${stats.outputEscapes === 1 ? "" : "s"} in output`
                : `${stats.inputEscapes} valid percent escape${stats.inputEscapes === 1 ? "" : "s"} in input`}
            </p>
          </div>

          {hasResult && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>

        <pre className="yoryantra-output mt-4 overflow-auto text-sm min-h-[180px] whitespace-pre-wrap break-words">
          {hasResult ? output : "Encoded or decoded output will appear here."}
        </pre>
      </div>

      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <h3 className="text-sm font-semibold text-yellow-900">Privacy Note</h3>
        <p className="mt-2 text-sm leading-relaxed text-yellow-800">
          Encoding and decoding run in this browser. This page does not send the URL or query value to a remote service.
        </p>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Full URLs and URL components need different treatment
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Percent-encoding represents an octet as <code>%</code> followed by two hexadecimal digits. The important part is deciding which characters are data and which characters are URL syntax. Encoding an entire URL as though it were one query value turns structural characters such as <code>:</code>, <code>/</code>, <code>?</code>, <code>&amp;</code>, and <code>=</code> into data and can destroy the URL structure.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Use component mode for one path segment, parameter value, fragment value, or other piece of data. Use full-URL mode when the separators already describe the URL structure. The full-URL encoder also preserves existing valid <code>%HH</code> triplets so an already encoded space such as <code>%20</code> is not silently turned into <code>%2520</code>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            %20 and + do not mean the same thing everywhere
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            In normal URI percent-encoding, a space is represented as <code>%20</code>. HTML form and URLSearchParams-style encoding uses <code>application/x-www-form-urlencoded</code> rules, where a space is serialized as <code>+</code>. A literal plus sign in that form encoding is percent-encoded so it is not confused with a space.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reserved characters are sometimes syntax, sometimes data
          </h2>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700">
            <p>
              URI syntax reserves characters such as <code>:</code>, <code>/</code>, <code>?</code>, <code>#</code>, <code>[</code>, <code>]</code>, <code>@</code>, <code>&amp;</code>, <code>=</code>, and <code>+</code>. If one of those characters is acting as a delimiter, keep it as syntax. If the same character is literal data inside a component, encode it. Decoding a reserved escape too early can change how the URL is parsed, which is why full-URL decode mode uses URI-aware decoding rather than decoding every escape indiscriminately.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/url-encoder-decoder" />
        </div>
      </section>
    </ToolShell>
  );
}
