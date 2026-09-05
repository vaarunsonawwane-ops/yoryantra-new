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
      description="Check image alt text, missing alt attributes, duplicate alt text, long alt text, dimensions, and image SEO issues."
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <label htmlFor="alt-html-input" className="block mb-2 text-sm font-medium text-gray-700">
          HTML or Image List
        </label>

        <textarea
          id="alt-html-input"
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
          Paste HTML with image tags for alt analysis. URL inventory mode only lists image sources; a URL by itself does not contain HTML alt text.
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
              { label: "Image URL inventory", value: "imageList" },
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
        <button onClick={checkImages} className="yoryantra-btn shrink-0 whitespace-nowrap">
          Check Alt Text
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
          <SummaryCard label="Images" value={result.totalImages.toLocaleString()} />
          <SummaryCard label="Missing Alt" value={result.missingAltCount.toLocaleString()} />
          <SummaryCard label="Issues" value={result.issues.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <p className="mt-3 text-xs leading-relaxed text-gray-500">
          Review score is a local heuristic for triage. It is not a WCAG conformance score or a Google ranking metric.
        </p>
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

      {result && result.issues.some((issue) => issue.severity === "high") && (
        <AltFindingGroup title="Missing alternatives" issues={result.issues.filter((issue) => issue.severity === "high")} tone="error" />
      )}

      {result && result.issues.some((issue) => issue.severity === "warning") && (
        <AltFindingGroup title="Alt text cautions" issues={result.issues.filter((issue) => issue.severity === "warning")} tone="warning" />
      )}

      {result && result.issues.some((issue) => issue.severity === "info") && (
        <AltFindingGroup title="Markup review notes" issues={result.issues.filter((issue) => issue.severity === "info")} tone="info" />
      )}

      {notes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Alt text notes
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
          {output || "Image alt text output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
        HTML parsing runs in this page. The code does not send pasted markup to an image or accessibility analysis API.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Alt text depends on what the image means here</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Alternative text is a replacement for an image's meaning or function in its current context. A product photo, chart, icon button, decorative divider, and repeated logo do not need the same kind of wording. Filling every alt attribute with descriptive keywords can make accessibility worse rather than better.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            HTML mode identifies missing attributes, empty alternatives, repeated wording, filename-like text, and supporting markup such as dimensions and loading. It cannot decide from markup alone whether an image is truly decorative or whether the wording conveys the right meaning.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="text-xl font-semibold text-amber-950">Empty alt can be the correct answer</h2>
            <p className="mt-3 text-sm leading-relaxed text-amber-900">
              Purely decorative or redundant images are commonly marked alt="" so assistive technology can ignore them. The surrounding context decides whether that empty value is appropriate.
            </p>
          </div>
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">Length is not a compliance limit</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              The selected length threshold is only an editorial prompt to review unusually long text. Neither HTML nor WCAG defines one universal maximum number of characters for alt text.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">A better review sequence for image alternatives</h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Paste the rendered or template HTML that contains the image elements.</li>
            <li>Start with missing alt attributes, then decide whether each image is informative, functional, decorative, redundant, or complex.</li>
            <li>For informative images, write the replacement meaning needed in that page context.</li>
            <li>For linked or button images, describe the action or destination rather than the pixels.</li>
            <li>For charts and diagrams, make the important data available in surrounding text or a longer description as well.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">SEO checks and accessibility checks overlap, but they are not identical</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google recommends descriptive alt text as part of image SEO because it helps understand an image in context. Accessibility guidance is broader: the alternative must serve the equivalent purpose for people who cannot use the image visually. Keyword repetition is not a substitute for either goal.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google's <a href="https://developers.google.com/search/docs/appearance/google-images" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">Image SEO guidance</a>, the <a href="https://www.w3.org/WAI/tutorials/images/decision-tree/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">W3C WAI alt decision tree</a>, and the <a href="https://html.spec.whatwg.org/multipage/images.html#alt" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-2">HTML alt requirements</a> cover different parts of that decision.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">What markup inspection cannot know</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="self-start rounded-xl border border-gray-200 bg-white p-5"><h3 className="font-semibold text-gray-900">Visible from HTML</h3><p className="mt-2 text-sm leading-relaxed text-gray-600">Whether alt exists, whether it is empty, repeated wording, filename-like wording, dimensions, loading, title text, and source attributes.</p></div>
            <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-semibold text-amber-950">Needs human context</h3><p className="mt-2 text-sm leading-relaxed text-amber-900">Whether an image is decorative, whether a chart needs a longer text equivalent, whether nearby text already conveys the same information, and whether the alternative describes function rather than appearance.</p></div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Alt text decisions worth checking twice</h2>
          <div className="mt-5 space-y-6">
            <div><h3 className="font-semibold text-gray-900">Should every img have non-empty alt text?</h3><p className="mt-2 text-gray-600 leading-relaxed">No. Decorative images commonly use an empty alt value. Missing the alt attribute entirely is a different case and normally deserves review.</p></div>
            <div><h3 className="font-semibold text-gray-900">Can a filename be a good alternative?</h3><p className="mt-2 text-gray-600 leading-relaxed">Usually not. A filename rarely conveys the image's purpose or meaning for someone who cannot see it.</p></div>
            <div><h3 className="font-semibold text-gray-900">Can URL inventory mode judge alt text?</h3><p className="mt-2 text-gray-600 leading-relaxed">No. The alt attribute belongs to the HTML that embeds the image, not to the image URL itself. URL mode is therefore only a source inventory.</p></div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/heading-structure-checker" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Heading Structure Checker</Link>
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Meta Tags Checker</Link>
            <Link href="/tools/serp-snippet-preview-tool" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">SERP Snippet Preview Tool</Link>
            <Link href="/tools/open-graph-preview-checker" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Open Graph Preview Checker</Link>
            <Link href="/tools/structured-data-validator" className="yoryantra-btn-outline shrink-0 whitespace-nowrap">Structured Data Validator</Link>
          </div>
        </div>
      </section>
    </ToolShell>
  );
}

function AltFindingGroup({
  title,
  issues,
  tone,
}: {
  title: string;
  issues: ImageIssue[];
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
        {shownIssues.map((issue, index) => <div key={`${issue.title}-${index}`}><p className="text-sm font-semibold">{issue.title}</p><p className="mt-1 text-sm leading-relaxed">{issue.message}</p></div>)}
      </div>
      {hiddenCount > 0 && <p className="mt-3 text-xs leading-relaxed opacity-80">{hiddenCount.toLocaleString()} more finding{hiddenCount === 1 ? "" : "s"} are included in the copied report.</p>}
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
    issues: options.inputMode === "html"
      ? getImageIssues(image, options)
      : getImageInventoryIssues(image),
  }));
  const issues: ImageIssue[] = [];
  checkedImages.forEach((image) => {
    image.issues.forEach((issue) => {
      issues.push({
        ...issue,
        title: `Image ${image.order}: ${issue.title}`,
      });
    });
  });

  if (options.inputMode === "imageList") {
    issues.push({
      severity: "info",
      title: "URL inventory cannot expose alt attributes",
      message: "An image URL does not contain the alt attribute from the HTML that embeds it. Paste HTML for alt-text review.",
    });
  }
  const isHtmlMode = options.inputMode === "html";
  const missingAltCount = isHtmlMode ? checkedImages.filter((image) => !image.hasAltAttribute).length : 0;
  const emptyAltCount = isHtmlMode ? checkedImages.filter((image) => image.hasAltAttribute && !image.alt).length : 0;
  const duplicateAltCount = isHtmlMode ? checkedImages.filter((image) => image.duplicateAlt).length : 0;
  const longAltLimit = getLongAltLimit(options.checkStyle);
  const longAltCount = isHtmlMode ? checkedImages.filter((image) => image.altLength > longAltLimit).length : 0;
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

function getImageInventoryIssues(image: ImageItem): ImageIssue[] {
  if (!image.src) {
    return [{ severity: "warning", title: "Missing image source", message: "The inventory line is empty or could not be interpreted as an image source." }];
  }

  return [];
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
      message: "An authored img element normally needs an alt attribute. Decorative images generally use alt=\"\"; omission is reserved for narrow cases and should be reviewed.",
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
      message: `The alt text is longer than the ${longAltLimit}-character editorial review threshold selected here. HTML and WCAG do not define a universal maximum.`,
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
      message: "The title attribute repeats the alt text and may add no additional information.",
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
    }
    // Informational notes do not reduce the heuristic score.

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
    `Review score (heuristic): ${result.score}/100`,
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
        "Empty alt text is appropriate for decorative or redundant images; informative and functional images need an alternative that conveys their purpose or meaning.",
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
