import Link from "next/link";

const developerTools = [
  {
    title: "Regex Tester",
    description:
      "Test and debug regular expressions with live matching output.",
    href: "/tools/regex-tester",
  },
  {
    title: "JWT Decoder",
    description:
      "Decode JWT tokens and inspect payload data instantly.",
    href: "/tools/jwt-decoder",
  },
  {
    title: "Base64 Encoder Decoder",
    description:
      "Encode and decode Base64 strings directly in your browser.",
    href: "/tools/base64-encoder-decoder",
  },
  {
    title: "URL Encoder Decoder",
    description:
      "Encode and decode URLs for query strings and web requests.",
    href: "/tools/url-encoder-decoder",
  },
  {
    title: "HTML Encoder Decoder",
    description:
      "Convert HTML entities into encoded or decoded text.",
    href: "/tools/html-encoder-decoder",
  },
  {
    title: "JSON Formatter",
    description:
      "Format and beautify JSON for debugging and development.",
    href: "/tools/json-formatter",
  },
  {
    title: "JSON Validator",
    description:
      "Validate JSON structure and detect formatting errors.",
    href: "/tools/json-validator",
  },
  {
    title: "Timestamp Converter",
    description:
      "Convert Unix timestamps into readable date and time values.",
    href: "/tools/timestamp-converter",
  },
  {
    title: "UUID Generator",
    description:
      "Generate UUIDs for APIs, databases, and application workflows.",
    href: "/tools/uuid-generator",
  },
  {
    title: "Cron Expression Parser",
    description:
      "Read and understand cron schedules and timing expressions.",
    href: "/tools/cron-expression-parser",
  },
];

const featuredTools =
  developerTools.slice(0, 6);

export const metadata = {
  title:
    "Developer Tools Online Free | Yoryantra",

  description:
    "Use free online developer tools for regex testing, JWT decoding, JSON formatting, Base64 encoding, timestamps, UUID generation, and debugging workflows.",

  keywords: [
    "developer tools",
    "online developer tools",
    "regex tester",
    "jwt decoder",
    "json formatter",
    "base64 encoder",
    "uuid generator",
    "timestamp converter",
    "debugging tools",
    "developer utilities",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/categories/developer-tools",
  },

  openGraph: {
    title:
      "Developer Tools Online Free | Yoryantra",

    description:
      "Free online developer utilities for debugging, encoding, JSON formatting, JWT inspection, timestamps, and regex testing.",

    url:
      "https://yoryantra.com/categories/developer-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Developer Tools Online Free | Yoryantra",

    description:
      "Free online developer utilities for debugging, formatting, encoding, and testing workflows.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
	  
	  <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
  <Link href="/" className="transition hover:text-[var(--gold)]">
    Home
  </Link>
  <span>/</span>
  <Link href="/categories" className="transition hover:text-[var(--gold)]">
    Categories
  </Link>
  <span>/</span>
  <span className="text-gray-900">Developer Utilities</span>
</nav>

        {/* HERO */}
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--green)]">
            Developer Utilities
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Developer Tools for Debugging, Formatting, and Everyday Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical developer tools for debugging APIs, formatting JSON,
            decoding JWT tokens, testing regex patterns, converting timestamps,
            generating UUIDs, and handling encoded data during development.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful for Everyday Development
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              These tools help simplify common development tasks such as
              debugging payloads, validating data, formatting outputs, and
              inspecting encoded values.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Fast Browser-Based Usage
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Most utilities work directly in your browser without requiring
              installations, accounts, or external processing.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Helpful Across Multiple Workflows
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Developers, QA teams, DevOps engineers, API testers, and frontend
              developers can use these tools during daily debugging and testing.
            </p>
          </div>
        </div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular Developer Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Frequently used utilities for API debugging, data inspection,
              encoding workflows, and structured data formatting.
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
              All Developer Utilities
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse tools for debugging, encoding, formatting, parsing, and
              testing during frontend and backend development.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {developerTools.map((tool) => (
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
            Common Development Tasks These Tools Support
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Debugging API responses and JWT tokens.",
              "Formatting and validating JSON payloads.",
              "Testing regex expressions during development.",
              "Converting timestamps into readable values.",
              "Generating UUIDs for systems and databases.",
              "Handling Base64 and encoded strings.",
              "Inspecting URL parameters and query strings.",
              "Testing data formatting before deployment.",
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
            Why Browser-Based Developer Utilities Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Developers frequently need quick utilities while testing APIs,
              debugging payloads, inspecting tokens, formatting data, or working
              with encoded content.
            </p>

            <p>
              Lightweight browser-based tools reduce context switching and help
              speed up development workflows without needing heavy software or
              external platforms.
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
                What are developer utilities?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Developer utilities are tools that help with debugging,
                formatting, encoding, parsing, validation, and testing during
                software development.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for frontend and backend developers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. These tools support frontend development, backend APIs,
                DevOps workflows, testing, and structured data handling.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools require installation?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Most tools work directly inside your browser without any
                installation or signup.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are inputs processed on external servers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser
                unless a specific utility requires an external URL check.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Tool Categories
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
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
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
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