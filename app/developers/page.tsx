import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const featuredCategories = [
  {
    title: "Developer Utilities",
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
  title: "Developer Utilities Online Free | Yoryantra",

  description:
    "Explore free online developer utilities for JSON formatting, JWT decoding, regex testing, Base64 encoding, timestamps, UUIDs, API debugging, and everyday development workflows.",

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
    title: "Developer Utilities Online Free | Yoryantra",

    description:
      "Free online developer utilities for debugging, JSON, JWTs, regex, encoding, timestamps, UUIDs, and API workflows.",

    url: "https://yoryantra.com/developers",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Developer Utilities Online Free | Yoryantra",

    description:
      "Explore free online developer tools for debugging, APIs, JSON, JWTs, regex, encoding, timestamps, and UUID workflows.",
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
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Developer Utilities for Debugging, APIs, and Daily Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Explore practical developer utilities for formatting JSON, decoding
            JWT tokens, testing regex patterns, converting timestamps, generating
            UUIDs, encoding data, and debugging API workflows without switching
            between heavy tools.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Quick Debugging
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Use lightweight utilities for checking payloads, tokens, encoded
              strings, timestamps, identifiers, and structured data while
              building or testing applications.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful Across Frontend and Backend Work
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              These tools support API development, frontend debugging, backend
              validation, authentication testing, QA workflows, and daily
              developer tasks.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Simple Browser-Based Utilities
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Most Yoryantra tools run directly inside your browser, keeping
              common developer checks fast, private, and easy to copy.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Developer-Focused Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with focused utility categories that cover debugging,
              structured data, encoding, and security-related workflows.
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
              Frequently used utilities for JSON, JWTs, regex, timestamps,
              encoded values, identifiers, and API request debugging.
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

        {/* USE CASES */}
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Common Developer Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Formatting and validating JSON before sending API payloads.",
              "Decoding JWT tokens during authentication debugging.",
              "Testing regex patterns before using them in code.",
              "Encoding and decoding Base64 or URL-safe values.",
              "Generating UUIDs for databases, mocks, and testing.",
              "Converting timestamps while debugging logs and events.",
              "Comparing structured data during API response testing.",
              "Preparing secure tokens, keys, and signatures during development.",
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
            Why Developer Utilities Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Development work often includes small but repeated tasks such as
              formatting data, checking encoded strings, testing regex, decoding
              tokens, reviewing timestamps, and preparing request values.
            </p>

            <p>
              Fast browser-based utilities reduce context switching and help
              developers keep momentum while debugging, testing, and preparing
              application data across frontend, backend, API, and DevOps
              workflows.
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
                Developer utilities are small tools that help with debugging,
                formatting, validation, encoding, parsing, token inspection, and
                everyday software development tasks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for API development?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JSON formatting, JWT decoding, curl commands, timestamps,
                schema validation, and encoding tools are commonly used during
                API development and testing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these developer tools require installation?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Yoryantra tools are designed to work in the browser, so you
                can use them quickly without installing desktop software or
                browser extensions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is my data uploaded while using these tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser.
                Inputs are not uploaded unless a specific utility clearly needs
                an external URL check.
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
