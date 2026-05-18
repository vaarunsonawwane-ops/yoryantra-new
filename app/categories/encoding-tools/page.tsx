import Link from "next/link";

const encodingTools = [
  {
    title: "Base64 Encoder Decoder",
    description:
      "Encode and decode Base64 strings for data, APIs, and debugging.",
    href: "/tools/base64-encoder-decoder",
  },
  {
    title: "Base64URL Encoder Decoder",
    description:
      "Encode and decode URL-safe Base64URL strings for JWTs and APIs.",
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
      "Escape and unescape JSON strings for API payloads and logs.",
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
      "Create clean URL slugs for blog posts, pages, and SEO workflows.",
    href: "/tools/slug-generator",
  },
  {
    title: "QR Code Generator",
    description:
      "Generate QR codes for links, text, campaigns, and quick sharing.",
    href: "/tools/qr-code-generator",
  },
];

const featuredTools = encodingTools.slice(0, 6);

export const metadata = {
  title: "Encoding Tools Online Free | Yoryantra",

  description:
    "Use free online encoding tools for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, text conversion, slugs, and QR code workflows.",

  keywords: [
    "encoding tools",
    "online encoding tools",
    "base64 encoder",
    "base64 decoder",
    "base64url encoder",
    "url encoder decoder",
    "html encoder decoder",
    "json escape unescape",
    "text converter",
    "slug generator",
  ],

  alternates: {
    canonical: "https://yoryantra.com/categories/encoding-tools",
  },

  openGraph: {
    title: "Encoding Tools Online Free | Yoryantra",

    description:
      "Free online encoding utilities for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, text conversion, slugs, and QR codes.",

    url: "https://yoryantra.com/categories/encoding-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Encoding Tools Online Free | Yoryantra",

    description:
      "Free online encoding tools for Base64, URLs, HTML entities, JSON escaping, slugs, text conversion, and QR workflows.",
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

  <Link
    href="/categories"
    className="hover:!text-[var(--light-gold)] transition-colors duration-200"
  >
    Categories
  </Link>

  <span className="mx-2">/</span>

  <span className="text-gray-900">
    Encoding Tools
  </span>

</div>
	  
        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Encoding Tools for URLs, Base64, HTML, and Structured Text
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical encoding utilities to convert Base64 strings, encode
            URLs, handle HTML entities, escape JSON text, generate slugs, and
            prepare text values for development and SEO workflows.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Web Development
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Encode and decode common web formats used in URLs, HTML,
              JavaScript, API payloads, JWTs, and frontend debugging workflows.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful for API and Data Handling
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Work with encoded strings, JSON-safe values, Base64 data, and
              URL-safe formats during API testing and backend development.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Fast Browser-Based Utilities
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Most encoding tools run directly inside your browser, making them
              quick to use while keeping inputs private and easy to copy.
            </p>
          </div>
        </div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular Encoding Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with common utilities for Base64, URLs, HTML entities,
              JSON-safe strings, and text transformation tasks.
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
              All Encoding Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse utilities for encoding, decoding, escaping, slug creation,
              QR code generation, and safe text transformation.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {encodingTools.map((tool) => (
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
            Where These Encoding Tools Help
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Encoding and decoding Base64 strings during development.",
              "Handling Base64URL values used in JWT and API workflows.",
              "Encoding URLs and query strings safely.",
              "Escaping HTML entities before displaying raw content.",
              "Preparing JSON-safe strings for logs, scripts, and payloads.",
              "Creating clean URL slugs for pages and posts.",
              "Converting text case for content and development workflows.",
              "Generating QR codes for encoded links and campaign URLs.",
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
            Why Encoding Tools Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Web development often requires text to be encoded, decoded,
              escaped, or transformed before it can safely move through URLs,
              APIs, HTML pages, logs, scripts, and authentication systems.
            </p>

            <p>
              Encoding mistakes can break query strings, damage payloads, create
              rendering issues, or make debugging harder. Browser-based tools
              make these transformations faster during everyday work.
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
                What are encoding tools used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Encoding tools help convert text, URLs, HTML entities, Base64
                strings, and JSON-safe values into formats that work correctly
                across web systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Encoding and decoding are common while working with API
                payloads, JWT values, query strings, logs, and structured data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between Base64 and Base64URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL is a URL-safe version of Base64 commonly used in JWTs
                and web authentication workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools upload my data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser,
                so your encoded strings and text values are not uploaded unless
                a specific tool clearly needs an external URL check.
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
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Security Tools
            </Link>

            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
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
