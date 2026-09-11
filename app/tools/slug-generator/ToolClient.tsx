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

      <section className="mt-12 border-t border-gray-200 pt-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">A slug becomes part of an address people and crawlers may keep</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Lowercase words and hyphen separators can make a path easier to read, but a generated slug is not an SEO score and it does not decide whether a page should rank. Google recommends descriptive URLs, words in the audience&apos;s language, and hyphens between words. Those are naming principles, not a reason to stuff keywords into a path or rewrite a stable URL only to make it look cleaner.
          </p>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The safest time to choose a slug is before publication. Once bookmarks, internal links, backlinks, analytics, caches, and search indexes know an address, the slug is part of the page&apos;s public identity.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Reference: {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://developers.google.com/search/docs/crawling-indexing/url-structure" target="_blank" rel="noreferrer">
              Google Search Central URL structure guidance
            </a>.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">The two character modes make different compromises</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Unicode mode keeps letters and numbers from the original language after normalization and lowercasing. ASCII mode is deliberately lossy: it removes combining marks when decomposition provides them, then keeps only <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">a-z</code> and <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">0-9</code>. It is not a general transliteration engine.
          </p>
          <div className="mt-5 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white text-sm">
            <div className="p-5">
              <p className="font-semibold text-gray-900">Café APIs</p>
              <p className="mt-2 text-gray-600"><span className="font-medium text-gray-900">Unicode:</span> <code>café-apis</code> · <span className="font-medium text-gray-900">ASCII:</span> <code>cafe-apis</code></p>
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-900">日本語 API</p>
              <p className="mt-2 text-gray-600"><span className="font-medium text-gray-900">Unicode:</span> <code>日本語-api</code> · <span className="font-medium text-gray-900">ASCII:</span> <code>api</code></p>
              <p className="mt-2 text-gray-500">The Japanese text disappears in ASCII mode because this page does not transliterate it into Latin characters.</p>
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-900">C++ &amp; C#</p>
              <p className="mt-2 text-gray-600">Both modes produce <code>c-c</code> because punctuation is treated as a separator. Technical names where symbols carry meaning need a manual decision.</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Readable Unicode and a serialized URL are two views of the same path</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A slug such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">café-apis</code> can stay readable in an editor while its non-ASCII bytes appear percent-encoded when serialized into a URL. The encoded preview uses <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">encodeURIComponent()</code>, which UTF-8 percent-encodes characters that need escaping in a URL component. A framework may perform its own URL serialization, so avoid encoding the same path segment twice.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Reference: {" "}
            <a className="text-[var(--green)] underline underline-offset-2" href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer">
              WHATWG URL Standard
            </a>.
          </p>
        </div>

        <div className="mt-10 self-start rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Treat a published slug change as a URL migration</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            Renaming a live slug can break bookmarks, inbound links, cached addresses, and references inside your own site. When a published route must move, update internal links and configure the redirect that matches the migration rather than treating regeneration as harmless text cleanup.
          </p>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900">Your CMS or router still owns the rules this page cannot know</h2>
          <ul className="mt-5 space-y-3 text-gray-600 leading-relaxed">
            <li><strong className="text-gray-900">Uniqueness:</strong> two different titles can collapse to the same slug, so collision handling belongs in the application or database.</li>
            <li><strong className="text-gray-900">Reserved names:</strong> routes such as <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">admin</code>, <code className="rounded bg-gray-100 px-1 py-0.5 text-sm text-gray-800">api</code>, or framework-specific paths may be unavailable even when the string looks valid.</li>
            <li><strong className="text-gray-900">Length and hierarchy:</strong> a CMS may cap segment length, scope uniqueness under a parent, append an ID, or derive the final route from more than the title.</li>
            <li><strong className="text-gray-900">Meaningful punctuation:</strong> apostrophes are removed and other punctuation becomes separators here. Product names, programming languages, model numbers, and trademarks may need an intentional override.</li>
          </ul>
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900">Related Tools</h2>
          <div className="mt-4">
            <YoryantraRelatedTools currentHref="/tools/slug-generator" />
          </div>
        </div>
      </section>
    </ToolShell>
  );
}
