import Link from "next/link";

const workflowGroups = [
  {
    title: "Prepare page metadata before publishing",
    description:
      "Use separate tools for writing metadata, checking length, previewing search results, and reviewing the final HTML.",
    steps: [
      {
        title: "Create the basic tags",
        detail:
          "Start with Meta Tag Generator when you need title, description, robots, canonical, and social metadata in one place.",
        href: "/tools/meta-tag-generator",
        linkLabel: "Open Meta Tag Generator",
      },
      {
        title: "Check description length",
        detail:
          "Use Meta Description Length Checker to review character count, estimated width, truncation risk, and wording before publishing.",
        href: "/tools/meta-description-length-checker",
        linkLabel: "Open Meta Description Length Checker",
      },
      {
        title: "Preview the search result",
        detail:
          "Use SERP Snippet Preview Tool to see how the title, description, and URL may appear together in a search result.",
        href: "/tools/serp-snippet-preview-tool",
        linkLabel: "Open SERP Snippet Preview Tool",
      },
      {
        title: "Inspect the final HTML",
        detail:
          "Use Meta Tags Checker after implementation to confirm that the expected tags are actually present in the page source.",
        href: "/tools/meta-tags-checker",
        linkLabel: "Open Meta Tags Checker",
      },
    ],
  },
  {
    title: "Control crawling and discovery",
    description:
      "Robots rules, sitemaps, and crawl-cleaning tasks solve different problems. Use them together rather than treating one file as a complete indexing solution.",
    steps: [
      {
        title: "Prepare crawler instructions",
        detail:
          "Use Robots.txt Generator to create allow, disallow, sitemap, and user-agent rules for the parts of a site that should or should not be crawled.",
        href: "/tools/robots-txt-generator",
        linkLabel: "Open Robots.txt Generator",
      },
      {
        title: "Generate a sitemap structure",
        detail:
          "Use Sitemap Generator when you need a clean XML sitemap format for a known list of canonical URLs.",
        href: "/tools/sitemap-generator",
        linkLabel: "Open Sitemap Generator",
      },
      {
        title: "Validate the sitemap",
        detail:
          "Use Sitemap Validator to check XML structure, URL formatting, duplicates, and other common sitemap problems.",
        href: "/tools/sitemap-validator",
        linkLabel: "Open Sitemap Validator",
      },
      {
        title: "Clean crawl-waste URLs",
        detail:
          "Use Crawl Budget URL Cleaner to normalize URLs, remove unwanted parameters, deduplicate entries, and review crawl-waste patterns.",
        href: "/tools/crawl-budget-url-cleaner",
        linkLabel: "Open Crawl Budget URL Cleaner",
      },
    ],
  },
  {
    title: "Review duplicate and moved URLs",
    description:
      "Canonical tags and redirects are related, but they are not interchangeable. One is a page-level signal; the other changes where a request goes.",
    steps: [
      {
        title: "Create the canonical tag",
        detail:
          "Use Canonical Tag Generator when you already know the preferred URL and need the correct HTML tag.",
        href: "/tools/canonical-tag-generator",
        linkLabel: "Open Canonical Tag Generator",
      },
      {
        title: "Review canonical consistency",
        detail:
          "Use Canonical URL Checker to compare the page URL, canonical target, formatting, and common mismatch risks.",
        href: "/tools/canonical-url-checker",
        linkLabel: "Open Canonical URL Checker",
      },
      {
        title: "Inspect redirect behaviour",
        detail:
          "Use Redirect Checker to review status codes, redirect chains, loops, and the final destination URL.",
        href: "/tools/redirect-checker",
        linkLabel: "Open Redirect Checker",
      },
      {
        title: "Check the final response",
        detail:
          "Use HTTP Headers Checker when you need to review the response headers that accompany the final URL.",
        href: "/tools/http-headers-checker",
        linkLabel: "Open HTTP Headers Checker",
      },
    ],
  },
];

const pageQualityChecks = [
  {
    title: "Heading Structure Checker",
    description:
      "Review H1–H6 order, missing levels, repeated headings, and page-outline clarity.",
    href: "/tools/heading-structure-checker",
  },
  {
    title: "Image Alt Text Checker",
    description:
      "Inspect image alt attributes and identify missing, empty, repeated, or unhelpful text.",
    href: "/tools/image-alt-text-checker",
  },
  {
    title: "SEO Slug Analyzer",
    description:
      "Review URL slugs for readability, length, separators, repeated terms, and avoidable complexity.",
    href: "/tools/seo-slug-analyzer",
  },
  {
    title: "Open Graph Preview Checker",
    description:
      "Inspect Open Graph and Twitter card tags from HTML and review the resulting social preview.",
    href: "/tools/open-graph-preview-checker",
  },
  {
    title: "Open Graph Generator",
    description:
      "Create Open Graph tags when a page needs a social title, description, image, URL, and content type.",
    href: "/tools/open-graph-generator",
  },
  {
    title: "UTM Builder",
    description:
      "Create consistent campaign parameters for analytics without mixing them into canonical URL strategy.",
    href: "/tools/utm-builder",
  },
];

const internationalSeoTools = [
  {
    title: "Hreflang Tag Generator",
    description:
      "Create hreflang tags for language and regional page variants when the URL relationships are already known.",
    href: "/tools/hreflang-tag-generator",
  },
  {
    title: "Hreflang Validator",
    description:
      "Review hreflang syntax, language-region codes, self-references, return links, and common implementation issues.",
    href: "/tools/hreflang-validator",
  },
  {
    title: "Punycode Converter",
    description:
      "Convert internationalized domain names between Unicode and ASCII-compatible Punycode forms.",
    href: "/tools/punycode-converter",
  },
];

