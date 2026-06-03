"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type InputMode = "html" | "imageList";
type OutputMode = "summary" | "report" | "json" | "csv" | "markdown";
type CheckStyle = "balanced" | "strict" | "relaxed";

type ImageIssue = {
  severity: "info" | "warning" | "high";
  title: string;
  message: string;
};

type ImageItem = {
  order: number;
  src: string;
  alt: string;
  hasAltAttribute: boolean;
  title: string;
  width: string;
  height: string;
  loading: string;
  decoding: string;
  line: number;
  altLength: number;
  duplicateAlt: boolean;
  decorative: boolean;
  issues: ImageIssue[];
};

type AltResult = {
  images: ImageItem[];
  output: string;
  totalImages: number;
  missingAltCount: number;
  emptyAltCount: number;
  duplicateAltCount: number;
  longAltCount: number;
  score: number;
  issues: ImageIssue[];
};

type AltNote = {
  title: string;
  message: string;
};

const sampleHtml = `<main>
  <h1>Best Developer Tools</h1>

  <img
    src="/images/json-formatter-preview.png"
    alt="JSON formatter interface showing formatted JSON output"
    width="1200"
    height="630"
    loading="lazy"
  />

  <img src="/images/security-header-scan.png" alt="security-header-scan.png" />

  <img src="/decorative-divider.svg" alt="" loading="lazy" />

  <img src="/images/api-tool.png" />
</main>`;

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("html");
  const [outputMode, setOutputMode] = useState<OutputMode>("summary");
  const [checkStyle, setCheckStyle] = useState<CheckStyle>("balanced");
  const [allowEmptyDecorativeAlt, setAllowEmptyDecorativeAlt] = useState(true);
  const [warnMissingDimensions, setWarnMissingDimensions] = useState(true);
  const [warnMissingLazyLoading, setWarnMissingLazyLoading] = useState(false);
  const [warnFileNameAlt, setWarnFileNameAlt] = useState(true);
  const [warnDuplicateAlt, setWarnDuplicateAlt] = useState(true);
  const [result, setResult] = useState<AltResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getAltNotes(result) : []), [result]);

  const checkImages = () => {
    if (!input.trim()) {
      setError("Please paste HTML with image tags or an image list.");
      setResult(null);
      setOutput("");
      setCopied(false);
      return;
    }

    try {
      const nextResult = analyzeImageAltText(input, {
        inputMode,
        outputMode,
        checkStyle,
        allowEmptyDecorativeAlt,
        warnMissingDimensions,
        warnMissingLazyLoading,
        warnFileNameAlt,
        warnDuplicateAlt,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to check image alt text."
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
    setInputMode("html");
    setOutputMode("summary");
    setCheckStyle("balanced");
    setAllowEmptyDecorativeAlt(true);
    setWarnMissingDimensions(true);
    setWarnMissingLazyLoading(false);
    setWarnFileNameAlt(true);
    setWarnDuplicateAlt(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  const resetAll = () => {
    setInput("");
    setInputMode("html");
    setOutputMode("summary");
    setCheckStyle("balanced");
    setAllowEmptyDecorativeAlt(true);
    setWarnMissingDimensions(true);
    setWarnMissingLazyLoading(false);
    setWarnFileNameAlt(true);
    setWarnDuplicateAlt(true);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Image Alt Text Checker"
      description="Check image alt text from HTML. Find missing alt attributes, empty alt text, long alt text, duplicate alt text, file-name-like alt text, lazy loading, dimensions, and image SEO issues."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          HTML or Image List
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
          className="w-full min-h-[390px] rounded-xl border border-gray-300 p-4 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
        />

        <p className="mt-2 text-sm text-gray-500">
          Paste HTML with image tags, copied template markup, or one image URL
          per line when using image list mode.
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
              { label: "HTML image tags", value: "html" },
              { label: "Image URL list", value: "imageList" },
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
            value={checkStyle}
            onChange={(value) => {
              setCheckStyle(value as CheckStyle);
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

          <div className="md:col-span-2 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={allowEmptyDecorativeAlt}
                onChange={(event) => {
                  setAllowEmptyDecorativeAlt(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Allow empty alt for decorative images
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnMissingDimensions}
                onChange={(event) => {
                  setWarnMissingDimensions(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn when width or height is missing
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnMissingLazyLoading}
                onChange={(event) => {
                  setWarnMissingLazyLoading(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn when loading="lazy" is missing
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnFileNameAlt}
                onChange={(event) => {
                  setWarnFileNameAlt(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn when alt text looks like a file name
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900">
              <input
                type="checkbox"
                checked={warnDuplicateAlt}
                onChange={(event) => {
                  setWarnDuplicateAlt(event.target.checked);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                className="h-4 w-4 accent-[var(--light-gold)]"
              />

              Warn about duplicate alt text
            </label>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Checks missing alt attributes, empty alt text, duplicate alt text, long
          alt text, file-name-like alt text, dimensions, and loading attributes.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={checkImages} className="yoryantra-btn">
          Check Alt Text
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
          <SummaryCard label="Images" value={result.totalImages.toLocaleString()} />
          <SummaryCard label="Missing Alt" value={result.missingAltCount.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && result.images.length > 0 && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Image Alt Review
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            A quick review of image sources, alt text, and common image SEO or
            accessibility issues.
          </p>

          <div className="mt-4 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Image</th>
                  <th className="px-4 py-3 font-semibold">Alt Text</th>
                  <th className="px-4 py-3 font-semibold">Length</th>
                  <th className="px-4 py-3 font-semibold">Size</th>
                  <th className="px-4 py-3 font-semibold">Loading</th>
                  <th className="px-4 py-3 font-semibold">Issues</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {result.images.slice(0, 80).map((image) => (
                  <tr key={`${image.order}-${image.src}`}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-800">
                      <span className="block max-w-[260px] break-words">
                        {image.src || "(missing src)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="block max-w-[280px] break-words">
                        {image.hasAltAttribute ? image.alt || "(empty alt)" : "(missing alt)"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {image.altLength}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {image.width || "-"} × {image.height || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">
                      {image.loading || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {image.issues.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.images.length > 80 && (
            <p className="mt-3 text-sm text-gray-500">
              Showing the first 80 images. Copy the output for the full result.
            </p>
          )}
        </div>
      )}

      {result && result.issues.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Image findings
          </h3>

          <div className="mt-3 space-y-3">
            {result.issues.slice(0, 12).map((issue, index) => (
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
            Alt text notes
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
          {output || "Image alt text output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Image alt text analysis happens directly in your browser. Your HTML is
        not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Checking Image Alt Text for SEO and Accessibility
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Image alt text helps screen readers describe meaningful images and
            gives search engines more context about image content. Missing or
            unclear alt text can make a page harder to understand, especially
            when images support the main content.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Image Alt Text Checker scans pasted HTML and reports missing
            alt attributes, empty alt text, duplicate alt text, long alt text,
            file-name-like alt text, missing image dimensions, and lazy loading
            notes.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reviewing Image Alt Attributes
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste HTML from a page, template, CMS editor, or copied source.</li>
            <li>Choose HTML input or image URL list input.</li>
            <li>Set checking style and optional warnings.</li>
            <li>Run the checker and review each image result.</li>
            <li>Fix missing, unclear, duplicated, or file-name-like alt text.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Image Alt Text Checker Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Finding images with missing alt attributes before publishing.</li>
            <li>Checking whether meaningful images have descriptive alt text.</li>
            <li>Finding alt text that only repeats the image file name.</li>
            <li>Reviewing product, blog, documentation, and landing page images.</li>
            <li>Checking image dimensions and loading attributes in templates.</li>
            <li>Preparing cleaner HTML for SEO and accessibility reviews.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Image Markup
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<img
  src="/images/json-formatter-preview.png"
  alt="JSON formatter interface showing formatted JSON output"
  width="1200"
  height="630"
  loading="lazy"
/>`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Empty Alt Text Can Be Correct
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Not every image needs descriptive alt text. Decorative icons, dividers,
            and purely visual flourishes can use empty alt text so screen readers
            do not announce unnecessary content.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            The goal is not to fill every alt attribute with keywords. The goal is
            to describe meaningful images naturally and leave decorative images
            quiet when appropriate.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does an Image Alt Text Checker do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It scans image tags and reports missing alt attributes, empty alt
                text, duplicate alt text, long alt text, and other image markup
                issues.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should every image have alt text?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Every image should have an alt attribute, but decorative images
                can use an empty alt value.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is alt text important for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Helpful alt text can improve image understanding and accessibility.
                It should describe the image naturally, not stuff keywords.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can this check image URLs only?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Use image URL list mode to review image sources, though HTML
                mode gives better alt attribute details.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my HTML uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The checker runs directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/heading-structure-checker" className="yoryantra-btn-outline">
              Heading Structure Checker
            </Link>

            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline">
              Meta Tags Checker
            </Link>

            <Link href="/tools/serp-snippet-preview-tool" className="yoryantra-btn-outline">
              SERP Snippet Preview Tool
            </Link>

            <Link href="/tools/open-graph-preview-checker" className="yoryantra-btn-outline">
              Open Graph Preview Checker
            </Link>

            <Link href="/tools/structured-data-validator" className="yoryantra-btn-outline">
              Structured Data Validator
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

function analyzeImageAltText(
  input: string,
  options: {
    inputMode: InputMode;
    outputMode: OutputMode;
    checkStyle: CheckStyle;
    allowEmptyDecorativeAlt: boolean;
    warnMissingDimensions: boolean;
    warnMissingLazyLoading: boolean;
    warnFileNameAlt: boolean;
    warnDuplicateAlt: boolean;
  }
): AltResult {
  const images =
    options.inputMode === "html"
      ? extractImagesFromHtml(input)
      : extractImagesFromList(input);

  if (images.length === 0) {
    throw new Error("No images were found in the input.");
  }

  const withFlags = markDuplicateAlts(images);
  const checkedImages = withFlags.map((image) => ({
    ...image,
    issues: getImageIssues(image, options),
  }));
  const issues = checkedImages.flatMap((image) =>
    image.issues.map((issue) => ({
      ...issue,
      title: `Image ${image.order}: ${issue.title}`,
    }))
  );
  const missingAltCount = checkedImages.filter((image) => !image.hasAltAttribute).length;
  const emptyAltCount = checkedImages.filter((image) => image.hasAltAttribute && !image.alt).length;
  const duplicateAltCount = checkedImages.filter((image) => image.duplicateAlt).length;
  const longAltLimit = getLongAltLimit(options.checkStyle);
  const longAltCount = checkedImages.filter((image) => image.altLength > longAltLimit).length;
  const score = calculateScore(issues);
  const base = {
    images: checkedImages,
    totalImages: checkedImages.length,
    missingAltCount,
    emptyAltCount,
    duplicateAltCount,
    longAltCount,
    issues,
    score,
  };
  const output = formatOutput(base, options.outputMode);

  return {
    ...base,
    output,
  };
}

function extractImagesFromHtml(input: string): ImageItem[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");
  const nodes = Array.from(doc.querySelectorAll("img"));
  const sourceLines = input.split(/\r?\n/);

  return nodes.map((node, index) => {
    const src = node.getAttribute("src") || node.getAttribute("data-src") || "";
    const hasAltAttribute = node.hasAttribute("alt");
    const alt = node.getAttribute("alt") || "";
    const title = node.getAttribute("title") || "";
    const width = node.getAttribute("width") || "";
    const height = node.getAttribute("height") || "";
    const loading = node.getAttribute("loading") || "";
    const decoding = node.getAttribute("decoding") || "";

    return {
      order: index + 1,
      src,
      alt: normalizeText(alt),
      hasAltAttribute,
      title: normalizeText(title),
      width,
      height,
      loading,
      decoding,
      line: findLineNumber(sourceLines, node.outerHTML, src),
      altLength: normalizeText(alt).length,
      duplicateAlt: false,
      decorative: hasAltAttribute && normalizeText(alt).length === 0,
      empty: hasAltAttribute && normalizeText(alt).length === 0,
      issues: [],
    } as ImageItem;
  });
}

function extractImagesFromList(input: string): ImageItem[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((src, index) => ({
      order: index + 1,
      src,
      alt: "",
      hasAltAttribute: false,
      title: "",
      width: "",
      height: "",
      loading: "",
      decoding: "",
      line: index + 1,
      altLength: 0,
      duplicateAlt: false,
      decorative: false,
      empty: false,
      issues: [],
    } as ImageItem));
}

function markDuplicateAlts(images: ImageItem[]) {
  const counts = new Map<string, number>();

  images.forEach((image) => {
    const key = image.alt.trim().toLowerCase();

    if (key) {
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  });

  return images.map((image) => ({
    ...image,
    duplicateAlt: image.alt ? (counts.get(image.alt.toLowerCase()) || 0) > 1 : false,
  }));
}

function getImageIssues(
  image: ImageItem,
  options: {
    checkStyle: CheckStyle;
    allowEmptyDecorativeAlt: boolean;
    warnMissingDimensions: boolean;
    warnMissingLazyLoading: boolean;
    warnFileNameAlt: boolean;
    warnDuplicateAlt: boolean;
  }
) {
  const issues: ImageIssue[] = [];
  const longAltLimit = getLongAltLimit(options.checkStyle);

  if (!image.src) {
    issues.push({
      severity: "warning",
      title: "Missing image source",
      message: "The image does not have a src or data-src value.",
    });
  }

  if (!image.hasAltAttribute) {
    issues.push({
      severity: "high",
      title: "Missing alt attribute",
      message: "Every image should have an alt attribute, even if the value is empty for a decorative image.",
    });
  }

  if (image.hasAltAttribute && image.altLength === 0 && !options.allowEmptyDecorativeAlt) {
    issues.push({
      severity: "warning",
      title: "Empty alt text",
      message: "The image has empty alt text. This is fine for decorative images, but meaningful images need descriptive alt text.",
    });
  }

  if (image.altLength > longAltLimit) {
    issues.push({
      severity: "info",
      title: "Long alt text",
      message: `The alt text is longer than ${longAltLimit} characters. Keep it clear and useful.`,
    });
  }

  if (options.warnFileNameAlt && image.alt && looksLikeFileName(image.alt)) {
    issues.push({
      severity: "warning",
      title: "Alt text looks like a file name",
      message: "Alt text should describe the image, not repeat the image file name.",
    });
  }

  if (options.warnDuplicateAlt && image.duplicateAlt) {
    issues.push({
      severity: "info",
      title: "Duplicate alt text",
      message: "This alt text appears more than once. Repeated alt text may be fine for repeated images, but check if the images are different.",
    });
  }

  if (options.warnMissingDimensions && (!image.width || !image.height)) {
    issues.push({
      severity: "info",
      title: "Missing width or height",
      message: "Width and height attributes can help reduce layout shift when images load.",
    });
  }

  if (options.warnMissingLazyLoading && image.loading.toLowerCase() !== "lazy") {
    issues.push({
      severity: "info",
      title: "Missing lazy loading",
      message: "Below-the-fold images can often use loading=\"lazy\". Do not blindly lazy-load important hero images.",
    });
  }

  if (image.title && image.alt && normalizeText(image.title).toLowerCase() === image.alt.toLowerCase()) {
    issues.push({
      severity: "info",
      title: "Title repeats alt text",
      message: "The title attribute repeats the alt text. It may not add useful value.",
    });
  }

  return issues;
}

function getLongAltLimit(style: CheckStyle) {
  if (style === "strict") {
    return 100;
  }

  if (style === "relaxed") {
    return 180;
  }

  return 140;
}

function looksLikeFileName(value: string) {
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(value.trim()) ||
    /^[a-z0-9-_]+\.(png|jpe?g|gif|webp|svg|avif)$/i.test(value.trim()) ||
    value.trim().includes("_") && !value.trim().includes(" ");
}

function calculateScore(issues: ImageIssue[]) {
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
  result: Omit<AltResult, "output">,
  outputMode: OutputMode
) {
  if (outputMode === "json") {
    return JSON.stringify(result, null, 2);
  }

  if (outputMode === "csv") {
    const rows = [
      ["order", "src", "alt", "has_alt", "alt_length", "width", "height", "loading", "issues"],
      ...result.images.map((image) => [
        String(image.order),
        image.src,
        image.alt,
        String(image.hasAltAttribute),
        String(image.altLength),
        image.width,
        image.height,
        image.loading,
        String(image.issues.length),
      ]),
    ];

    return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  }

  if (outputMode === "markdown") {
    return [
      "| Image | Source | Alt Text | Issues |",
      "| --- | --- | --- | --- |",
      ...result.images.map((image) => {
        const alt = image.hasAltAttribute ? image.alt || "(empty alt)" : "(missing alt)";
        return `| ${image.order} | ${escapeMarkdown(image.src || "(missing src)")} | ${escapeMarkdown(alt)} | ${image.issues.length} |`;
      }),
    ].join("\n");
  }

  if (outputMode === "report") {
    return result.images
      .map((image) => {
        const issues =
          image.issues.length === 0
            ? ["- No common issues found."]
            : image.issues.map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

        return [
          `Image ${image.order}`,
          "-------",
          `Source: ${image.src || "(missing)"}`,
          `Alt: ${image.hasAltAttribute ? image.alt || "(empty alt)" : "(missing alt)"}`,
          `Alt length: ${image.altLength}`,
          `Dimensions: ${image.width || "-"} x ${image.height || "-"}`,
          `Loading: ${image.loading || "-"}`,
          "",
          "Findings:",
          ...issues,
        ].join("\n");
      })
      .join("\n\n");
  }

  const issues =
    result.issues.length === 0
      ? ["- No common image alt text issues found."]
      : result.issues.slice(0, 12).map((issue) => `- [${issue.severity}] ${issue.title}: ${issue.message}`);

  return [
    "Image Alt Text Summary",
    "----------------------",
    `Score: ${result.score}/100`,
    `Total images: ${result.totalImages}`,
    `Missing alt attributes: ${result.missingAltCount}`,
    `Empty alt values: ${result.emptyAltCount}`,
    `Duplicate alt values: ${result.duplicateAltCount}`,
    `Long alt values: ${result.longAltCount}`,
    "",
    "Findings:",
    ...issues,
  ].join("\n");
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findLineNumber(lines: string[], outerHTML: string, src: string) {
  const srcIndex = lines.findIndex((line) => src && line.includes(src));

  if (srcIndex !== -1) {
    return srcIndex + 1;
  }

  const outerStart = outerHTML.trim().slice(0, 60);
  const outerIndex = lines.findIndex((line) => line.includes(outerStart));

  return outerIndex === -1 ? 0 : outerIndex + 1;
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

function getAltNotes(result: AltResult): AltNote[] {
  const notes: AltNote[] = [];

  if (result.missingAltCount > 0) {
    notes.push({
      title: "Missing alt attributes",
      message:
        "Some images do not have alt attributes. Add alt text for meaningful images or alt=\"\" for decorative ones.",
    });
  }

  if (result.emptyAltCount > 0) {
    notes.push({
      title: "Empty alt text found",
      message:
        "Empty alt text is fine for decorative images, but meaningful images should have useful descriptions.",
    });
  }

  if (result.duplicateAltCount > 0) {
    notes.push({
      title: "Duplicate alt text",
      message:
        "Repeated alt text may be fine for repeated icons, but different images usually need different descriptions.",
    });
  }

  if (result.score >= 90) {
    notes.push({
      title: "Good image markup",
      message:
        "Only minor or no common alt text issues were found. Review the text manually for meaning and context.",
    });
  }

  return notes;
}
