"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type SocialData = {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
  ogUrl: string;
  ogType: string;
  ogSiteName: string;
  ogLocale: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  htmlTitle: string;
  metaDescription: string;
  canonical: string;
};

type SocialIssue = {
  level: "Warning" | "Note";
  message: string;
};

type SocialReport = {
  data: SocialData;
  issues: SocialIssue[];
  duplicateTags: Array<{ key: string; values: string[] }>;
};

const sampleHtml = `<!doctype html>
<html lang="en">
<head>
  <title>Yoryantra | Practical Developer Tools</title>
  <meta name="description" content="Practical browser tools for developers.">
  <link rel="canonical" href="https://yoryantra.com/">

  <meta property="og:title" content="Yoryantra | Practical Developer Tools">
  <meta property="og:type" content="website">
  <meta property="og:image" content="https://yoryantra.com/og-image.png">
  <meta property="og:image:alt" content="Yoryantra developer tools">
  <meta property="og:url" content="https://yoryantra.com/">
  <meta property="og:description" content="Practical browser tools for developers.">
  <meta property="og:site_name" content="Yoryantra">

  <meta name="twitter:card" content="summary_large_image">
</head>
</html>`;

export default function ToolClient() {
  const [input, setInput] = useState(sampleHtml);
  const [output, setOutput] = useState("");
  const [preview, setPreview] = useState<SocialData | null>(null);
  const [error, setError] = useState("");

  const inspect = () => {
    if (!input.trim()) {
      setError("Paste HTML source containing social metadata.");
      setOutput("");
      setPreview(null);
      return;
    }

    try {
      const report = inspectSocialMetadata(input);
      setPreview(report.data);
      setOutput(formatSocialReport(report));
      setError("");
    } catch (err) {
      setPreview(null);
      setOutput("");
      setError(
        err instanceof Error ? err.message : "Unable to inspect this HTML."
      );
    }
  };

  const resetAll = () => {
    setInput(sampleHtml);
    setOutput("");
    setPreview(null);
    setError("");
  };

  const previewTitle = preview?.ogTitle || preview?.htmlTitle || "";
  const previewDescription =
    preview?.ogDescription || preview?.metaDescription || "";

  return (
    <ToolShell
      title="Open Graph Preview Checker"
      description="Inspect Open Graph and X card metadata from pasted HTML, find duplicates or missing core properties, and preview the text a sharing card may use."
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          HTML source
        </label>
        <textarea
          value={input}
          onChange={(event: { target: { value: string } }) => setInput(event.target.value)}
          rows={15}
          placeholder={sampleHtml}
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 font-mono text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          This checker parses only the HTML you paste. It does not fetch the page
          or sharing image.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={inspect} className="yoryantra-btn">
          Check Social Metadata
        </button>
        <button
          onClick={() => {
            setInput(sampleHtml);
            setOutput("");
            setPreview(null);
            setError("");
          }}
          className="yoryantra-btn-outline"
        >
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

      {preview && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Approximate content preview
          </h3>
          <div className="mt-3 max-w-xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex min-h-[150px] items-center justify-center bg-gray-100 p-5 text-center text-sm text-gray-500">
              {preview.ogImage ? (
                <span className="break-all">og:image: {preview.ogImage}</span>
              ) : (
                "No og:image"
              )}
            </div>
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {preview.ogSiteName || hostName(preview.ogUrl) || "Preview"}
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {previewTitle || "No title found"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {previewDescription || "No description found"}
              </p>
            </div>
          </div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
            This is not a platform emulator. Real services may cache, crop,
            truncate, or ignore metadata differently.
          </p>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Metadata report
          </h3>
          {output && (
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="yoryantra-btn-outline text-sm"
            >
              Copy
            </button>
          )}
        </div>
        <pre className="yoryantra-output mt-3 min-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Open Graph inspection results will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Inspect the declared tags separately from fallbacks
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The preview can fall back to the HTML title or meta description so
            you can see useful page text, but the report still tells you when a
            core Open Graph property is actually absent. That prevents a normal
            title tag from being mistaken for a complete Open Graph setup.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            What this checker catches
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-gray-600">
            <li>Missing og:title, og:type, og:image, or og:url.</li>
            <li>Duplicate Open Graph or X card tags with conflicting values.</li>
            <li>Relative or malformed sharing URLs.</li>
            <li>A canonical URL that differs from og:url.</li>
            <li>Missing og:image:alt when an Open Graph image is declared.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Core Open Graph properties follow{" "}
            <a href="https://ogp.me/" target="_blank" rel="noreferrer" className="font-medium underline">
              The Open Graph protocol
            </a>
            . Everything here is parsed locally from pasted HTML.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <YoryantraRelatedTools currentHref="/tools/open-graph-preview-checker" />
        </div>
      </section>
    </ToolShell>
  );
}

function inspectSocialMetadata(source: string): SocialReport {
  if (typeof window === "undefined") {
    throw new Error("HTML metadata inspection must run in the browser.");
  }

  const document = new DOMParser().parseFromString(source, "text/html");
  const metaValues = collectMeta(document);
  const duplicateTags: Array<{ key: string; values: string[] }> = [];

  metaValues.forEach((values, key) => {
    if (values.length > 1) {
      duplicateTags.push({ key, values });
    }
  });

  const read = (key: string) => metaValues.get(key)?.[0] || "";
  const canonical =
    document
      .querySelector('link[rel~="canonical"]')
      ?.getAttribute("href")
      ?.trim() || "";

  const data: SocialData = {
    ogTitle: read("property:og:title"),
    ogDescription: read("property:og:description"),
    ogImage: read("property:og:image"),
    ogImageAlt: read("property:og:image:alt"),
    ogUrl: read("property:og:url"),
    ogType: read("property:og:type"),
    ogSiteName: read("property:og:site_name"),
    ogLocale: read("property:og:locale"),
    twitterCard: read("name:twitter:card"),
    twitterTitle: read("name:twitter:title"),
    twitterDescription: read("name:twitter:description"),
    twitterImage: read("name:twitter:image"),
    htmlTitle: document.querySelector("title")?.textContent?.trim() || "",
    metaDescription: read("name:description"),
    canonical,
  };

  const issues: SocialIssue[] = [];
  const required: Array<[keyof SocialData, string]> = [
    ["ogTitle", "og:title"],
    ["ogType", "og:type"],
    ["ogImage", "og:image"],
    ["ogUrl", "og:url"],
  ];

  required.forEach(([field, label]) => {
    if (!data[field]) {
      issues.push({ level: "Warning", message: `Missing core Open Graph property ${label}.` });
    }
  });

  for (const [value, label] of [
    [data.ogUrl, "og:url"],
    [data.ogImage, "og:image"],
    [data.twitterImage, "twitter:image"],
  ] as const) {
    if (value && !isAbsoluteHttpUrl(value)) {
      issues.push({
        level: "Warning",
        message: `${label} is not an absolute HTTP or HTTPS URL.`,
      });
    }
  }

  if (data.ogImage && !data.ogImageAlt) {
    issues.push({
      level: "Note",
      message: "og:image is present; consider adding og:image:alt for an accessible text description.",
    });
  }

  if (data.ogLocale && !/^[A-Za-z]{2,3}_[A-Za-z]{2}$/.test(data.ogLocale)) {
    issues.push({
      level: "Note",
      message: `og:locale "${data.ogLocale}" does not use the usual language_TERRITORY form.`,
    });
  }

  if (data.canonical && data.ogUrl) {
    const canonicalUrl = normalizeUrl(data.canonical);
    const ogUrl = normalizeUrl(data.ogUrl);
    if (canonicalUrl && ogUrl && canonicalUrl !== ogUrl) {
      issues.push({
        level: "Note",
        message: "The canonical link and og:url point to different normalized URLs. Review whether that is intentional.",
      });
    }
  }

  duplicateTags.forEach((duplicate) => {
    const distinct = Array.from(new Set(duplicate.values));
    issues.push({
      level: distinct.length > 1 ? "Warning" : "Note",
      message:
        distinct.length > 1
          ? `${duplicate.key} appears more than once with different values.`
          : `${duplicate.key} is duplicated with the same value.`,
    });
  });

  return { data, issues, duplicateTags };
}

function collectMeta(document: Document) {
  const result = new Map<string, string[]>();

  Array.from(document.getElementsByTagName("meta")).forEach((element) => {
    const property = element.getAttribute("property")?.trim().toLowerCase();
    const name = element.getAttribute("name")?.trim().toLowerCase();
    const content = element.getAttribute("content")?.trim() || "";

    const key = property
      ? `property:${property}`
      : name
        ? `name:${name}`
        : "";

    if (!key) return;
    const values = result.get(key) || [];
    values.push(content);
    result.set(key, values);
  });

  return result;
}

function formatSocialReport(report: SocialReport) {
  const { data } = report;
  const warnings = report.issues.filter((issue) => issue.level === "Warning").length;
  const notes = report.issues.filter((issue) => issue.level === "Note").length;

  const lines = [
    "Social metadata inspection completed.",
    "",
    `Warnings: ${warnings}`,
    `Notes: ${notes}`,
    `Duplicate meta keys: ${report.duplicateTags.length}`,
    "",
    "Open Graph:",
    `og:title: ${data.ogTitle || "Not found"}`,
    `og:type: ${data.ogType || "Not found"}`,
    `og:image: ${data.ogImage || "Not found"}`,
    `og:image:alt: ${data.ogImageAlt || "Not found"}`,
    `og:url: ${data.ogUrl || "Not found"}`,
    `og:description: ${data.ogDescription || "Not found"}`,
    `og:site_name: ${data.ogSiteName || "Not found"}`,
    `og:locale: ${data.ogLocale || "Not found"}`,
    "",
    "X / Twitter card:",
    `twitter:card: ${data.twitterCard || "Not found"}`,
    `twitter:title: ${data.twitterTitle || "Not found"}`,
    `twitter:description: ${data.twitterDescription || "Not found"}`,
    `twitter:image: ${data.twitterImage || "Not found"}`,
    "",
    "HTML fallbacks:",
    `title: ${data.htmlTitle || "Not found"}`,
    `meta description: ${data.metaDescription || "Not found"}`,
    `canonical: ${data.canonical || "Not found"}`,
    "",
    "Issues:",
  ];

  if (!report.issues.length) {
    lines.push("No common Open Graph structural issues found.");
  } else {
    report.issues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.level}: ${issue.message}`);
    });
  }

  lines.push("");
  lines.push(
    "Preview note: social platforms may cache, transform, crop, truncate, or ignore metadata differently."
  );

  return lines.join("\n");
}

function isAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  try {
    return new URL(value).href;
  } catch {
    return "";
  }
}

function hostName(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return "";
  }
}
