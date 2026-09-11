import Link from "next/link";

const resourceAreas = [
  {
    title: "Developer Workflows",
    description:
      "Choose between parsers, formatters, builders, converters, and request-debugging tools without confusing local inspection with live network behavior.",
    href: "/developers",
  },
  {
    title: "DevOps Resources",
    description:
      "Read Docker, Kubernetes, environment, cron, DNS, and CI configuration in layers before relying on runtime behavior.",
    href: "/devops-resources",
  },
  {
    title: "Encoding Guides",
    description:
      "Understand how bytes, Unicode text, Base64, percent encoding, entities, and URL-safe representations differ by context.",
    href: "/encoding-guides",
  },
  {
    title: "JSON & Data Guides",
    description:
      "Separate parsing, schema validation, comparison, querying, and conversion so transformed data keeps the meaning you expect.",
    href: "/json-guides",
  },
  {
    title: "Security Guides",
    description:
      "Distinguish decoding from verification, hashing from authentication, and generated headers from real production security controls.",
    href: "/security-guides",
  },
  {
    title: "SEO Resources",
    description:
      "Debug crawling, indexing, canonicalization, redirects, hreflang, sitemaps, and search snippets as separate signals rather than one score.",
    href: "/seo-resources",
  },
];

const decisionPoints = [
  {
    title: "Inspect or validate?",
    text: "Inspection makes structure visible. Validation answers a narrower question against syntax, a schema, or a documented rule set.",
  },
  {
    title: "Encode or secure?",
    text: "Encoding changes representation so data can travel through another context. It does not add secrecy, authenticity, or trust.",
  },
  {
    title: "Generate or verify?",
    text: "A generator can produce valid-looking output. Verification checks whether an existing value satisfies a specific rule or cryptographic condition.",
  },
  {
    title: "Static check or live behavior?",
    text: "Pasted text and local configuration can reveal many mistakes, but live HTTP, DNS, containers, clusters, and browsers still have runtime state.",
  },
];

export const metadata = {
  title: "Technical Resources and Workflow Guides | Yoryantra",
  description:
    "Use Yoryantra workflow guides to choose the right developer, DevOps, encoding, JSON, security, or SEO tool and understand what its result can prove.",
  alternates: {
    canonical: "https://yoryantra.com/resources",
  },
  openGraph: {
    title: "Technical Resources and Workflow Guides | Yoryantra",
    description:
      "Practical guidance for choosing and interpreting Yoryantra tools across development, DevOps, encoding, JSON, security, and technical SEO.",
    url: "https://yoryantra.com/resources",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical Resources and Workflow Guides | Yoryantra",
    description:
      "Choose the right technical workflow and understand the limits of each kind of tool before relying on the result.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link
            href="/"
            className="transition-colors duration-200 hover:!text-[var(--light-gold)]"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Resources</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Start With the Technical Question, Not the Tool Name
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Many developer utilities look similar because they accept the same
            kind of input. The useful distinction is the question they answer:
            format, parse, validate, convert, inspect, generate, compare, or
            verify. These resource pages connect Yoryantra&apos;s tools to those
            questions and explain where a browser result stops being enough.
          </p>
        </div>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Choose a Workflow Area
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              Each area is written around a different kind of technical work.
              The goal is not to repeat the tool list, but to help you choose an
              operation and interpret its result correctly.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resourceAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {area.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {area.description}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Read the guide →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-18 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Four Distinctions That Prevent the Wrong Tool Choice
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              Tool names often differ by one word, but that word can change the
              meaning of the result. These distinctions recur across the site.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {decisionPoints.map((point) => (
              <div key={point.title} className="rounded-xl bg-white p-5">
                <h3 className="font-semibold text-gray-900">{point.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">
            A Practical Way to Use Yoryantra
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              First, identify what you are trying to learn or change. If the
              question is whether text is valid JSON, use a validator. If the
              question is whether valid JSON matches an API contract, use a
              schema validator. If the question is what changed between two
              payloads, use a diff tool. Treating those as interchangeable can
              produce a technically correct result that answers the wrong
              question.
            </p>
            <p>
              Second, check the boundary of the tool. Some utilities operate
              entirely on text or bytes you provide. Others depend on browser
              APIs or remote data. A static configuration check cannot prove a
              deployment will succeed, and a generated SEO tag cannot prove a
              search engine will index or display it.
            </p>
            <p>
              Finally, take the result back to the system that owns the real
              decision: your API, runtime, browser, container engine, cluster,
              DNS provider, application security policy, or search platform.
              Yoryantra is most useful as a focused inspection and preparation
              layer, not as a substitute for the environment itself.
            </p>
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Want to see the review approach?
              </h2>
              <p className="mt-3 leading-7 text-gray-600">
                The methodology page explains how tools are selected, checked,
                documented, and kept honest about their limits.
              </p>
              <Link
                href="/how-yoryantra-tools-are-built"
                className="mt-5 inline-flex font-semibold text-[var(--light-gold)]"
              >
                How Yoryantra tools are built →
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Prefer to browse directly?
              </h2>
              <p className="mt-3 leading-7 text-gray-600">
                Use the category pages when you already know the subject area,
                or the complete tools page when you know the exact utility.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/categories" className="yoryantra-btn-outline">
                  Browse categories
                </Link>
                <Link href="/tools" className="yoryantra-btn-outline">
                  Browse all tools
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
