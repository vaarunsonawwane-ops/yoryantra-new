"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type RobotsMode =
  | "omit"
  | "index-follow"
  | "noindex-follow"
  | "index-nofollow"
  | "noindex-nofollow";

type OgType = "website" | "article";

type MetaResult = {
  output: string;
  warnings: string[];
  notes: string[];
};

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

function trackingParams(url: URL) {
  const found: string[] = [];

  url.searchParams.forEach((_, key) => {
    const lower = key.toLowerCase();

    if (
      lower.indexOf("utm_") === 0 ||
      lower === "gclid" ||
      lower === "dclid" ||
      lower === "fbclid" ||
      lower === "msclkid"
    ) {
      if (found.indexOf(key) === -1) {
        found.push(key);
      }
    }
  });

  return found;
}

function normalizeHttpUrl(
  raw: string,
  label: string,
  warnings: string[],
  options: {
    stripFragment: boolean;
    checkTracking: boolean;
  }
) {
  const value = raw.trim();

  if (!value) return "";

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `${label} must be an absolute URL such as https://example.com/page.`
    );
  }

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {
    throw new Error(
      `${label} must use http:// or https://.`
    );
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      `${label} must not contain username/password credentials.`
    );
  }

  if (parsed.protocol === "http:") {
    warnings.push(
      `${label} uses plain HTTP. Use the production HTTPS URL when the page is actually served securely.`
    );
  }

  if (options.stripFragment && parsed.hash) {
    warnings.push(
      `${label} contained a #fragment. It was removed because canonical and social page URLs normally identify the document, not an in-page anchor.`
    );
    parsed.hash = "";
  }

  if (options.checkTracking) {
    const tracking = trackingParams(parsed);

    if (tracking.length) {
      warnings.push(
        `The canonical/page URL contains common campaign parameters (${tracking.join(
          ", "
        )}). Canonicals normally point to the representative content URL rather than a tracking variant.`
      );
    }
  }

  return parsed.toString();
}

function robotsContent(mode: RobotsMode) {
  if (mode === "index-follow") {
    return "index, follow";
  }

  if (mode === "noindex-follow") {
    return "noindex, follow";
  }

  if (mode === "index-nofollow") {
    return "index, nofollow";
  }

  if (mode === "noindex-nofollow") {
    return "noindex, nofollow";
  }

  return "";
}

function buildMarkup(values: {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  siteName: string;
  robots: string;
  ogType: OgType;
}) {
  const lines: string[] = [];

  lines.push("<!-- Search / document metadata -->");
  lines.push(
    `<title>${escapeHtmlText(values.title)}</title>`
  );

  if (values.description) {
    lines.push(
      `<meta name="description" content="${escapeHtmlAttr(
        values.description
      )}" />`
    );
  }

  if (values.robots) {
    lines.push(
      `<meta name="robots" content="${escapeHtmlAttr(
        values.robots
      )}" />`
    );
  }

  if (values.url) {
    lines.push(
      `<link rel="canonical" href="${escapeHtmlAttr(
        values.url
      )}" />`
    );
  }

  lines.push("");
  lines.push("<!-- Open Graph -->");
  lines.push(
    `<meta property="og:type" content="${values.ogType}" />`
  );
  lines.push(
    `<meta property="og:title" content="${escapeHtmlAttr(
      values.title
    )}" />`
  );

  if (values.description) {
    lines.push(
      `<meta property="og:description" content="${escapeHtmlAttr(
        values.description
      )}" />`
    );
  }

  if (values.url) {
    lines.push(
      `<meta property="og:url" content="${escapeHtmlAttr(
        values.url
      )}" />`
    );
  }

  if (values.siteName) {
    lines.push(
      `<meta property="og:site_name" content="${escapeHtmlAttr(
        values.siteName
      )}" />`
    );
  }

  if (values.image) {
    lines.push(
      `<meta property="og:image" content="${escapeHtmlAttr(
        values.image
      )}" />`
    );
  }

  if (values.image && values.imageAlt) {
    lines.push(
      `<meta property="og:image:alt" content="${escapeHtmlAttr(
        values.imageAlt
      )}" />`
    );
  }

  lines.push("");
  lines.push("<!-- X card -->");
  lines.push(
    `<meta name="twitter:card" content="${
      values.image ? "summary_large_image" : "summary"
    }" />`
  );
  lines.push(
    `<meta name="twitter:title" content="${escapeHtmlAttr(
      values.title
    )}" />`
  );

  if (values.description) {
    lines.push(
      `<meta name="twitter:description" content="${escapeHtmlAttr(
        values.description
      )}" />`
    );
  }

  if (values.image) {
    lines.push(
      `<meta name="twitter:image" content="${escapeHtmlAttr(
        values.image
      )}" />`
    );
  }

  if (values.image && values.imageAlt) {
    lines.push(
      `<meta name="twitter:image:alt" content="${escapeHtmlAttr(
        values.imageAlt
      )}" />`
    );
  }

  return lines.join("\n");
}

