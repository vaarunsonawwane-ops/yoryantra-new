"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type HreflangRow = { language: string; url: string };
type OutputMode = "html" | "header" | "sitemap";

const ISO_LANGUAGES = new Set<string>(["aa", "ab", "ae", "af", "ak", "am", "an", "ar", "as", "av", "ay", "az", "ba", "be", "bg", "bi", "bm", "bn", "bo", "br", "bs", "ca", "ce", "ch", "co", "cr", "cs", "cu", "cv", "cy", "da", "de", "dv", "dz", "ee", "el", "en", "eo", "es", "et", "eu", "fa", "ff", "fi", "fj", "fo", "fr", "fy", "ga", "gd", "gl", "gn", "gu", "gv", "ha", "he", "hi", "ho", "hr", "ht", "hu", "hy", "hz", "ia", "id", "ie", "ig", "ii", "ik", "io", "is", "it", "iu", "ja", "jv", "ka", "kg", "ki", "kj", "kk", "kl", "km", "kn", "ko", "kr", "ks", "ku", "kv", "kw", "ky", "la", "lb", "lg", "li", "ln", "lo", "lt", "lu", "lv", "mg", "mh", "mi", "mk", "ml", "mn", "mr", "ms", "mt", "my", "na", "nb", "nd", "ne", "ng", "nl", "nn", "no", "nr", "nv", "ny", "oc", "oj", "om", "or", "os", "pa", "pi", "pl", "ps", "pt", "qu", "rm", "rn", "ro", "ru", "rw", "sa", "sc", "sd", "se", "sg", "sh", "si", "sk", "sl", "sm", "sn", "so", "sq", "sr", "ss", "st", "su", "sv", "sw", "ta", "te", "tg", "th", "ti", "tk", "tl", "tn", "to", "tr", "ts", "tt", "tw", "ty", "ug", "uk", "ur", "uz", "ve", "vi", "vo", "wa", "wo", "xh", "yi", "yo", "za", "zh", "zu"]);
const ISO_REGIONS = new Set<string>(["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"]);
const ISO_SCRIPTS = new Set<string>(["Adlm", "Afak", "Aghb", "Ahom", "Arab", "Aran", "Armi", "Armn", "Avst", "Bali", "Bamu", "Bass", "Batk", "Beng", "Bhks", "Blis", "Bopo", "Brah", "Brai", "Bugi", "Buhd", "Cakm", "Cans", "Cari", "Cham", "Cher", "Cirt", "Copt", "Cprt", "Cyrl", "Cyrs", "Deva", "Dsrt", "Dupl", "Egyd", "Egyh", "Egyp", "Elba", "Ethi", "Geok", "Geor", "Glag", "Goth", "Gran", "Grek", "Gujr", "Guru", "Hanb", "Hang", "Hani", "Hano", "Hans", "Hant", "Hatr", "Hebr", "Hira", "Hluw", "Hmng", "Hrkt", "Hung", "Inds", "Ital", "Jamo", "Java", "Jpan", "Jurc", "Kali", "Kana", "Khar", "Khmr", "Khoj", "Kitl", "Kits", "Knda", "Kore", "Kpel", "Kthi", "Lana", "Laoo", "Latf", "Latg", "Latn", "Leke", "Lepc", "Limb", "Lina", "Linb", "Lisu", "Loma", "Lyci", "Lydi", "Mahj", "Mand", "Mani", "Marc", "Maya", "Mend", "Merc", "Mero", "Mlym", "Modi", "Mong", "Moon", "Mroo", "Mtei", "Mult", "Mymr", "Narb", "Nbat", "Newa", "Nkgb", "Nkoo", "Nshu", "Ogam", "Olck", "Orkh", "Orya", "Osge", "Osma", "Palm", "Pauc", "Perm", "Phag", "Phli", "Phlp", "Phlv", "Phnx", "Piqd", "Plrd", "Prti", "Qaaa", "Qabx", "Rjng", "Roro", "Runr", "Samr", "Sara", "Sarb", "Saur", "Sgnw", "Shaw", "Shrd", "Sidd", "Sind", "Sinh", "Sora", "Sund", "Sylo", "Syrc", "Syre", "Syrj", "Syrn", "Tagb", "Takr", "Tale", "Talu", "Taml", "Tang", "Tavt", "Telu", "Teng", "Tfng", "Tglg", "Thaa", "Thai", "Tibt", "Tirh", "Ugar", "Vaii", "Visp", "Wara", "Wole", "Xpeo", "Xsux", "Yiii", "Zinh", "Zmth", "Zsye", "Zsym", "Zxxx", "Zyyy", "Zzzz"]);

