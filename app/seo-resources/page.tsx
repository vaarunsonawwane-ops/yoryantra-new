import Link from "next/link";

const featuredCategories = [
  {
    title: "SEO Tools",
    description:
      "Metadata, hreflang, robots.txt, sitemaps, redirects, and technical SEO utilities.",
    href: "/categories/seo-tools",
  },
  {
    title: "Developer Utilities",
    description:
      "Useful debugging and formatting tools for developers working on SEO pages.",
    href: "/categories/developer-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Structured data, JSON formatting, validation, and conversion utilities.",
    href: "/categories/json-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "URL encoding, HTML entities, Base64, slugs, and web-safe text workflows.",
    href: "/categories/encoding-tools",
  },
];

const popularSeoTools = [
  {
    title: "Meta Tag Generator",
    description:
      "Create SEO titles, descriptions, and page metadata for webpages.",
    href: "/tools/meta-tag-generator",
  },
  {
    title: "Open Graph Generator",
    description:
      "Generate Open Graph tags for cleaner social sharing previews.",
    href: "/tools/open-graph-generator",
  },
  {
    title: "Hreflang Tag Generator",
    description:
      "Create hreflang tags for multilingual and international SEO pages.",
    href: "/tools/hreflang-tag-generator",
  },
  {
    title: "robots.txt Generator",
    description:
      "Build robots.txt rules to guide search engine crawlers.",
    href: "/tools/robots-txt-generator",
  },
  {
    title: "Sitemap Generator",
    description:
      "Generate sitemap structure for search engine discovery.",
    href: "/tools/sitemap-generator",
  },
  {
    title: "Canonical URL Checker",
    description:
      "Check canonical URLs and reduce duplicate page confusion.",
    href: "/tools/canonical-url-checker",
  },
  {
    title: "Redirect Checker",
    description:
      "Inspect redirect chains, status codes, and final destination URLs.",
    href: "/tools/redirect-checker",
  },
  {
    title: "UTM Builder",
    description:
      "Build campaign tracking URLs for analytics and marketing reports.",
    href: "/tools/utm-builder",
  },
];

export const metadata = {
  title: "SEO Resources for Technical SEO Workflows | Yoryantra",

  description:
    "Explore practical SEO resources and free online tools for metadata, indexing, robots.txt, sitemaps, hreflang, redirects, canonical URLs, Open Graph, and campaign tracking.",

  keywords: [
    "seo resources",
    "technical seo resources",
    "seo tools",
    "technical seo tools",
    "meta tag generator",
    "hreflang generator",
    "robots.txt generator",
    "sitemap generator",
    "canonical url checker",
    "redirect checker",
    "open graph generator",
    "utm builder",
  ],

  alternates: {
    canonical: "https://yoryantra.com/seo-resources",
  },

  openGraph: {
    title: "SEO Resources for Technical SEO Workflows | Yoryantra",

    description:
      "Practical SEO resources and free tools for metadata, indexing, redirects, hreflang, robots.txt, sitemaps, canonical URLs, and campaign tracking.",

    url: "https://yoryantra.com/seo-resources",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "SEO Resources for Technical SEO Workflows | Yoryantra",

    description:
      "Explore free SEO tools and resources for technical SEO, metadata, indexing, redirects, hreflang, and campaign tracking.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* BREADCRUMB */}
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link
            href="/"
            className="hover:!text-[var(--light-gold)] transition-colors duration-200"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-900">
            SEO Resources
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            SEO Resources for Metadata, Indexing, and Technical Site Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Explore practical SEO resources and browser-based utilities for
            metadata, Open Graph previews, hreflang tags, robots.txt rules,
            sitemaps, redirects, canonical URLs, campaign tracking, and
            technical search visibility checks.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Technical SEO Tasks
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Use focused utilities for page metadata, crawl instructions,
              canonical checks, redirect inspection, international SEO, and
              search engine discovery workflows.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful for Marketers and Developers
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              SEO work often sits between content, code, analytics, and
              deployment. These resources help both SEO teams and developers
              review important page-level signals.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Practical Browser-Based Checks
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Yoryantra keeps technical SEO utilities simple, fast, and focused
              so common checks can happen before pages are published or updated.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              SEO-Related Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with categories that support search optimization, structured
              content, URL handling, and developer-side SEO checks.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {category.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Explore category →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* POPULAR TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular SEO Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Frequently used tools for metadata, search previews, indexing,
              international SEO, redirects, canonical signals, and tracking
              links.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {popularSeoTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Open tool →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* WORKFLOWS */}
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Common Technical SEO Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Creating meta titles and descriptions before publishing a page.",
              "Generating Open Graph tags for cleaner social previews.",
              "Preparing hreflang tags for multilingual and regional pages.",
              "Checking redirects and final destination URLs.",
              "Creating robots.txt rules for crawler guidance.",
              "Reviewing canonical URLs to reduce duplicate page confusion.",
              "Generating sitemap structure for search discovery.",
              "Building UTM links for analytics and campaign tracking.",
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
            Why Technical SEO Resources Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Search visibility depends on more than page content. Search
              engines also rely on metadata, crawl rules, canonical signals,
              redirects, language targeting, sitemap discovery, and clean URL
              structures to understand a website properly.
            </p>

            <p>
              Technical SEO resources help catch simple issues before they
              become ranking, indexing, or reporting problems. A quick check of
              metadata, redirects, robots.txt, or hreflang tags can prevent
              confusion for crawlers and improve the experience for users.
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
                What are SEO resources used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                SEO resources help website owners, developers, and marketers
                improve page metadata, indexing signals, crawlability, search
                previews, redirects, and technical site structure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these resources useful for technical SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This page focuses on technical SEO workflows such as meta
                tags, Open Graph tags, hreflang, robots.txt, sitemaps,
                canonical URLs, redirects, and tracking links.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can developers use these SEO tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Developers often need SEO utilities while building landing
                pages, content sites, apps, templates, metadata systems, and
                marketing pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these SEO tools replace a full SEO audit?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. These tools help with focused checks and implementation
                tasks. A complete SEO audit may also include content quality,
                backlinks, performance, accessibility, crawl analysis, and
                search data review.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Pages
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>

            <Link
              href="/developers"
              className="yoryantra-btn-outline"
            >
              Developers
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Utilities
            </Link>

            <Link
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
            </Link>

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