export default function ToolClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [siteName, setSiteName] = useState("");
  const [robotsMode, setRobotsMode] =
    useState<RobotsMode>("omit");
  const [ogType, setOgType] =
    useState<OgType>("website");
  const [result, setResult] =
    useState<MetaResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const clearResult = () => {
    setResult(null);
    setError("");
    setCopied(false);
  };

  const generateMetaTags = () => {
    if (!title.trim()) {
      setError(
        "Enter a page title before generating markup."
      );
      setResult(null);
      return;
    }

    try {
      const warnings: string[] = [];
      const notes: string[] = [];

      const normalizedUrl = normalizeHttpUrl(
        url,
        "Page URL",
        warnings,
        {
          stripFragment: true,
          checkTracking: true,
        }
      );

      const normalizedImage = normalizeHttpUrl(
        image,
        "Social image URL",
        warnings,
        {
          stripFragment: true,
          checkTracking: false,
        }
      );

      if (!description.trim()) {
        warnings.push(
          "No meta description was supplied. Search engines can build snippets from page content, but a useful page-specific description is still worth providing."
        );
      }

      if (!normalizedUrl) {
        warnings.push(
          "No page URL was supplied, so canonical and og:url markup are omitted."
        );
      }

      if (!normalizedImage) {
        warnings.push(
          "No social image URL was supplied. The generated X card falls back to summary, and the Open Graph set has no og:image."
        );
      }

      if (
        normalizedImage &&
        !imageAlt.trim()
      ) {
        warnings.push(
          "A social image is present without descriptive image alt text."
        );
      }

      if (
        robotsMode === "noindex-follow" ||
        robotsMode === "noindex-nofollow"
      ) {
        warnings.push(
          "This markup includes noindex. Confirm that removing the page from search results is intentional before publishing."
        );
      }

      if (
        title.indexOf("\n") !== -1 ||
        title.indexOf("\r") !== -1
      ) {
        notes.push(
          "The title contains a line break. Browsers and search systems may normalize whitespace when displaying it."
        );
      }

      notes.push(
        "Character counts are editing context only. Search engines and social platforms can truncate, rewrite, or compose displayed text differently."
      );

      const output = buildMarkup({
        title: title.trim(),
        description: description.trim(),
        url: normalizedUrl,
        image: normalizedImage,
        imageAlt: imageAlt.trim(),
        siteName: siteName.trim(),
        robots: robotsContent(robotsMode),
        ogType,
      });

      setResult({
        output,
        warnings,
        notes,
      });
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate metadata."
      );
    }
  };

  const loadExample = () => {
    setTitle("URL Debugging Guide | Example Site");
    setDescription(
      "Learn how to inspect redirects, query parameters, canonical URLs, and common URL problems before publishing a page."
    );
    setUrl(
      "https://example.com/guides/url-debugging"
    );
    setImage(
      "https://example.com/images/url-debugging-preview.jpg"
    );
    setImageAlt(
      "Browser address bar and URL components diagram"
    );
    setSiteName("Example Site");
    setRobotsMode("omit");
    setOgType("article");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(
        result.output
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError(
        "The generated markup could not be copied. Select and copy it manually."
      );
      setCopied(false);
    }
  };

  const resetAll = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setImage("");
    setImageAlt("");
    setSiteName("");
    setRobotsMode("omit");
    setOgType("website");
    clearResult();
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]";

  return (
    <ToolShell
      title="Meta Tag Generator"
      description="Generate escaped search, canonical, robots, Open Graph, and X card markup while keeping URL problems and the limits of search/social previews visible."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Page title
          </label>
          <input
            value={title}
            onChange={(event: { target: { value: string } }) => {
              setTitle(event.target.value);
              clearResult();
            }}
            placeholder="A clear, page-specific title"
            className={inputClass}
          />
          <p className="mt-2 text-xs text-gray-500">
            {title.length.toLocaleString()} characters · informational only;
            displayed search title links are not guaranteed to match this text.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Meta description
          </label>
          <textarea
            value={description}
            onChange={(event: { target: { value: string } }) => {
              setDescription(event.target.value);
              clearResult();
            }}
            placeholder="A concise, accurate summary of this specific page"
            className="w-full min-h-[120px] rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
          />
          <p className="mt-2 text-xs text-gray-500">
            {description.length.toLocaleString()} characters · Google has no
            fixed meta-description character limit; snippets depend on the
            query, device, and page content.
          </p>
        </div>

        <Field
          label="Canonical / page URL"
          value={url}
          setValue={setUrl}
          clearResult={clearResult}
          placeholder="https://example.com/page"
        />

        <Field
          label="Site name (optional)"
          value={siteName}
          setValue={setSiteName}
          clearResult={clearResult}
          placeholder="Example Site"
        />

        <Field
          label="Social image URL (optional)"
          value={image}
          setValue={setImage}
          clearResult={clearResult}
          placeholder="https://example.com/preview.jpg"
        />

        <Field
          label="Social image alt text (optional)"
          value={imageAlt}
          setValue={setImageAlt}
          clearResult={clearResult}
          placeholder="Describe the preview image"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Robots meta
          </label>
          <select
            value={robotsMode}
            onChange={(event: { target: { value: string } }) => {
              setRobotsMode(
                event.target.value as RobotsMode
              );
              clearResult();
            }}
            className={inputClass}
          >
            <option value="omit">
              Omit robots tag (default behavior)
            </option>
            <option value="index-follow">
              index, follow
            </option>
            <option value="noindex-follow">
              noindex, follow
            </option>
            <option value="index-nofollow">
              index, nofollow
            </option>
            <option value="noindex-nofollow">
              noindex, nofollow
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Open Graph type
          </label>
          <select
            value={ogType}
            onChange={(event: { target: { value: string } }) => {
              setOgType(
                event.target.value as OgType
              );
              clearResult();
            }}
            className={inputClass}
          >
            <option value="website">website</option>
            <option value="article">article</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generateMetaTags}
          className="yoryantra-btn"
        >
          Generate Markup
        </button>
        <button
          type="button"
          onClick={loadExample}
          className="yoryantra-btn-outline"
        >
          Load Example
        </button>
        <button
          type="button"
          onClick={resetAll}
          className="yoryantra-btn-outline"
        >
          Reset
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Generated head markup
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Text and attribute values are HTML-escaped before insertion.
              </p>
            </div>

            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline text-sm"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <pre className="mt-4 yoryantra-output min-h-[300px] overflow-auto whitespace-pre text-sm">
            {result.output}
          </pre>

          {result.warnings.length ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <strong>Review before publishing:</strong>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.warnings.map(
                  (warning, index) => (
                    <li
                      key={`${warning}-${index}`}
                    >
                      {warning}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}

          {result.notes.length ? (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              <ul className="list-disc space-y-1 pl-5">
                {result.notes.map(
                  (note, index) => (
                    <li key={`${note}-${index}`}>
                      {note}
                    </li>
                  )
                )}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Generation happens from the values in your browser. This tool does not
        fetch the page, social image, search result, or social preview. Site-wide
        analytics or advertising scripts, if enabled, are separate from this
        markup-generation operation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            One Page Can Have Three Different Metadata Consumers
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The browser uses the HTML <code>&lt;title&gt;</code> for the
            document and browser UI. Search engines use the title, visible page
            content, links, and other signals when composing search results.
            Social crawlers look for Open Graph or card metadata when building
            a shared-link preview.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Repeating the same page title and description into all three layers
            is a sensible starting point, but the generated markup is not a
            promise that Google, X, Slack, LinkedIn, or another platform will
            display the exact same text.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Search Titles and Descriptions Are Inputs, Not Pixel-Perfect Preview Instructions
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Google can create title links from several sources and can generate
            snippets primarily from page content. It may use the meta
            description when that description better represents the page for a
            particular query. This is why the generator shows character counts
            without turning them into a green/red SEO score.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Write a title that identifies the page and a description that
            accurately summarizes what a visitor will find. Do not pad either
            field just to hit a mythical character target. Google&apos;s{" "}
            <a
              href="https://developers.google.com/search/docs/appearance/title-link"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              title-link guidance
            </a>{" "}
            and{" "}
            <a
              href="https://developers.google.com/search/docs/appearance/snippet"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              snippet guidance
            </a>{" "}
            are useful when displayed search text behaves differently from the
            HTML you supplied.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            A Canonical Is a Hint About the Representative URL, Not a Redirect
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            If several URLs expose duplicate or near-duplicate content, a
            canonical link can indicate which URL you prefer search engines to
            treat as representative. It does not send visitors anywhere and it
            does not guarantee that a search engine will select that exact URL.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Tracking parameters such as <code>utm_source</code>,{" "}
            <code>gclid</code>, or <code>fbclid</code> usually describe an
            acquisition variant rather than a different document, so the
            generator warns when they appear in the canonical/page URL. Google
            provides deeper canonicalization guidance{" "}
            <a
              href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              here
            </a>.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            noindex and robots.txt Solve Different Problems
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A robots meta tag can tell a supporting search crawler not to index
            a page. But the crawler has to be able to fetch the page to see that
            instruction. Blocking the URL in <code>robots.txt</code> and adding
            <code>noindex</code> are therefore not interchangeable strategies.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The robots selector defaults to omission because ordinary indexable
            pages do not need an explicit <code>index, follow</code> tag.
            Choose noindex only when keeping that page out of search results is
            intentional.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Social Preview Metadata Needs a Fetchable Image, Not Just a Correct Tag
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Open Graph metadata describes the object being shared. For a normal
            web page, the core properties include a title, type, URL, and image.
            This tool can write those tags, but it cannot verify that the image
            server returns the expected file, that a social crawler can reach
            it, or that the platform accepts its size and aspect ratio.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Social platforms also cache previews, so correcting metadata may
            not immediately change every previously shared card. The{" "}
            <a
              href="https://ogp.me/"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--green)] underline underline-offset-4"
            >
              Open Graph protocol
            </a>{" "}
            is directly relevant when you need to understand the property model
            behind the generated <code>og:</code> tags.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Escaping Is Part of Correct Markup Generation
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            A title such as <code>Tools &amp; APIs &quot;Guide&quot;</code>
            contains characters that have meaning in HTML. The generator
            escapes text and attribute values before placing them into markup
            so an ampersand, quote, or angle bracket does not accidentally
            break the generated tag.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The fields are treated as plain metadata values, not as arbitrary
            HTML snippets. Pasting markup into a title does not make that markup
            executable in the generated result.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Why There Is No Meta Keywords Field
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The old <code>&lt;meta name="keywords"&gt;</code> pattern still
            appears in many generic “SEO meta generator” templates, but Google
            does not use that tag for web ranking. Adding a keyword textarea
            here would make the tool look more complete while providing no
            useful Google search metadata.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Check the Deployed Head, Not Only the Copied Snippet
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Framework metadata APIs, CMS plugins, server templates, and other
            components can add a second canonical, duplicate descriptions, or
            competing Open Graph values after you paste this snippet. Inspect
            the final rendered page source or DOM and verify there is one
            intentional set of signals.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            For dynamically rendered sites, also confirm that crawlers receive
            the metadata in the response or rendered page in the way your
            framework expects. A correct snippet stored in a component is not
            useful if it never reaches the final document head.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/meta-tag-generator" />
        </div>
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
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(event: { target: { value: string } }) => {
          setValue(event.target.value);
          clearResult();
        }}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
  );
}
