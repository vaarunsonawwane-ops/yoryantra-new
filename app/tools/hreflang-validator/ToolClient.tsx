"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "html" | "lines" | "xml";
type OutputMode = "summary" | "report" | "json" | "csv" | "markdown";
type StrictnessMode = "balanced" | "strict" | "relaxed";

type HreflangIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type HreflangEntry = {
  order: number;
  hreflang: string;
  href: string;
  rel: string;
  source: string;
  language: string;
  region: string;
  isXDefault: boolean;
  isAbsoluteUrl: boolean;
  duplicateHreflang: boolean;
  duplicateHref: boolean;
  issues: HreflangIssue[];
};

type ValidationResult = {
  entries: HreflangEntry[];
  issues: HreflangIssue[];
  output: string;
  totalTags: number;
  xDefaultCount: number;
  duplicateHreflangCount: number;
  duplicateHrefCount: number;
  invalidCodeCount: number;
  absoluteUrlCount: number;
  score: number;
};

type HreflangNote = {
  title: string;
  message: string;
};

const sampleHtml = `<link rel="alternate" hreflang="en" href="https://example.com/" />
<link rel="alternate" hreflang="en-us" href="https://example.com/us/" />
<link rel="alternate" hreflang="en-gb" href="https://example.com/uk/" />
<link rel="alternate" hreflang="hi-in" href="https://example.com/in/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />`;

const languageCodes = new Set([
  "af", "am", "ar", "az", "be", "bg", "bn", "bs", "ca", "cs", "cy", "da",
  "de", "el", "en", "es", "et", "eu", "fa", "fi", "fil", "fr", "ga", "gl",
  "gu", "he", "hi", "hr", "hu", "hy", "id", "is", "it", "ja", "ka", "kk",
  "km", "kn", "ko", "lo", "lt", "lv", "mk", "ml", "mn", "mr", "ms", "my",
  "ne", "nl", "no", "pa", "pl", "pt", "ro", "ru", "si", "sk", "sl", "sq",
  "sr", "sv", "sw", "ta", "te", "th", "tr", "uk", "ur", "uz", "vi", "zh",
]);

