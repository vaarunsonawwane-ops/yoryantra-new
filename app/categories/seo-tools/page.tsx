import Link from "next/link";

const seoTools = [
  {
    title: "Meta Tag Generator",
    description:
      "Create SEO meta titles, descriptions, and basic metadata for webpages.",
    href: "/tools/meta-tag-generator",
  },
  {
    title: "Open Graph Generator",
    description:
      "Generate Open Graph tags for better social sharing previews.",
    href: "/tools/open-graph-generator",
  },
  {
    title: "Hreflang Tag Generator",
    description:
      "Generate hreflang tags for multilingual and international SEO pages.",
    href: "/tools/hreflang-tag-generator",
  },
  {
    title: "robots.txt Generator",
    description:
      "Create robots.txt rules to guide search engine crawlers.",
    href: "/tools/robots-txt-generator",
  },
  {
    title: "Sitemap Generator",
    description:
      "Generate XML sitemap structure for search engine discovery.",
    href: "/tools/sitemap-generator",
  },
  {
    title: "Canonical URL Checker",
    description:
      "Check canonical URLs and avoid duplicate page confusion.",
    href: "/tools/canonical-url-checker",
  },
  {
    title: "Redirect Checker",
    description:
      "Inspect redirects, status codes, and final destination URLs.",
    href: "/tools/redirect-checker",
  },
  {
    title: "UTM Builder",
    description:
      "Build campaign tracking URLs for analytics and marketing reports.",
    href: "/tools/utm-builder",
  },
  {
    title: "URL Query Params Parser",
    description:
      "Read and inspect tracking tags, query strings, and URL parameters.",
    href: "/tools/url-query-params-parser",
  },
  {
    title: "QR Code Generator",
    description:
      "Generate QR codes for links, campaigns, and quick mobile sharing.",
    href: "/tools/qr-code-generator",
  },
];

const featuredTools = seoTools.slice(0, 6);

export const metadata = {
  title: "SEO Tools Online Free | Yoryantra",

  description:
    "Use free online SEO tools for meta tags, Open Graph, hreflang, robots.txt, sitemaps, redirects, UTM links, and technical SEO workflows.",

  keywords: [
    "seo tools",
    "free seo tools",
    "technical seo tools",
    "online seo tools",
    "meta tag generator",
    "hreflang generator",
    "robots.txt generator",
    "sitemap generator",
    "utm builder",
    "redirect checker",
  ],

  alternates: {
    canonical: "https://yoryantra.com/categories/seo-tools",
  },

  openGraph: {
    title: "SEO Tools Online Free | Yoryantra",

    description:
      "Use free online SEO tools for metadata, indexing, redirects, hreflang, sitemaps, and campaign tracking.",

    url: "https://yoryantra.com/categories/seo-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "SEO Tools Online Free | Yoryantra",

    description:
      "Free online SEO tools for technical SEO, metadata, indexing, redirects, and campaign tracking.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* HERO */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--green)]">
            SEO Tools
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Technical SEO Tools for Metadata, Indexing, and Site Audits
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical SEO tools to create metadata, inspect redirects,
            build tracking URLs, generate hreflang tags, prepare robots.txt
            rules, and improve how search engines understand your website.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Technical SEO Workflows
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              These tools help with everyday SEO tasks such as metadata
              creation, crawl control, redirects, canonical checks, and
              structured URL handling.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful for Developers and SEO Teams
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Yoryantra keeps SEO utilities simple enough for marketers and
              practical enough for developers working on websites, apps, and
              landing pages.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Fast Browser-Based Utilities
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Most tools run directly in your browser, making them quick to use
              while keeping your inputs private and easy to copy.
            </p>
          </div>
        </div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular SEO Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with these frequently used tools for metadata, search
              appearance, indexing rules, and international SEO setup.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--green)]">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--green)]">
                  Open tool →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ALL TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              All SEO Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse the complete SEO tool set for technical checks, campaign
              URLs, metadata generation, and search optimization tasks.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {seoTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:border-[var(--green)] hover:bg-white"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* USE CASES */}
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Where These SEO Tools Help
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Creating meta titles and descriptions for pages.",
              "Generating Open Graph tags for social previews.",
              "Preparing hreflang tags for international SEO.",
              "Checking redirects and final destination URLs.",
              "Creating robots.txt and sitemap-related SEO files.",
              "Building UTM links for analytics and campaign tracking.",
              "Reviewing canonical URLs and duplicate page signals.",
              "Inspecting query parameters used in tracking URLs.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* WHY MATTERS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Technical SEO Tools Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Technical SEO is not only about keywords. Search engines also
              need clear metadata, clean URLs, crawlable pages, correct
              redirects, canonical signals, and language targeting information.
            </p>

            <p>
              Small mistakes in redirects, metadata, robots.txt, canonical
              tags, or hreflang markup can reduce search visibility or confuse
              crawlers. These tools make common checks faster before pages go
              live.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What are SEO tools used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                SEO tools help improve how search engines discover, understand,
                preview, and rank website pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for technical SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This category focuses on technical SEO tasks such as
                metadata, redirects, canonical URLs, hreflang tags, robots.txt,
                sitemap structure, and tracking URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can developers use these SEO tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. These tools are useful for developers building websites,
                landing pages, frontend apps, and SEO-focused pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools upload my data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools run directly in your browser. Inputs are
                not uploaded unless a specific tool clearly needs an external
                URL check.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED CATEGORIES */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Tool Categories
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Security Tools
            </Link>

            <Link
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
            </Link>

            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Utilities
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
