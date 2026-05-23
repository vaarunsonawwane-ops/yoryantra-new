import Link from "next/link";

export const metadata = {
  title: "Yoryantra | Small Browser Tools for Technical Work",

  description:
    "A growing collection of simple browser tools for developers, SEO work, security checks, data formatting, encoding, debugging, and everyday technical tasks.",

  alternates: {
    canonical: "https://yoryantra.com",
  },

  openGraph: {
    title: "Yoryantra | Small Browser Tools for Technical Work",

    description:
      "Simple browser tools for developers, SEO work, security checks, data formatting, encoding, debugging, and everyday technical tasks.",

    url: "https://yoryantra.com",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Yoryantra | Small Browser Tools for Technical Work",

    description:
      "Simple browser tools for developers, SEO work, security checks, data formatting, encoding, debugging, and everyday technical tasks.",
  },
};

const categories = [
  {
    title: "Developer Tools",
    description:
      "Small utilities for JSON, regex, UUIDs, timestamps, tokens, debugging, and everyday development checks.",
    href: "/categories/developer-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Encode, decode, escape, translate, and clean text values used in URLs, APIs, payloads, logs, and browser workflows.",
    href: "/categories/encoding-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Format, validate, compare, convert, and inspect structured data while working with APIs, files, and integrations.",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    description:
      "Check headers, inspect tokens, generate hashes, review signatures, and prepare safer values during development.",
    href: "/categories/security-tools",
  },
  {
    title: "SEO Tools",
    description:
      "Create metadata, check redirects, prepare social previews, review URL signals, and handle technical SEO tasks.",
    href: "/categories/seo-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "Work with environment files, YAML, cron expressions, configuration values, and deployment-related text formats.",
    href: "/categories/devops-tools",
  },
];

const notes = [
  "Runs in the browser wherever possible.",
  "Built for small technical tasks that come up often.",
  "Kept simple so the tool stays more important than the page.",
];

export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="max-w-4xl">
          <p className="inline-flex rounded-full border border-[var(--light-gold)] bg-[var(--light-bg)] px-4 py-2 text-sm font-medium text-gray-800">
            Built with gratitude, kept simple.
          </p>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 md:text-6xl md:leading-tight">
            Small browser tools for people building, debugging, and cleaning up technical work.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            Yoryantra is a growing set of practical utilities for developers,
            SEO work, security checks, data formatting, encoding, debugging,
            and structured workflows. The aim is simple: open a tool, solve the
            small problem, and move on with your work.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/tools"
              className="rounded-xl bg-[var(--green)] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Explore tools
            </Link>

            <Link
              href="/categories"
              className="rounded-xl border border-[var(--green)] bg-white px-6 py-3 text-sm font-medium text-[var(--green)] transition hover:-translate-y-0.5 hover:bg-green-50"
            >
              Browse categories
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note}
              className="rounded-2xl border border-[var(--light-gold)] bg-[var(--light-bg)] p-5"
            >
              <p className="text-sm leading-relaxed text-gray-700">
                {note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              Browse tools by the kind of work you are doing
            </h2>

            <p className="mt-4 text-gray-600 leading-relaxed">
              The categories are grouped around real tasks: transforming data,
              checking technical details, preparing values, and inspecting
              things before they go into websites, APIs, logs, or systems.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
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

      {/* ABOUT */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              Why Yoryantra exists
            </h2>
          </div>

          <div className="space-y-5 text-gray-600 leading-relaxed">
            <p>
              Many technical tasks are small, but they interrupt the flow:
              decoding a value, formatting JSON, checking headers, preparing a
              slug, reading a timestamp, or testing a redirect. Yoryantra is
              made for those moments.
            </p>

            <p>
              It is not meant to feel like a heavy platform. It is a practical
              workshop of browser tools that help people build, validate,
              transform, debug, inspect, and operate systems with less friction.
            </p>

            <p>
              The site will keep growing carefully, with useful tools,
              readable examples, and a simple interface that respects the work
              you came here to finish.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
