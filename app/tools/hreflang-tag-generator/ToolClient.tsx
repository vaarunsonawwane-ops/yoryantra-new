"use client";

import { useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type HreflangRow = {
  language: string;
  url: string;
};

type OutputMode = "html" | "header" | "sitemap";

type Entry = {
  code: string;
  url: string;
};

type Result = {
  output: string;
  errors: string[];
  warnings: string[];
  notes: string[];
  entries: Entry[];
};

const ISO_LANGUAGES = new Set<string>([
  "aa","ab","ae","af","ak","am","an","ar","as","av","ay","az","ba","be","bg","bi","bm","bn","bo","br","bs","ca","ce","ch","co","cr","cs","cu","cv","cy","da","de","dv","dz","ee","el","en","eo","es","et","eu","fa","ff","fi","fj","fo","fr","fy","ga","gd","gl","gn","gu","gv","ha","he","hi","ho","hr","ht","hu","hy","hz","ia","id","ie","ig","ii","ik","io","is","it","iu","ja","jv","ka","kg","ki","kj","kk","kl","km","kn","ko","kr","ks","ku","kv","kw","ky","la","lb","lg","li","ln","lo","lt","lu","lv","mg","mh","mi","mk","ml","mn","mr","ms","mt","my","na","nb","nd","ne","ng","nl","nn","no","nr","nv","ny","oc","oj","om","or","os","pa","pi","pl","ps","pt","qu","rm","rn","ro","ru","rw","sa","sc","sd","se","sg","si","sk","sl","sm","sn","so","sq","sr","ss","st","su","sv","sw","ta","te","tg","th","ti","tk","tl","tn","to","tr","ts","tt","tw","ty","ug","uk","ur","uz","ve","vi","vo","wa","wo","xh","yi","yo","za","zh","zu"
]);

const ISO_REGIONS = new Set<string>([
  "AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"
]);

const ISO_SCRIPTS = new Set<string>([
  "Adlm","Arab","Armi","Armn","Avst","Bali","Bamu","Bass","Batk","Beng","Bopo","Brah","Brai","Bugi","Buhd","Cakm","Cans","Cari","Cham","Cher","Copt","Cprt","Cyrl","Deva","Dsrt","Dupl","Egyp","Elba","Ethi","Geor","Glag","Goth","Gran","Grek","Gujr","Guru","Hang","Hani","Hano","Hans","Hant","Hebr","Hira","Hmng","Hrkt","Hung","Inds","Ital","Java","Jpan","Kali","Kana","Khar","Khmr","Knda","Kore","Lana","Laoo","Latn","Lepc","Limb","Lina","Linb","Lisu","Lyci","Lydi","Mahj","Mand","Mani","Marc","Mend","Merc","Mero","Mlym","Mong","Mroo","Mtei","Mymr","Narb","Nbat","Newa","Nkoo","Ogam","Olck","Orkh","Orya","Osge","Osma","Palm","Pauc","Perm","Phag","Phli","Phlp","Phlv","Phnx","Plrd","Prti","Rjng","Runr","Samr","Sarb","Saur","Sgnw","Shaw","Shrd","Sidd","Sind","Sinh","Sora","Sund","Sylo","Syrc","Tagb","Takr","Tale","Talu","Taml","Tang","Tavt","Telu","Tfng","Tglg","Thaa","Thai","Tibt","Tirh","Ugar","Vaii","Wara","Xpeo","Xsux","Yiii","Zinh","Zmth","Zsye","Zsym","Zxxx","Zyyy","Zzzz"
]);

function normalizeCode(input: string) {
  const raw = input.trim().replace(/_/g, "-");
  const parts = raw.split("-").filter(Boolean);
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!parts.length) {
    return {
      code: "",
      errors: ["Language code is empty."],
      warnings,
    };
  }

  const language = parts[0].toLowerCase();

  if (!/^[a-z]{2}$/.test(language) || !ISO_LANGUAGES.has(language)) {
    errors.push(
      `Unsupported language code "${parts[0]}". Google hreflang expects an assigned ISO 639-1 two-letter language code.`
    );
  }

  let script = "";
  let region = "";
  let index = 1;

  if (parts[index] && /^[A-Za-z]{4}$/.test(parts[index])) {
    script =
      parts[index].charAt(0).toUpperCase() +
      parts[index].slice(1).toLowerCase();

    if (!ISO_SCRIPTS.has(script)) {
      warnings.push(
        `Script code "${script}" has the right four-letter shape but is not in the local ISO 15924 snapshot. Confirm the assignment before publishing.`
      );
    }

    index += 1;
  }

  if (parts[index]) {
    if (/^[A-Za-z]{2}$/.test(parts[index])) {
      region = parts[index].toUpperCase();

      if (!ISO_REGIONS.has(region)) {
        errors.push(
          `Unsupported ISO 3166-1 alpha-2 region code "${region}". Reserved values such as UK, EU, and UN are not valid Google hreflang regions.`
        );
      }

      index += 1;
    } else {
      errors.push(
        `Unsupported hreflang segment "${parts[index]}". Google supports a two-letter region after the language, with an optional script before it.`
      );
      index += 1;
    }
  }

  if (index < parts.length) {
    errors.push(
      "Additional BCP 47 variants/extensions are outside the Google hreflang format handled here."
    );
  }

  if (input.indexOf("_") !== -1) {
    warnings.push("Underscores were normalized to hyphens.");
  }

  return {
    code: [language, script, region].filter(Boolean).join("-"),
    errors,
    warnings,
  };
}

