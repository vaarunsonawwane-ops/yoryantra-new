"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type MetaResult = {
  output: string;
  warnings: string[];
  normalizedUrl: string;
};

export default function ToolClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [siteName, setSiteName] = useState("");
  const [result, setResult] = useState<MetaResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const generateMetaTags = () => {
    if (!title.trim()) {
      setError("Enter a page title before generating markup.");
      setResult(null);
      return;
    }

    try {
      const warnings: string[] = [];
      const normalizedUrl = normalizeOptionalHttpUrl(url, "Page URL", warnings, true);
      const normalizedImage = normalizeOptionalHttpUrl(image, "Image URL", warnings, false);

      if (!description.trim()) warnings.push("No meta description was supplied. Google may still create a snippet from page content, but a useful page-specific description is worth providing.");
      if (!normalizedUrl) warnings.push("No page URL was supplied, so canonical and og:url markup are omitted.");
      if (!normalizedImage) warnings.push("No social image URL was supplied. Open Graph markup is incomplete without og:image, and the X card will use the summary card type.");
      if (normalizedImage && !imageAlt.trim()) warnings.push("A social image is present without descriptive image alt text.");

      const output = buildMarkup({
        title: title.trim(),
        description: description.trim(),
        url: normalizedUrl,
        image: normalizedImage,
        imageAlt: imageAlt.trim(),
        siteName: siteName.trim(),
      });

      setResult({ output, warnings, normalizedUrl });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : "Unable to generate metadata.");
    }
  };

  const copyOutput = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
  };

  const resetAll = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setImage("");
    setImageAlt("");
    setSiteName("");
    clearResult();
  };

  return (
    <ToolShell
      title="Meta Tag Generator"
      description="Generate escaped page title, description, canonical, Open Graph, and X card markup without obsolete meta-keywords output or fixed-length SEO scoring."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">Page title</label>
          <input
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              clearResult();
            }}
            placeholder="A clear, page-specific title"
            className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
          <p className="mt-2 text-xs text-gray-500">{title.length.toLocaleString()} characters · informational only; search engines can rewrite displayed title links.</p>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">Meta description</label>
          <textarea
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              clearResult();
            }}
            placeholder="A concise, accurate summary of this specific page"
            className="w-full min-h-[120px] rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
          />
          <p className="mt-2 text-xs text-gray-500">{description.length.toLocaleString()} characters · Google has no fixed meta-description character limit; snippets are query- and device-dependent.</p>
        </div>

        <Field label="Canonical / page URL" value={url} setValue={setUrl} clearResult={clearResult} placeholder="https://example.com/page" />
        <Field label="Site name (optional)" value={siteName} setValue={setSiteName} clearResult={clearResult} placeholder="Example Site" />
        <Field label="Social image URL (optional)" value={image} setValue={setImage} clearResult={clearResult} placeholder="https://example.com/preview.jpg" />
        <Field label="Social image alt text (optional)" value={imageAlt} setValue={setImageAlt} clearResult={clearResult} placeholder="Describe what is visible in the preview image" />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={generateMetaTags} className="yoryantra-btn">Generate Markup</button>
        <button type="button" onClick={resetAll} className="yoryantra-btn-outline">Reset</button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generated head markup</h3>
              <p className="mt-1 text-sm text-gray-500">Values are HTML-escaped before insertion into text or attributes.</p>
            </div>
            <button type="button" onClick={copyOutput} className="yoryantra-btn-outline text-sm">{copied ? "Copied" : "Copy"}</button>
          </div>

          <pre className="yoryantra-output mt-3 min-h-[260px] overflow-auto whitespace-pre text-sm font-mono">{result.output}</pre>

          {result.warnings.length ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <strong>Review before publishing:</strong>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">What belongs in the generated markup</h2>
          <div className="mt-4 space-y-4 text-gray-600 leading-relaxed">
            <p>
              The basic search-facing pieces are the HTML <code>&lt;title&gt;</code> element and a page-specific meta description. A canonical link can express your preferred representative URL. Open Graph properties help social platforms build link previews; X card tags provide parallel preview hints.
            </p>
            <p>
              This generator deliberately does not create <code>meta name=&quot;keywords&quot;</code>. Google Search says it does not use the keywords meta tag, so adding a keyword list here would create noise rather than useful metadata.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">No fixed title or description score</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Character counts are shown as editing context, not as pass/fail SEO limits. Google can form title links from multiple page signals and can generate snippets primarily from page content. It may use the meta description when that provides a better description for a particular result.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Why output escaping matters</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            A title such as <code>Tools &amp; APIs &quot;Guide&quot;</code> must be escaped before it is placed in HTML markup. The generator encodes characters that could otherwise terminate an attribute or create malformed markup. It does not sanitize arbitrary HTML because these inputs are treated as plain text values, not HTML fragments.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          <strong>Local generation:</strong> titles, URLs, descriptions, and image metadata stay in your browser; this tool does not fetch the page or image.
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">References</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-600 leading-relaxed">
            <li><a className="underline" href="https://developers.google.com/search/docs/appearance/snippet" target="_blank" rel="noreferrer">Google Search: snippets and meta descriptions</a></li>
            <li><a className="underline" href="https://developers.google.com/search/docs/fundamentals/seo-starter-guide" target="_blank" rel="noreferrer">Google Search: SEO Starter Guide</a></li>
            <li><a className="underline" href="https://ogp.me/" target="_blank" rel="noreferrer">Open Graph protocol</a></li>
          </ul>
        </div>

        <YoryantraRelatedTools currentHref="/tools/meta-tag-generator" />
      </section>
    </ToolShell>
  );
}