export const metadata = {
  title: "Technical SEO Workflows and Tool Selection | Yoryantra",
  description:
    "Follow practical SEO workflows for metadata, search previews, robots.txt, sitemaps, canonicals, redirects, hreflang, URLs, headings, images, and campaign tracking.",
  keywords: [
    "technical SEO workflows",
    "SEO tool guide",
    "metadata workflow",
    "robots.txt and sitemap guide",
    "canonical and redirect workflow",
    "hreflang workflow",
    "SEO publishing checklist",
    "technical SEO checklist",
  ],
  alternates: {
    canonical: "https://yoryantra.com/seo-resources",
  },
  openGraph: {
    title: "Technical SEO Workflows and Tool Selection | Yoryantra",
    description:
      "Practical workflows for choosing and using Yoryantra SEO tools for metadata, crawling, canonicals, redirects, hreflang, URLs, and page checks.",
    url: "https://yoryantra.com/seo-resources",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical SEO Workflows and Tool Selection | Yoryantra",
    description:
      "Choose the right Yoryantra SEO tool for metadata, crawling, indexing, redirects, canonicals, hreflang, URLs, and page checks.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link
            href="/"
            className="transition-colors duration-200 hover:!text-[var(--light-gold)]"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-900">SEO Resources</span>
        </div>

        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--light-gold)]">
            Practical technical SEO workflows
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Choose the Right SEO Tool for Each Publishing Task
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            This guide explains which tool to use while preparing metadata,
            controlling crawling, validating sitemaps, reviewing canonicals,
            checking redirects, working with hreflang, and improving page-level
            SEO details.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/categories/seo-tools" className="yoryantra-btn-outline">
              Browse all SEO Tools
            </Link>

            <Link href="/contact" className="yoryantra-btn-outline">
              Report a tool issue
            </Link>
          </div>
        </div>

        <section className="mt-14 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Before Treating an SEO Check as Final
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "A preview is an estimate. Search engines and social platforms may rewrite or crop what they display.",
              "A valid robots.txt file does not guarantee indexing, and a blocked URL may still appear in search without content.",
              "A sitemap helps discovery but does not force crawling, indexing, or ranking.",
              "A canonical tag is a signal, not an instruction that always overrides every other signal.",
              "Redirects should be tested on the live response, not only in configuration text.",
              "Tool output should be compared with the real page source, server response, and Search Console data.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Three Common Technical SEO Workflows
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Similar SEO tools are separated because generating, previewing,
              checking, validating, and inspecting a live response are different
              tasks.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {workflowGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
              >
                <div className="max-w-3xl">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {group.title}
                  </h3>

                  <p className="mt-3 leading-relaxed text-gray-600">
                    {group.description}
                  </p>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {group.steps.map((step, index) => (
                    <div
                      key={step.href}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--light-gold)]">
                        Step {index + 1}
                      </p>

                      <h4 className="mt-2 text-lg font-semibold text-gray-900">
                        {step.title}
                      </h4>

                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {step.detail}
                      </p>

                      <Link
                        href={step.href}
                        className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)] transition-opacity hover:opacity-75"
                      >
                        {step.linkLabel} →
                      </Link>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Page-Level SEO Checks Before Publishing
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              These checks focus on the page itself: structure, images, URLs,
              social metadata, and campaign tracking.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pageQualityChecks.map((tool) => (
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

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              International and Multilingual SEO
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Hreflang works only when the language, region, URLs, canonicals,
              and return links agree. Generate the tags, then validate the full
              relationship instead of checking one line in isolation.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {internationalSeoTools.map((tool) => (
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

        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            A Practical Publishing Checklist
          </h2>

          <ol className="mt-6 space-y-4 text-gray-700">
            {[
              "Confirm that the page has one clear purpose and a useful outcome for the visitor.",
              "Review the title, meta description, canonical URL, robots directives, and social metadata.",
              "Check headings, image alt text, URL slug, and internal links.",
              "Test redirects and important response headers on the live URL.",
              "Confirm that sitemaps and hreflang references use canonical, accessible URLs.",
              "Publish, inspect the real page source, and then monitor Search Console instead of assuming the tool output guarantees indexing.",
            ].map((item, index) => (
              <li
                key={item}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-xs font-semibold text-[var(--brand-green)]">
                  {index + 1}
                </span>

                <span className="pt-1 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-7">
            <div>
              <h3 className="font-semibold text-gray-900">
                Does a technically valid page automatically rank?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                No. Technical SEO helps search engines access and understand a
                page, but rankings also depend on relevance, usefulness,
                competition, links, trust, and the overall search result.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does submitting a sitemap guarantee indexing?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                No. A sitemap helps discovery and provides URL information.
                Search engines still decide when to crawl and whether a page
                should be indexed.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should canonical tags and redirects point to the same URL?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                When an old URL permanently redirects to a preferred URL, the
                destination page should normally use a self-referencing
                canonical. Mixed signals should be reviewed carefully.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can Google rewrite a title or meta description?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                Yes. Search engines may display different text when they believe
                another title or passage better matches the query or page.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Continue With the Full SEO Tool Collection
          </h2>

          <p className="mt-3 max-w-3xl leading-relaxed text-gray-600">
            Use the SEO Tools category when you already know the task and want
            to browse the complete collection. This guide remains focused on
            workflow, tool selection, limitations, and publishing decisions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/categories/seo-tools" className="yoryantra-btn-outline">
              View all SEO Tools
            </Link>

            <Link href="/developers" className="yoryantra-btn-outline">
              For Developers
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
