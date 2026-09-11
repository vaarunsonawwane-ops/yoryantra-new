import Link from "next/link";
import { tools } from "@/app/data/tools";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const seoTools = tools.filter((tool) => tool.category === "SEO Tools");

export const metadata = {
  title: "SEO Tools for Crawling, Indexing, Canonicals, and Metadata | Yoryantra",
  description:
    "Inspect technical SEO signals for crawling, indexing, canonicals, hreflang, sitemaps, redirects, metadata, structured data, headings, and search-result previews.",
  alternates: {
    canonical: "https://yoryantra.com/categories/seo-tools",
  },
  openGraph: {
    title: "SEO Tools for Crawling, Indexing, Canonicals, and Metadata | Yoryantra",
    description:
      "Technical SEO utilities that keep crawl access, indexability, canonicalization, internationalization, redirects, and search presentation separate.",
    url: "https://yoryantra.com/categories/seo-tools",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Tools for Crawling, Indexing, Canonicals, and Metadata | Yoryantra",
    description:
      "Review crawl directives, indexability, canonicals, hreflang, sitemaps, redirects, metadata, and search-presentation signals without ranking promises.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Categories</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">SEO Tools</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Technical SEO Tools for Crawling, Indexing, and Search Presentation
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Technical SEO is a chain of separate signals rather than a single score.
            Crawl access, indexability, canonicalization, language targeting, redirects,
            metadata, structured data, and search presentation interact, but each answers
            a different question. The tools here are organized around those distinctions.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-gray-900">A Map of the Signals Before You Diagnose Them</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700"><strong className="text-gray-900">Crawl access:</strong>{" "}robots.txt tells cooperating crawlers which URL paths they may fetch. It is not a page-level noindex mechanism.</p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700"><strong className="text-gray-900">Indexing directives:</strong>{" "}meta robots and X-Robots-Tag can request noindex, nofollow, or snippet-related behavior when the search engine can obtain the directive.</p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700"><strong className="text-gray-900">Canonicalization:</strong>{" "}canonical signals express a preferred representative URL among duplicate or similar content; search engines still evaluate other evidence.</p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700"><strong className="text-gray-900">Discovery and relationships:</strong>{" "}sitemaps help surface URLs, while hreflang connects localized alternatives. Neither is a ranking guarantee.</p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700"><strong className="text-gray-900">Navigation behavior:</strong>{" "}redirects move clients between URLs. A redirect chain, a canonical declaration, and a sitemap entry should not be treated as interchangeable signals.</p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700"><strong className="text-gray-900">Search presentation:</strong>{" "}titles, descriptions, headings, structured data, and social metadata can be inspected, but search engines may rewrite or ignore parts of the submitted markup.</p>
            </SectionMiniCard>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">All SEO Tools</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse all 32 tools for metadata, robots rules, sitemaps, canonicals,
              hreflang, redirects, HTTP signals, structured data, indexability,
              headings, image alt text, title and description review, slug analysis,
              crawl cleanup, and search-result previews.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {seoTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">{tool.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">A Practical Order for Investigating an Indexing Problem</h2>
          <div className="mt-6 space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900">1. Can the crawler fetch the URL?</h3>
              <p className="mt-2">Check robots.txt and the actual response path. A blocked URL may prevent the crawler from seeing page-level directives.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">2. What indexing directives are visible?</h3>
              <p className="mt-2">Inspect meta robots and X-Robots-Tag values in the representation or response headers you actually have, rather than assuming they are absent.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">3. Which URL is being nominated as canonical?</h3>
              <p className="mt-2">Compare the page URL, declared canonical, redirects, internal linking, and sitemap entries. Conflicting signals can make diagnosis harder even when each tag is syntactically valid.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">4. Is the page discoverable and correctly related?</h3>
              <p className="mt-2">Review sitemap membership and, for localized pages, hreflang language or region codes, self-reference, reciprocal relationships, and x-default where appropriate.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">5. Separate implementation findings from search-engine decisions</h3>
              <p className="mt-2">A tool can surface malformed markup, conflicting signals, or likely truncation. It cannot guarantee recrawl timing, indexing, chosen canonical, ranking, traffic, or the final snippet shown for a query.</p>
            </div>
          </div>
        </SectionCard>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">Pasted Source and Live Search Behavior Are Different Evidence</h2>
          <div className="mt-5 space-y-5 text-gray-600 leading-relaxed">
            <p>
              Several tools intentionally analyze pasted HTML, headers, URL lists, or
              user-entered values. That makes the result reproducible and useful for
              implementation review, but it cannot reveal every redirect, rendered DOM
              change, CDN response, authentication condition, or crawler-specific response
              that exists outside the supplied material.
            </p>
            <p>
              The Redirect Checker is an example of that boundary: it traces redirect
              information from pasted HTTP response material rather than silently claiming
              to perform a live crawl. When live behavior matters, confirm it with an
              appropriate HTTP client, server logs, browser developer tools, or Search Console.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">Google Documentation for the Search Signals Used Here</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">robots.txt documentation</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Explains crawler access rules and why robots.txt is not, by itself, a reliable method for keeping a URL out of Google's index.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">Canonicalization guidance</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Explains canonical signals and how Google selects a representative URL among duplicate or similar pages.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">Sitemap documentation</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Covers sitemap discovery, supported formats, and the role sitemaps play in helping search engines discover URLs.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://developers.google.com/search/docs/specialty/international/localized-versions" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">Localized-version guidance</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Documents hreflang relationships for language and regional variants, including x-default use.</p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">Related Tool Categories</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/categories/developer-tools" className="yoryantra-btn-outline">Developer Tools</Link>
            <Link href="/categories/json-tools" className="yoryantra-btn-outline">JSON & Data Tools</Link>
            <Link href="/categories/devops-tools" className="yoryantra-btn-outline">DevOps Tools</Link>
            <Link href="/categories/security-tools" className="yoryantra-btn-outline">Security Tools</Link>
            <Link href="/categories/encoding-tools" className="yoryantra-btn-outline">Encoding Tools</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