function validateAbsoluteUrl(input: string) {
  const trimmed = input.trim();

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return {
        url: "",
        error: "Alternate URLs must use http:// or https://.",
      };
    }

    if (parsed.username || parsed.password) {
      return {
        url: "",
        error:
          "Do not use a URL containing username/password credentials in hreflang markup.",
      };
    }

    return {
      url: parsed.toString(),
      error: "",
    };
  } catch {
    return {
      url: "",
      error:
        "Use a fully qualified URL including https:// or http://.",
    };
  }
}

function escapeXmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


function createHtml(entries: Entry[]) {
  return entries
    .map(
      (entry) =>
        `<link rel="alternate" hreflang="${entry.code}" href="${escapeXmlAttribute(
          entry.url
        )}" />`
    )
    .join("\n");
}

function createHeader(entries: Entry[]) {
  return `Link: ${entries
    .map(
      (entry) =>
        `<${entry.url}>; rel="alternate"; hreflang="${entry.code}"`
    )
    .join(",\n      ")}`;
}

function createSitemapFragment(entries: Entry[]) {
  const links = entries
    .map(
      (entry) =>
        `  <xhtml:link rel="alternate" hreflang="${entry.code}" href="${escapeXmlAttribute(
          entry.url
        )}" />`
    )
    .join("\n");

  return [
    "<!-- Repeat this complete alternate block inside every corresponding <url> entry. -->",
    "<!-- The parent <urlset> must declare xmlns:xhtml=\"http://www.w3.org/1999/xhtml\". -->",
    links,
  ].join("\n");
}

