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
};

const initialValues: OgValues = {
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
};

export default function ToolClient() {
  const [values, setValues] = useState<OgValues>(initialValues);
  const [output, setOutput] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const [error, setError] = useState("");

  const update = (field: keyof OgValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const generate = () => {
    try {
      const result = buildOpenGraph(values);
      setOutput(result.output);
      setWarnings(result.warnings);
      setError("");
    } catch (err) {
      setOutput("");
      setWarnings([]);
      setError(err instanceof Error ? err.message : "Unable to generate Open Graph tags.");
    }
  };

  const loadExample = () => {
    setValues({
      title: "Yoryantra | Practical Developer Tools",
      type: "website",
      url: "https://yoryantra.com/",
      image: "https://yoryantra.com/og-image.png",
      description: "Practical browser tools for developers, debugging, data, security, SEO, and DevOps workflows.",
      siteName: "Yoryantra",
      locale: "en_US",
      imageAlt: "Yoryantra developer tools",
      imageWidth: "1200",
      imageHeight: "630",
    });
    setOutput("");
    setWarnings([]);
    setError("");
  };

  const resetAll = () => {
    setValues(initialValues);
    setOutput("");
    setWarnings([]);
    setError("");
  };

  return (
    <ToolShell
      title="Open Graph Generator"
      description="Generate escaped Open Graph metadata for titles, URLs, images, descriptions, locales, site names, and image details."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="og:title" value={values.title} onChange={(value) => update("title", value)} placeholder="Page title" />
        <Field label="og:type" value={values.type} onChange={(value) => update("type", value)} placeholder="website" />
        <Field label="og:url" value={values.url} onChange={(value) => update("url", value)} placeholder="https://example.com/page" />
        <Field label="og:image" value={values.image} onChange={(value) => update("image", value)} placeholder="https://example.com/share.jpg" />
        <Field label="og:site_name" value={values.siteName} onChange={(value) => update("siteName", value)} placeholder="Example Site" />
        <Field label="og:locale" value={values.locale} onChange={(value) => update("locale", value)} placeholder="en_US" />
        <Field label="og:image:alt" value={values.imageAlt} onChange={(value) => update("imageAlt", value)} placeholder="Describe the sharing image" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Image width" value={values.imageWidth} onChange={(value) => update("imageWidth", value)} placeholder="1200" />
          <Field label="Image height" value={values.imageHeight} onChange={(value) => update("imageHeight", value)} placeholder="630" />
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700">
          og:description
        </label>
        <textarea
          value={values.description}
          onChange={(event: { target: { value: string } }) => update("description", event.target.value)}
          rows={4}
          placeholder="Short description for a social preview."
          className="mt-2 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generate} className="yoryantra-btn">
          Generate Open Graph Tags
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

      {warnings.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          <p className="font-semibold">Review these notes</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Open Graph markup
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
        <pre className="yoryantra-output mt-3 min-h-[260px] overflow-auto whitespace-pre-wrap break-words text-sm">
          {output || "Open Graph meta tags will appear here."}
        </pre>
      </div>

      <section className="mt-12 space-y-10 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Generate the Open Graph core, then add only useful details
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            The Open Graph protocol defines four basic properties for an object:
            og:title, og:type, og:image, and og:url. Description, site name,
            locale, and image details are optional additions that can make the
            metadata more useful to consumers.
          </p>
          <p className="mt-4 leading-relaxed text-gray-600">
            This generator HTML-escapes every content attribute. That matters
            when titles or descriptions contain ampersands, quotes, or angle
            brackets copied from real content.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preview behavior is platform-specific
          </h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Open Graph describes metadata; it does not guarantee a pixel-perfect
            card on every platform. Services may cache metadata, crop images,
            shorten text, or apply their own fallback rules.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Reference</h2>
          <p className="mt-4 leading-relaxed text-gray-600">
            Property names and the basic object model follow{" "}
            <a
              href="https://ogp.me/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline"
            >
              The Open Graph protocol
            </a>
            . Generation is local to your browser.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
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
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        value={value}
        onChange={(event: { target: { value: string } }) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gray-300 p-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
      />
    </div>
  );
}

function buildOpenGraph(values: OgValues) {
  const required: Array<keyof Pick<OgValues, "title" | "type" | "url" | "image">> = [
    "title",
    "type",
    "url",
    "image",
  ];

  required.forEach((field) => {
    if (!values[field].trim()) {
      throw new Error(`Enter ${field === "title" ? "og:title" : `og:${field}`}.`);
    }
  });

  if (!isAbsoluteHttpUrl(values.url)) {
    throw new Error("og:url must be an absolute HTTP or HTTPS URL.");
  }

  if (!isAbsoluteHttpUrl(values.image)) {
    throw new Error("og:image must be an absolute HTTP or HTTPS URL.");
  }

  if (values.locale && !/^[A-Za-z]{2,3}_[A-Za-z]{2}$/.test(values.locale)) {
    throw new Error("og:locale should look like en_US or en_GB.");
  }

  for (const [label, raw] of [
    ["Image width", values.imageWidth],
    ["Image height", values.imageHeight],
  ] as const) {
    if (raw && (!/^\d+$/.test(raw) || Number(raw) <= 0)) {
      throw new Error(`${label} must be a positive whole number.`);
    }
  }

  const warnings: string[] = [];
  if (values.image && !values.imageAlt) {
    warnings.push("Consider adding og:image:alt to describe the sharing image.");
  }

  const tags: Array<[string, string]> = [
    ["og:title", values.title],
    ["og:type", values.type],
    ["og:image", values.image],
  ];

  if (values.imageAlt) tags.push(["og:image:alt", values.imageAlt]);
  if (values.imageWidth) tags.push(["og:image:width", values.imageWidth]);
  if (values.imageHeight) tags.push(["og:image:height", values.imageHeight]);

  tags.push(["og:url", values.url]);
  if (values.description) tags.push(["og:description", values.description]);
  if (values.siteName) tags.push(["og:site_name", values.siteName]);
  if (values.locale) tags.push(["og:locale", values.locale]);

  return {
    output: tags
      .map(
        ([property, content]) =>
          `<meta property="${property}" content="${escapeHtmlAttribute(content.trim())}" />`
      )
      .join("\n"),
    warnings,
  };
}

function isAbsoluteHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
