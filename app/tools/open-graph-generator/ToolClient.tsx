"use client";

import { useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";

type OgValues = {
  title: string;
  type: string;
  url: string;
  image: string;
  description: string;
  siteName: string;
  locale: string;
  imageAlt: string;
  imageWidth: string;
  imageHeight: string;
  imageType: string;
};

type BuildResult = {
  output: string;
  warnings: string[];
  notes: string[];
};

const INITIAL_VALUES: OgValues = {
  title: "",
  type: "website",
  url: "",
  image: "",
  description: "",
  siteName: "",
  locale: "",
  imageAlt: "",
  imageWidth: "",
  imageHeight: "",
  imageType: "",
};

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function normalizeHttpUrl(
  raw: string,
  label: string,
  warnings: string[]
) {
  const value = raw.trim();

  if (!value) {
    throw new Error(`${label} is required.`);
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(
      `${label} must be an absolute HTTP or HTTPS URL.`
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
      `${label} must not contain embedded username/password credentials.`
    );
  }

  if (parsed.hash) {
    warnings.push(
      `${label} contains a URL fragment (${parsed.hash}). Social object URLs normally identify the page/resource rather than an in-page anchor.`
    );
  }

  if (parsed.protocol === "http:") {
    warnings.push(
      `${label} uses HTTP. Use the real HTTPS production URL when the resource is served securely.`
    );
  }

  return parsed.href;
}

function hasCommonTrackingParams(url: string) {
  try {
    const parsed = new URL(url);
    const found: string[] = [];

    parsed.searchParams.forEach((_, key) => {
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
  } catch {
    return [];
  }
}

function validatePositiveInteger(
  raw: string,
  label: string
) {
  const value = raw.trim();

  if (!value) return "";

  if (
    !/^\d+$/.test(value) ||
    Number(value) <= 0
  ) {
    throw new Error(
      `${label} must be a positive whole number.`
    );
  }

  return value;
}

function isLikelyImageMime(value: string) {
  if (!value) return true;

  return /^image\/[A-Za-z0-9.+-]+$/.test(value);
}

function buildOpenGraph(values: OgValues): BuildResult {
  const warnings: string[] = [];
  const notes: string[] = [];

  if (!values.title.trim()) {
    throw new Error("Enter og:title.");
  }

  if (!values.type.trim()) {
    throw new Error("Enter og:type.");
  }

  const normalizedUrl = normalizeHttpUrl(
    values.url,
    "og:url",
    warnings
  );
  const normalizedImage = normalizeHttpUrl(
    values.image,
    "og:image",
    warnings
  );

  const imageWidth = validatePositiveInteger(
    values.imageWidth,
    "Image width"
  );
  const imageHeight = validatePositiveInteger(
    values.imageHeight,
    "Image height"
  );

  const locale = values.locale.trim();

  if (
    locale &&
    !/^[A-Za-z]{2,3}_[A-Za-z]{2}$/.test(locale)
  ) {
    warnings.push(
      `og:locale "${locale}" does not use the Open Graph language_TERRITORY form such as en_US or en_GB.`
    );
  }

  const imageType = values.imageType.trim();

  if (
    imageType &&
    !isLikelyImageMime(imageType)
  ) {
    warnings.push(
      `og:image:type "${imageType}" does not look like an image/* media type.`
    );
  }

  if (!values.imageAlt.trim()) {
    warnings.push(
      "og:image is present without og:image:alt. The Open Graph protocol says an image should include alt text describing what is in the image."
    );
  }

  if (
    Boolean(imageWidth) !== Boolean(imageHeight)
  ) {
    warnings.push(
      "Only one image dimension was supplied. Width and height are usually more useful together when both values are known."
    );
  }

  const tracking = hasCommonTrackingParams(
    normalizedUrl
  );

  if (tracking.length) {
    warnings.push(
      `og:url contains common campaign parameter${
        tracking.length === 1 ? "" : "s"
      }: ${tracking.join(
        ", "
      )}. Review whether the permanent social object URL should instead use the stable representative page URL.`
    );
  }

  if (
    values.description.trim().length > 300
  ) {
    notes.push(
      "The description is long. Open Graph does not define one universal display length, but social platforms can truncate preview text."
    );
  }

  if (
    values.type.trim() !== "website" &&
    values.type.trim() !== "article" &&
    values.type.trim().indexOf(".") === -1 &&
    values.type.trim().indexOf(":") === -1
  ) {
    notes.push(
      `og:type "${values.type.trim()}" is not one of the common website/article values and has no visible namespace separator. Confirm the intended Open Graph object type.`
    );
  }

  notes.push(
    "Open Graph defines metadata; each consuming platform decides how much of it to fetch, cache, crop, truncate, or display."
  );

  const tags: Array<[string, string]> = [
    ["og:title", values.title.trim()],
    ["og:type", values.type.trim()],
    ["og:image", normalizedImage],
  ];

  if (imageWidth) {
    tags.push(["og:image:width", imageWidth]);
  }

  if (imageHeight) {
    tags.push(["og:image:height", imageHeight]);
  }

  if (imageType) {
    tags.push(["og:image:type", imageType]);
  }

  if (values.imageAlt.trim()) {
    tags.push([
      "og:image:alt",
      values.imageAlt.trim(),
    ]);
  }

  tags.push(["og:url", normalizedUrl]);

  if (values.description.trim()) {
    tags.push([
      "og:description",
      values.description.trim(),
    ]);
  }

  if (values.siteName.trim()) {
    tags.push([
      "og:site_name",
      values.siteName.trim(),
    ]);
  }

  if (locale) {
    tags.push(["og:locale", locale]);
  }

  const output = tags
    .map(
      ([property, content]) =>
        `<meta property="${property}" content="${escapeHtmlAttribute(
          content
        )}" />`
    )
    .join("\n");

  return {
    output,
    warnings,
    notes,
  };
}

export default function ToolClient() {
  const [values, setValues] =
    useState<OgValues>(INITIAL_VALUES);
  const [result, setResult] =
    useState<BuildResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const update = (
    field: keyof OgValues,
    value: string
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setResult(null);
    setError("");
    setCopied(false);
  };

  const generate = () => {
    try {
      setResult(buildOpenGraph(values));
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult(null);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to generate Open Graph metadata."
      );
      setCopied(false);
    }
  };

  const loadExample = () => {
    setValues({
      title: "URL Debugging Guide",
      type: "article",
      url: "https://example.com/guides/url-debugging",
      image:
        "https://example.com/images/url-debugging-preview.jpg",
      description:
        "A practical guide to redirects, canonical URLs, query parameters, and common URL debugging mistakes.",
      siteName: "Example Site",
      locale: "en_US",
      imageAlt:
        "Browser address bar with URL components highlighted",
      imageWidth: "1200",
      imageHeight: "630",
      imageType: "image/jpeg",
    });
    setResult(null);
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setValues(INITIAL_VALUES);
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
      window.setTimeout(
        () => setCopied(false),
        1400
      );
    } catch {
      setCopied(false);
      setError(
        "The generated markup could not be copied. Select and copy it manually."
      );
    }
  };

  return (
    <ToolShell
      title="Open Graph Generator"
      description="Create Open Graph metadata for one social object, with strict URL handling, escaped attributes, structured image details, and review notes that stay separate from platform-specific preview behavior."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="og:title"
          value={values.title}
          onChange={(value) =>
            update("title", value)
          }
          placeholder="Page or object title"
        />

        <Field
          label="og:type"
          value={values.type}
          onChange={(value) =>
            update("type", value)
          }
          placeholder="website or article"
        />

        <Field
          label="og:url"
          value={values.url}
          onChange={(value) =>
            update("url", value)
          }
          placeholder="https://example.com/page"
        />

        <Field
          label="og:image"
          value={values.image}
          onChange={(value) =>
            update("image", value)
          }
          placeholder="https://example.com/share.jpg"
        />

        <Field
          label="og:site_name (optional)"
          value={values.siteName}
          onChange={(value) =>
            update("siteName", value)
          }
          placeholder="Example Site"
        />

        <Field
          label="og:locale (optional)"
          value={values.locale}
          onChange={(value) =>
            update("locale", value)
          }
          placeholder="en_US"
        />

        <Field
          label="og:image:alt"
          value={values.imageAlt}
          onChange={(value) =>
            update("imageAlt", value)
          }
          placeholder="Describe what is in the social image"
        />

        <Field
          label="og:image:type (optional)"
          value={values.imageType}
          onChange={(value) =>
            update("imageType", value)
          }
          placeholder="image/jpeg"
        />

        <Field
          label="Image width (optional)"
          value={values.imageWidth}
          onChange={(value) =>
            update("imageWidth", value)
          }
          placeholder="1200"
        />

        <Field
          label="Image height (optional)"
          value={values.imageHeight}
          onChange={(value) =>
            update("imageHeight", value)
          }
          placeholder="630"
        />
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700">
          og:description (optional)
        </label>
        <textarea
          value={values.description}
          onChange={(event: {
            target: { value: string };
          }) =>
            update(
              "description",
              event.target.value
            )
          }
          rows={4}
          placeholder="A concise description of the object being shared."
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
        <p className="mt-2 text-xs text-gray-500">
          {values.description.length.toLocaleString()} characters · preview
          platforms decide how much text they display.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={generate}
          className="yoryantra-btn"
        >
          Generate Open Graph Tags
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

      {result && result.warnings.length ? (
        <div className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm leading-relaxed text-yellow-900">
          <strong>Review before publishing:</strong>
          <ul className="mt-2 list-disc space-y-2 pl-5">
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

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Generated Open Graph markup
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Values are HTML-escaped before being written into{" "}
              <code>content</code> attributes.
            </p>
          </div>

          {result ? (
            <button
              type="button"
              onClick={copyOutput}
              className="yoryantra-btn-outline whitespace-nowrap"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          ) : null}
        </div>

        <pre className="yoryantra-output mt-4 min-h-[270px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {result
            ? result.output
            : "Generated Open Graph meta tags will appear here."}
        </pre>

        {result && result.notes.length ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
            <ul className="list-disc space-y-2 pl-5">
              {result.notes.map(
                (note, index) => (
                  <li
                    key={`${note}-${index}`}
                  >
                    {note}
                  </li>
                )
              )}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        Generation runs on the values in your browser. The tool does not fetch
        the page, image, Facebook scraper, X card, or any other social preview.
        Site-wide analytics or advertising scripts, if enabled, are separate
        from this markup generation.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Open Graph Is an Object Description, Not a Screenshot Specification
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Open Graph tells a consumer what object a page represents: its
            title, type, permanent URL, image, and optional supporting details.
            That metadata is shared input. The actual card is still rendered by
            the consuming service.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            A platform may crop the image, shorten the description, prefer a
            cached value, apply a product-specific fallback, or ignore fields it
            does not support. A generator can make the markup correct; it cannot
            guarantee one universal visual preview.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-xl font-semibold text-gray-900">
            The Four Core Properties Should Describe the Same Object
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The protocol defines <code>og:title</code>, <code>og:type</code>,{" "}
            <code>og:image</code>, and <code>og:url</code> as the basic metadata
            for an object. The important practical detail is consistency. If
            the title describes one article, the image promotes another
            campaign, and <code>og:url</code> points at a tracking variant, the
            markup may be technically complete while describing the object
            poorly.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            Think of <code>og:url</code> as the stable identity of the object,
            not as “whatever URL happened to be copied from the browser today.”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Structured Image Properties Belong to the Image Immediately Before Them
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Open Graph allows repeated images. Width, height, media type and alt
            text are structured properties attached to the preceding{" "}
            <code>og:image</code>. Their position therefore matters when a page
            contains several social images.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This generator creates one image group, so those properties are
            emitted immediately after <code>og:image</code>. If you later add
            multiple images manually, keep each image&apos;s structured
            properties together instead of putting every width or alt field at
            the end of the head.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
          <h2 className="text-xl font-semibold text-yellow-900">
            Image Dimensions Help a Consumer, but They Do Not Validate the Image
          </h2>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Adding <code>og:image:width</code> and{" "}
            <code>og:image:height</code> tells a crawler the dimensions you
            claim. This browser generator does not download the image to confirm
            those numbers, MIME type, file size, redirect behavior, TLS
            certificate, or crawler accessibility.
          </p>
          <p className="mt-4 leading-relaxed text-yellow-900/90">
            Use real platform debugging tools when a deployed card still shows
            the wrong or stale image.
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            og:image:alt Describes the Image; It Is Not a Second Marketing Caption
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The Open Graph protocol describes <code>og:image:alt</code> as text
            describing what is in the image, not as a caption. A useful value is
            therefore closer to “Browser address bar showing highlighted URL
            parts” than “The ultimate guide you cannot miss.”
          </p>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Do Not Add Campaign Parameters to the Permanent Object URL by Accident
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Sharing links often arrive with <code>utm_source</code>,{" "}
            <code>gclid</code>, <code>fbclid</code>, or another acquisition
            parameter. Those parameters can be useful for measuring a visit,
            while the Open Graph object should often continue identifying the
            stable page URL.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            The tool warns about common campaign parameters instead of removing
            them automatically because query strings sometimes identify
            genuinely different content.
          </p>
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm leading-relaxed text-gray-700">
          The{" "}
          <a
            href="https://ogp.me/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--green)] underline underline-offset-4"
          >
            Open Graph protocol
          </a>{" "}
          is directly useful for this generator because it defines the four
          basic properties, optional locale/site-name/description fields,
          structured image properties, arrays, and the ordering relationship
          between an image and its structured properties.
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <YoryantraRelatedTools currentHref="/tools/open-graph-generator" />
        </div>
      </section>
    </ToolShell>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(event: {
          target: { value: string };
        }) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        spellCheck={false}
        className="mt-2 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
  );
}
