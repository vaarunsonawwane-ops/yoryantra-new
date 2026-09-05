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
  script: string;
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
<link rel="alternate" hreflang="en-US" href="https://example.com/us/" />
<link rel="alternate" hreflang="en-GB" href="https://example.com/uk/" />
<link rel="alternate" hreflang="hi-IN" href="https://example.com/in/" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />`;

const languageCodes = new Set([
  "aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az",
  "ba", "be", "bg", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch",
  "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el",
  "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy",
  "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht",
  "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it",
  "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko",
  "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo",
  "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt",
  "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny",
  "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm",
  "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk",
  "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta",
  "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw",
  "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi",
  "yo", "za", "zh", "zu",
]);

const regionCodes = new Set([
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT",
  "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI",
  "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY",
  "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM",
  "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK",
  "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL",
  "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR",
  "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN",
  "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS",
  "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW",
  "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP",
  "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM",
  "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM",
  "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF",
  "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW",
  "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
]);

const scriptCodes = new Set([
  "Adlm", "Afak", "Aghb", "Ahom", "Arab", "Aran", "Armi", "Armn", "Avst", "Bali", "Bamu", "Bass",
  "Batk", "Beng", "Bhks", "Blis", "Bopo", "Brah", "Brai", "Bugi", "Buhd", "Cakm", "Cans", "Cari",
  "Cham", "Cher", "Cirt", "Copt", "Cprt", "Cyrl", "Cyrs", "Deva", "Dsrt", "Dupl", "Egyd", "Egyh",
  "Egyp", "Elba", "Ethi", "Geok", "Geor", "Glag", "Goth", "Gran", "Grek", "Gujr", "Guru", "Hanb",
  "Hang", "Hani", "Hano", "Hans", "Hant", "Hatr", "Hebr", "Hira", "Hluw", "Hmng", "Hrkt", "Hung",
  "Inds", "Ital", "Jamo", "Java", "Jpan", "Jurc", "Kali", "Kana", "Khar", "Khmr", "Khoj", "Kitl",
  "Kits", "Knda", "Kore", "Kpel", "Kthi", "Lana", "Laoo", "Latf", "Latg", "Latn", "Leke", "Lepc",
  "Limb", "Lina", "Linb", "Lisu", "Loma", "Lyci", "Lydi", "Mahj", "Mand", "Mani", "Marc", "Maya",
  "Mend", "Merc", "Mero", "Mlym", "Modi", "Mong", "Moon", "Mroo", "Mtei", "Mult", "Mymr", "Narb",
  "Nbat", "Newa", "Nkgb", "Nkoo", "Nshu", "Ogam", "Olck", "Orkh", "Orya", "Osge", "Osma", "Palm",
  "Pauc", "Perm", "Phag", "Phli", "Phlp", "Phlv", "Phnx", "Piqd", "Plrd", "Prti", "Qaaa", "Qabx",
  "Rjng", "Roro", "Runr", "Samr", "Sara", "Sarb", "Saur", "Sgnw", "Shaw", "Shrd", "Sidd", "Sind",
  "Sinh", "Sora", "Sund", "Sylo", "Syrc", "Syre", "Syrj", "Syrn", "Tagb", "Takr", "Tale", "Talu",
  "Taml", "Tang", "Tavt", "Telu", "Teng", "Tfng", "Tglg", "Thaa", "Thai", "Tibt", "Tirh", "Ugar",
  "Vaii", "Visp", "Wara", "Wole", "Xpeo", "Xsux", "Yiii", "Zinh", "Zmth", "Zsye", "Zsym", "Zxxx",
  "Zyyy", "Zzzz",
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

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setError("The browser could not copy the report. Select the output and copy it manually.");
    }
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
      description="Validate hreflang tags for language codes, region codes, x-default, duplicate targets, absolute URLs, and self-reference."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="hreflang-input" className="block mb-2 text-sm font-medium text-gray-700">
          Hreflang Tags or Sitemap XML
        </label>

        <textarea
          id="hreflang-input"
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
          like en-US https://example.com/us/.
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
            <label htmlFor="hreflang-current-url" className="block text-sm font-medium text-gray-700">
              Current Page URL
            </label>

            <input
              id="hreflang-current-url"
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
        <button onClick={validateHreflang} className="yoryantra-btn shrink-0 whitespace-nowrap">
          Validate Hreflang
        </button>

        <button onClick={copyOutput} className="yoryantra-btn shrink-0 whitespace-nowrap" disabled={!output}>
          {copied ? "Copied" : "Copy Output"}
        </button>

        <button onClick={loadExample} className="yoryantra-btn-outline shrink-0 whitespace-nowrap">
          Load Example
        </button>

        <button onClick={resetAll} className="yoryantra-btn-outline shrink-0 whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Review score" value={`${result.score}/100`} />
          <SummaryCard label="Tags" value={result.totalTags.toLocaleString()} />
          <SummaryCard label="x-default" value={result.xDefaultCount.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          Review score is a local heuristic for prioritizing findings, not a Google Search Console metric or ranking signal.
        </p>
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
                  <th className="px-4 py-3 font-semibold">Script</th>
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

      {result && result.issues.some((issue) => issue.severity === "high") && (
        <FindingGroup
          title="Implementation errors"
          issues={result.issues.filter((issue) => issue.severity === "high")}
          tone="error"
        />
      )}

      {result && result.issues.some((issue) => issue.severity === "warning") && (
        <FindingGroup
          title="Hreflang cautions"
          issues={result.issues.filter((issue) => issue.severity === "warning")}
          tone="warning"
        />
      )}

      {result && result.issues.some((issue) => issue.severity === "info") && (
        <FindingGroup
          title="Review notes"
          issues={result.issues.filter((issue) => issue.severity === "info")}
          tone="info"
        />
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Hreflang notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-gray-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-gray-700">
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
            <button onClick={copyOutput} className="yoryantra-btn-outline shrink-0 whitespace-nowrap text-sm">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Hreflang validation output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Parsing and validation run in this page. The code does not send pasted hreflang markup or URLs to a validation API.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Hreflang is a cluster, not a tag-by-tag setting
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            International pages work as a connected alternate set. Every localized version should list itself and the other versions, and the alternate URLs must be fully qualified. A clean-looking tag on one page can still fail when another page in the cluster does not return the relationship.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The pasted set is checked for locale syntax, duplicate locale targets, absolute URLs, x-default, and self-reference when you provide the current page URL. Reciprocal links on remote pages are deliberately outside the browser-only check because confirming them requires fetching those pages.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-xl font-semibold text-amber-950">Locale codes need the right shape</h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-900">
              Google supports ISO 639-1 language codes, optional ISO 3166-1 Alpha-2 regions, and ISO 15924 scripts such as zh-Hant. A script can also be followed by a region, for example zh-Hans-US. Reserved region labels such as UK are not treated as GB.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">x-default is a fallback, not a mandatory locale</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              x-default is recommended when a fallback or language-selector URL makes sense. Its absence is therefore a review note by default rather than a hard failure.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Before publishing a locale cluster</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the HTML alternate links, sitemap XML, or locale-and-URL lines.</li>
            <li>Enter the current page URL when you want a local self-reference check.</li>
            <li>Resolve invalid locale codes, missing alternate relationships, relative URLs, and duplicate locale assignments.</li>
            <li>Visit or crawl the alternate pages separately to confirm return links.</li>
            <li>Keep the same cluster consistent across every localized version.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What the pasted markup can and cannot prove</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Visible here</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">Locale syntax, x-default, duplicate locale assignments, duplicate destinations, fully qualified URLs, and self-reference against the URL you enter.</p>
            </div>
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-semibold text-amber-950">Needs a crawler or live-page check</h3>
              <p className="mt-2 text-sm leading-relaxed text-amber-900">Return links, HTTP status, canonical behavior, indexability, redirects, and whether the alternate page actually contains the intended localized content.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Google's current hreflang rules</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google documents HTML, HTTP headers, and XML sitemaps as equivalent ways to declare localized versions. It also requires each language version to list itself and the other versions. The source of truth for these Google-specific checks is the
            {" "}<a href="https://developers.google.com/search/docs/specialty/international/localized-versions" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">localized versions documentation</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Hreflang decisions that often cause mistakes</h2>
          <div className="mt-5 space-y-6">
            <div><h3 className="font-semibold text-gray-900">Should every locale include itself?</h3><p className="mt-2 text-gray-600 leading-relaxed">Yes for Google's implementation guidance. Each version should list itself along with the other alternate versions.</p></div>
            <div><h3 className="font-semibold text-gray-900">Can alternate pages live on different domains?</h3><p className="mt-2 text-gray-600 leading-relaxed">Yes. The relationship is not restricted to one host, but each alternate URL still needs to be fully qualified.</p></div>
            <div><h3 className="font-semibold text-gray-900">Does a valid pasted set confirm reciprocal links?</h3><p className="mt-2 text-gray-600 leading-relaxed">No. The remote pages are not fetched, so return links must be checked separately.</p></div>
            <div><h3 className="font-semibold text-gray-900">Is x-default always required?</h3><p className="mt-2 text-gray-600 leading-relaxed">No. It is a recommended fallback for unmatched languages, especially on selector or global fallback pages.</p></div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/hreflang-tag-generator" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Hreflang Tag Generator</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Canonical URL Checker</Link>
            <Link href="/tools/sitemap-validator" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Sitemap Validator</Link>
            <Link href="/tools/sitemap-url-extractor" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Sitemap URL Extractor</Link>
            <Link href="/tools/meta-robots-tag-generator" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Meta Robots Tag Generator</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function FindingGroup({
  title,
  issues,
  tone,
}: {
  title: string;
  issues: HreflangIssue[];
  tone: "error" | "warning" | "info";
}) {
  const classes = tone === "error"
    ? "border-red-200 bg-red-50 text-red-800"
    : tone === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : "border-gray-200 bg-gray-50 text-gray-700";

  const shownIssues = issues.slice(0, 20);
  const hiddenCount = Math.max(0, issues.length - shownIssues.length);

  return (
    <div role={tone === "error" ? "alert" : undefined} className={`mt-6 rounded-xl border p-4 ${classes}`}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-3 space-y-3">
        {shownIssues.map((issue, index) => (
          <div key={`${issue.title}-${index}`}>
            <p className="text-sm font-semibold">{issue.title}</p>
            <p className="mt-1 text-sm leading-relaxed">{issue.message}</p>
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <p className="mt-3 text-xs leading-relaxed opacity-80">
          {hiddenCount.toLocaleString()} more finding{hiddenCount === 1 ? "" : "s"} are included in the copied report.
        </p>
      )}
    </div>
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
  const entryIssues: HreflangIssue[] = [];
  entries.forEach((entry) => {
    entry.issues.forEach((issue) => {
      entryIssues.push({
        ...issue,
        title: `Entry ${entry.order}: ${issue.title}`,
      });
    });
  });
  const issues = [...globalIssues, ...entryIssues];
  const invalidCodeCount = entries.filter((entry) =>
    entry.issues.some((issue) =>
      issue.title.includes("Invalid") ||
      issue.title.includes("Unknown") ||
      issue.title.includes("Unsupported") ||
      issue.title.includes("Unrecognized")
    )
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
  const linkNodes = Array.from(doc.querySelectorAll("link[hreflang]"));

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
    script: parsed.script,
    region: parsed.region,
    isXDefault: clean.toLowerCase() === "x-default",
    isAbsoluteUrl: isAbsoluteHttpUrl(href.trim()),
    duplicateHreflang: false,
    duplicateHref: false,
    issues: [],
  };
}

function parseHreflang(value: string) {
  if (!value || value.toLowerCase() === "x-default") {
    return { language: "", script: "", region: "" };
  }

  const parts = value.split("-");
  const hasScript = parts.length >= 2 && /^[A-Za-z]{4}$/.test(parts[1] || "");
  const regionIndex = hasScript ? 2 : 1;

  return {
    language: parts[0] || "",
    script: hasScript ? (parts[1] || "") : "",
    region: parts[regionIndex] || "",
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

    if (hrefKey && !entry.isXDefault) {
      hrefCounts.set(hrefKey, (hrefCounts.get(hrefKey) || 0) + 1);
    }
  });

  return entries.map((entry) => ({
    ...entry,
    duplicateHreflang: entry.hreflang ? (hreflangCounts.get(entry.hreflang.toLowerCase()) || 0) > 1 : false,
    duplicateHref: entry.href && !entry.isXDefault
      ? (hrefCounts.get(normalizeUrl(entry.href)) || 0) > 1
      : false,
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
      severity: "high",
      title: "rel does not include alternate",
      message: "A hreflang link declaration needs rel=\"alternate\" to describe the alternate relationship.",
    });
  }

  if (options.requireAbsoluteUrls && entry.href && !entry.isAbsoluteUrl) {
    issues.push({
      severity: "high",
      title: "URL is not fully qualified",
      message: "Google requires a fully qualified alternate URL including http:// or https://.",
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

  if (parts.length < 1 || parts.length > 3 || !parts[0]) {
    return {
      severity: "high",
      title: "Invalid hreflang shape",
      message: "Use language, language-region, language-script, or language-script-region, such as en, en-US, zh-Hant, or zh-Hans-US.",
    };
  }

  const language = parts[0].toLowerCase();
  if (!/^[a-z]{2}$/.test(language) || !languageCodes.has(language)) {
    return {
      severity: "high",
      title: "Unsupported language code",
      message: "Google's hreflang guidance uses ISO 639-1 two-letter language codes.",
    };
  }

  let script = "";
  let region = "";
  if (parts[1] && /^[A-Za-z]{4}$/.test(parts[1])) {
    script = parts[1];
    region = parts[2] || "";
  } else {
    region = parts[1] || "";
    if (parts[2]) {
      return {
        severity: "high",
        title: "Invalid script or region order",
        message: "When three parts are used, the four-letter script comes before the two-letter region.",
      };
    }
  }

  if (script) {
    const canonicalScript = script.slice(0, 1).toUpperCase() + script.slice(1).toLowerCase();
    if (!scriptCodes.has(canonicalScript)) {
      return {
        severity: "warning",
        title: "Unrecognized script code",
        message: "The four-letter script is not in the ISO 15924 registry bundled with this page.",
      };
    }

    if (/^Q[a-z]{3}$/.test(canonicalScript) || ["Zxxx", "Zyyy", "Zzzz"].includes(canonicalScript)) {
      return {
        severity: "warning",
        title: "Reserved or special-purpose script code",
        message: "The script code is reserved, private-use, unknown, or undetermined rather than a normal writing-system target. Review whether it belongs in hreflang.",
      };
    }
  }

  if (region) {
    if (!/^[A-Za-z]{2}$/.test(region)) {
      return {
        severity: "high",
        title: "Invalid region code",
        message: "The optional region must be an ISO 3166-1 Alpha-2 code such as US, GB, or IN.",
      };
    }

    if (!regionCodes.has(region.toUpperCase())) {
      return {
        severity: "high",
        title: "Unsupported region code",
        message: "The region is not an officially assigned ISO 3166-1 Alpha-2 code. Use GB rather than the reserved label UK.",
      };
    }

    if (warnLowercaseRegion && region !== region.toUpperCase()) {
      return {
        severity: "info",
        title: "Region code casing",
        message: "Region codes are conventionally written uppercase, such as en-US or hi-IN; matching is not treated as case-sensitive here.",
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
    const hasSelfReference = entries.some(
      (entry) => !entry.isXDefault && normalizeUrl(entry.href) === cleanCurrentUrl
    );

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
    }
    // Informational notes do not reduce the heuristic score.

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
      ["order", "hreflang", "language", "script", "region", "href", "absolute_url", "duplicate_hreflang", "issues"],
      ...result.entries.map((entry) => [
        String(entry.order),
        entry.hreflang,
        entry.language,
        entry.script,
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
        `| ${escapeMarkdown(entry.hreflang || "(missing)")} | ${escapeMarkdown(entry.script || "—")} | ${escapeMarkdown(entry.href || "(missing)")} | ${entry.issues.length} |`
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
    `Review score (heuristic): ${result.score}/100`,
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

function isAbsoluteHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    const normalized = parsed.toString();
    return normalized.endsWith("/") && parsed.pathname === "/" && !parsed.search
      ? normalized.slice(0, -1)
      : normalized.replace(/\/$/, "");
  } catch {
    return trimmed.replace(/\/$/, "");
  }
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
        "x-default is not required for every site, but it can serve as the fallback for unmatched languages or a language selector page.",
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
        "Only minor or no common hreflang issues were found by the local heuristic. Live reciprocal links and indexability still need separate checks.",
    });
  }

  notes.push({
    title: "Reciprocal tags need crawling",
    message:
      "The pasted markup is checked locally; alternate URLs are not crawled to confirm live reciprocal hreflang tags.",
  });

  return notes;
}
