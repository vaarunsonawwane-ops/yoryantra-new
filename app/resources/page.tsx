import Link from "next/link";

const resourcePages = [
  {
    title: "Developers",
    description:
      "Developer utilities for debugging, APIs, JSON, JWTs, regex, timestamps, UUIDs, and daily workflows.",
    href: "/developers",
  },
  {
    title: "SEO Resources",
    description:
      "Technical SEO resources for metadata, indexing, hreflang, robots.txt, sitemaps, redirects, and tracking.",
    href: "/seo-resources",
  },
  {
    title: "Security Guides",
    description:
      "Security guides for JWTs, hashes, HMAC signatures, RSA keys, PEM files, CSP headers, and API keys.",
    href: "/security-guides",
  },
  {
    title: "JSON Guides",
    description:
      "JSON guides for formatting, validation, minifying, diff checking, schema validation, and conversion.",
    href: "/json-guides",
  },
  {
    title: "DevOps Resources",
    description:
      "DevOps resources for Docker, Kubernetes, YAML, .env files, cron expressions, and deployment workflows.",
    href: "/devops-resources",
  },
  {
    title: "Encoding Guides",
    description:
      "Encoding guides for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, slugs, and text conversion.",
    href: "/encoding-guides",
  },
];

const featuredCategories = [
  {
    title: "SEO Tools",
    description:
      "Metadata, indexing, redirects, hreflang, sitemaps, and technical SEO utilities.",
    href: "/categories/seo-tools",
  },
  {
    title: "Security Tools",
    description:
      "JWTs, hashes, tokens, API signing, CSP headers, and authentication workflows.",
    href: "/categories/security-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "JSON formatting, validation, conversion, schema checks, and structured data utilities.",
    href: "/categories/json-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "Docker, Kubernetes, YAML, cron expressions, and infrastructure workflows.",
    href: "/categories/devops-tools",
  },
];

export const metadata = {
  title: "Developer and SEO Resources | Yoryantra",

  description:
    "Explore Yoryantra resources for developers, technical SEO, security, JSON, DevOps, encoding, APIs, metadata, structured data, and browser-based utility workflows.",

  keywords: [
    "developer resources",
    "seo resources",
    "security guides",
    "json guides",
    "devops resources",
    "encoding guides",
    "developer tools",
    "technical seo tools",
    "online utilities",
    "api debugging tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/resources",
  },

  openGraph: {
    title: "Developer and SEO Resources | Yoryantra",

    description:
      "Explore Yoryantra resources for developers, SEO, security, JSON, DevOps, encoding, APIs, and browser-based utility workflows.",

    url: "https://yoryantra.com/resources",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Developer and SEO Resources | Yoryantra",

    description:
      "Browse developer, SEO, security, JSON, DevOps, and encoding resources on Yoryantra.",
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
            Resources
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Resources for Developers, SEO, Security, JSON, and DevOps Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Explore Yoryantra resources for practical developer utilities,
            technical SEO, security workflows, JSON handling, DevOps
            configuration, encoding tasks, APIs, structured data, and
            browser-based productivity tools.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built Around Practical Workflows
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              These resource pages organize related tools and explanations
              around real tasks such as debugging APIs, preparing metadata,
              validating data, checking security values, and reviewing configs.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Helps Search Engines Understand Yoryantra
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Resource hubs connect categories, tools, and guide pages together,
              creating clearer topical structure across SEO, development,
              security, JSON, DevOps, and encoding clusters.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Clean Discovery for Users
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Instead of browsing a long list of tools, users can start from a
              resource area that matches their task and move naturally into the
              right category or utility page.
            </p>
          </div>
        </div>

        {/* RESOURCE PAGES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Resource Hubs
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with a focused resource page for the workflow you are
              working on. Each page links to useful tools, categories, and
              related utility areas.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resourcePages.map((resource) => (
              <Link
                key={resource.href}
                href={resource.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {resource.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {resource.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Open resource →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Related Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              These category hubs group Yoryantra tools by task type, making it
              easier to discover utilities for technical SEO, security, data,
              infrastructure, and development.
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

        {/* USE CASES */}
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Common Workflows Covered
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Debugging APIs, tokens, timestamps, and encoded values.",
              "Preparing technical SEO metadata, redirects, and indexing files.",
              "Working with JWTs, hashes, signatures, keys, and CSP headers.",
              "Formatting, validating, comparing, and converting JSON data.",
              "Reviewing Docker, Kubernetes, YAML, .env, and cron configuration.",
              "Encoding URLs, HTML entities, Base64 values, JSON strings, and slugs.",
              "Finding related tools through category hubs and resource pages.",
              "Improving internal discovery across Yoryantra utility clusters.",
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
            Why Resource Hubs Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              A utility website becomes more useful when related tools are
              connected by real workflows. Resource hubs help users move from a
              broad task like API debugging or technical SEO into the exact tool
              they need.
            </p>

            <p>
              They also improve Yoryantra’s site structure by connecting guide
              pages, category hubs, and individual tools together. This creates
              clearer topical clusters for both users and search engines.
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
                What is the Resources page for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The Resources page organizes Yoryantra’s major guide and
                resource areas, including developer utilities, SEO resources,
                security guides, JSON guides, DevOps resources, and encoding
                guides.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                How is this different from the Tools page?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The Tools page lists individual utilities. The Resources page
                connects broader workflows and topic areas so users can discover
                related categories, guides, and tools more easily.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is this useful for SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Resource hubs strengthen internal linking and help organize
                topical clusters across Yoryantra, which can support crawl depth,
                discoverability, and long-term search visibility.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Should every tool category have a resource page?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Not every small category needs one, but major clusters such as
                SEO, security, JSON, DevOps, encoding, and developer workflows
                benefit from dedicated resource pages.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Explore More
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="yoryantra-btn-outline"
            >
              All Tools
            </Link>

            <Link
              href="/categories"
              className="yoryantra-btn-outline"
            >
              Categories
            </Link>

            <Link
              href="/developers"
              className="yoryantra-btn-outline"
            >
              Developers
            </Link>

            <Link
              href="/seo-resources"
              className="yoryantra-btn-outline"
            >
              SEO Resources
            </Link>

            <Link
              href="/security-guides"
              className="yoryantra-btn-outline"
            >
              Security Guides
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
