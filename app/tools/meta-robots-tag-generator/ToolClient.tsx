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
    followMode: "nofollow",
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
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
    noarchive: true,
    nosnippet: false,
    noimageindex: false,
    notranslate: false,
    unavailableAfter: false,
  },
  staging: {
    indexMode: "noindex",
    followMode: "nofollow",
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    notranslate: false,
    unavailableAfter: false,
  },
  pdf: {
    indexMode: "noindex",
    followMode: "follow",
    noarchive: true,
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
  const [maxSnippet, setMaxSnippet] = useState("160");
  const [maxVideoPreview, setMaxVideoPreview] = useState("30");
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
  };

  const generateRobotsTag = () => {
    try {
      const nextResult = buildRobotsDirectives({
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

    await navigator.clipboard.writeText(output);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1400);
  };

  const loadExample = () => {
    applyUseCase("duplicate");
    setOutputMode("both");
    setSnippetMode("default");
    setImagePreviewMode("default");
    setVideoPreviewMode("default");
    setMaxSnippet("160");
    setMaxVideoPreview("30");
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
    setMaxSnippet("160");
    setMaxVideoPreview("30");
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
      description="Generate meta robots tags and X-Robots-Tag header values for indexing, following links, snippets, images, archives, translations, and search preview controls."
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
              { label: "Normal public page", value: "normal" },
              { label: "Private or internal page", value: "private" },
              { label: "Duplicate page", value: "duplicate" },
              { label: "Thin or temporary page", value: "thin" },
              { label: "Staging page", value: "staging" },
              { label: "PDF or file response", value: "pdf" },
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
              <label className="block text-sm font-medium text-gray-700">
                Max Snippet Characters
              </label>

              <input
                value={maxSnippet}
                onChange={(event) => {
                  setMaxSnippet(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder="160"
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
              <label className="block text-sm font-medium text-gray-700">
                Max Video Preview Seconds
              </label>

              <input
                value={maxVideoPreview}
                onChange={(event) => {
                  setMaxVideoPreview(event.target.value);
                  setResult(null);
                  setOutput("");
                  setError("");
                  setCopied(false);
                }}
                placeholder="30"
                className="mt-2 w-full rounded-xl border border-gray-300 bg-white p-3 text-sm font-mono outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
              />
            </div>
          )}

          {unavailableAfter && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Unavailable After Date
              </label>

              <input
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

            noarchive
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

            Also generate googlebot-specific tag
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

            Also generate bingbot-specific tag
          </label>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Use noindex carefully. If a public page should appear in search, avoid
          adding noindex accidentally.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateRobotsTag} className="yoryantra-btn">
          Generate Robots Tag
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
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">
            Robots tag notes
          </h3>

          <div className="mt-3 space-y-3">
            {notes.map((note) => (
              <div key={note.title}>
                <p className="text-sm font-semibold text-amber-900">
                  {note.title}
                </p>

                <p className="mt-1 text-sm leading-relaxed text-amber-800">
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

        <pre className="yoryantra-output overflow-auto text-sm min-h-[300px] whitespace-pre-wrap break-words">
          {output || "Generated meta robots output will appear here."}
        </pre>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
        Robots tag generation happens directly in your browser. Your settings
        are not uploaded to a server.
      </div>

      <section className="mt-12 border-t border-gray-200 pt-10 space-y-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Creating Meta Robots Tags for Search Indexing
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            A meta robots tag tells search engines how a page should be crawled,
            indexed, and shown in search results. It can allow indexing, block
            indexing, control link following, disable snippets, prevent image
            indexing, or remove cached copies.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            This Meta Robots Tag Generator creates clean robots meta tags and
            X-Robots-Tag header values for common SEO situations, including
            duplicate pages, private pages, staging pages, temporary content, and
            file responses.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Generating a Robots Meta Tag
          </h2>

          <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Choose the page use case or set indexing rules manually.</li>
            <li>Select index/noindex and follow/nofollow behavior.</li>
            <li>Add snippet, image, archive, translation, or expiry directives if needed.</li>
            <li>Choose meta tag, X-Robots-Tag header, or framework output.</li>
            <li>Copy the result into your page, server, CDN, or app code.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Common Meta Robots Use Cases
          </h2>

          <ul className="mt-4 list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Allowing normal public pages to be indexed and followed.</li>
            <li>Blocking duplicate, thin, internal, or temporary pages from search.</li>
            <li>Adding noindex to staging pages before launch.</li>
            <li>Generating X-Robots-Tag values for PDFs and file responses.</li>
            <li>Controlling snippets, image previews, and cached copies.</li>
            <li>Creating Next.js metadata robots settings.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Example Meta Robots Tag
          </h2>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
{`<meta name="robots" content="noindex, follow, noarchive">`}
            </pre>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Meta Robots vs robots.txt
          </h2>

          <p className="mt-4 text-gray-600 leading-relaxed">
            robots.txt controls crawling at the site or path level. A meta
            robots tag controls indexing and search display behavior for a
            specific HTML page. X-Robots-Tag does a similar job through HTTP
            headers and is useful for PDFs, images, and other non-HTML files.
          </p>

          <p className="mt-4 text-gray-600 leading-relaxed">
            Be careful not to block crawling with robots.txt if search engines
            need to see a noindex tag on the page. For many SEO workflows,
            noindex should be visible to crawlers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-5 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What does a meta robots tag do?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                It tells search engines whether a page should be indexed, whether
                links should be followed, and how the page may appear in search.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between noindex and nofollow?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                noindex asks search engines not to show the page in search
                results. nofollow asks them not to follow links on the page.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                When should I use X-Robots-Tag?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Use X-Robots-Tag when you need robots directives in HTTP headers,
                especially for PDFs, images, downloads, and non-HTML files.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should every page have index, follow?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Not always. Normal public pages can usually use index, follow or
                no robots tag at all. Duplicate, private, thin, and staging pages
                may need noindex.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is anything uploaded when I generate the tag?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The robots tag is generated directly in your browser.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Related Tools
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/tools/robots-txt-generator" className="yoryantra-btn-outline">
              Robots.txt Generator
            </Link>

            <Link href="/tools/robots-txt-validator" className="yoryantra-btn-outline">
              Robots.txt Validator
            </Link>

            <Link href="/tools/canonical-url-checker" className="yoryantra-btn-outline">
              Canonical URL Checker
            </Link>

            <Link href="/tools/sitemap-generator" className="yoryantra-btn-outline">
              Sitemap Generator
            </Link>

            <Link href="/tools/meta-tag-analyzer" className="yoryantra-btn-outline">
              Meta Tag Analyzer
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

function buildRobotsDirectives({
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
    const value = Number(maxSnippet);

    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Max snippet length must be a positive number.");
    }

    directives.push(`max-snippet:${Math.floor(value)}`);
  }

  if (imagePreviewMode !== "default") {
    directives.push(`max-image-preview:${imagePreviewMode}`);
  }

  if (videoPreviewMode === "none") {
    directives.push("max-video-preview:0");
  }

  if (videoPreviewMode === "seconds") {
    const value = Number(maxVideoPreview);

    if (!Number.isFinite(value) || value < 0) {
      throw new Error("Max video preview must be a positive number of seconds.");
    }

    directives.push(`max-video-preview:${Math.floor(value)}`);
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

    directives.push(`unavailable_after: ${cleanDate}`);
  }

  if (indexMode === "noindex") {
    warnings.push("noindex will ask search engines not to show this page in search results.");
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
    return [
      "export const metadata = {",
      "  robots: {",
      `    index: ${directives.includes("index") && !directives.includes("noindex")},`,
      `    follow: ${directives.includes("follow") && !directives.includes("nofollow")},`,
      "  },",
      "};",
    ].join("\n");
  }

  return tags.join("\n");
}

function getRobotsNotes(result: RobotsResult): RobotsNote[] {
  const notes: RobotsNote[] = [];

  if (result.warnings.length > 0) {
    notes.push({
      title: "Review before publishing",
      message: result.warnings.join(" "),
    });
  }

  if (result.notes.length > 0) {
    notes.push({
      title: "Simple public page",
      message: result.notes.join(" "),
    });
  }

  if (result.directives.some((directive) => directive.startsWith("unavailable_after"))) {
    notes.push({
      title: "Date-sensitive directive",
      message:
        "The unavailable_after directive depends on a valid date format and search engine support.",
    });
  }

  return notes;
}
