import Link from "next/link";

const featuredCategories = [
  {
    title: "JSON & Data Tools",
    description:
      "JSON formatting, validation, schema checks, diff comparison, escaping, and conversions.",
    href: "/categories/json-tools",
  },
  {
    title: "Developer Utilities",
    description:
      "Debugging tools for APIs, tokens, timestamps, UUIDs, regex, and daily development.",
    href: "/categories/developer-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Base64, URL encoding, HTML entities, JSON-safe strings, and web text transformations.",
    href: "/categories/encoding-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "YAML, Docker, Kubernetes, .env parsing, cron expressions, and configuration workflows.",
    href: "/categories/devops-tools",
  },
];

const popularJsonTools = [
  {
    title: "JSON Formatter",
    description:
      "Format and beautify JSON data for easier reading and debugging.",
    href: "/tools/json-formatter",
  },
  {
    title: "JSON Validator",
    description:
      "Validate JSON syntax and find formatting errors quickly.",
    href: "/tools/json-validator",
  },
  {
    title: "JSON Minifier",
    description:
      "Minify JSON by removing whitespace and unnecessary formatting.",
    href: "/tools/json-minifier",
  },
  {
    title: "JSON Diff Checker",
    description:
      "Compare two JSON objects and inspect structural differences.",
    href: "/tools/json-diff-checker",
  },
  {
    title: "JSON Schema Validator",
    description:
      "Validate JSON data against schema rules for API and backend workflows.",
    href: "/tools/json-schema-validator",
  },
  {
    title: "JSON Escape Unescape",
    description:
      "Escape and unescape JSON strings for logs, scripts, and API payloads.",
    href: "/tools/json-escape-unescape",
  },
  {
    title: "JSON to YAML Converter",
    description:
      "Convert JSON data into readable YAML configuration.",
    href: "/tools/json-to-yaml-converter",
  },
  {
    title: "XML to JSON Converter",
    description:
      "Convert XML responses and structured data into JSON format.",
    href: "/tools/xml-to-json-converter",
  },
];

export const metadata = {
  title: "JSON Guides for Developers and API Workflows | Yoryantra",

  description:
    "Explore practical JSON guides and free online tools for JSON formatting, validation, minifying, diff checking, schema validation, escaping, and JSON conversion workflows.",

  keywords: [
    "json guides",
    "json tools",
    "json formatter",
    "json validator",
    "json minifier",
    "json diff checker",
    "json schema validator",
    "json escape unescape",
    "json to yaml converter",
    "xml to json converter",
    "api json tools",
    "developer json tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/json-guides",
  },

  openGraph: {
    title: "JSON Guides for Developers and API Workflows | Yoryantra",

    description:
      "Practical JSON guides and free online tools for formatting, validation, minifying, diff checking, schema validation, escaping, and conversion workflows.",

    url: "https://yoryantra.com/json-guides",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Guides for Developers and API Workflows | Yoryantra",

    description:
      "Explore free JSON tools and guides for APIs, formatting, validation, schema checks, diff comparison, escaping, and data conversion.",
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
            JSON Guides
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            JSON Guides for APIs, Validation, and Structured Data Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Explore practical JSON resources and browser-based utilities for
            formatting, validation, minifying, diff checking, schema validation,
            escaping, and converting structured data used in APIs, backend
            systems, configuration files, and development workflows.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for API Debugging
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Format responses, validate payloads, inspect escaped strings, and
              compare JSON objects while working with APIs, webhooks, logs, and
              backend services.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful for Structured Data Checks
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              JSON guides and utilities help developers catch syntax problems,
              schema mismatches, broken payloads, and conversion issues before
              they create integration errors.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Practical Browser-Based Tools
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Most Yoryantra JSON tools run inside your browser, making them
              fast for quick checks while keeping structured data private.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              JSON-Related Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with categories that support structured data, API debugging,
              encoding, configuration files, and developer workflows.
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
              Popular JSON Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Frequently used tools for formatting JSON, validating payloads,
              comparing data, escaping strings, checking schemas, and converting
              structured formats.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {popularJsonTools.map((tool) => (
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
            Common JSON Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Formatting API responses before debugging.",
              "Validating JSON payloads before sending requests.",
              "Comparing two JSON objects during testing.",
              "Checking JSON data against schema rules.",
              "Escaping and unescaping JSON strings for logs and scripts.",
              "Minifying JSON before storage or transmission.",
              "Converting JSON into YAML configuration files.",
              "Transforming XML responses into JSON for modern APIs.",
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
            Why JSON Guides Matter for Developers
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              JSON is one of the most common data formats used across APIs,
              frontend applications, backend services, logs, configuration
              files, databases, and automation workflows.
            </p>

            <p>
              Small JSON mistakes can break requests, fail validation, confuse
              integrations, or create hard-to-read logs. Practical JSON guides
              and browser-based tools help developers catch these issues faster
              during everyday work.
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
                What are JSON guides used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON guides help developers understand formatting, validation,
                schema checks, escaping, minifying, diff comparison, and data
                conversion workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are JSON tools useful for API development?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JSON formatting, validation, schema validation, diff
                checking, escaping, and conversion tools are commonly used while
                building and debugging APIs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can JSON be converted into YAML or XML-related formats?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Yoryantra includes tools for JSON to YAML conversion, YAML
                to JSON conversion, and XML to JSON conversion workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON data uploaded while using these tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser,
                so your JSON payloads are not uploaded unless a specific tool
                clearly requires an external URL check.
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
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
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
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>

            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