const regionCodes = new Set([
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AT", "AU", "AZ",
  "BA", "BB", "BD", "BE", "BG", "BH", "BN", "BO", "BR", "BS", "BT", "BW",
  "BY", "BZ", "CA", "CH", "CL", "CN", "CO", "CR", "CY", "CZ", "DE", "DK",
  "DO", "DZ", "EC", "EE", "EG", "ES", "FI", "FR", "GB", "GE", "GH", "GR",
  "GT", "HK", "HN", "HR", "HU", "ID", "IE", "IL", "IN", "IQ", "IR", "IS",
  "IT", "JM", "JO", "JP", "KE", "KH", "KR", "KW", "KZ", "LA", "LB", "LK",
  "LT", "LU", "LV", "MA", "MD", "ME", "MK", "MM", "MN", "MO", "MT", "MX",
  "MY", "NG", "NL", "NO", "NP", "NZ", "OM", "PA", "PE", "PH", "PK", "PL",
  "PT", "QA", "RO", "RS", "RU", "SA", "SE", "SG", "SI", "SK", "TH", "TR",
  "TW", "UA", "UG", "UK", "US", "UY", "VN", "ZA",
]);

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("html");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [strictnessMode, setStrictnessMode] = useState<StrictnessMode>("balanced");
  const [requireXDefault, setRequireXDefault] = useState(true);
  const [requireSelfReference, setRequireSelfReference] = useState(true);
  const [requireAbsoluteUrls, setRequireAbsoluteUrls] = useState(true);
  const [warnDuplicateUrls, setWarnDuplicateUrls] = useState(true);
  const [warnLowercaseRegion, setWarnLowercaseRegion] = useState(true);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getHreflangNotes(result) : []), [result]);

  const validateHreflang = () => {
    if (!input.trim()) {
      setError("Please paste hreflang tags, sitemap XML, or hreflang URL lines.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzeHreflang(input, {
        currentUrl,
        inputMode,
        outputMode,
        strictnessMode,
        requireXDefault,
        requireSelfReference,
        requireAbsoluteUrls,
        warnDuplicateUrls,
        warnLowercaseRegion,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to validate these hreflang tags."
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
    setInput(sampleHtml);
    setCurrentUrl("https://example.com/");
    setInputMode("html");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setRequireXDefault(true);
    setRequireSelfReference(true);
    setRequireAbsoluteUrls(true);
    setWarnDuplicateUrls(true);
    setWarnLowercaseRegion(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setCurrentUrl("");
    setInputMode("html");
    setOutputMode("summary");
    setStrictnessMode("balanced");
    setRequireXDefault(true);
    setRequireSelfReference(true);
    setRequireAbsoluteUrls(true);
    setWarnDuplicateUrls(true);
    setWarnLowercaseRegion(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Hreflang Validator"
      description="Validate hreflang tags for international SEO. Check language codes, region codes, x-default, duplicate hreflang values, absolute URLs, self-reference, and common hreflang mistakes."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Hreflang Tags or Sitemap XML
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
          placeholder={sampleHtml}
          className="w-full min-h-[380px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste HTML link tags, sitemap XML with alternate links, or simple lines
          like en-us https://example.com/us/.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Options
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Input"
            value={inputMode}
            onChange={(value) => {
              setInputMode(value as InputMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "HTML link tags", value: "html" },
              { label: "Simple hreflang lines", value: "lines" },
              { label: "Sitemap XML", value: "xml" },
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
              { label: "Summary", value: "summary" },
              { label: "Detailed report", value: "report" },
              { label: "JSON", value: "json" },
              { label: "CSV", value: "csv" },
              { label: "Markdown table", value: "markdown" },
            ]}
          />

          <YoryantraSelect
            label="Checking Style"
            value={strictnessMode}
            onChange={(value) => {
              setStrictnessMode(value as StrictnessMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Balanced", value: "balanced" },
              { label: "Strict", value: "strict" },
              { label: "Relaxed", value: "relaxed" },
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Page URL
            </label>

            <input
              value={currentUrl}
              onChange={(event) => {
                setCurrentUrl(event.target.value);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              placeholder="https://example.com/"
              className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireXDefault}
              onChange={(event) => {
                setRequireXDefault(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn when x-default is missing
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireSelfReference}
              onChange={(event) => {
                setRequireSelfReference(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Check self-reference when current page URL is entered
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={requireAbsoluteUrls}
              onChange={(event) => {
                setRequireAbsoluteUrls(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Require absolute URLs
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnDuplicateUrls}
              onChange={(event) => {
                setWarnDuplicateUrls(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn about duplicate URLs
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={warnLowercaseRegion}
              onChange={(event) => {
                setWarnLowercaseRegion(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            Warn when region codes are lowercase
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Checks hreflang values, language and region shape, x-default, duplicate
          targets, absolute URLs, and self-reference when a current page URL is provided.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={validateHreflang} className="yoryantra-btn">
          Validate Hreflang
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
          <SummaryCard label="Score" value={`${result.score}/100`} />
          <SummaryCard label="Tags" value={result.totalTags.toLocaleString()} />
          <SummaryCard label="x-default" value={result.xDefaultCount.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.entries.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Hreflang Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Parsed hreflang entries and their target URLs.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Hreflang</th>
                  <th className="px-4 py-3 font-semibold">Language</th>
                  <th className="px-4 py-3 font-semibold">Region</th>
                  <th className="px-4 py-3 font-semibold">URL</th>
                  <th className="px-4 py-3 font-semibold">Issues</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.entries.map((entry) => (
                  <tr key={`${entry.order}-${entry.hreflang}-${entry.href}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      {entry.hreflang || "(missing)"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {entry.language || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {entry.region || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[360px] break-words">
                        {entry.href || "(missing href)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {entry.issues.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Hreflang findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.slice(0, 14).map((issue, index) => (
              <div key={`${issue.title}-${index}`}>
                <p className="text-sm font-semibold text-amber-900">
                  {issue.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
                  {issue.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            Hreflang notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-blue-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-800">
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
          {output || "Hreflang validation output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Hreflang validation happens directly in your browser. Your tags and URLs
        are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Hreflang Tags for International SEO
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hreflang tags help search engines understand alternate language or
            regional versions of a page. They are useful for international sites,
            country-specific pages, multilingual content, and pages that serve
            similar content to different audiences.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Hreflang Validator checks pasted alternate tags and sitemap
            entries for common issues such as missing x-default, duplicate
            hreflang values, invalid language or region shape, relative URLs, and
            missing self-reference.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Validating Hreflang Markup
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste hreflang link tags, sitemap XML, or simple hreflang lines.</li>
            <li>Choose the input format and checking style.</li>
            <li>Add the current page URL if you want self-reference checking.</li>
            <li>Run the validator and review duplicate, missing, or invalid entries.</li>
            <li>Fix the markup before publishing or submitting sitemap changes.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Hreflang Validator Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Checking language and region codes before publishing hreflang tags.</li>
            <li>Finding duplicate hreflang values across alternate URLs.</li>
            <li>Checking whether x-default is present for language selector pages.</li>
            <li>Finding relative URLs that should be absolute URLs.</li>
            <li>Reviewing self-referencing hreflang on localized pages.</li>
            <li>Validating copied alternate links from a template or CMS.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Hreflang Tags
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<link rel="alternate" hreflang="en" href="https://example.com/" />
<link rel="alternate" hreflang="en-us" href="https://example.com/us/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Hreflang Needs a Complete Cluster
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Hreflang works best when alternate pages reference each other
            consistently. A single tag on one page is usually not enough if the
            alternate version does not point back.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This browser tool can check the tags you paste, but it does not crawl
            every alternate URL to verify live reciprocal tags. For large sites,
            combine this with crawling, sitemap validation, and Search Console
            review.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a Hreflang Validator do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks hreflang tags for common international SEO issues such
                as invalid codes, duplicate values, missing URLs, and missing
                x-default.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is x-default?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                x-default points to a fallback page, often a language selector or
                default global version.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should hreflang URLs be absolute?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Absolute URLs are the safest and clearest choice for
                hreflang annotations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does this check reciprocal hreflang automatically?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It checks the tags you paste, but it does not crawl alternate
                pages automatically to confirm live reciprocal tags.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I validate hreflang tags?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Hreflang validation happens directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/hreflang-tag-generator" className="yoryantra-btn-outline">
              Hreflang Tag Generator
            </Link>

            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">
              Canonical URL Checker
            </Link>

            <Link href="/tools/sitemap-validator" className="yoryantra-btn-outline">
              Sitemap Validator
            </Link>

            <Link href="/tools/sitemap-url-extractor" className="yoryantra-btn-outline">
              Sitemap URL Extractor
            </Link>

            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline">
              Meta Robots Tag Generator
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

function analyzeHreflang(
  input: string,
  options: {
    currentUrl: string;
    inputMode: InputMode;
    outputMode: OutputMode;
    strictnessMode: StrictnessMode;
    requireXDefault: boolean;
    requireSelfReference: boolean;
    requireAbsoluteUrls: boolean;
    warnDuplicateUrls: boolean;
    warnLowercaseRegion: boolean;
  }
): ValidationResult {
  const rawEntries = extractEntries(input, options.inputMode);

  if (rawEntries.length === 0) {
    throw new Error("No hreflang entries were found.");
  }

  const entriesWithDuplicates = markDuplicates(rawEntries);
  const entries = entriesWithDuplicates.map((entry) => ({
    ...entry,
    issues: getEntryIssues(entry, options),
  }));
  const globalIssues = getGlobalIssues(entries, options);
  const issues = [
    ...globalIssues,
    ...entries.flatMap((entry) =>
      entry.issues.map((issue) => ({
        ...issue,
        title: `Entry ${entry.order}: ${issue.title}`,
      }))
    ),
  ];
  const invalidCodeCount = entries.filter((entry) =>
    entry.issues.some((issue) => issue.title.includes("Invalid") || issue.title.includes("Unknown"))
  ).length;
  const duplicateHreflangCount = entries.filter((entry) => entry.duplicateHreflang).length;
  const duplicateHrefCount = entries.filter((entry) => entry.duplicateHref).length;
  const absoluteUrlCount = entries.filter((entry) => entry.isAbsoluteUrl).length;
  const score = calculateScore(issues);
  const base = {
    entries,
    issues,
    totalTags: entries.length,
    xDefaultCount: entries.filter((entry) => entry.isXDefault).length,
    duplicateHreflangCount,
    duplicateHrefCount,
    invalidCodeCount,
    absoluteUrlCount,
    score,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function extractEntries(input: string, inputMode: InputMode): HreflangEntry[] {
  if (inputMode === "lines") {
    return extractLineEntries(input);
  }

  if (inputMode === "xml") {
    return extractXmlEntries(input);
  }

  return extractHtmlEntries(input);
}

function extractHtmlEntries(input: string): HreflangEntry[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  const linkNodes = Array.from(doc.querySelectorAll("link[hreflang], a[hreflang]"));

  return linkNodes.map((node, index) => {
    const hreflang = (node.getAttribute("hreflang") || "").trim();
    const href = (node.getAttribute("href") || "").trim();
    const rel = (node.getAttribute("rel") || "").trim();

    return buildEntry({
      order: index + 1,
      hreflang,
      href,
      rel,
      source: node.outerHTML,
    });
  });
}

function extractLineEntries(input: string): HreflangEntry[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split(/\s+/);
      const hreflang = parts[0] || "";
      const href = parts[1] || "";

      return buildEntry({
        order: index + 1,
        hreflang,
        href,
        rel: "alternate",
        source: line,
      });
    });
}

function extractXmlEntries(input: string): HreflangEntry[] {
  const parser = new DOMParser();
  const xml = parser.parseFromString(input, "application/xml");

  if (xml.querySelector("parsererror")) {
    throw new Error("The sitemap XML could not be parsed.");
  }

  const links = Array.from(xml.getElementsByTagName("*"))
    .filter((node) => node.localName.toLowerCase() === "link" && node.getAttribute("hreflang"));

  return links.map((node, index) =>
    buildEntry({
      order: index + 1,
      hreflang: (node.getAttribute("hreflang") || "").trim(),
      href: (node.getAttribute("href") || "").trim(),
      rel: (node.getAttribute("rel") || "").trim(),
      source: new XMLSerializer().serializeToString(node),
    })
  );
}

function buildEntry({
  order,
  hreflang,
  href,
  rel,
  source,
}: {
  order: number;
  hreflang: string;
  href: string;
  rel: string;
  source: string;
}): HreflangEntry {
  const clean = hreflang.trim();
  const parsed = parseHreflang(clean);

  return {
    order,
    hreflang: clean,
    href: href.trim(),
    rel,
    source,
    language: parsed.language,
    region: parsed.region,
    isXDefault: clean.toLowerCase() === "x-default",
    isAbsoluteUrl: /^https?:\/\//i.test(href.trim()),
    duplicateHreflang: false,
    duplicateHref: false,
    issues: [],
  };
}

function parseHreflang(value: string) {
  if (!value || value.toLowerCase() === "x-default") {
    return {
      language: "",
      region: "",
    };
  }

  const parts = value.split("-");

  return {
    language: parts[0] || "",
    region: parts[1] || "",
  };
}

function markDuplicates(entries: HreflangEntry[]) {
  const hreflangCounts = new Map<string, number>();
  const hrefCounts = new Map<string, number>();

  entries.forEach((entry) => {
    const hreflangKey = entry.hreflang.toLowerCase();
    const hrefKey = normalizeUrl(entry.href);

    if (hreflangKey) {
      hreflangCounts.set(hreflangKey, (hreflangCounts.get(hreflangKey) || 0) + 1);
    }

    if (hrefKey) {
      hrefCounts.set(hrefKey, (hrefCounts.get(hrefKey) || 0) + 1);
    }
  });

  return entries.map((entry) => ({
    ...entry,
    duplicateHreflang: entry.hreflang ? (hreflangCounts.get(entry.hreflang.toLowerCase()) || 0) > 1 : false,
    duplicateHref: entry.href ? (hrefCounts.get(normalizeUrl(entry.href)) || 0) > 1 : false,
  }));
}

function getEntryIssues(
  entry: HreflangEntry,
  options: {
    strictnessMode: StrictnessMode;
    requireAbsoluteUrls: boolean;
    warnDuplicateUrls: boolean;
    warnLowercaseRegion: boolean;
  }
): HreflangIssue[] {
  const issues: HreflangIssue[] = [];

  if (!entry.hreflang) {
    issues.push({
      severity: "high",
      title: "Missing hreflang value",
      message: "This entry does not have a hreflang value.",
    });
  }

  if (!entry.href) {
    issues.push({
      severity: "high",
      title: "Missing href URL",
      message: "This entry does not have an href URL.",
    });
  }

  if (entry.rel && !entry.rel.toLowerCase().split(/\s+/).includes("alternate")) {
    issues.push({
      severity: "warning",
      title: "rel does not include alternate",
      message: "HTML hreflang links should use rel=\"alternate\".",
    });
  }

  if (options.requireAbsoluteUrls && entry.href && !entry.isAbsoluteUrl) {
    issues.push({
      severity: "warning",
      title: "URL is not absolute",
      message: "Hreflang URLs should usually be absolute URLs.",
    });
  }

  if (entry.hreflang && !entry.isXDefault) {
    const codeIssue = validateLanguageRegion(entry.hreflang, options.warnLowercaseRegion);

    if (codeIssue) {
      issues.push(codeIssue);
    }
  }

  if (entry.duplicateHreflang) {
    issues.push({
      severity: "high",
      title: "Duplicate hreflang value",
      message: "Each hreflang value should normally point to one chosen URL in the alternate set.",
    });
  }

  if (options.warnDuplicateUrls && entry.duplicateHref && !entry.isXDefault) {
    issues.push({
      severity: options.strictnessMode === "relaxed" ? "info" : "warning",
      title: "Duplicate URL target",
      message: "The same URL appears more than once. Check whether this is intentional.",
    });
  }

  return issues;
}

function validateLanguageRegion(value: string, warnLowercaseRegion: boolean): HreflangIssue | null {
  const parts = value.split("-");

  if (parts.length > 2 || parts.length === 0 || !parts[0]) {
    return {
      severity: "high",
      title: "Invalid hreflang shape",
      message: "Use a language code such as en, or language-region such as en-US.",
    };
  }

  const language = parts[0].toLowerCase();

  if (!/^[a-z]{2,3}$/.test(language) || !languageCodes.has(language)) {
    return {
      severity: "warning",
      title: "Unknown language code",
      message: "The language code does not look like a common ISO language code.",
    };
  }

  if (parts[1]) {
    const region = parts[1];

    if (!/^[A-Za-z]{2}$/.test(region)) {
      return {
        severity: "warning",
        title: "Invalid region code",
        message: "The region part should usually be a two-letter country or region code.",
      };
    }

    if (warnLowercaseRegion && region !== region.toUpperCase()) {
      return {
        severity: "info",
        title: "Region code is lowercase",
        message: "Region codes are commonly written uppercase, such as en-US or hi-IN.",
      };
    }

    if (!regionCodes.has(region.toUpperCase())) {
      return {
        severity: "info",
        title: "Uncommon region code",
        message: "The region code is not in the common region list used by this checker.",
      };
    }
  }

  return null;
}

function getGlobalIssues(
  entries: HreflangEntry[],
  options: {
    currentUrl: string;
    requireXDefault: boolean;
    requireSelfReference: boolean;
    strictnessMode: StrictnessMode;
  }
): HreflangIssue[] {
  const issues: HreflangIssue[] = [];

  if (options.requireXDefault && !entries.some((entry) => entry.isXDefault)) {
    issues.push({
      severity: options.strictnessMode === "strict" ? "warning" : "info",
      title: "x-default is missing",
      message: "Consider adding x-default for a fallback or language selector page when appropriate.",
    });
  }

  const cleanCurrentUrl = normalizeUrl(options.currentUrl);

  if (options.requireSelfReference && cleanCurrentUrl) {
    const hasSelfReference = entries.some((entry) => normalizeUrl(entry.href) === cleanCurrentUrl);

    if (!hasSelfReference) {
      issues.push({
        severity: "warning",
        title: "Self-reference not found",
        message: "The current page URL was not found in the alternate set.",
      });
    }
  }

  if (entries.length === 1) {
    issues.push({
      severity: "info",
      title: "Only one hreflang entry found",
      message: "Hreflang usually works as a set of alternate URLs, not a single isolated tag.",
    });
  }

  return issues;
}

function calculateScore(issues: HreflangIssue[]) {
  let score = 100;

  issues.forEach((issue) => {
    if (issue.severity === "high") {
      score -= 25;
    } else if (issue.severity === "warning") {
      score -= 12;
    } else {
      score -= 4;
    }
  });

  return Math.max(0, score);
}

function formatOutput(
  result: Omit<ValidationResult, "output">,
  outputMode: OutputMode
) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const rows = [
      ["order", "hreflang", "language", "region", "href", "absolute_url", "duplicate_hreflang", "issues"],
      ...result.entries.map((entry) => [
        String(entry.order),
        entry.hreflang,
        entry.language,
        entry.region,
        entry.href,
        String(entry.isAbsoluteUrl),
        String(entry.duplicateHreflang),
        String(entry.issues.length),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Hreflang | URL | Issues |",
      "| --- | --- | --- |",
      ...result.entries.map((entry) =>
        `| ${escapeMarkdown(entry.hreflang || "(missing)")} | ${escapeMarkdown(entry.href || "(missing)")} | ${entry.issues.length} |`
      ),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.entries
      .map((entry) => {
        const issues =
          entry.issues.length === 0
            ? ["- No common issues found."]
            : entry.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

        return [
          `Entry ${entry.order}`,
          "-------",
          `Hreflang: ${entry.hreflang || "(missing)"}`,
          `Language: ${entry.language || "-"}`,
          `Region: ${entry.region || "-"}`,
          `URL: ${entry.href || "(missing)"}`,
          "",
          "Findings:",
          ...issues,
        ].join("\n");
      })
      .join("\n\n");
  }

  const issues =
    result.issues.length === 0
      ? ["- No common hreflang issues found."]
      : result.issues.slice(0, 14).map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

  return [
    "Hreflang Validation Summary",
    "---------------------------",
    `Score: ${result.score}/100`,
    `Total tags: ${result.totalTags}`,
    `x-default entries: ${result.xDefaultCount}`,
    `Duplicate hreflang values: ${result.duplicateHreflangCount}`,
    `Duplicate URLs: ${result.duplicateHrefCount}`,
    `Absolute URLs: ${result.absoluteUrlCount}`,
    "",
    "Findings:",
    ...issues,
  ].join("\n");
}

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, "\\|");
}

function getHreflangNotes(result: ValidationResult): HreflangNote[] {
  const notes: HreflangNote[] = [];

  if (result.xDefaultCount === 0) {
    notes.push({
      title: "No x-default found",
      message:
        "x-default is not required for every site, but it is useful when you have a default or language selector page.",
    });
  }

  if (result.duplicateHreflangCount > 0) {
    notes.push({
      title: "Duplicate hreflang values",
      message:
        "Duplicate language targets can confuse alternate selection. Check which URL should be the preferred version.",
    });
  }

  if (result.score >= 90) {
    notes.push({
      title: "Clean hreflang set",
      message:
        "Only minor or no common hreflang issues were found in the pasted markup.",
    });
  }

  notes.push({
    title: "Reciprocal tags need crawling",
    message:
      "This tool checks the tags you paste. It does not crawl alternate URLs to confirm live reciprocal hreflang tags.",
  });

  return notes;
}
