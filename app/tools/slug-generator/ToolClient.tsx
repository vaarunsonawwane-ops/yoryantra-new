"use client";

import { type ChangeEvent, useMemo, useState } from "react";
import ToolShell from "@/app/components/ToolShell";
import YoryantraRelatedTools from "@/app/components/YoryantraRelatedTools";
import YoryantraSelect from "@/app/components/YoryantraSelect";

type SlugMode = "unicode" | "ascii";

const sampleTitle = "Café APIs & URL Design in 2026";

function makeUnicodeSlug(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[’']/gu, "")
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeAsciiSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[’']/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ToolClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SlugMode>("unicode");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const encodedPath = useMemo(() => (output ? encodeURIComponent(output) : ""), [output]);

  const clearResult = () => {
    setOutput("");
    setError("");
    setCopied(false);
  };

  const generateSlug = () => {
    if (!input.trim()) {
      setError("Enter a title or phrase before generating a slug.");
      setOutput("");
      return;
    }

    const slug = mode === "unicode" ? makeUnicodeSlug(input) : makeAsciiSlug(input);

    if (!slug) {
      setError(
        mode === "ascii"
          ? "No ASCII letters or numbers remained after conversion. Choose Unicode output or enter text that can produce an ASCII slug."
          : "No letters or numbers remained after removing separators and symbols.",
      );
      setOutput("");
      return;
    }

    setOutput(slug);
    setError("");
    setCopied(false);
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("The browser could not copy the generated slug to the clipboard.");
    }
  };

  const loadExample = () => {
    setInput(sampleTitle);
    setMode("unicode");
    clearResult();
  };

  const resetAll = () => {
    setInput("");
    setMode("unicode");
    clearResult();
  };

  return (
    <ToolShell
      title="Slug Generator"
      description="Build lowercase hyphenated URL slugs with Unicode-preserving or ASCII-only output."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <label className="block text-sm font-semibold text-gray-900">Title or phrase</label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Punctuation becomes separators, repeated separators collapse, and the result is lowercased.
          </p>
          <textarea
            className="mt-3 w-full min-h-[220px] rounded-xl border border-gray-300 p-4 text-sm leading-6 outline-none transition focus:border-transparent focus:ring-2 focus:ring-[var(--green)]"
            placeholder="Café APIs & URL Design in 2026"
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              setInput(event.target.value);
              clearResult();
            }}
          />
        </div>

        <div className="self-start rounded-2xl border border-gray-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-gray-900">Slug Style</h3>
          <div className="mt-4">
            <YoryantraSelect
              label="Character Mode"
              value={mode}
              onChange={(value) => {
                setMode(value as SlugMode);
                clearResult();
              }}
              options={[
                { value: "unicode", label: "Keep Unicode letters and numbers" },
                { value: "ascii", label: "ASCII letters and numbers only" },
              ]}
            />
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-600">
            {mode === "unicode"
              ? "Keeps readable letters and numbers from languages beyond ASCII. Browsers may percent-encode them when the slug is used in a URL."
              : "Removes combining marks where possible, then keeps only a–z and 0–9. Some non-Latin words can disappear completely."}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={generateSlug} className="yoryantra-btn min-h-[44px] whitespace-nowrap">
          Generate Slug
        </button>
        <button onClick={loadExample} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Load Example
        </button>
        <button onClick={resetAll} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap">
          Reset
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-9 grid gap-5 md:grid-cols-2 items-start">
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Generated Slug</h3>
            {output && (
              <button onClick={copyOutput} className="yoryantra-btn-outline min-h-[44px] whitespace-nowrap text-sm">
                {copied ? "Copied" : "Copy Slug"}
              </button>
            )}
          </div>
          <pre className="yoryantra-output min-h-[150px] overflow-auto whitespace-pre-wrap break-words text-sm">
            {output || "Generated slug will appear here."}
          </pre>
        </div>

        <div className="self-start">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Encoded Path Segment</h3>
          <pre className="yoryantra-output min-h-[150px] overflow-auto whitespace-pre-wrap break-all text-sm">
            {encodedPath || "Percent-encoded form will appear here."}
          </pre>
        </div>
      </div>

      <section className="mt-12 space-y-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A slug is a URL decision, not an SEO score</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A slug is usually the readable path segment that identifies a page, such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">/docs/http-caching</code>. Lowercase words and hyphen separators make that segment easier to read and keep route naming consistent, but there is no special ranking bonus simply because a string was produced by a slug generator.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Google recommends simple, descriptive URLs, words in the audience&apos;s language, and hyphens between words. That is a useful naming rule, not a reason to stuff keywords into a path or rewrite a clear existing URL just to make it shorter.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Reference: {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://developers.google.com/search/docs/crawling-indexing/url-structure" target="_blank" rel="noreferrer">
              Google Search Central URL structure guidance
            </a>.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 items-start">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Unicode keeps the language; ASCII simplifies transport</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Unicode mode keeps letters such as é, ü, Ελληνικά, हिन्दी, or 日本語 instead of deleting them. ASCII mode is intentionally lossy: it removes combining marks when a decomposition exists and then discards anything outside a–z and 0–9. It is useful only when your routing or publishing system requires ASCII paths.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Readable text and URL serialization are separate steps</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              A Unicode slug can be readable in an editor while appearing percent-encoded in an actual URL. The encoded preview shows the UTF-8 path-segment representation produced by <code className="rounded bg-white px-1 py-0.5">encodeURIComponent()</code>; your framework or URL builder may serialize the surrounding path for you.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Reference: {" "}
              <a className="text-[var(--green)] underline underline-offset-2" href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer">
                WHATWG URL Standard
              </a>.
            </p>
          </div>
        </div>

        <div className="self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Changing a live slug changes the URL</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            Renaming an existing slug can break bookmarks, internal links, inbound links, cached URLs, and indexed addresses. If a published route must change, update internal references and configure the appropriate redirect rather than treating slug generation as a harmless text cleanup step.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">The generator cannot decide route policy for your application</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A valid-looking slug can still be unusable in a real app. Your CMS or router may reserve names such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">admin</code>, require unique slugs, enforce a maximum length, scope uniqueness by parent route, or attach an ID when two titles normalize to the same value. Those rules belong in the application that owns the URLs.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Punctuation removal can also merge meaning. Apostrophes are dropped so <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">developer&apos;s guide</code> becomes <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">developers-guide</code>; symbols such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">+</code> or <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">&amp;</code> become separators rather than words. Review technical names, trademarks, and titles where those characters carry meaning.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/slug-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
