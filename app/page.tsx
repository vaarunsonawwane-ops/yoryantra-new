import Link from "next/link";

export const metadata = {
  title: "Yoryantra | Practical Browser Tools for Everyday Technical Work",

  description:
    "Practical browser tools and technical guides for development, DevOps, security, SEO, JSON, data, encoding, and everyday technical work.",

  alternates: {
    canonical: "https://yoryantra.com",
  },

  openGraph: {
    title: "Yoryantra | Practical Browser Tools for Everyday Technical Work",

    description:
      "Focused browser tools with clear technical context for development, DevOps, security, SEO, structured data, encoding, and related work.",

    url: "https://yoryantra.com",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Yoryantra | Practical Browser Tools for Everyday Technical Work",

    description:
      "Focused browser tools with clear technical context for development, DevOps, security, SEO, structured data, encoding, and related work.",
  },
};

const categories = [
  {
    title: "Developer Tools",
    description:
      "Work with HTTP requests and responses, URLs, regex, timestamps, UUIDs, headers, and debugging utilities.",
    href: "/categories/developer-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "Check Docker, Kubernetes, GitHub Actions, Nginx, cron, DNS, CIDR, environment files, and deployment configuration.",
    href: "/categories/devops-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Work with Base64, percent encoding, HTML and XML entities, Unicode escapes, Punycode, MIME, and byte-oriented text formats.",
    href: "/categories/encoding-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Format, validate, compare, query, and transform JSON, CSV, XML, YAML, SQL, schemas, pointers, and patches.",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    description:
      "Inspect JWTs and cookies, work with hashes and keys, review security headers, and build browser security policies.",
    href: "/categories/security-tools",
  },
  {
    title: "SEO Tools",
    description:
      "Review metadata, robots directives, canonicals, hreflang, sitemaps, indexability signals, and search-preview fields.",
    href: "/categories/seo-tools",
  },
];

const guides = [
  {
    title: "Developer Workflows",
    description:
      "Choose between parsers, formatters, builders, and testers while keeping local and live behavior distinct.",
    href: "/developers",
  },
  {
    title: "DevOps Resources",
    description:
      "Separate valid syntax from platform configuration, interpolation, deployment checks, and runtime state.",
    href: "/devops-resources",
  },
  {
    title: "Encoding Guides",
    description:
      "Follow characters, bytes, and encoded forms across Base64, URLs, entities, Unicode, MIME, and IDNs.",
    href: "/encoding-guides",
  },
  {
    title: "JSON & Data Guides",
    description:
      "Understand parsing, schemas, transformations, pointers, patches, and where conversions can lose information.",
    href: "/json-guides",
  },
  {
    title: "Security Guides",
    description:
      "Distinguish decoding, verification, hashing, HMAC, password hashing, keys, headers, and trust boundaries.",
    href: "/security-guides",
  },
  {
    title: "SEO Resources",
    description:
      "Work through crawling, indexing, canonicalization, hreflang, sitemaps, metadata, and search presentation without ranking promises.",
    href: "/seo-resources",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-4 md:pb-20 md:pt-8">
        <div className="max-w-4xl">
          <p className="text-sm font-medium text-[var(--light-gold)]">
            ✦ Tool first. Context when it matters.
          </p>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl md:leading-tight">
            Practical browser tools for everyday technical work.
          </h1>

          <div className="mt-8 max-w-4xl space-y-5 text-lg leading-relaxed text-gray-600">
            <p>
              Small technical tasks should not require a maze of pages. Yoryantra
              is built for the moment you need to inspect a value, validate input,
              convert data, check configuration, or prepare something for the next
              system.
            </p>

            <p>
              The tool comes first. When a result has limits or needs
              interpretation, the page explains what it does — and what it does
              not prove — so you can use the output with the right context.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/tools"
              className="rounded-xl bg-[var(--green)] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
            >
              Explore Tools
            </Link>

            <Link
              href="/categories"
              className="rounded-xl border border-[var(--green)] bg-white px-6 py-3 text-sm font-medium text-[var(--green)] transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              Start with the work in front of you
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              The categories separate data work, encoding, security,
              infrastructure, search, and general development so related tools
              stay in the right technical context.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
              >
                <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[var(--light-gold)]">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {category.description}
                </p>

                <p className="mt-5 text-sm font-medium text-[var(--green)]">
                  Explore category →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              A result is useful only when you know what it proves
            </h2>

            <div className="mt-6 space-y-5 leading-relaxed text-gray-600">
              <p>
                Many technical tools look similar on the surface but answer
                different questions. A formatter can make input readable; it
                does not prove that the input satisfies a schema or that another
                system will accept it.
              </p>

              <p>
                The same distinction appears across Yoryantra: decoding a JWT
                is not signature verification, valid YAML is not proof that a
                Kubernetes cluster will accept a manifest, and a search preview
                is not a promise of how a search engine will display a page.
              </p>

              <p>
                Tool pages keep those boundaries visible so the output is easier
                to use in the real workflow that comes next.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Format ≠ validate
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Presentation can change without establishing whether the data
                meets a schema, protocol, or application rule.
              </p>
            </div>

            <div className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Decode ≠ verify
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Readable token data does not establish signature validity,
                trusted identity, or authorization.
              </p>
            </div>

            <div className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Static check ≠ live behavior
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Local analysis cannot replace the server, browser, cluster, or
                runtime that ultimately interprets a configuration or request.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-gray-100 bg-gray-50 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
                When the task needs more than one tool
              </h2>

              <p className="mt-4 leading-relaxed text-gray-600">
                The resource pages connect related tools and explain the
                technical distinctions that affect how their results should be
                interpreted or combined.
              </p>
            </div>

            <Link
              href="/resources"
              className="self-start rounded-sm text-sm font-semibold text-[var(--green)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2 md:self-auto"
            >
              Browse all resources →
            </Link>
          </div>

          <div className="mt-8 grid gap-x-10 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group border-b border-gray-200 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
              >
                <h3 className="text-base font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[var(--light-gold)]">
                  {guide.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {guide.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
            Why Yoryantra exists
          </h2>

          <div className="mt-6 space-y-5 leading-relaxed text-gray-600">
            <p>
              Small technical jobs often interrupt larger work: inspecting a
              response, checking a configuration, converting a value, or
              understanding why two representations differ. Yoryantra is built
              for those moments.
            </p>

            <p>
              It is an independent, creator-built project. Tools are reviewed
              against the behavior they claim, and supporting content is written
              around the subject rather than a fixed page formula.
            </p>

            <p>
              The goal is not to collect the largest possible number of
              utilities. It is to make each page useful enough that you can
              complete the task, understand the result, and know what still
              needs to be checked elsewhere.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/how-yoryantra-tools-are-built"
              className="rounded-xl border border-[var(--green)] bg-white px-5 py-3 text-sm font-medium text-[var(--green)] transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
            >
              How Tools Are Built
            </Link>

            <Link
              href="/about"
              className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:-translate-y-0.5 hover:border-[var(--green)] hover:text-[var(--green)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
            >
              About Yoryantra
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