function buildResult(
  rows: HreflangRow[],
  xDefaultUrl: string,
  currentPageUrl: string,
  mode: OutputMode
): Result {
  const errors: string[] = [];
  const warnings: string[] = [];
  const notes: string[] = [];
  const entries: Entry[] = [];

  rows.forEach((row, index) => {
    const hasLanguage = Boolean(row.language.trim());
    const hasUrl = Boolean(row.url.trim());

    if (!hasLanguage && !hasUrl) return;

    if (!hasLanguage || !hasUrl) {
      errors.push(
        `Row ${index + 1}: language/locale and alternate URL are both required.`
      );
      return;
    }

    const codeResult = normalizeCode(row.language);
    const urlResult = validateAbsoluteUrl(row.url);

    codeResult.errors.forEach((item) =>
      errors.push(`Row ${index + 1}: ${item}`)
    );
    codeResult.warnings.forEach((item) =>
      warnings.push(`Row ${index + 1}: ${item}`)
    );

    if (urlResult.error) {
      errors.push(`Row ${index + 1}: ${urlResult.error}`);
    }

    if (!codeResult.errors.length && !urlResult.error) {
      entries.push({
        code: codeResult.code,
        url: urlResult.url,
      });
    }
  });

  if (xDefaultUrl.trim()) {
    const result = validateAbsoluteUrl(xDefaultUrl);

    if (result.error) {
      errors.push(`x-default: ${result.error}`);
    } else {
      entries.push({
        code: "x-default",
        url: result.url,
      });
    }
  }

  const seenCodes = Object.create(null) as Record<string, number>;
  const urlToCodes = Object.create(null) as Record<string, string[]>;

  entries.forEach((entry) => {
    const codeKey = entry.code.toLowerCase();
    seenCodes[codeKey] = (seenCodes[codeKey] || 0) + 1;

    if (!urlToCodes[entry.url]) {
      urlToCodes[entry.url] = [];
    }

    urlToCodes[entry.url].push(entry.code);
  });

  Object.keys(seenCodes).forEach((code) => {
    if (seenCodes[code] > 1) {
      errors.push(
        `Duplicate hreflang value "${code}". One alternate set should not assign the same hreflang value to multiple URLs.`
      );
    }
  });

  Object.keys(urlToCodes).forEach((url) => {
    if (urlToCodes[url].length > 1) {
      warnings.push(
        `The same URL is used for several hreflang values (${urlToCodes[
          url
        ].join(", ")}): ${url}`
      );
    }
  });

  const languageGroups = Object.create(null) as Record<string, string[]>;

  entries.forEach((entry) => {
    if (entry.code === "x-default") return;

    const language = entry.code.split("-")[0];

    if (!languageGroups[language]) {
      languageGroups[language] = [];
    }

    languageGroups[language].push(entry.code);
  });

  Object.keys(languageGroups).forEach((language) => {
    const codes = languageGroups[language];
    const hasRegionalVariant = codes.some((code) => {
      const parts = code.split("-");
      return (
        parts.length >= 2 &&
        /^[A-Z]{2}$/.test(parts[parts.length - 1])
      );
    });

    if (
      hasRegionalVariant &&
      codes.indexOf(language) === -1
    ) {
      warnings.push(
        `Regional variants exist for "${language}" but no generic ${language} alternate is present. Google recommends considering a language catchall when it fits the site.`
      );
    }
  });

  if (currentPageUrl.trim()) {
    const current = validateAbsoluteUrl(currentPageUrl);

    if (current.error) {
      errors.push(`Current page URL: ${current.error}`);
    } else if (
      !entries.some((entry) => entry.url === current.url)
    ) {
      warnings.push(
        "The current page URL is not present in the alternate set. Each localized version should include a self-reference."
      );
    } else {
      notes.push(
        "The supplied current page URL is present in the generated alternate set."
      );
    }
  } else {
    notes.push(
      "Add the current page URL to check whether the entered set contains a self-reference."
    );
  }

  if (!entries.length) {
    warnings.push(
      "Add at least one complete language/URL pair to generate annotations."
    );
  }

  notes.push(
    "Only the entered alternate set is checked locally. Reciprocal return links on live pages cannot be confirmed without fetching those pages, and no network requests are made here."
  );

  if (mode === "sitemap") {
    notes.push(
      "Sitemap mode generates the xhtml:link block, not a complete sitemap. Repeat the same block under every corresponding <url> entry and declare the xhtml namespace on <urlset>."
    );
  }

  if (errors.length || !entries.length) {
    return {
      output: "",
      errors,
      warnings,
      notes,
      entries,
    };
  }

  const output =
    mode === "html"
      ? createHtml(entries)
      : mode === "header"
      ? createHeader(entries)
      : createSitemapFragment(entries);

  return {
    output,
    errors,
    warnings,
    notes,
    entries,
  };
}

