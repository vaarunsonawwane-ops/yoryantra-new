import Link from "next/link";

const featuredCategories = [
  {
    title: "Encoding Tools",
    description:
      "Base64, Base64URL, URLs, HTML entities, JSON strings, slugs, and text workflows.",
    href: "/categories/encoding-tools",
  },
  {
    title: "Developer Tools",
    description:
      "Developer tools for debugging, formatting, timestamps, UUIDs, regex, and daily work.",
    href: "/categories/developer-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "JSON formatting, validation, escaping, schemas, and data conversion.",
    href: "/categories/json-tools",
  },
  {
    title: "SEO Tools",
    description:
      "SEO tools for slugs, metadata, URLs, campaigns, redirects, and page checks.",
    href: "/categories/seo-tools",
  },
];

const popularEncodingTools = [
  {
    title: "Base64 Encoder Decoder",
    description:
      "Encode or decode Base64 text and binary data represented as text.",
    href: "/tools/base64-encoder-decoder",
  },
  {
    title: "Base64URL Encoder Decoder",
    description:
      "Encode or decode URL-safe Base64 values used in JWTs and APIs.",
    href: "/tools/base64url-encoder-decoder",
  },
  {
    title: "URL Encoder Decoder",
    description:
      "Encode or decode URL components, query values, and reserved characters.",
    href: "/tools/url-encoder-decoder",
  },
  {
    title: "HTML Encoder Decoder",
    description:
      "Encode or decode HTML entities for text displayed in HTML.",
    href: "/tools/html-encoder-decoder",
  },
  {
    title: "JSON Escape Unescape",
    description:
      "Escape or unescape JSON strings for logs, code, and nested payloads.",
    href: "/tools/json-escape-unescape",
  },
  {
    title: "Text Case Converter",
    description:
      "Convert text between common letter-case formats.",
    href: "/tools/text-case-converter",
  },
  {
    title: "Slug Generator",
    description:
      "Create readable URL slugs for pages, posts, and content systems.",
    href: "/tools/slug-generator",
  },
  {
    title: "QR Code Generator",
    description:
      "Generate QR codes for URLs or text, then test the final scan result.",
    href: "/tools/qr-code-generator",
  },
];

export const metadata = {
  title: "Encoding Workflows for URLs, Base64, HTML, and Web Text | Yoryantra",

  description:
    "Follow practical encoding workflows for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, slugs, text conversion, and QR codes.",

  keywords: [
    "encoding workflows",
    "encoding tool selection",
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
    title: "Encoding Workflows for URLs, Base64, HTML, and Web Text | Yoryantra",

    description:
      "Practical encoding workflows and tools for Base64, Base64URL, URLs, HTML entities, JSON escaping, slugs, text conversion, and QR codes.",

    url: "https://yoryantra.com/encoding-guides",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Encoding Workflows for URLs, Base64, HTML, and Web Text | Yoryantra",

    description:
      "Choose the right encoding tool for Base64, URLs, HTML entities, JSON strings, slugs, text conversion, and web-safe values.",
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
            Encoding Workflows for URLs, Base64, HTML, and Web Text
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Encode and decode URLs, Base64 values, HTML entities, JSON strings,
            slugs, and other text formats used across web systems.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Encode URLs and Web Text
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Handle URL components, query values, and text that must be represented
              safely in a web address.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Work With Base64 and Base64URL
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Encode or decode standard and URL-safe Base64 values used in files, APIs,
              tokens, and debugging.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Prepare JSON, HTML, and Slugs
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Escape text for JSON or HTML, convert letter case, and create readable slugs
              for content and code.
            </p>
          </div>
        </div>


        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Related Categories for Encoding Work
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Use these categories when the task extends beyond one encoding
              step into structured data, SEO, debugging, or general
              development work.
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
              Common Encoding Tools and When to Use Them
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with these tools for Base64, URL-safe Base64, URLs,
              HTML entities, JSON strings, text conversion, slugs, and QR codes.
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
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Practical Encoding Workflows
          </h2>

          <div className="mt-7 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {[
              "Encode or decode Base64 only when a system expects that representation.",
              "Use Base64URL for JWT segments and URL-safe API values.",
              "Encode individual URL components instead of encoding an entire URL blindly.",
              "Encode HTML characters when showing text inside HTML content.",
              "Escape JSON strings before placing them inside JSON text.",
              "Create readable slugs and review collisions, language, and canonical URLs.",
              "Convert text case for labels, identifiers, content, and code preparation.",
              "Generate QR codes, then test the final destination and scan size.",
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-4">
                <span className="min-w-7 pt-0.5 text-xs font-semibold tracking-wider text-[var(--light-gold)]">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="text-sm leading-6 text-gray-700">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* WHY MATTERS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            How to Interpret Encoding Tool Results
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Web systems move text through URLs, HTML, JavaScript, JSON,
              APIs, logs, tokens, and databases. Each context has different
              escaping and encoding rules, so the same transformation should
              not be reused everywhere.
            </p>

            <p>
              A successful conversion only confirms the transformation.
              Review character encoding, padding, reserved characters, Unicode,
              output context, and how the receiving system decodes the value.
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
                How should I choose between similar encoding tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Start with the destination context: URL, HTML, JSON,
                Base64, Base64URL, slug, or QR code. Similar tools are separated
                because each format has different rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is Base64 a form of encryption?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Base64 is a reversible text representation. Anyone with
                the encoded value can decode it, so it should not be used to
                protect secrets.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between Base64 and Base64URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL replaces characters that can cause problems in
                URLs and may omit padding. It is commonly used in JWTs and
                URL-safe API values.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does encoding make untrusted text safe everywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Safety depends on where the value is used. HTML, URLs,
                JSON, JavaScript, CSS, and command lines require different
                escaping and validation rules.
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
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
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
