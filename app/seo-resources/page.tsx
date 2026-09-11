import Link from "next/link";

const signalCards = [
  {
    title: "robots.txt",
    does: "Controls crawler access to URL paths for matching user-agents.",
    not: "It is not a reliable way to remove an already known URL from search results, and blocked crawling can prevent a crawler from seeing page-level noindex directives.",
    href: "/tools/robots-txt-tester",
    label: "Robots.txt Tester",
  },
  {
    title: "XML sitemap",
    does: "Provides a discovery list and optional URL metadata to search engines.",
    not: "Submission does not guarantee crawling, indexing, canonical selection, or ranking.",
    href: "/tools/sitemap-validator",
    label: "Sitemap Validator",
  },
  {
    title: "Canonical URL",
    does: "Expresses a preferred representative URL for duplicate or very similar content.",
    not: "It is a signal, not a command; search engines can select another canonical when signals disagree.",
    href: "/tools/canonical-url-checker",
    label: "Canonical URL Checker",
  },
  {
    title: "hreflang",
    does: "Connects language or regional alternatives so search engines can serve a suitable version.",
    not: "It does not replace canonicalization, translation quality, or correct indexability of the alternate URLs.",
    href: "/tools/hreflang-validator",
    label: "Hreflang Validator",
  },
];

const debugOrder = [
  "Confirm the URL returns the intended HTTP status and redirect behavior.",
  "Check whether robots.txt permits the crawler to fetch the page.",
  "Inspect robots meta and X-Robots-Tag directives for indexing restrictions.",
  "Compare the declared canonical with redirects, internal links, and sitemap URLs.",
  "For international pages, verify hreflang relationships and self-references.",
  "Use Search Console to see what Google actually crawled, indexed, or selected as canonical.",
];

export const metadata = {
  title: "Technical SEO Resources for Crawling, Indexing, Canonicals, and Hreflang | Yoryantra",
  description:
    "Debug technical SEO signals in order across HTTP status, robots.txt, noindex, canonicals, sitemaps, hreflang, metadata, and Search Console verification.",
  alternates: {
    canonical: "https://yoryantra.com/seo-resources",
  },
  openGraph: {
    title: "Technical SEO Resources | Yoryantra",
    description:
      "Understand what robots.txt, sitemaps, canonicals, hreflang, redirects, and metadata can signal—and what they cannot guarantee.",
    url: "https://yoryantra.com/seo-resources",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical SEO Resources | Yoryantra",
    description:
      "Treat crawling, indexing, canonicalization, international targeting, and search presentation as separate technical questions.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--light-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">SEO Resources</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Technical SEO Is a Chain of Signals, Not a Single Score
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A page can be crawlable but not indexable, indexable but not chosen
            as canonical, canonicalized correctly but missing hreflang, or fully
            indexable while its title is rewritten in search results. Debugging
            becomes easier when crawling, indexing, canonicalization,
            international targeting, and presentation are treated as separate
            questions.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">What Common SEO Signals Actually Do</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {signalCards.map((signal) => (
              <div key={signal.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{signal.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Useful for:</strong> {signal.does}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Does not guarantee:</strong> {signal.not}</p>
                <Link href={signal.href} className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">{signal.label} →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 grid gap-7 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Debug Indexability in a Useful Order</h2>
            <ol className="mt-6 space-y-4">
              {debugOrder.map((item, index) => (
                <li key={item} className="flex gap-4 leading-7 text-gray-600">
                  <span className="min-w-7 pt-0.5 text-xs font-semibold tracking-wider text-[var(--light-gold)]">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-7">
            <h2 className="text-xl font-semibold text-gray-900">Useful diagnostic tools</h2>
            <div className="mt-5 flex flex-col gap-3 text-sm font-semibold">
              <Link href="/tools/indexability-checker" className="text-[var(--light-gold)] hover:underline">Indexability Checker →</Link>
              <Link href="/tools/meta-robots-tag-generator" className="text-[var(--light-gold)] hover:underline">Meta Robots Tag Generator →</Link>
              <Link href="/tools/redirect-checker" className="text-[var(--light-gold)] hover:underline">Redirect Checker →</Link>
              <Link href="/tools/sitemap-url-extractor" className="text-[var(--light-gold)] hover:underline">Sitemap URL Extractor →</Link>
              <Link href="/tools/crawl-budget-url-cleaner" className="text-[var(--light-gold)] hover:underline">Crawl Budget URL Cleaner →</Link>
            </div>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              The Redirect Checker analyzes response information you provide; it
              does not silently fetch and follow a live URL. Use live HTTP data
              when the problem depends on actual server behavior.
            </p>
          </div>
        </section>

        <section className="mt-18 rounded-2xl border border-gray-200 bg-white p-7 md:p-9">
          <h2 className="text-2xl font-semibold text-gray-900">A Search Preview Is Still a Preview</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Title and description tools can measure source text, estimated
              width, duplicate wording, and likely truncation. They cannot
              guarantee the exact title link or snippet a search engine will
              display for every query. Search systems may choose different text
              from the page when it better represents the result.
            </p>
            <p>
              Treat preview tools as editing aids. Check the live HTML, make the
              page title and main heading descriptive, keep the visible content
              consistent with the metadata, and evaluate actual search behavior
              in Search Console after the page has been crawled.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tools/title-tag-length-checker" className="yoryantra-btn-outline">Title Tag Length Checker</Link>
            <Link href="/tools/meta-description-length-checker" className="yoryantra-btn-outline">Meta Description Length Checker</Link>
            <Link href="/tools/serp-snippet-preview-tool" className="yoryantra-btn-outline">SERP Snippet Preview</Link>
            <Link href="/tools/open-graph-preview-checker" className="yoryantra-btn-outline">Open Graph Preview Checker</Link>
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">Consistency Matters More Than One Perfect Tag</h2>
          <p className="mt-5 leading-8 text-gray-600">
            Redirects, canonicals, internal links, sitemap URLs, hreflang
            alternates, robots directives, and actual HTTP responses should tell
            a coherent story about which URLs are accessible and preferred.
            Conflicting signals are more useful to investigate than chasing a
            single “SEO score.” Technical correctness also does not guarantee
            ranking; the page still needs useful content that satisfies the
            person who searched for it.
          </p>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Google Search Central references</h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro" target="_blank" rel="noreferrer" className="text-[var(--light-gold)] hover:underline">robots.txt introduction ↗</a>
            <a href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview" target="_blank" rel="noreferrer" className="text-[var(--light-gold)] hover:underline">Sitemaps overview ↗</a>
            <a href="https://developers.google.com/search/docs/crawling-indexing/canonicalization" target="_blank" rel="noreferrer" className="text-[var(--light-gold)] hover:underline">Canonicalization ↗</a>
            <a href="https://developers.google.com/search/docs/specialty/international/localized-versions" target="_blank" rel="noreferrer" className="text-[var(--light-gold)] hover:underline">Localized versions and hreflang ↗</a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/categories/seo-tools" className="yoryantra-btn-outline">Browse SEO Tools</Link>
          <Link href="/developers" className="yoryantra-btn-outline">Developer Workflows</Link>
          <Link href="/resources" className="yoryantra-btn-outline">All Resource Guides</Link>
        </div>
      </section>
    </main>
  );
}