export default function ToolClient() {
  const [rows, setRows] = useState<HreflangRow[]>([
    { language: "en", url: "" },
    { language: "en-IN", url: "" },
    { language: "de", url: "" },
  ]);
  const [xDefaultUrl, setXDefaultUrl] = useState("");
  const [currentPageUrl, setCurrentPageUrl] = useState("");
  const [mode, setMode] = useState<OutputMode>("html");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const result = useMemo(
    () =>
      buildResult(
        rows,
        xDefaultUrl,
        currentPageUrl,
        mode
      ),
    [rows, xDefaultUrl, currentPageUrl, mode]
  );

  const updateRow = (
    index: number,
    field: keyof HreflangRow,
    value: string
  ) => {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, [field]: value }
          : row
      )
    );
    setCopied(false);
    setCopyError("");
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      { language: "", url: "" },
    ]);
    setCopied(false);
    setCopyError("");
  };

  const removeRow = (index: number) => {
    setRows((current) =>
      current.filter((_, rowIndex) => rowIndex !== index)
    );
    setCopied(false);
    setCopyError("");
  };

  const loadExample = () => {
    setRows([
      {
        language: "en",
        url: "https://example.com/en/product",
      },
      {
        language: "en-IN",
        url: "https://example.com/in/product",
      },
      {
        language: "de",
        url: "https://example.com/de/produkt",
      },
    ]);
    setXDefaultUrl("https://example.com/choose-language");
    setCurrentPageUrl("https://example.com/in/product");
    setMode("html");
    setCopied(false);
    setCopyError("");
  };

  const reset = () => {
    setRows([
      { language: "en", url: "" },
      { language: "en-IN", url: "" },
      { language: "de", url: "" },
    ]);
    setXDefaultUrl("");
    setCurrentPageUrl("");
    setMode("html");
    setCopied(false);
    setCopyError("");
  };

  const copyOutput = async () => {
    if (!result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setCopyError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
      setCopyError("Clipboard access was blocked. Select the generated markup and copy it manually.");
    }
  };

  return (
    <ToolShell
      title="Hreflang Tag Generator"
      description="Build a complete alternate set for localized pages, check Google-oriented language and region codes, add x-default, and generate HTML, HTTP Link header, or sitemap markup."
    >
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-[1fr_2fr_auto]"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Language / locale
              </label>
              <input
                value={row.language}
                onChange={(event: { target: { value: string } }) =>
                  updateRow(
                    index,
                    "language",
                    event.target.value
                  )
                }
                placeholder="en-IN"
                spellCheck={false}
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fully qualified alternate URL
              </label>
              <input
                type="url"
                value={row.url}
                onChange={(event: { target: { value: string } }) =>
                  updateRow(index, "url", event.target.value)
                }
                placeholder="https://example.com/in/product"
                spellCheck={false}
                className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="yoryantra-btn-outline w-full"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            x-default URL <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            type="url"
            value={xDefaultUrl}
            onChange={(event: { target: { value: string } }) => {
              setXDefaultUrl(event.target.value);
              setCopied(false);
              setCopyError("");
            }}
            placeholder="https://example.com/choose-language"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Current page URL <span className="font-normal text-gray-500">(optional self-reference check)</span>
          </label>
          <input
            type="url"
            value={currentPageUrl}
            onChange={(event: { target: { value: string } }) => {
              setCurrentPageUrl(event.target.value);
              setCopied(false);
              setCopyError("");
            }}
            placeholder="https://example.com/in/product"
            spellCheck={false}
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Output format
        </label>
        <select
          value={mode}
          onChange={(event: { target: { value: string } }) => {
            setMode(event.target.value as OutputMode);
            setCopied(false);
            setCopyError("");
          }}
          className="w-full rounded-xl border border-gray-300 bg-white p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] md:max-w-md"
        >
          <option value="html">HTML link tags</option>
          <option value="header">HTTP Link header</option>
          <option value="sitemap">Sitemap xhtml:link block</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addRow}
          className="yoryantra-btn"
        >
          Add Alternate
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        {result.output ? (
          <button
            type="button"
            onClick={copyOutput}
            className="yoryantra-btn-outline"
          >
            {copied ? "Copied" : "Copy Output"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {copyError ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {copyError}
        </div>
      ) : null}

      {result.errors.length ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          <strong>Fix before using the output:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.warnings.length ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-gray-900">
          <strong>Implementation checks:</strong>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.notes.length ? (
        <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
          <ul className="list-disc space-y-1 pl-5">
            {result.notes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">
          Generated hreflang Markup
        </h3>
        <pre className="yoryantra-output min-h-[240px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {result.output ||
            "Complete the alternate set to generate markup."}
        </pre>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Hreflang Works as a Set, Not as a Tag You Add to One Page
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The most important part of hreflang is the relationship between localized URLs. If an English page, an Indian-English page, and a German page are alternatives of the same content, each participating page should expose the relevant alternate set—including itself. A single correct-looking tag on only one page does not establish the complete relationship.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google also expects return links. If one localized page points to another as an alternate, the other page should point back. The rows entered here can be checked for a local self-reference, but reciprocity on live pages cannot be proved without crawling them. Google documents the full relationship rules in its{" "}
            <a href="https://developers.google.com/search/docs/specialty/international/localized-versions" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              localized-versions guidance
            </a>.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Three Localized Pages in One Alternate Set
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-700">
            <p><code>en</code> → a general English page.</p>
            <p><code>en-IN</code> → English content adapted for India.</p>
            <p><code>de</code> → German content.</p>
            <p><code>x-default</code> → a language selector or neutral fallback for users who do not match another target.</p>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600">
            The same complete alternate set should normally appear on each corresponding version. The URL paths do not have to use the language code, and alternate URLs can live on different domains.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Language, Region, and Script Are Different Signals
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The first hreflang segment identifies the language, such as <code>en</code>, <code>de</code>, or <code>hi</code>. An optional two-letter region can narrow the audience, such as <code>en-IN</code> or <code>en-GB</code>. A region cannot stand alone because <code>IN</code> tells Google a country, not what language the page is written in.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Script codes are useful when the writing system matters, for example <code>zh-Hans</code> and <code>zh-Hant</code>. They can also be combined with a region where that level of targeting is genuinely needed. Script identifiers come from the{" "}
            <a href="https://www.unicode.org/iso15924/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
              ISO 15924 registry maintained by Unicode
            </a>.
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            UK, EU, and “Looks Plausible” Are Common Code Traps
          </h2>
          <p className="mt-4 leading-relaxed text-gray-700">
            Google expects assigned ISO 3166-1 alpha-2 region codes. The United Kingdom is <code>GB</code>, not <code>UK</code>. Reserved or non-country values such as <code>EU</code> and <code>UN</code> do not work as normal hreflang regions. A code can look syntactically neat and still be ignored if it is not an assigned value Google supports.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Choose One Implementation Method You Can Maintain Reliably
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google supports HTML <code>&lt;link&gt;</code> tags, HTTP <code>Link</code> headers, and XML sitemap annotations as equivalent ways to communicate localized alternates. Using all three does not create an SEO bonus; it creates three places where the sets can drift apart.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            HTML is usually straightforward for ordinary web pages. HTTP headers are particularly useful for non-HTML resources such as PDFs. Sitemap annotations can be easier when a large multilingual site already generates sitemaps centrally.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Sitemap Mode Produces the Repeated Alternate Block on Purpose
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A valid localized sitemap does not contain one free-floating list of alternate links. Each <code>&lt;url&gt;</code> entry has its own <code>&lt;loc&gt;</code> and repeats the complete set of <code>&lt;xhtml:link&gt;</code> alternates. The sitemap root also needs the XHTML namespace.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The generated sitemap output is therefore an alternate-link block, not a complete sitemap. Place the same block inside every corresponding URL entry produced by your sitemap system.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Hreflang and Canonical Tags Solve Different Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Hreflang helps Google choose the appropriate language or regional version for a searcher. Canonicalization helps identify the representative URL among duplicate or near-duplicate pages. If regional pages are intended to remain independently searchable, carelessly canonicalizing every version to one country page can work against that goal.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Review canonical and hreflang signals together when localized pages have very similar content. A technically correct alternate set cannot compensate for contradictory indexing signals elsewhere on the page.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Before Publishing a Large Alternate Set
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-gray-600">
            <li>Use fully qualified http/https URLs, not relative paths.</li>
            <li>Make sure every hreflang value maps to one intended alternate URL.</li>
            <li>Include a self-reference on each participating localized page.</li>
            <li>Check reciprocal links between alternate pages.</li>
            <li>Consider a generic language catchall when several regional versions exist.</li>
            <li>Use x-default when a neutral selector or fallback page is useful.</li>
            <li>Keep the same set synchronized if your CMS or deployment process changes URLs.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Check the Other Signals Around a Localized Page
          </h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/hreflang-tag-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
