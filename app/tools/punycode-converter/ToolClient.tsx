"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type ConvertMode = "auto" | "unicodeToPunycode" | "punycodeToUnicode";
type InputMode = "domain" | "url" | "email" | "lines";
type OutputMode = "clean" | "report" | "json" | "table";

type LabelResult = {
  original: string;
  converted: string;
  type: "ascii" | "unicode" | "punycode";
  changed: boolean;
  warning: string;
};

type ConversionItem = {
  original: string;
  converted: string;
  modeUsed: "unicodeToPunycode" | "punycodeToUnicode";
  inputKind: InputMode;
  labels: LabelResult[];
  warnings: string[];
};

type ConversionResult = {
  items: ConversionItem[];
  output: string;
  totalItems: number;
  changedItems: number;
  warningCount: number;
};

type PunycodeNote = {
  title: string;
  message: string;
};

const sampleInput = `mañana.com
bücher.example
xn--maana-pta.com
https://उदाहरण.भारत/path?query=1
user@café.example`;

const baseNumber = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128;
const delimiter = "-";

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [convertMode, setConvertMode] = useState<ConvertMode>("auto");
  const [inputMode, setInputMode] = useState<InputMode>("lines");
  const [outputMode, setOutputMode] = useState<OutputMode>("clean");
  const [lowercaseAscii, setLowercaseAscii] = useState(true);
  const [preserveUrlParts, setPreserveUrlParts] = useState(true);
  const [showLabelReport, setShowLabelReport] = useState(true);
  const [warnMixedScripts, setWarnMixedScripts] = useState(true);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getPunycodeNotes(result) : []), [result]);

  const convertPunycode = () => {
    if (!input.trim()) {
      setError("Please enter a domain, URL, email address, or list of values.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = runConversion(input, {
        convertMode,
        inputMode,
        outputMode,
        lowercaseAscii,
        preserveUrlParts,
        showLabelReport,
        warnMixedScripts,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to convert this Punycode value."
      );
      setResult(null);
      setOutput("");
      setCopied(false);
    }
  };

  const copyOutput = async () => {
    if (!output) {
      return;
    }

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    setInput(sampleInput);
    setConvertMode("auto");
    setInputMode("lines");
    setOutputMode("clean");
    setLowercaseAscii(true);
    setPreserveUrlParts(true);
    setShowLabelReport(true);
    setWarnMixedScripts(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setConvertMode("auto");
    setInputMode("lines");
    setOutputMode("clean");
    setLowercaseAscii(true);
    setPreserveUrlParts(true);
    setShowLabelReport(true);
    setWarnMixedScripts(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Punycode Converter"
      description="Convert international domain names between Unicode and Punycode. Encode IDN domains to xn-- format, decode Punycode domains, inspect labels, and copy clean output in your browser."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Domain, URL, Email, or List
        </label>

        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setResult(null);
            setOutput("");
            setError("");
            setCopied(false);
          }}
          placeholder={sampleInput}
          className="w-full min-h-[330px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste Unicode domains like mañana.com, Punycode domains like
          xn--maana-pta.com, full URLs, emails, or one value per line.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Conversion"
            value={convertMode}
            onChange={(value) => {
              setConvertMode(value as ConvertMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Auto detect", value: "auto" },
              { label: "Unicode to Punycode", value: "unicodeToPunycode" },
              { label: "Punycode to Unicode", value: "punycodeToUnicode" },
            ]}
          />

          <YoryantraSelect
            label="Input Type"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Domain", value: "domain" },
              { label: "URL", value: "url" },
              { label: "Email address", value: "email" },
              { label: "Multiple lines", value: "lines" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              setOutputMode(value as OutputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Clean output", value: "clean" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "Markdown table", value: "table" },
            ]}
          />

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={lowercaseAscii}
                onChange={(event) => {
                  setLowercaseAscii(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Lowercase ASCII domain labels
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={preserveUrlParts}
                onChange={(event) => {
                  setPreserveUrlParts(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Preserve URL path, query, hash, and email local part
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={showLabelReport}
                onChange={(event) => {
                  setShowLabelReport(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Include label-by-label details in report output
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnMixedScripts}
                onChange={(event) => {
                  setWarnMixedScripts(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about mixed-script Unicode labels
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Converts international domain labels to xn-- Punycode and decodes xn--
          labels back to readable Unicode. Review IDN domains carefully before use.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={convertPunycode} className="yoryantra-btn">
          Convert Punycode
        </button>

        <button onClick={copyOutput} className="yoryantra-btn" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
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

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Inputs" value={result.totalItems.toLocaleString()} />
          <SummaryCard label="Changed" value={result.changedItems.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warningCount.toLocaleString()} />
          <SummaryCard label="Mode" value={convertMode === "auto" ? "Auto" : convertMode === "unicodeToPunycode" ? "Encode" : "Decode"} />
        </div>
      )}

      {result && result.items.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Conversion Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Review the converted domains, URLs, or email domains before copying.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Original</th>
                  <th className="px-4 py-3 font-semibold">Converted</th>
                  <th className="px-4 py-3 font-semibold">Mode</th>
                  <th className="px-4 py-3 font-semibold">Labels</th>
                  <th className="px-4 py-3 font-semibold">Warnings</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.items.slice(0, 80).map((item, index) => (
                  <tr key={`${item.original}-${index}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[260px] break-words">
                        {item.original}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[300px] break-words">
                        {item.converted}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.modeUsed === "unicodeToPunycode" ? "encode" : "decode"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.labels.length}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {item.warnings.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.items.length > 80 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 80 rows. Copy the output for the full result.
            </p>
          )}
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Punycode notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {note.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[320px] whitespace-pre-wrap break-words">
          {output || "Converted Punycode output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Punycode conversion happens directly in your browser. Your domains, URLs,
        and email addresses are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Converting International Domain Names to Punycode
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Punycode is the encoding used to represent international domain names
            with non-ASCII characters in a DNS-safe format. A domain like
            mañana.com becomes an ASCII form starting with xn-- so browsers and
            domain systems can handle it correctly.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Punycode Converter encodes Unicode domains to xn-- Punycode and
            decodes Punycode domains back to readable Unicode. It can also handle
            full URLs and email domains while preserving paths, query strings,
            fragments, and local parts.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Using the Punycode Converter
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste a Unicode domain, Punycode domain, URL, email, or list of values.</li>
            <li>Choose auto detect, Unicode to Punycode, or Punycode to Unicode.</li>
            <li>Select the input type and output format.</li>
            <li>Convert and review the label-by-label result.</li>
            <li>Copy the clean output for DNS, SEO, browser, or debugging work.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Punycode Converter Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Converting international domain names before DNS setup.</li>
            <li>Decoding xn-- domains found in logs, redirects, or browser output.</li>
            <li>Checking Unicode domains before adding canonical or hreflang URLs.</li>
            <li>Reviewing IDN email domains in forms or configuration files.</li>
            <li>Debugging domain redirects, sitemap URLs, and browser display differences.</li>
            <li>Spotting mixed-script labels that may need extra review.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Punycode Conversion
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`Unicode:  mañana.com
Punycode: xn--maana-pta.com`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Review IDN Domains Carefully
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            International domain names are useful, but visually similar
            characters from different scripts can be confusing. For example,
            letters from Latin, Cyrillic, Greek, and other scripts may look
            similar even when they are different characters.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Use Punycode conversion to understand what a browser or DNS system is
            actually using. For important domains, review the Unicode version,
            Punycode version, script mix, and final URL carefully before
            publishing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is Punycode?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Punycode is an ASCII-safe encoding used for international domain
                names that contain non-ASCII characters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What does xn-- mean in a domain?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                xn-- marks a domain label that has been encoded with Punycode.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this convert full URLs?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. The converter can convert the domain part while preserving
                the path, query string, and hash.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Punycode the same as URL encoding?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Punycode is used for international domain labels. URL
                encoding is used for characters in URLs, paths, query strings,
                and form values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I convert a domain?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Punycode conversion happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/url-encoder-decoder" className="yoryantra-btn-outline">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/unicode-encoder-decoder" className="yoryantra-btn-outline">
              Unicode Encoder Decoder
            </Link>

            <Link href="/tools/unicode-escape-sequence-converter" className="yoryantra-btn-outline">
              Unicode Escape Sequence Converter
            </Link>

            <Link href="/tools/url-query-encoder-decoder" className="yoryantra-btn-outline">
              URL Query Encoder Decoder
            </Link>

            <Link href="/tools/hreflang-validator" className="yoryantra-btn-outline">
              Hreflang Validator
            </Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>

      <div className="mt-1 break-words font-mono text-lg font-semibold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function runConversion(
  input: string,
  options: {
    convertMode: ConvertMode;
    inputMode: InputMode;
    outputMode: OutputMode;
    lowercaseAscii: boolean;
    preserveUrlParts: boolean;
    showLabelReport: boolean;
    warnMixedScripts: boolean;
  }
): ConversionResult {
  const values = options.inputMode === "lines"
    ? input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    : [input.trim()];

  if (values.length === 0) {
    throw new Error("No input values were found.");
  }

  const items = values.map((value) => convertValue(value, options));
  const output = formatOutput(items, options.outputMode, options.showLabelReport);

  return {
    items,
    output,
    totalItems: items.length,
    changedItems: items.filter((item) => item.original !== item.converted).length,
    warningCount: items.reduce((count, item) => count + item.warnings.length, 0),
  };
}

function convertValue(
  value: string,
  options: {
    convertMode: ConvertMode;
    inputMode: InputMode;
    lowercaseAscii: boolean;
    preserveUrlParts: boolean;
    warnMixedScripts: boolean;
  }
): ConversionItem {
  const inferredMode = options.convertMode === "auto"
    ? value.toLowerCase().includes("xn--") ? "punycodeToUnicode" : "unicodeToPunycode"
    : options.convertMode;

  if (options.inputMode === "url" || looksLikeUrl(value)) {
    return convertUrl(value, inferredMode, options);
  }

  if (options.inputMode === "email" || looksLikeEmail(value)) {
    return convertEmail(value, inferredMode, options);
  }

  return convertDomain(value, inferredMode, options, "domain");
}

function convertUrl(
  value: string,
  mode: "unicodeToPunycode" | "punycodeToUnicode",
  options: {
    lowercaseAscii: boolean;
    preserveUrlParts: boolean;
    warnMixedScripts: boolean;
  }
): ConversionItem {
  const original = value.trim();
  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(original);
  const parseValue = hasProtocol ? original : `https://${original}`;

  try {
    const url = new URL(parseValue);
    const domainResult = convertDomain(url.hostname, mode, options, "url");
    const convertedHost = domainResult.converted;
    const converted = options.preserveUrlParts
      ? `${hasProtocol ? url.protocol + "//" : ""}${url.username ? `${url.username}${url.password ? `:${url.password}` : ""}@` : ""}${convertedHost}${url.port ? `:${url.port}` : ""}${url.pathname}${url.search}${url.hash}`
      : convertedHost;

    return {
      ...domainResult,
      original,
      converted,
      inputKind: "url",
    };
  } catch {
    const fallback = convertDomain(original, mode, options, "url");
    return {
      ...fallback,
      warnings: [...fallback.warnings, "URL parsing failed, so the full input was treated like a domain."],
    };
  }
}

function convertEmail(
  value: string,
  mode: "unicodeToPunycode" | "punycodeToUnicode",
  options: {
    lowercaseAscii: boolean;
    preserveUrlParts: boolean;
    warnMixedScripts: boolean;
  }
): ConversionItem {
  const original = value.trim();
  const atIndex = original.lastIndexOf("@");

  if (atIndex === -1) {
    return convertDomain(original, mode, options, "email");
  }

  const local = original.slice(0, atIndex);
  const domain = original.slice(atIndex + 1);
  const domainResult = convertDomain(domain, mode, options, "email");
  const converted = options.preserveUrlParts ? `${local}@${domainResult.converted}` : domainResult.converted;

  return {
    ...domainResult,
    original,
    converted,
    inputKind: "email",
  };
}

function convertDomain(
  value: string,
  mode: "unicodeToPunycode" | "punycodeToUnicode",
  options: {
    lowercaseAscii: boolean;
    warnMixedScripts: boolean;
  },
  inputKind: InputMode
): ConversionItem {
  const original = value.trim();
  const cleanDomain = stripDomainNoise(original);
  const labels = cleanDomain
    .split(".")
    .filter((label) => label.length > 0)
    .map((label) => convertLabel(label, mode, options));
  const converted = labels.map((label) => label.converted).join(".");
  const warnings = labels.map((label) => label.warning).filter(Boolean);

  if (cleanDomain.length > 253) {
    warnings.push("Domain is longer than 253 characters.");
  }

  labels.forEach((label) => {
    if (label.converted.length > 63) {
      warnings.push(`Label "${label.original}" is longer than 63 characters after conversion.`);
    }
  });

  return {
    original,
    converted,
    modeUsed: mode,
    inputKind,
    labels,
    warnings,
  };
}

function convertLabel(
  label: string,
  mode: "unicodeToPunycode" | "punycodeToUnicode",
  options: {
    lowercaseAscii: boolean;
    warnMixedScripts: boolean;
  }
): LabelResult {
  const original = label.trim();
  let converted = original;
  let warning = "";

  try {
    if (mode === "punycodeToUnicode") {
      converted = original.toLowerCase().startsWith("xn--")
        ? decodePunycodeLabel(original.slice(4))
        : original;
    } else {
      converted = /[^\x00-\x7F]/.test(original)
        ? `xn--${encodePunycodeLabel(original)}`
        : original;
    }

    if (options.lowercaseAscii && /^[\x00-\x7F]+$/.test(converted)) {
      converted = converted.toLowerCase();
    }

    if (options.warnMixedScripts && hasMixedScripts(mode === "punycodeToUnicode" ? converted : original)) {
      warning = "Label appears to mix multiple writing scripts. Review carefully.";
    }
  } catch (err) {
    warning = err instanceof Error ? err.message : "Unable to convert this label.";
    converted = original;
  }

  return {
    original,
    converted,
    type: original.toLowerCase().startsWith("xn--") ? "punycode" : /[^\x00-\x7F]/.test(original) ? "unicode" : "ascii",
    changed: original !== converted,
    warning,
  };
}

function encodePunycodeLabel(input: string) {
  const codePoints = Array.from(input).map((char) => char.codePointAt(0) || 0);
  let output = "";
  let handledCount = 0;

  codePoints.forEach((point) => {
    if (point < 0x80) {
      output += String.fromCharCode(point);
      handledCount += 1;
    }
  });

  const basicLength = handledCount;

  if (basicLength > 0) {
    output += delimiter;
  }

  let n = initialN;
  let delta = 0;
  let bias = initialBias;

  while (handledCount < codePoints.length) {
    let m = Number.MAX_SAFE_INTEGER;

    codePoints.forEach((point) => {
      if (point >= n && point < m) {
        m = point;
      }
    });

    delta += (m - n) * (handledCount + 1);
    n = m;

    codePoints.forEach((point) => {
      if (point < n) {
        delta += 1;
      }

      if (point === n) {
        let q = delta;

        for (let k = baseNumber; ; k += baseNumber) {
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

          if (q < t) {
            break;
          }

          output += encodeDigit(t + ((q - t) % (baseNumber - t)));
          q = Math.floor((q - t) / (baseNumber - t));
        }

        output += encodeDigit(q);
        bias = adapt(delta, handledCount + 1, handledCount === basicLength);
        delta = 0;
        handledCount += 1;
      }
    });

    delta += 1;
    n += 1;
  }

  return output;
}

function decodePunycodeLabel(input: string) {
  let n = initialN;
  let i = 0;
  let bias = initialBias;
  const output: number[] = [];
  const delimiterIndex = input.lastIndexOf(delimiter);

  if (delimiterIndex > -1) {
    for (let j = 0; j < delimiterIndex; j += 1) {
      output.push(input.charCodeAt(j));
    }
  }

  let index = delimiterIndex > -1 ? delimiterIndex + 1 : 0;

  while (index < input.length) {
    const oldI = i;
    let w = 1;

    for (let k = baseNumber; ; k += baseNumber) {
      if (index >= input.length) {
        throw new Error("Invalid Punycode label.");
      }

      const digit = decodeDigit(input.charCodeAt(index));
      index += 1;

      if (digit >= baseNumber) {
        throw new Error("Invalid Punycode digit.");
      }

      i += digit * w;
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

      if (digit < t) {
        break;
      }

      w *= baseNumber - t;
    }

    const outLength = output.length + 1;
    bias = adapt(i - oldI, outLength, oldI === 0);
    n += Math.floor(i / outLength);
    i %= outLength;
    output.splice(i, 0, n);
    i += 1;
  }

  return String.fromCodePoint(...output);
}

function adapt(deltaValue: number, numPoints: number, firstTime: boolean) {
  let delta = firstTime ? Math.floor(deltaValue / damp) : deltaValue >> 1;
  delta += Math.floor(delta / numPoints);
  let k = 0;

  while (delta > ((baseNumber - tMin) * tMax) >> 1) {
    delta = Math.floor(delta / (baseNumber - tMin));
    k += baseNumber;
  }

  return k + Math.floor(((baseNumber - tMin + 1) * delta) / (delta + skew));
}

function encodeDigit(value: number) {
  return String.fromCharCode(value + 22 + 75 * Number(value < 26));
}

function decodeDigit(codePoint: number) {
  if (codePoint >= 48 && codePoint < 58) {
    return 26 + (codePoint - 48);
  }

  if (codePoint >= 65 && codePoint < 91) {
    return codePoint - 65;
  }

  if (codePoint >= 97 && codePoint < 123) {
    return codePoint - 97;
  }

  return baseNumber;
}

function stripDomainNoise(value: string) {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^\/+/, "")
    .split(/[/?#]/)[0]
    .replace(/\.$/, "");
}

function looksLikeUrl(value: string) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) || value.includes("/") || value.includes("?") || value.includes("#");
}

function looksLikeEmail(value: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

function hasMixedScripts(value: string) {
  const scripts = new Set<string>();

  for (const char of value) {
    const point = char.codePointAt(0) || 0;

    if (point < 128 || /[\d.-]/.test(char)) {
      continue;
    }

    if (point >= 0x0400 && point <= 0x04FF) {
      scripts.add("Cyrillic");
    } else if (point >= 0x0370 && point <= 0x03FF) {
      scripts.add("Greek");
    } else if (point >= 0x0900 && point <= 0x097F) {
      scripts.add("Devanagari");
    } else if (point >= 0x4E00 && point <= 0x9FFF) {
      scripts.add("CJK");
    } else if (point >= 0x0600 && point <= 0x06FF) {
      scripts.add("Arabic");
    } else if (point >= 0x00C0 && point <= 0x024F) {
      scripts.add("Latin Extended");
    } else {
      scripts.add("Other");
    }
  }

  return scripts.size > 1;
}

function formatOutput(items: ConversionItem[], outputMode: OutputMode, showLabelReport: boolean) {
  if (outputMode === "json") {
    return JSON.stringify(items, null, 2);
  }

  if (outputMode === "table") {
    return [
      "| Original | Converted | Mode | Warnings |",
      "| --- | --- | --- | --- |",
      ...items.map((item) =>
        `| ${escapeMarkdown(item.original)} | ${escapeMarkdown(item.converted)} | ${item.modeUsed === "unicodeToPunycode" ? "encode" : "decode"} | ${item.warnings.length} |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return items
      .map((item, index) => {
        const labelLines = showLabelReport
          ? [
              "",
              "Labels:",
              ...item.labels.map((label) =>
                `- ${label.original} -> ${label.converted}${label.warning ? ` (${label.warning})` : ""}`
              ),
            ]
          : [];
        const warnings = item.warnings.length
          ? item.warnings.map((warning) => `- ${warning}`)
          : ["- None"];

        return [
          `Item ${index + 1}`,
          "------",
          `Original: ${item.original}`,
          `Converted: ${item.converted}`,
          `Mode: ${item.modeUsed === "unicodeToPunycode" ? "Unicode to Punycode" : "Punycode to Unicode"}`,
          ...labelLines,
          "",
          "Warnings:",
          ...warnings,
        ].join("\n");
      })
      .join("\n\n");
  }

  return items.map((item) => item.converted).join("\n");
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getPunycodeNotes(result: ConversionResult): PunycodeNote[] {
  const notes: PunycodeNote[] = [];

  if (result.warningCount > 0) {
    notes.push({
      title: "Review warnings",
      message:
        "One or more labels produced warnings. Check mixed scripts, long labels, or values that could not be converted.",
    });
  }

  if (result.items.some((item) => item.converted.includes("xn--"))) {
    notes.push({
      title: "Punycode output",
      message:
        "xn-- labels are the ASCII representation of internationalized domain labels.",
    });
  }

  if (result.items.some((item) => /[^\x00-\x7F]/.test(item.converted))) {
    notes.push({
      title: "Unicode output",
      message:
        "Readable Unicode domains are easier for people, but DNS and some tools may show the xn-- form.",
    });
  }

  return notes;
}
