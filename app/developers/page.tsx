import Link from "next/link";

const featuredCategories = [
  {
    title: "Developer Tools",
    description:
      "Regex testing, timestamps, UUIDs, JWT decoding, and everyday debugging tools.",
    href: "/categories/developer-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Format, validate, compare, escape, and convert structured data for APIs.",
    href: "/categories/json-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Encode and decode Base64, URLs, HTML entities, JSON strings, and web-safe values.",
    href: "/categories/encoding-tools",
  },
  {
    title: "Security Tools",
    description:
      "JWTs, hashes, HMAC signatures, API keys, RSA keys, PEM files, and CSP headers.",
    href: "/categories/security-tools",
  },
];

const popularTools = [
  {
    title: "JSON Formatter",
    description:
      "Format and beautify JSON data for easier debugging and API inspection.",
    href: "/tools/json-formatter",
  },
  {
    title: "JWT Decoder",
    description:
      "Decode JWT tokens and inspect header, payload, and claim data.",
    href: "/tools/jwt-decoder",
  },
  {
    title: "Regex Tester",
    description:
      "Test regular expressions and inspect live pattern matches.",
    href: "/tools/regex-tester",
  },
  {
    title: "Base64 Encoder Decoder",
    description:
      "Encode and decode Base64 strings directly inside your browser.",
    href: "/tools/base64-encoder-decoder",
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
      "Generate UUIDs for databases, APIs, testing, and application workflows.",
    href: "/tools/uuid-generator",
  },
  {
    title: "JSON Schema Validator",
    description:
      "Validate JSON payloads against schema rules before APIs break.",
    href: "/tools/json-schema-validator",
  },
  {
    title: "CURL Command Builder",
    description:
      "Build curl commands for API testing and request debugging.",
    href: "/tools/curl-command-builder",
  },
];

export const metadata = {
  title: "Developer Workflows and Practical Browser Tools | Yoryantra",

  description:
    "Use practical browser-based tools for JSON, APIs, JWTs, regex, timestamps, UUIDs, encoding, and everyday development checks.",

  keywords: [
    "developer utilities",
    "developer tools",
    "online developer tools",
    "json formatter",
    "jwt decoder",
    "regex tester",
    "base64 encoder",
    "timestamp converter",
    "uuid generator",
    "api debugging tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/developers",
  },

  openGraph: {
    title: "Developer Workflows and Practical Tools | Yoryantra",

    description:
      "Practical browser-based developer tools for JSON, JWTs, regex, encoding, timestamps, UUIDs, APIs, and debugging workflows.",

    url: "https://yoryantra.com/developers",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Developer Workflows and Practical Tools | Yoryantra",

    description:
      "Explore practical developer tools for JSON, APIs, JWTs, regex, encoding, timestamps, UUIDs, and debugging work.",
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
            Developers
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 md:text-6xl md:leading-tight">
            Developer Workflows for Debugging, APIs, and Everyday Tasks
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            Format data, inspect tokens, test patterns, convert timestamps,
            generate identifiers, and debug API requests with focused tools
            designed for small development tasks.
          </p>
        </div>
        {/* INTRO */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Inspect Data and API Payloads
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Format JSON, compare responses, validate schemas, and prepare
              request data before it reaches an API.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Debug Tokens, Text, and Time
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Decode JWTs, test regex, inspect encoded values, and convert
              timestamps while tracing application behaviour.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Generate Values for Development
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Create UUIDs, tokens, keys, and request examples for local work,
              testing, and temporary development data.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Browse Developer Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Choose a category based on the task you are working on:
              debugging, structured data, encoding, security, or deployment.
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
              Popular Developer Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with commonly used tools for payloads, authentication,
              text patterns, time values, identifiers, and API requests.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {popularTools.map((tool) => (
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
        {/* COMMON WORKFLOWS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Practical Developer Workflows
          </h2>

          <p className="mt-3 max-w-3xl text-gray-600 leading-relaxed">
            Small development checks often happen between larger tasks. These
            workflows show where a focused browser tool can save time.
          </p>

          <div className="mt-7 grid gap-x-12 gap-y-6 md:grid-cols-2">
            {[
              "Format and validate JSON before sending it to an API.",
              "Inspect JWT contents when authentication starts behaving unexpectedly.",
              "Test a regular expression before adding it to application code.",
              "Decode Base64 or URL-safe values while reviewing requests and responses.",
              "Generate UUIDs for database records, fixtures, or temporary test data.",
              "Convert timestamps while checking logs, events, and backend activity.",
              "Compare API responses or structured data before accepting a change.",
              "Prepare tokens, keys, signatures, or curl requests during testing.",
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
            Where These Tools Fit in Daily Development
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
			  When you are building something, there are often small things you
			  need to check, format, validate, clean, decode, or prepare quickly.
            </p>

            <p>
			  Developer tools on Yoryantra are grouped to make those small steps
			  easier to find — whether it is formatting JSON, checking values,
			  testing something quickly, or preparing data before moving ahead.
			</p> 
			  
			<p>
			  The idea is simple: keep useful tools in one place so you can find
			  what you need quickly and continue with your work.
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
                What kinds of tasks are developer tools useful for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                They help with focused tasks such as formatting data, validating
                syntax, inspecting tokens, testing patterns, converting values,
                and preparing API requests.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Which tools are useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON formatters, schema validators, JWT tools, curl builders,
                timestamp converters, encoders, and response comparison tools
                are useful during API development and testing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these developer tools require installation?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. The tools are designed to work in the browser, so focused
                checks can be completed without installing a separate desktop
                application or browser extension.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my data uploaded while using these tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most tools process input locally in the browser. A tool that
                needs to inspect an external URL or remote response should make
                that behaviour clear on its page.
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
          </div>
        </section>
      </section>
    </main>
  );
}