function Field({
  label,
  value,
  setValue,
  clearResult,
  placeholder,
}: {
  label: string;
  value: string;
  setValue: (value: string) => void;
  clearResult: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          clearResult();
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none focus:ring-2 focus:ring-[var(--green)] focus:border-transparent transition"
      />
    </div>
  );
}

function normalizeOptionalHttpUrl(raw: string, label: string, warnings: string[], stripFragment: boolean) {
  const value = raw.trim();
  if (!value) return "";

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute URL such as https://example.com/page.`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${label} must use http:// or https://.`);
  }

  if (stripFragment && parsed.hash) {
    warnings.push("The page URL contained a fragment. The generated canonical and og:url values omit the fragment because canonical URLs normally identify the document rather than an in-page anchor.");
    parsed.hash = "";
  }

  return parsed.toString();
}

function buildMarkup(values: {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  siteName: string;
}) {
  const lines: string[] = [];

  lines.push("<!-- Search / document metadata -->");
  lines.push(`<title>${escapeHtmlText(values.title)}</title>`);
  if (values.description) lines.push(`<meta name="description" content="${escapeHtmlAttr(values.description)}" />`);
  if (values.url) lines.push(`<link rel="canonical" href="${escapeHtmlAttr(values.url)}" />`);

  lines.push("");
  lines.push("<!-- Open Graph -->");
  lines.push('<meta property="og:type" content="website" />');
  lines.push(`<meta property="og:title" content="${escapeHtmlAttr(values.title)}" />`);
  if (values.description) lines.push(`<meta property="og:description" content="${escapeHtmlAttr(values.description)}" />`);
  if (values.url) lines.push(`<meta property="og:url" content="${escapeHtmlAttr(values.url)}" />`);
  if (values.siteName) lines.push(`<meta property="og:site_name" content="${escapeHtmlAttr(values.siteName)}" />`);
  if (values.image) lines.push(`<meta property="og:image" content="${escapeHtmlAttr(values.image)}" />`);
  if (values.image && values.imageAlt) lines.push(`<meta property="og:image:alt" content="${escapeHtmlAttr(values.imageAlt)}" />`);

  lines.push("");
  lines.push("<!-- X Card -->");
  lines.push(`<meta name="twitter:card" content="${values.image ? "summary_large_image" : "summary"}" />`);
  lines.push(`<meta name="twitter:title" content="${escapeHtmlAttr(values.title)}" />`);
  if (values.description) lines.push(`<meta name="twitter:description" content="${escapeHtmlAttr(values.description)}" />`);
  if (values.image) lines.push(`<meta name="twitter:image" content="${escapeHtmlAttr(values.image)}" />`);
  if (values.image && values.imageAlt) lines.push(`<meta name="twitter:image:alt" content="${escapeHtmlAttr(values.imageAlt)}" />`);

  return lines.join("\n");
}

function escapeHtmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttr(value: string) {
  return escapeHtmlText(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
