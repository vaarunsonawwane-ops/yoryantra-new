import Link from "next/link";

const featuredCategories = [
  {
    title: "SEO Tools",
    description:
      "Metadata, hreflang, robots.txt, sitemap, redirect, and canonical workflows.",
    href: "/categories/seo-tools",
  },
  {
    title: "Developer Tools",
    description:
      "Developer tools for inspecting responses, URLs, markup, and page behaviour.",
    href: "/categories/developer-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Structured data and JSON tools for markup, feeds, APIs, and data checks.",
    href: "/categories/json-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "URL encoding, HTML escaping, slugs, and web-safe text workflows.",
    href: "/categories/encoding-tools",
  },
];

const popularSeoTools = [
  {
    title: "Meta Tag Generator",
    description:
      "Create title, description, robots, canonical, and social metadata.",
    href: "/tools/meta-tag-generator",
  },
  {
    title: "Open Graph Generator",
    description:
      "Create Open Graph tags for social titles, descriptions, images, and URLs.",
    href: "/tools/open-graph-generator",
  },
  {
    title: "Hreflang Tag Generator",
    description:
      "Create hreflang tags for language and regional page variants.",
    href: "/tools/hreflang-tag-generator",
  },
  {
    title: "robots.txt Generator",
    description:
      "Create user-agent, allow, disallow, and sitemap rules for crawlers.",
    href: "/tools/robots-txt-generator",
  },
  {
    title: "Sitemap Generator",
    description:
      "Generate XML sitemap structure from canonical URL lists.",
    href: "/tools/sitemap-generator",
  },
  {
    title: "Canonical URL Checker",
    description:
      "Review canonical URL formatting and common consistency problems.",
    href: "/tools/canonical-url-checker",
  },
  {
    title: "Redirect Checker",
    description:
      "Inspect redirect status codes, chains, loops, and final destinations.",
    href: "/tools/redirect-checker",
  },
  {
    title: "UTM Builder",
    description:
      "Create consistent UTM campaign URLs for analytics and reporting.",
    href: "/tools/utm-builder",
  },
];

export const metadata = {
  title: "Technical SEO Workflows and Tool Selection | Yoryantra",

  description:
    "Follow practical technical SEO workflows for metadata, robots.txt, sitemaps, hreflang, redirects, canonical URLs, Open Graph, and campaign tracking.",

  keywords: [
    "technical SEO workflows",
    "SEO tool selection",
    "technical SEO tools",
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
    title: "Technical SEO Workflows and Tool Selection | Yoryantra",

    description:
      "Practical technical SEO workflows and tools for metadata, redirects, hreflang, robots.txt, sitemaps, canonical URLs, and campaign tracking.",

    url: "https://yoryantra.com/seo-resources",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Technical SEO Workflows and Tool Selection | Yoryantra",

    description:
      "Choose the right technical SEO tool for metadata, crawling, redirects, canonicals, hreflang, and campaign tracking.",
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
            Technical SEO Workflows for Metadata, Crawling, and URLs
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical browser-based tools for metadata, Open Graph
            previews, hreflang, robots.txt, sitemaps, redirects, canonical
            URLs, campaign tracking, and page-level technical checks.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Choose the Right Tool for the SEO Task
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Use separate tools for generating metadata, checking crawl
              instructions, reviewing canonicals, testing redirects, and
              validating international SEO signals.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Connect Content, Code, and Search Signals
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Technical SEO often connects content, code, analytics, and
              deployment. These tools help review the signals that must remain
              consistent across those workflows.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Understand What a Browser Check Can Confirm
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Browser-based tools help review markup, URLs, files, and
              generated output before publishing, but they do not guarantee
              crawling, indexing, ranking, or a specific search preview.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Related Categories for Technical SEO Work
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Use these categories when the task extends beyond one SEO check
              into structured data, URL handling, encoding, or development work.
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
              Common SEO Tools and When to Use Them
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with these tools for metadata, social previews,
              international targeting, crawler instructions, redirects,
              canonicals, and campaign links.
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
            Practical Technical SEO Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Create and review page titles and descriptions before publishing.",
              "Generate Open Graph tags, then inspect the final HTML and preview.",
              "Prepare hreflang tags and verify language, region, and return links.",
              "Check redirect status codes, chains, loops, and final destinations.",
              "Create robots.txt rules only after deciding which paths should be crawlable.",
              "Review canonical URLs together with redirects, internal links, and sitemaps.",
              "Generate sitemap entries from canonical, accessible URLs.",
              "Build UTM links for analytics without mixing them into canonical strategy.",
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
            How to Interpret Technical SEO Checks
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Technical SEO signals work together. Metadata, crawl rules,
              canonicals, redirects, hreflang, sitemaps, internal links, and
              live response behaviour should point search engines toward the
              same preferred version of a page.
            </p>

            <p>
              These tools help catch implementation problems before
              publishing or during debugging. Always confirm the result in the
              live page source, server response, and Search Console data rather
              than assuming a generated file or tag guarantees indexing.
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
                How should I choose between similar SEO tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Start with the exact task: generate, preview, validate,
                inspect, or test. Similar SEO tools are separated because those
                operations answer different implementation questions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does a technically valid page automatically rank?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Technical SEO helps search engines access and understand
                a page, but rankings also depend on relevance, usefulness,
                competition, links, trust, and the overall search result.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does submitting a sitemap guarantee indexing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. A sitemap helps discovery and provides URL information.
                Search engines still decide when to crawl and whether a page
                should be indexed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can search engines rewrite titles and descriptions?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Search engines may display different text when another
                title or passage better matches the query, page, or available
                search-result space.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Continue Exploring Yoryantra
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
              For Developers
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Tools
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
