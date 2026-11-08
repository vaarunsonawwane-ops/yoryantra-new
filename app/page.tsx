import Link from "next/link";
import { getPublishedArticles } from "./blog/blog-data";

export const metadata = {
  title: "Yoryantra | Practical Browser Tools for Everyday Work",

  description:
    "Yoryantra helps you do technical tasks easier everyday. Validate JSON, test regex, validate SEO tags and analyse API requests using browser-based tools and guides.",

  alternates: {
    canonical: "https://yoryantra.com",
  },

  openGraph: {
    title: "Yoryantra | Practical Browser Tools for Everyday Work",

    description:
      "Yoryantra helps you do technical tasks easier everyday. Validate JSON, test regex, validate SEO tags and analyse API requests using browser-based tools and guides.",

    url: "https://yoryantra.com",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Yoryantra | Practical Browser Tools for Everyday Work",

    description:
      "Yoryantra helps you do technical tasks easier everyday. Validate JSON, test regex, validate SEO tags and analyse API requests using browser-based tools and guides.",
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
      "Inspect tokens, work with hashes and signatures, review headers, and check security-related values.",
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

function readableDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export default function HomePage() {
  const latestArticles = getPublishedArticles().slice(0, 4);

  return (
    <main className="bg-white text-gray-900">
      {/* HERO — approved homepage copy */}
      <section className="mx-auto max-w-7xl px-6 pt-4 pb-20 md:pt-8 md:pb-24">
        <div className="max-w-4xl">
          <p className="text-sm font-medium text-[var(--gold-text)]">
            ✦ Built for you
          </p>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl md:leading-tight">
            Find the tool you need. Get back to your work.
          </h1>

          <p className="mt-8 max-w-4xl text-lg leading-relaxed text-gray-600">
            Need to check a page title, review a sitemap, validate JSON, test a regex, or decode text? Yoryantra brings together browser-based tools for these tasks and more, whether you’re working on a website, creating content, working on SEO, developing software, or troubleshooting an issue.
          </p>

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
              Find tools based on what you are looking for — development, encoding, JSON and data, security, SEO, DevOps, and more.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
              >
                <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[var(--gold-text)]">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {category.description}
                </p>

                <p className="mt-5 text-sm font-medium text-[var(--gold-text)]">
                  View tools →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST ARTICLES — only published posts, using their original dates */}
      {latestArticles.length > 0 && (
        <section aria-labelledby="latest-articles-heading" className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="latest-articles-heading" className="text-3xl font-semibold tracking-tight text-gray-950">
                Latest technical articles
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
                Practical explanations, debugging notes, and fixes for everyday technical work.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-[var(--green)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
            >
              View all articles →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {latestArticles.map((article) => (
              <article key={article.slug} className="min-w-0">
                <Link
                  href={`/blog/${article.slug}`}
                  className="group flex h-full flex-col rounded-2xl p-5 transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--green)]">
                    {article.topic}
                  </p>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-[var(--gold-text)]">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {article.description}
                  </p>
                  {article.datePublished && (
                    <p className="mt-auto pt-4 text-xs text-gray-600">
                      <time dateTime={article.datePublished}>Published {readableDate(article.datePublished)}</time>
                      {article.dateModified && article.dateModified > article.datePublished && (
                        <>
                          <span className="mx-2 text-gray-400" aria-hidden="true">·</span>
                          <time dateTime={article.dateModified}>Updated {readableDate(article.dateModified)}</time>
                        </>
                      )}
                    </p>
                  )}
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* RESOURCES */}
      <section className="border-y border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              Guides for work that needs more than one tool
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Some technical jobs need more than one tool. These guides bring the related tools
              and explanations together so you can work through the task in one place.
            </p>
          </div>

          <div className="mt-8 grid gap-x-10 md:grid-cols-2">
            {guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group border-b border-gray-200 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)] focus-visible:ring-offset-2"
              >
                <h3 className="text-base font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[var(--gold-text)]">
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

    </main>
  );
}