function normalizeCode(input: string) {
  const raw = input.trim().replace(/_/g, "-");
  const parts = raw.split("-").filter(Boolean);
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!parts.length) return { code: "", errors: ["Language code is empty."], warnings };

  const language = parts[0].toLowerCase();
  if (!/^[a-z]{2}$/.test(language) || !ISO_LANGUAGES.has(language)) {
    errors.push(`Unsupported language code: ${parts[0]}. Google hreflang uses ISO 639-1 language codes.`);
  }

  let script = "";
  let region = "";
  let index = 1;
  if (parts[index] && /^[A-Za-z]{4}$/.test(parts[index])) {
    script = parts[index][0].toUpperCase() + parts[index].slice(1).toLowerCase();
    if (!ISO_SCRIPTS.has(script)) errors.push(`Unknown ISO 15924 script code: ${script}.`);
    index += 1;
  }
  if (parts[index]) {
    if (/^[A-Za-z]{2}$/.test(parts[index])) {
      region = parts[index].toUpperCase();
      if (!ISO_REGIONS.has(region)) errors.push(`Unknown ISO 3166-1 alpha-2 region code: ${region}.`);
      index += 1;
    } else {
      errors.push(`Unsupported region segment: ${parts[index]}. Google hreflang region targeting uses a two-letter ISO 3166-1 code.`);
      index += 1;
    }
  }
  if (index < parts.length) errors.push("Additional hreflang variants are not supported by this Google-oriented generator.");
  if (input.includes("_")) warnings.push("Underscores were normalized to hyphens.");

  return { code: [language, script, region].filter(Boolean).join("-"), errors, warnings };
}

function validateAbsoluteHttpUrl(input: string) {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return { url: "", error: "URL must use http:// or https://." };
    return { url: url.toString(), error: "" };
  } catch {
    return { url: "", error: "Use a fully qualified URL including https:// or http://." };
  }
}

function escapeXmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildOutput(rows: HreflangRow[], xDefaultUrl: string, mode: OutputMode) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entries: Array<{ code: string; url: string }> = [];

  rows.forEach((row, index) => {
    const hasAny = row.language.trim() || row.url.trim();
    if (!hasAny) return;
    if (!row.language.trim() || !row.url.trim()) {
      errors.push(`Row ${index + 1}: both language code and URL are required.`);
      return;
    }
    const codeResult = normalizeCode(row.language);
    const urlResult = validateAbsoluteHttpUrl(row.url);
    codeResult.errors.forEach((item) => errors.push(`Row ${index + 1}: ${item}`));
    codeResult.warnings.forEach((item) => warnings.push(`Row ${index + 1}: ${item}`));
    if (urlResult.error) errors.push(`Row ${index + 1}: ${urlResult.error}`);
    if (!codeResult.errors.length && !urlResult.error) entries.push({ code: codeResult.code, url: urlResult.url });
  });

  if (xDefaultUrl.trim()) {
    const xUrl = validateAbsoluteHttpUrl(xDefaultUrl);
    if (xUrl.error) errors.push(`x-default: ${xUrl.error}`);
    else entries.push({ code: "x-default", url: xUrl.url });
  }

  const seenCodes = new Map<string, number>();
  const seenUrls = new Map<string, string[]>();
  entries.forEach((entry) => {
    const key = entry.code.toLowerCase();
    seenCodes.set(key, (seenCodes.get(key) || 0) + 1);
    const codes = seenUrls.get(entry.url) || [];
    codes.push(entry.code);
    seenUrls.set(entry.url, codes);
  });
  seenCodes.forEach((count, code) => { if (count > 1) errors.push(`Duplicate hreflang code: ${code}. Each code should identify one alternate URL in the set.`); });
  seenUrls.forEach((codes, url) => { if (codes.length > 1) warnings.push(`The same URL is used for multiple hreflang values (${codes.join(", ")}): ${url}`); });

  const languageGroups = new Map<string, string[]>();
  entries.filter((entry) => entry.code !== "x-default").forEach((entry) => {
    const language = entry.code.split("-")[0];
    const current = languageGroups.get(language) || [];
    current.push(entry.code);
    languageGroups.set(language, current);
  });
  languageGroups.forEach((codes, language) => {
    const hasRegionalVariant = codes.some((code) => {
      const parts = code.split("-");
      return parts.length >= 2 && /^[A-Z]{2}$/.test(parts[parts.length - 1]);
    });
    if (hasRegionalVariant && !codes.includes(language)) {
      warnings.push(`You have regional variants for ${language} but no generic ${language} catchall. Google recommends considering one when it fits your site.`);
    }
  });

  if (!entries.length) warnings.push("Add at least one complete language/URL pair to generate annotations.");
  warnings.push("Deploy the same complete alternate set on every localized version, including a self-reference. Return links are checked across live pages, not by this local generator.");

  if (errors.length) return { output: "", errors, warnings, count: entries.length };

  let output = "";
  if (mode === "html") {
    output = entries.map((entry) => `<link rel="alternate" hreflang="${entry.code}" href="${escapeXmlAttribute(entry.url)}" />`).join("\n");
  } else if (mode === "header") {
    output = `Link: ${entries.map((entry) => `<${entry.url}>; rel="alternate"; hreflang="${entry.code}"`).join(",\n      ")}`;
  } else {
    output = entries.map((entry) => `<xhtml:link rel="alternate" hreflang="${entry.code}" href="${escapeXmlAttribute(entry.url)}" />`).join("\n");
  }
  return { output, errors, warnings, count: entries.length };
}

