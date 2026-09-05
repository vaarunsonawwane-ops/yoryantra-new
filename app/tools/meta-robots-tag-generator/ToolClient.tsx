"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ToolShell from "@/app/components/ToolShell";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type IndexMode = "index" | "noindex";
type FollowMode = "follow" | "nofollow";
type OutputMode = "meta" | "header" | "both" | "nextjs" | "json";
type SnippetMode = "default" | "nosnippet" | "maxSnippet";
type ImagePreviewMode = "default" | "none" | "standard" | "large";
type VideoPreviewMode = "default" | "none" | "seconds";
type PageUseCase = "normal" | "private" | "duplicate" | "thin" | "staging" | "pdf";

type RobotsResult = {
  directives: string[];
  metaTag: string;
  headerValue: string;
  output: string;
  warnings: string[];
  notes: string[];
  summary: string;
};

type RobotsNote = {
  tone: "warning" | "info";
  title: string;
  message: string;
};

const useCasePresets: Record<PageUseCase, {
  indexMode: IndexMode;
  followMode: FollowMode;
  noarchive: boolean;
  nosnippet: boolean;
  noimageindex: boolean;
  notranslate: boolean;
  unavailableAfter: boolean;
}> = {
  normal: {
    indexMode: "index",
    followMode: "follow",
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
    unavailableAfter: false,
  },
  private: {
    indexMode: "noindex",
    followMode: "follow",
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
    unavailableAfter: false,
  },
  duplicate: {
    indexMode: "noindex",
    followMode: "follow",
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
    unavailableAfter: false,
  },
  thin: {
    indexMode: "noindex",
    followMode: "follow",
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
    unavailableAfter: false,
  },
  staging: {
    indexMode: "noindex",
    followMode: "nofollow",
    noarchive: false,
    nosnippet: true,
    noimageindex: true,
    notranslate: false,
    unavailableAfter: false,
  },
  pdf: {
    indexMode: "noindex",
    followMode: "follow",
    noarchive: false,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
    unavailableAfter: false,
  },
};

