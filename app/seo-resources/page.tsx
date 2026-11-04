import Link from "next/link";

const signalCards = [
  {
    title: "robots.txt",
    does: "Controlling what crawlers can access on specific URLs for specific user-agents.",
    not: "However it cannot be used to ensure that URLs that are already known will be removed from search results. It can also stop crawlers from accessing noindex directives on the page itself.",
    href: "/tools/robots-txt-tester",
    label: "Robots.txt Tester",
  },
  {
    title: "XML sitemap",
    does: "Provides a list of URLs for discovery and optional metadata.",
    not: "The site will be crawled, indexed, canonicalised or ranked..",
    href: "/tools/sitemap-validator",
    label: "Sitemap Validator",
  },
  {
    title: "Canonical URL",
    does: "Specifying a preferred canonical URL for duplicated or very similar content.",
    not: "To force search engines to use your preferred canonical. If signals conflict search engines can pick another canonical.",
    href: "/tools/canonical-url-checker",
    label: "Canonical URL Checker",
  },
  {
    title: "hreflang",
    does: "To link language or region variants so search engines can return the correct version.",
    not: "An alternative to canonicalisation, quality translations or ensuring that alternate URLs are correctly indexable.",
    href: "/tools/hreflang-validator",
    label: "Hreflang Validator",
  },
];

const debugOrder = [
  "If your page isn’t showing up in Google Search, this may not be an issue with your robots.txt or sitemap. There are many factors that can affect if Google can find, crawl and index your URL.",
  "Ensure that the HTTP response is successful. You want to confirm that you are able to load the final URL and not being redirected.",
  "Check robots.txt rules to make sure that Googlebot can crawl the page.",
  "Check for any indexing restrictions. Ensure that there are no noindex directives in robots meta tags and X-Robots-Tag headers. However if the crawler is blocked it may never see these.",
  "Check for canonical signals. Ensure that the canonical URL matches what is being used in the internal linking, redirects and sitemap.",
  "Use Google Search Console to check what Google is reporting. This can be done using the URL Inspection tool.",
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
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--gold-text)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">SEO Resources</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Technical SEO As A Chain Of Signals
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            There are many factors that can affect if your page is crawlable, 
			indexable, canonicalised and hreflang’d, or a fully indexable page 
			with altered titles. It can be much easier to debug your issues if 
			you treat each of these factors as a separate question.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">What do common SEO signals do?</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {signalCards.map((signal) => (
              <div key={signal.title} className="self-start rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{signal.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Useful for:</strong> {signal.does}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Does not guarantee:</strong> {signal.not}</p>
                <Link href={signal.href} className="mt-5 inline-flex text-sm font-semibold text-[var(--gold-text)]">{signal.label} →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 grid gap-7 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Debugging An Indexing Issue</h2>
            <ol className="mt-6 space-y-4">
              {debugOrder.map((item, index) => (
                <li key={item} className="flex gap-4 leading-7 text-gray-600">
                  <span className="min-w-7 pt-0.5 text-xs font-semibold tracking-wider text-gray-900">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-7">
            <h2 className="text-xl font-semibold text-gray-900">Useful diagnostic tools</h2>
            <div className="mt-5 flex flex-col gap-3 text-sm font-semibold">
              <Link href="/tools/indexability-checker" className="text-[var(--gold-text)] hover:underline">Indexability Checker →</Link>
              <Link href="/tools/meta-robots-tag-generator" className="text-[var(--gold-text)] hover:underline">Meta Robots Tag Generator →</Link>
              <Link href="/tools/redirect-checker" className="text-[var(--gold-text)] hover:underline">Redirect Checker →</Link>
              <Link href="/tools/sitemap-url-extractor" className="text-[var(--gold-text)] hover:underline">Sitemap URL Extractor →</Link>
              <Link href="/tools/crawl-budget-url-cleaner" className="text-[var(--gold-text)] hover:underline">Crawl Budget URL Cleaner →</Link>
            </div>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              While Yoryantra’s SEO tools can help to break down each part of the 
			  process, you will need to use Google Search Console to see how 
			  Google has actually processed the URL.
            </p>
          </div>
        </section>

        <section className="mt-18 rounded-2xl border border-gray-200 bg-white p-7 md:p-9">
          <h2 className="text-2xl font-semibold text-gray-900">Search Preview Tools</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              While title and description tools can tell you about the text length, 
			  width, duplicated words and likely truncation, they cannot guarantee 
			  that Google will show exactly the same title link and snippet for all 
			  queries. Search systems may decide to use different text from the page 
			  to best represent the result.
            </p>
            <p>
              Use these as editing tools. Ensure that your live HTML is correct, your 
			  page title and heading are descriptive, and that the content on screen 
			  matches the metadata. Once the page has been crawled you can check how 
			  it behaves in search using Search Console..
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
          <h2 className="text-2xl font-semibold text-gray-900">Ensure All Signals Are Consistent</h2>
          <p className="mt-5 leading-8 text-gray-600">
            Redirects, canonical, internal linking, sitemap, hreflangs, robots 
			and HTTP responses should all tell a consistent story. If there are 
			conflicting signals then this can be useful to investigate. Trying to 
			get one perfect SEO score won’t help. Just because something is technically 
			correct doesn’t mean it will rank. The content on the page should be useful 
			to satisfy the searcher.
          </p>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Google Search Central references</h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">robots.txt introduction ↗</a>
            <a href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Sitemaps overview ↗</a>
            <a href="https://developers.google.com/search/docs/crawling-indexing/canonicalization" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Canonicalization ↗</a>
            <a href="https://developers.google.com/search/docs/specialty/international/localized-versions" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Localized versions and hreflang ↗</a>
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
