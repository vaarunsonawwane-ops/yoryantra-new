import Link from "next/link";

export const metadata = {
  title: "Yoryantra | Practical Browser Tools for Everyday Work",

  description:
    "Practical browser tools for development, DevOps, security, SEO, JSON, encoding, and everyday technical work.",

  alternates: {
    canonical: "https://yoryantra.com",
  },

  openGraph: {
    title: "Yoryantra | Practical Tools for Everyday Work",

    description:
      "Simple browser tools to help you format, convert, check, clean, validate, and prepare things quickly — without unnecessary clutter.",

    url: "https://yoryantra.com",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Yoryantra | Practical Tools for Everyday Work",

    description:
      "Simple browser tools to help you format, convert, check, clean, validate, and prepare things quickly — without unnecessary clutter.",
  },
};

const categories = [
  {
    title: "Developer Tools",
    description:
      "Work with JSON, regex, UUIDs, timestamps, tokens, API requests, and everyday debugging tasks.",
    href: "/categories/developer-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Encode and decode Base64, URLs, HTML entities, JSON strings, slugs, and web text.",
    href: "/categories/encoding-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Format, validate, compare, convert, and inspect structured data used in APIs and applications.",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    description:
      "Inspect tokens, work with hashes and signatures, review headers, and prepare security-related values.",
    href: "/categories/security-tools",
  },
  {
    title: "SEO Tools",
    description:
      "Prepare metadata, review redirects and canonicals, check crawl signals, and build campaign URLs.",
    href: "/categories/seo-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "Review YAML, Docker, Kubernetes, environment files, cron schedules, and deployment configuration.",
    href: "/categories/devops-tools",
  },
];

const guides = [
  {
    title: "Developer Workflows",
    description:
      "Practical notes for APIs, requests, responses, regex, timestamps, UUIDs, and debugging work.",
    href: "/developers",
  },
  {
    title: "DevOps Resources",
    description:
      "Guides for Docker, Kubernetes, YAML, environment files, cron, DNS, and deployment checks.",
    href: "/devops-resources",
  },
  {
    title: "Encoding Guides",
    description:
      "Help with Base64, URLs, HTML entities, Unicode, MIME, Punycode, and encoded text.",
    href: "/encoding-guides",
  },
  {
    title: "JSON & Data Guides",
    description:
      "Notes on JSON, schemas, pointers, patches, CSV, XML, YAML, and data conversion.",
    href: "/json-guides",
  },
  {
    title: "Security Guides",
    description:
      "Guides for JWTs, hashes, HMAC, keys, headers, cookies, and browser security settings.",
    href: "/security-guides",
  },
  {
    title: "SEO Resources",
    description:
      "Practical help with metadata, robots directives, canonicals, hreflang, sitemaps, and indexing checks.",
    href: "/seo-resources",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO — original production copy restored */}
      <section className="mx-auto max-w-7xl px-6 pt-4 pb-20 md:pt-8 md:pb-24">
        <div className="max-w-4xl">
          <p className="text-sm font-medium text-[var(--light-gold)]">
            ✦ Built for you
          </p>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl md:leading-tight">
            Practical browser tools for everyday technical work.
          </h1>

          <div className="mt-8 max-w-4xl space-y-5 text-lg leading-relaxed text-gray-600">
            <p>
              Yoryantra is a growing collection of focused browser tools for
              development, DevOps, security, SEO, JSON, encoding, and related
              technical tasks.
            </p>

            <p>
              Use them to format data, validate files, inspect values, convert
              text, check configuration, and prepare information for another
              system.
            </p>

            <p>
              The idea is simple: open the tool, complete the task, understand
              the result, and continue your work without unnecessary clutter.
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

      {/* CATEGORIES — original production wording restored */}
      <section className="border-y border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              Browse tools by category
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Start with the type of task you need to complete, then move
              through related tools without searching through one long list.
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

                <p className="mt-5 text-sm font-medium text-[var(--light-gold)]">
                  Explore category →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* A LITTLE CONTEXT — useful without turning the homepage into a sales page */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
            Some results need a little context
          </h2>

          <div className="mt-6 space-y-5 leading-relaxed text-gray-600">
            <p>
              A formatter can make JSON easier to read, but it does not tell you
              whether the data matches a schema. Decoding a JWT lets you read its
              contents, but it does not verify the signature or prove who created
              it.
            </p>

            <p>
              The same applies to configuration and SEO checks. A local check can
              catch useful problems, but the server, browser, cluster, or search
              engine still decides what happens in the real system.
            </p>

            <p>
              Where that difference matters, the tool page explains it instead
              of treating every result as final proof.
            </p>
          </div>
        </div>
      </section>

      {/* RESOURCES */}
      <section className="border-y border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              Guides for related technical work
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Some tasks involve more than one tool. These pages group related
              tools and explanations so you can follow the work without jumping
              between unrelated pages.
            </p>
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

          <Link
            href="/resources"
            className="mt-8 inline-flex text-sm font-semibold text-[var(--green)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
          >
            Browse all resources →
          </Link>
        </div>
      </section>

      {/* WHY YORYANTRA — original production wording restored */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
            Why Yoryantra Exists
          </h2>

          <div className="mt-6 space-y-5 text-gray-600 leading-relaxed">
            <p>
              Yoryantra was created because many utility websites make small
              technical tasks feel harder than they need to be.
            </p>

            <p>
              Sometimes you only need to format a payload, inspect a token,
              validate a file, convert a value, or check a configuration before
              moving back to the main task.
            </p>

            <p>
              You can also read{" "}
              <Link
                href="/how-yoryantra-tools-are-built"
                className="font-semibold text-[var(--light-gold)] hover:underline"
              >
                how Yoryantra tools are selected, tested, and improved
              </Link>
              .
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/how-yoryantra-tools-are-built"
              className="rounded-xl bg-[var(--green)] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
            >
              How Tools Are Built
            </Link>

            <Link
              href="/about"
              className="rounded-xl border border-[var(--green)] bg-white px-6 py-3 text-sm font-medium text-[var(--green)] transition hover:-translate-y-0.5 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
            >
              About Yoryantra
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