export default function ToolClient() {
  const [rows, setRows] = useState<HreflangRow[]>([
    { language: "en", url: "" },
    { language: "en-US", url: "" },
    { language: "en-GB", url: "" },
  ]);
  const [xDefaultUrl, setXDefaultUrl] = useState("");
  const [mode, setMode] = useState<OutputMode>("html");

  const result = useMemo(() => buildOutput(rows, xDefaultUrl, mode), [rows, xDefaultUrl, mode]);

  const updateRow = (index: number, field: keyof HreflangRow, value: string) => {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  };
  const addRow = () => setRows((current) => [...current, { language: "", url: "" }]);
  const removeRow = (index: number) => setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  const loadExample = () => {
    setRows([
      { language: "en", url: "https://example.com/en/page" },
      { language: "en-US", url: "https://example.com/us/page" },
      { language: "de", url: "https://example.com/de/page" },
    ]);
    setXDefaultUrl("https://example.com/language-selector");
  };
  const reset = () => {
    setRows([{ language: "en", url: "" }, { language: "en-US", url: "" }, { language: "en-GB", url: "" }]);
    setXDefaultUrl("");
    setMode("html");
  };

  return (
    <ToolShell title="Hreflang Tag Generator" description="Build validated hreflang annotations for HTML, HTTP Link headers, or XML sitemaps using Google-supported language and region conventions.">
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_2fr_auto]">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Language / locale</label>
              <input value={row.language} onChange={(event: { target: { value: string } }) => updateRow(index, "language", event.target.value)} placeholder="en-US" className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition" />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Fully qualified alternate URL</label>
              <input type="url" value={row.url} onChange={(event: { target: { value: string } }) => updateRow(index, "url", event.target.value)} placeholder="https://example.com/us/page" className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition" />
            </div>
            <div className="flex items-end"><button onClick={() => removeRow(index)} className="yoryantra-btn-outline w-full">Remove</button></div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">x-default URL (optional)</label>
          <input type="url" value={xDefaultUrl} onChange={(event: { target: { value: string } }) => setXDefaultUrl(event.target.value)} placeholder="https://example.com/language-selector" className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition" />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Output format</label>
          <select value={mode} onChange={(event: { target: { value: string } }) => setMode(event.target.value as OutputMode)} className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]">
            <option value="html">HTML &lt;link&gt; tags</option>
            <option value="header">HTTP Link header</option>
            <option value="sitemap">Sitemap xhtml:link entries</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={addRow} className="yoryantra-btn">Add Alternate</button>
        <button onClick={loadExample} className="yoryantra-btn-outline">Load Example</button>
        {result.output && <button onClick={() => navigator.clipboard.writeText(result.output)} className="yoryantra-btn-outline">Copy Output</button>}
        <button onClick={reset} className="yoryantra-btn-outline">Reset</button>
      </div>

      {result.errors.length > 0 && <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><strong>Fix before using:</strong><ul className="mt-2 list-disc list-inside space-y-1">{result.errors.map((item) => <li key={item}>{item}</li>)}</ul></div>}
      {result.warnings.length > 0 && <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900"><strong>Implementation checks:</strong><ul className="mt-2 list-disc list-inside space-y-1">{result.warnings.map((item) => <li key={item}>{item}</li>)}</ul></div>}

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Generated hreflang Annotations</h3>
        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">{result.output || "Valid hreflang output will appear here."}</pre>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Generate a Complete Alternate Set, Not Isolated Tags</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">Google treats HTML tags, HTTP Link headers, and sitemap annotations as equivalent ways to declare localized alternatives. Whichever method you choose, every language version should list itself and the other relevant versions, and alternate URLs must be fully qualified.</p>
          <p className="mt-4 text-gray-600 leading-relaxed">Return links matter too: if page A names page B as an alternate, page B should point back to page A. This generator can validate the set you enter, but it cannot confirm reciprocal markup on live pages because it makes no network requests.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Language, Script, Region, and x-default</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">The first segment must be an ISO 639-1 two-letter language code. You may add an ISO 15924 script and/or an ISO 3166-1 alpha-2 region, such as <code>zh-Hant</code>, <code>en-GB</code>, or <code>zh-Hans-US</code>. A country code by itself is not valid hreflang targeting.</p>
          <p className="mt-3 text-gray-600 leading-relaxed"><code>x-default</code> is a fallback for users whose language or region does not match another annotation. It is especially useful for language selectors and neutral fallback pages.</p>
        </div>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900"><strong>Common mistake:</strong> do not use <code>UK</code> for the United Kingdom in hreflang. The ISO 3166-1 alpha-2 region code is <code>GB</code>. Likewise, a structurally plausible but unassigned language or region code can be ignored by Google.</div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Official Reference</h2>
          <p className="mt-3 text-gray-600 leading-relaxed"><a className="underline" href="https://developers.google.com/search/docs/specialty/international/localized-versions" target="_blank" rel="noreferrer">Google Search Central: localized versions of pages</a> covers self-references, return links, absolute URLs, supported codes, x-default, HTTP headers, and sitemap annotations.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Explore Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/hreflang-tag-generator" />
        </div>
      </section>
    </ToolShell>
  );
}
