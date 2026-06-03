import Link from "next/link";

const featuredCategories = [
  {
    title: "Encoding Tools",
    description:
      "Base64, Base64URL, URL encoding, HTML entities, JSON escaping, slugs, and text conversion.",
    href: "/categories/encoding-tools",
  },
  {
    title: "Developer Utilities",
    description:
      "Debugging, formatting, timestamps, UUIDs, regex testing, and daily development tools.",
    href: "/categories/developer-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "JSON formatting, validation, escaping, schema checks, and structured data conversion.",
    href: "/categories/json-tools",
  },
  {
    title: "SEO Tools",
    description:
      "Slugs, metadata, URL checks, campaign links, redirects, and technical SEO workflows.",
    href: "/categories/seo-tools",
  },
];

const popularEncodingTools = [
  {
    title: "Base64 Encoder Decoder",
    description:
      "Encode and decode Base64 strings for data, APIs, and debugging.",
    href: "/tools/base64-encoder-decoder",
  },
  {
    title: "Base64URL Encoder Decoder",
    description:
      "Encode and decode URL-safe Base64URL strings used in JWTs and APIs.",
    href: "/tools/base64url-encoder-decoder",
  },
  {
    title: "URL Encoder Decoder",
    description:
      "Encode and decode URLs, query strings, and special characters.",
    href: "/tools/url-encoder-decoder",
  },
  {
    title: "HTML Encoder Decoder",
    description:
      "Encode and decode HTML entities for safe webpage rendering.",
    href: "/tools/html-encoder-decoder",
  },
  {
    title: "JSON Escape Unescape",
    description:
      "Escape and unescape JSON strings for logs, scripts, and API payloads.",
    href: "/tools/json-escape-unescape",
  },
  {
    title: "Text Case Converter",
    description:
      "Convert text between uppercase, lowercase, title case, and more.",
    href: "/tools/text-case-converter",
  },
  {
    title: "Slug Generator",
    description:
      "Create clean URL slugs for pages, posts, and SEO workflows.",
    href: "/tools/slug-generator",
  },
  {
    title: "QR Code Generator",
    description:
      "Generate QR codes for links, text, campaign URLs, and quick sharing.",
    href: "/tools/qr-code-generator",
  },
];

export const metadata = {
  title: "Encoding Guides for URLs, Base64, HTML, and Web Text | Yoryantra",

  description:
    "Explore practical encoding guides and free online tools for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, slugs, text conversion, and QR code workflows.",

  keywords: [
    "encoding guides",
    "encoding tools",
    "base64 encoder",
    "base64 decoder",
    "base64url encoder",
    "url encoder decoder",
    "html encoder decoder",
    "json escape unescape",
    "slug generator",
    "text case converter",
    "qr code generator",
    "developer encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/encoding-guides",
  },

  openGraph: {
    title: "Encoding Guides for URLs, Base64, HTML, and Web Text | Yoryantra",

    description:
      "Practical encoding guides and free tools for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, slugs, text conversion, and QR workflows.",

    url: "https://yoryantra.com/encoding-guides",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Encoding Guides for URLs, Base64, HTML, and Web Text | Yoryantra",

    description:
      "Explore free encoding tools and guides for Base64, URLs, HTML entities, JSON escaping, slugs, text conversion, and web-safe values.",
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
            Encoding Guides
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Encoding Guides for URLs, Base64, HTML, and Web Text
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Explore practical encoding resources and browser-based utilities for
            Base64, Base64URL, URL encoding, HTML entities, JSON-safe strings,
            slugs, text conversion, and web-safe values used in development,
            APIs, content workflows, and SEO tasks.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Web Development
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Encode and decode common web formats used in URLs, HTML pages,
              JavaScript strings, API payloads, JWTs, query strings, and
              frontend debugging workflows.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful for APIs and Structured Text
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Work with encoded values, JSON-safe strings, Base64 data,
              URL-safe formats, and escaped content while testing APIs,
              debugging logs, and preparing text for web systems.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Practical Browser-Based Utilities
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Yoryantra encoding tools are lightweight and browser-based, making
              quick transformations easy while keeping input values private.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Encoding-Related Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with categories that support web-safe text, API debugging,
              structured data handling, SEO slugs, and developer workflows.
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
              Popular Encoding Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Frequently used tools for Base64, Base64URL, URL encoding, HTML
              entities, JSON escaping, text conversion, slugs, and QR code
              workflows.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {popularEncodingTools.map((tool) => (
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
            Common Encoding Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Encoding and decoding Base64 strings during development.",
              "Handling Base64URL values used in JWT and API workflows.",
              "Encoding URLs and query strings safely before sharing or testing.",
              "Escaping HTML entities before displaying raw code or content.",
              "Preparing JSON-safe strings for scripts, logs, and payloads.",
              "Creating clean URL slugs for pages, posts, and SEO workflows.",
              "Converting text case for content, labels, and developer tasks.",
              "Generating QR codes for links, campaigns, and quick mobile access.",
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
            Why Encoding Guides Matter for Web Workflows
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Web systems often move text through URLs, HTML pages, scripts,
              JSON payloads, APIs, logs, authentication tokens, and databases.
              Encoding helps keep those values readable, safe, and compatible
              with the systems that handle them.
            </p>

            <p>
              Small encoding mistakes can break query strings, damage payloads,
              create rendering issues, or make debugging harder. Practical
              encoding guides and browser-based tools make these transformations
              easier during everyday development and content work.
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
                What are encoding guides used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Encoding guides help developers understand how to safely convert
                text, URLs, HTML entities, Base64 values, JSON strings, slugs,
                and web-safe data formats.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are encoding tools useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Encoding and decoding are common while working with API
                payloads, JWT values, query strings, logs, scripts, and
                structured data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between Base64 and Base64URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL is a URL-safe version of Base64 commonly used in JWTs,
                web authentication, and systems where regular Base64 characters
                may not be safe inside URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools upload my encoded data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser,
                so your encoded strings and text values are not uploaded unless
                a specific tool clearly requires an external URL check.
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
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
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
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