export default function ToolClient() {
  const [pageUseCase, setPageUseCase] = useState<PageUseCase>("normal");
  const [indexMode, setIndexMode] = useState<IndexMode>("index");
  const [followMode, setFollowMode] = useState<FollowMode>("follow");
  const [outputMode, setOutputMode] = useState<OutputMode>("meta");
  const [snippetMode, setSnippetMode] = useState<SnippetMode>("default");
  const [imagePreviewMode, setImagePreviewMode] = useState<ImagePreviewMode>("default");
  const [videoPreviewMode, setVideoPreviewMode] = useState<VideoPreviewMode>("default");
  const [maxSnippet, setMaxSnippet] = useState("");
  const [maxVideoPreview, setMaxVideoPreview] = useState("");
  const [unavailableAfterDate, setUnavailableAfterDate] = useState("");
  const [noarchive, setNoarchive] = useState(false);
  const [noimageindex, setNoimageindex] = useState(false);
  const [notranslate, setNotranslate] = useState(false);
  const [unavailableAfter, setUnavailableAfter] = useState(false);
  const [includeGooglebot, setIncludeGooglebot] = useState(false);
  const [includeBingbot, setIncludeBingbot] = useState(false);
  const [result, setResult] = useState<RobotsResult | null>(null);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const notes = useMemo(() => (result ? getRobotsNotes(result) : []), [result]);

  const applyUseCase = (useCase: PageUseCase) => {
    const preset = useCasePresets[useCase];

    setPageUseCase(useCase);
    setIndexMode(preset.indexMode);
    setFollowMode(preset.followMode);
    setNoarchive(preset.noarchive);
    setSnippetMode(preset.nosnippet ? "nosnippet" : "default");
    setNoimageindex(preset.noimageindex);
    setNotranslate(preset.notranslate);
    setUnavailableAfter(preset.unavailableAfter);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);

    if (useCase === "pdf") {
      setOutputMode("header");
      setIncludeGooglebot(false);
      setIncludeBingbot(false);
    }
  };

  const generateRobotsTag = () => {
    try {
      const nextResult = buildRobotsDirectives({
        pageUseCase,
        indexMode,
        followMode,
        outputMode,
        snippetMode,
        imagePreviewMode,
        videoPreviewMode,
        maxSnippet,
        maxVideoPreview,
        unavailableAfterDate,
        noarchive,
        noimageindex,
        notranslate,
        unavailableAfter,
        includeGooglebot,
        includeBingbot,
      });

      setResult(nextResult);
      setOutput(nextResult.output);
      setError("");
      setCopied(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate this robots meta tag."
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
      setError("Clipboard access was blocked. Select the output and copy it manually.");
      setCopied(false);
    }
  };

  const loadExample = () => {
    applyUseCase("duplicate");
    setOutputMode("both");
    setSnippetMode("default");
    setImagePreviewMode("default");
    setVideoPreviewMode("default");
    setMaxSnippet("");
    setMaxVideoPreview("");
    setUnavailableAfterDate("");
    setIncludeGooglebot(false);
    setIncludeBingbot(false);
  };

  const resetAll = () => {
    setPageUseCase("normal");
    setIndexMode("index");
    setFollowMode("follow");
    setOutputMode("meta");
    setSnippetMode("default");
    setImagePreviewMode("default");
    setVideoPreviewMode("default");
    setMaxSnippet("");
    setMaxVideoPreview("");
    setUnavailableAfterDate("");
    setNoarchive(false);
    setNoimageindex(false);
    setNotranslate(false);
    setUnavailableAfter(false);
    setIncludeGooglebot(false);
    setIncludeBingbot(false);
    setResult(null);
    setOutput("");
    setError("");
    setCopied(false);
  };

  return (
    <ToolShell
      title="Meta Robots Tag Generator"
      description="Build robots meta and X-Robots-Tag directives for indexing, link following, snippets, previews, and expiry."
    >
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-lg font-semibold text-gray-900">
          Page Indexing Settings
        </h3>

        <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
          <YoryantraSelect
            label="Page Use Case"
            value={pageUseCase}
            onChange={(value) => applyUseCase(value as PageUseCase)}
            options={[
              { label: "Public page (default)", value: "normal" },
              { label: "Search exclusion (not access control)", value: "private" },
              { label: "Duplicate URL (review canonical)", value: "duplicate" },
              { label: "Temporary page", value: "thin" },
              { label: "Staging page (also protect access)", value: "staging" },
              { label: "PDF or non-HTML file", value: "pdf" },
            ]}
          />

          <YoryantraSelect
            label="Output"
            value={outputMode}
            onChange={(value) => {
              const nextMode = value as OutputMode;
              setOutputMode(nextMode);

              if (nextMode === "header" || nextMode === "nextjs") {
                setIncludeGooglebot(false);
                setIncludeBingbot(false);
              }

              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Meta tag", value: "meta" },
              { label: "X-Robots-Tag header", value: "header" },
              { label: "Both", value: "both" },
              { label: "Next.js metadata", value: "nextjs" },
              { label: "JSON", value: "json" },
            ]}
          />

          <YoryantraSelect
            label="Indexing"
            value={indexMode}
            onChange={(value) => {
              setIndexMode(value as IndexMode);
              setPageUseCase("normal");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "index", value: "index" },
              { label: "noindex", value: "noindex" },
            ]}
          />

          <YoryantraSelect
            label="Link Following"
            value={followMode}
            onChange={(value) => {
              setFollowMode(value as FollowMode);
              setPageUseCase("normal");
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "follow", value: "follow" },
              { label: "nofollow", value: "nofollow" },
            ]}
          />

          <YoryantraSelect
            label="Snippet"
            value={snippetMode}
            onChange={(value) => {
              setSnippetMode(value as SnippetMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Default", value: "default" },
              { label: "No snippet", value: "nosnippet" },
              { label: "Max snippet length", value: "maxSnippet" },
            ]}
          />

          <YoryantraSelect
            label="Image Preview"
            value={imagePreviewMode}
            onChange={(value) => {
              setImagePreviewMode(value as ImagePreviewMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Default", value: "default" },
              { label: "None", value: "none" },
              { label: "Standard", value: "standard" },
              { label: "Large", value: "large" },
            ]}
          />

          {snippetMode === "maxSnippet" && (
            <div>
              <label htmlFor="max-snippet" className="block text-sm font-medium text-gray-700">
                Max Snippet Characters (-1 = no limit)
              </label>

              <input
                id="max-snippet"
                inputMode="numeric"
                value={maxSnippet}
                onChange={(event) => {
                  setMaxSnippet(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder="120 or -1"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}

          <YoryantraSelect
            label="Video Preview"
            value={videoPreviewMode}
            onChange={(value) => {
              setVideoPreviewMode(value as VideoPreviewMode);
              setResult(null);
              setOutput("");
              setError("");
              setCopied(false);
            }}
            options={[
              { label: "Default", value: "default" },
              { label: "None", value: "none" },
              { label: "Max seconds", value: "seconds" },
            ]}
          />

          {videoPreviewMode === "seconds" && (
            <div>
              <label htmlFor="max-video-preview" className="block text-sm font-medium text-gray-700">
                Max Video Preview Seconds (-1 = no limit)
              </label>

              <input
                id="max-video-preview"
                inputMode="numeric"
                value={maxVideoPreview}
                onChange={(event) => {
                  setMaxVideoPreview(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder="30 or -1"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}

          {unavailableAfter && (
            <div className="md:col-span-2">
              <label htmlFor="unavailable-after" className="block text-sm font-medium text-gray-700">
                Unavailable After Date
              </label>

              <input
                id="unavailable-after"
                value={unavailableAfterDate}
                onChange={(event) => {
                  setUnavailableAfterDate(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder="25 Jun 2026 15:00:00 GMT"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={noarchive}
              onChange={(event) => {
                setNoarchive(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            noarchive (Bing-supported; ignored by Google Search)
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={noimageindex}
              onChange={(event) => {
                setNoimageindex(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            noimageindex
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={notranslate}
              onChange={(event) => {
                setNotranslate(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            notranslate
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
            <input
              type="checkbox"
              checked={unavailableAfter}
              onChange={(event) => {
                setUnavailableAfter(event.target.checked);
                setResult(null);
                setOutput("");
                setError("");
                setCopied(false);
              }}
              className="h-4 w-4 accent-[var(--light-gold)]"
            />

            unavailable_after
          </label>

          {(outputMode === "meta" || outputMode === "both" || outputMode === "json") && (
            <>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
                <input
                  type="checkbox"
                  checked={includeGooglebot}
                  onChange={(event) => {
                    setIncludeGooglebot(event.target.checked);
                    setResult(null);
                    setOutput("");
                    setError("");
                    setCopied(false);
                  }}
                  className="h-4 w-4 accent-[var(--light-gold)]"
                />

                Also generate googlebot-specific meta tag
              </label>

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 md:col-span-2">
                <input
                  type="checkbox"
                  checked={includeBingbot}
                  onChange={(event) => {
                    setIncludeBingbot(event.target.checked);
                    setResult(null);
                    setOutput("");
                    setError("");
                    setCopied(false);
                  }}
                  className="h-4 w-4 accent-[var(--light-gold)]"
                />

                Also generate bingbot-specific meta tag
              </label>
            </>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          A crawler must be able to fetch the URL to discover noindex. For
          confidential or staging content, authentication or network access
          control is still required; robots directives are not a security layer.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateRobotsTag} className="yoryantra-btn shrink-0 whitespace-nowrap">
          Generate Robots Tag
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
          <SummaryCard label="Indexing" value={indexMode} />
          <SummaryCard label="Following" value={followMode} />
          <SummaryCard label="Directives" value={result.directives.length.toLocaleString()} />
          <SummaryCard label="Warnings" value={result.warnings.length.toLocaleString()} />
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Generated Preview
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Copy the generated tag into your page head, or use the header version
            for files and non-HTML responses.
          </p>

          <pre className="mt-4 overflow-auto rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
            {result.output}
          </pre>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mt-6 grid items-start gap-3 md:grid-cols-2">
          {notes.map((note) => {
            const isWarning = note.tone === "warning";

            return (
              <div
                key={note.title}
                className={
                  isWarning
                    ? "self-start rounded-xl border border-amber-200 bg-amber-50 p-4"
                    : "self-start rounded-xl border border-gray-200 bg-gray-50 p-4"
                }
              >
                <p className={isWarning ? "text-sm font-semibold text-amber-900" : "text-sm font-semibold text-gray-900"}>
                  {note.title}
                </p>
                <p className={isWarning ? "mt-1 text-sm leading-relaxed text-amber-800" : "mt-1 text-sm leading-relaxed text-gray-600"}>
                  {note.message}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Output
          </h3>

          {output && (
            <button onClick={copyOutput} className="yoryantra-btn-outline text-sm shrink-0 whitespace-nowrap">
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>

        <pre className="yoryantra-output overflow-auto text-sm min-h-[220px] whitespace-pre-wrap break-words">
          {output || "Generated meta robots output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
        Directive generation runs in the browser. The selected settings are not
        sent to Yoryantra for processing.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Decide whether you are controlling indexing, previews, or both
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            <code className="mx-1">noindex</code> controls whether a URL may
            appear in supported search indexes. Preview directives such as
            <code className="mx-1">nosnippet</code>,
            <code className="mx-1">max-snippet</code>, and
            <code className="mx-1">max-image-preview</code> control how much
            content a crawler may show when the URL is otherwise eligible.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Explicit <code className="mx-1">index, follow</code> values are
            normally unnecessary because they are defaults for Google and Bing.
            They remain available here when an explicit configuration is easier
            to audit alongside other directives.
          </p>
        </div>

        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-amber-900">
            noindex does not make confidential content private
          </h2>
          <p className="mt-3 text-amber-800 leading-relaxed">
            Search directives are not authentication. A crawler must also be able
            to fetch a URL to discover noindex, so blocking that same URL in
            robots.txt can prevent the directive from being seen. Protect private
            dashboards, staging sites, and sensitive files with access control.
          </p>
        </div>

        <div className="grid items-start gap-4 md:grid-cols-2">
          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              HTML pages can use a robots meta element
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Place the robots meta element in a valid HTML head. A crawler-specific
              name such as googlebot or bingbot is only needed when that crawler
              should receive rules different from the generic robots policy.
            </p>
          </div>

          <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Non-HTML resources need X-Robots-Tag
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              PDFs, images, and other non-HTML responses cannot carry an HTML meta
              element. Send the equivalent rule as an HTTP X-Robots-Tag header and
              verify the deployed response rather than only the application code.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Preview limits have special values
          </h2>
          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li><code>max-snippet:0</code> suppresses a text snippet; <code>-1</code> means no limit.</li>
            <li><code>max-video-preview:0</code> prevents a video preview; <code>-1</code> allows any available length.</li>
            <li><code>max-image-preview</code> accepts <code>none</code>, <code>standard</code>, or <code>large</code>.</li>
            <li><code>unavailable_after</code> needs a valid date/time; ISO 8601 is a clear choice for deployment.</li>
          </ul>
        </div>

        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-xl font-semibold text-amber-900">
            noarchive now means different things across search engines
          </h2>
          <p className="mt-3 text-amber-800 leading-relaxed">
            Google Search documents noarchive as an ignored historical rule after
            removing its cached-link feature. Bing still documents noarchive and
            nocache behavior. Keep it only when the crawler you care about still
            supports it, and verify current documentation before relying on it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Duplicate URLs usually need a canonical decision first
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A duplicate URL is not automatically a noindex candidate. If the goal
            is to consolidate equivalent pages while keeping links and discovery
            intact, review canonicalization and redirects before removing the URL
            from search entirely.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Framework output preserves the full directive string
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Next.js accepts the Metadata robots field as a string, so the generated
            snippet keeps the selected generic directives together instead of
            silently dropping preview or expiry settings. Identical crawler-specific
            tags are redundant when the generic robots value already applies. Search
            engines do not all support every directive, so check the crawler-specific
            documentation when a rule is business-critical.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Authoritative references
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag" target="_blank" rel="noreferrer" className="yoryantra-btn-outline whitespace-nowrap">
              Google robots directives
            </a>
            <a href="https://www.bing.com/webmasters/help/robots-meta-tags-and-attributes-that-bing-supports-5198d240" target="_blank" rel="noreferrer" className="yoryantra-btn-outline whitespace-nowrap">
              Bing robots directives
            </a>
            <a href="https://nextjs.org/docs/app/api-reference/functions/generate-metadata" target="_blank" rel="noreferrer" className="yoryantra-btn-outline whitespace-nowrap">
              Next.js Metadata
            </a>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/robots-txt-generator" className="yoryantra-btn-outline whitespace-nowrap">Robots.txt Generator</Link>
            <Link href="/tools/robots-txt-validator" className="yoryantra-btn-outline whitespace-nowrap">Robots.txt Validator</Link>
            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline whitespace-nowrap">Canonical URL Checker</Link>
            <Link href="/tools/sitemap-generator" className="yoryantra-btn-outline whitespace-nowrap">Sitemap Generator</Link>
            <Link href="/tools/meta-tags-checker" className="yoryantra-btn-outline whitespace-nowrap">Meta Tags Checker</Link>
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

function buildRobotsDirectives({
  pageUseCase,
  indexMode,
  followMode,
  outputMode,
  snippetMode,
  imagePreviewMode,
  videoPreviewMode,
  maxSnippet,
  maxVideoPreview,
  unavailableAfterDate,
  noarchive,
  noimageindex,
  notranslate,
  unavailableAfter,
  includeGooglebot,
  includeBingbot,
}: {
  pageUseCase: PageUseCase;
  indexMode: IndexMode;
  followMode: FollowMode;
  outputMode: OutputMode;
  snippetMode: SnippetMode;
  imagePreviewMode: ImagePreviewMode;
  videoPreviewMode: VideoPreviewMode;
  maxSnippet: string;
  maxVideoPreview: string;
  unavailableAfterDate: string;
  noarchive: boolean;
  noimageindex: boolean;
  notranslate: boolean;
  unavailableAfter: boolean;
  includeGooglebot: boolean;
  includeBingbot: boolean;
}): RobotsResult {
  const directives: string[] = [indexMode, followMode];
  const warnings: string[] = [];
  const notes: string[] = [];

  if (snippetMode === "nosnippet") {
    directives.push("nosnippet");
  }

  if (snippetMode === "maxSnippet") {
    const rawValue = maxSnippet.trim();

    if (!rawValue) {
      throw new Error("Enter a max snippet value: -1 for no limit, or a whole number from 0 upward.");
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value) || !Number.isInteger(value) || value < -1) {
      throw new Error("Max snippet must be -1 or a whole number of characters from 0 upward.");
    }

    directives.push(`max-snippet:${value}`);
  }

  if (imagePreviewMode !== "default") {
    directives.push(`max-image-preview:${imagePreviewMode}`);
  }

  if (videoPreviewMode === "none") {
    directives.push("max-video-preview:0");
  }

  if (videoPreviewMode === "seconds") {
    const rawValue = maxVideoPreview.trim();

    if (!rawValue) {
      throw new Error("Enter a max video preview value: -1 for no limit, or a whole number of seconds from 0 upward.");
    }

    const value = Number(rawValue);

    if (!Number.isFinite(value) || !Number.isInteger(value) || value < -1) {
      throw new Error("Max video preview must be -1 or a whole number of seconds from 0 upward.");
    }

    directives.push(`max-video-preview:${value}`);
  }

  if (noarchive) {
    directives.push("noarchive");
  }

  if (noimageindex) {
    directives.push("noimageindex");
  }

  if (notranslate) {
    directives.push("notranslate");
  }

  if (unavailableAfter) {
    const cleanDate = unavailableAfterDate.trim();

    if (!cleanDate) {
      throw new Error("Enter a date for unavailable_after.");
    }

    if (Number.isNaN(Date.parse(cleanDate))) {
      throw new Error("Enter a recognizable unavailable_after date, preferably in ISO 8601 format.");
    }

    directives.push(`unavailable_after: ${cleanDate}`);
  }

  if (indexMode === "noindex") {
    warnings.push("noindex will ask search engines not to show this page in search results.");
  }

  if (indexMode === "noindex") {
    warnings.push("The URL must remain crawlable for search engines to discover the noindex directive.");
  }

  if (pageUseCase === "private" || pageUseCase === "staging") {
    warnings.push("Robots directives are not access control. Protect confidential or staging content with authentication or network restrictions.");
  }

  if (pageUseCase === "duplicate") {
    notes.push("For duplicate URLs, review canonicalization or redirects before choosing noindex solely to consolidate signals.");
  }

  if (followMode === "nofollow") {
    warnings.push("nofollow asks search engines not to follow links on this page.");
  }

  if (indexMode === "index" && followMode === "follow" && directives.length === 2) {
    notes.push("For normal public pages, you may not need a robots meta tag at all.");
  }

  if (snippetMode === "nosnippet") {
    warnings.push("nosnippet can reduce how attractive the page looks in search results.");
  }

  if (noarchive) {
    warnings.push("Google Search ignores noarchive today, while Bing still documents support. Check the target crawler before relying on it.");
  }

  if (noimageindex) {
    warnings.push("noimageindex can prevent images on this page from being indexed.");
  }

  const content = directives.join(", ");
  const metaTag = `<meta name="robots" content="${content}">`;
  const headerValue = `X-Robots-Tag: ${content}`;
  const output = formatRobotsOutput({
    outputMode,
    metaTag,
    headerValue,
    content,
    directives,
    includeGooglebot,
    includeBingbot,
  });
  const summary = `${indexMode}, ${followMode}`;

  return {
    directives,
    metaTag,
    headerValue,
    output,
    warnings,
    notes,
    summary,
  };
}

function formatRobotsOutput({
  outputMode,
  metaTag,
  headerValue,
  content,
  directives,
  includeGooglebot,
  includeBingbot,
}: {
  outputMode: OutputMode;
  metaTag: string;
  headerValue: string;
  content: string;
  directives: string[];
  includeGooglebot: boolean;
  includeBingbot: boolean;
}) {
  const tags = [metaTag];

  if (includeGooglebot) {
    tags.push(`<meta name="googlebot" content="${content}">`);
  }

  if (includeBingbot) {
    tags.push(`<meta name="bingbot" content="${content}">`);
  }

  if (outputMode === "json") {
    return JSON.stringify(
      {
        directives,
        metaTag,
        headerValue,
        googlebotTag: includeGooglebot ? `<meta name="googlebot" content="${content}">` : "",
        bingbotTag: includeBingbot ? `<meta name="bingbot" content="${content}">` : "",
      },
      null,
      2
    );
  }

  if (outputMode === "header") {
    return headerValue;
  }

  if (outputMode === "both") {
    return [...tags, headerValue].join("\n");
  }

  if (outputMode === "nextjs") {
    const crawlerComment = includeGooglebot || includeBingbot
      ? [
          "",
          "// The generic robots value already applies to Googlebot and Bingbot.",
          "// Choose Meta tag output only when you specifically need duplicate crawler-named tags.",
        ]
      : [];

    return [
      'import type { Metadata } from "next";',
      "",
      "export const metadata: Metadata = {",
      `  robots: ${JSON.stringify(content)},`,
      "};",
      ...crawlerComment,
    ].join("\n");
  }

  return tags.join("\n");
}

function getRobotsNotes(result: RobotsResult): RobotsNote[] {
  const notes: RobotsNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      tone: "warning",
      title: "Review before publishing",
      message: result.warnings.join(" "),
    });
  }

  if (result.notes.length > 0) {
    notes.push({
      tone: "info",
      title: "Implementation context",
      message: result.notes.join(" "),
    });
  }

  if (result.directives.some((directive) => directive.startsWith("unavailable_after"))) {
    notes.push({
      tone: "info",
      title: "Date-sensitive directive",
      message:
        "Search engines support several date formats for unavailable_after. ISO 8601 is usually the clearest format to generate and review consistently.",
    });
  }

  return notes;
}
