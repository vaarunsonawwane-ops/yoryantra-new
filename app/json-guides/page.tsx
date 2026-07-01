import Link from "next/link";

const featuredCategories = [
  {
    title: "JSON & Data Tools",
    description:
      "JSON formatting, validation, schemas, comparison, escaping, and conversions.",
    href: "/categories/json-tools",
  },
  {
    title: "Developer Tools",
    description:
      "Developer tools for APIs, tokens, timestamps, UUIDs, regex, and debugging.",
    href: "/categories/developer-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Encoding tools for Base64, URLs, HTML, JSON-safe strings, and text transformations.",
    href: "/categories/encoding-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "DevOps tools for YAML, Docker, Kubernetes, environment files, cron, and configuration.",
    href: "/categories/devops-tools",
  },
];

const popularJsonTools = [
  {
    title: "JSON Formatter",
    description:
      "Format valid JSON for clearer reading, inspection, and debugging.",
    href: "/tools/json-formatter",
  },
  {
    title: "JSON Validator",
    description:
      "Validate JSON syntax and locate structural parsing errors.",
    href: "/tools/json-validator",
  },
  {
    title: "JSON Minifier",
    description:
      "Remove whitespace from valid JSON without changing its data structure.",
    href: "/tools/json-minifier",
  },
  {
    title: "JSON Diff Checker",
    description:
      "Compare two JSON documents and inspect added, removed, or changed values.",
    href: "/tools/json-diff-checker",
  },
  {
    title: "JSON Schema Validator",
    description:
      "Validate fields, types, required values, and nested data against a schema.",
    href: "/tools/json-schema-validator",
  },
  {
    title: "JSON Escape Unescape",
    description:
      "Escape or unescape JSON strings for logs, code, and nested payloads.",
    href: "/tools/json-escape-unescape",
  },
  {
    title: "JSON to YAML Converter",
    description:
      "Convert JSON into YAML while preserving the underlying data structure.",
    href: "/tools/json-to-yaml-converter",
  },
  {
    title: "XML to JSON Converter",
    description:
      "Convert XML to JSON while reviewing attributes, text nodes, and repeated elements.",
    href: "/tools/xml-to-json-converter",
  },
];

export const metadata = {
  title: "JSON Workflows for Validation, APIs, and Data Conversion | Yoryantra",

  description:
    "Follow practical JSON workflows for formatting, syntax validation, schemas, comparison, escaping, minifying, and data conversion.",

  keywords: [
    "JSON workflows",
    "JSON tool selection",
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
    title: "JSON Workflows for Validation, APIs, and Data Conversion | Yoryantra",

    description:
      "Practical JSON workflows and tools for formatting, validation, schemas, comparison, escaping, minifying, and data conversion.",

    url: "https://yoryantra.com/json-guides",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Workflows for Validation, APIs, and Data Conversion | Yoryantra",

    description:
      "Choose the right JSON tool for API debugging, validation, schemas, comparison, escaping, and data conversion.",
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
            JSON Workflows for APIs, Validation, and Data Conversion
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Format payloads, validate syntax, compare structured data, check
            schemas, and convert JSON during API, backend, and configuration work.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Format and Validate JSON
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Make JSON readable, find syntax errors, and prepare compact output when
              smaller data is required.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Compare and Check Data Structure
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Review changed values and validate fields, types, and required data against
              a schema.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Convert JSON for Other Systems
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Move data between JSON, YAML, XML, CSV, query strings, and other formats
              while reviewing the output.
            </p>
          </div>
        </div>


        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Related Categories for JSON and Data Work
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Use these categories when the task extends beyond one JSON
              check into encoding, configuration, DevOps, or general
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
              Common JSON Tools and When to Use Them
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with these tools for readability, syntax validation,
              schema checks, comparison, escaping, minifying, and format
              conversion.
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
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Practical JSON Workflows
          </h2>

          <div className="mt-7 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {[
              "Format valid API responses before reading or debugging them.",
              "Validate syntax before sending or storing a JSON payload.",
              "Compare two JSON documents when reviewing changes or test output.",
              "Check fields, types, and required values against a JSON Schema.",
              "Escape or unescape JSON strings for logs, code, and nested values.",
              "Minify valid JSON when compact output is required.",
              "Convert JSON to YAML when a configuration workflow expects YAML.",
              "Convert XML to JSON while reviewing attributes, text nodes, and repeated elements.",
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
            How to Interpret JSON Tool Results
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              JSON is used across APIs, frontend applications, backend
              services, logs, configuration files, databases, and automation.
              The same payload may need different checks depending on whether
              the problem is syntax, structure, comparison, or conversion.
            </p>

            <p>
              Formatting does not validate application rules, and valid JSON
              can still fail an API contract. Review field names, types, large
              numbers, null values, dates, arrays, duplicate keys, and
              conversion behaviour before relying on transformed output.
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
                How should I choose between similar JSON tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Start with the exact task: format, validate, compare, escape,
                minify, convert, or check against a schema. These operations
                solve different problems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between formatting and validating JSON?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Formatting changes indentation and whitespace for
                readability. Validation checks whether the text follows valid
                JSON syntax.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why can valid JSON still fail in an API?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                The payload may use the wrong field names, types, required
                values, nesting, enums, or application rules even when the JSON
                syntax is valid.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are JSON conversions always lossless?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. JSON can represent nested objects and arrays that do not
                map cleanly to CSV, XML, form data, or other formats. Review the
                converted output before using it in another system.
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
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
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
