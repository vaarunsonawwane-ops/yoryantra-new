import Link from "next/link";

const resourceAreas = [
  {
    title: "Developer Workflows",
    description:
      "Know when to use a parser, formatter, builder, converter and request debugger.",
    href: "/developers",
  },
  {
    title: "DevOps Resources",
    description:
      "Read and understand Docker, Kubernetes, environment, cron, DNS and CI config files.",
    href: "/devops-resources",
  },
  {
    title: "Encoding Guides",
    description:
      "Understand the differences between bytes, unicode, base64, percent encoding, entities and url safe versions.",
    href: "/encoding-guides",
  },
  {
    title: "JSON & Data Guides",
    description:
      "Understand how to parse, validate, compare, query and convert data to keep the correct meaning.",
    href: "/json-guides",
  },
  {
    title: "Security Guides",
    description:
      "Understand the difference between decoding, verifying, hashing and authenticating, along with the difference between generated headers and actual security measures.",
    href: "/security-guides",
  },
  {
    title: "SEO Resources",
    description:
      "Debug your crawl, index, canonical, redirect, hreflang, sitemap and search snippet signals.",
    href: "/seo-resources",
  },
];

const decisionPoints = [
  {
    title: "Inspection vs validation",
    text: "Inspection will expose the structure. Validation will answer a very specific question about whether it is valid according to a syntax, schema or documented rules.",
  },
  {
    title: "Encoding vs securing",
    text: "Encoding will change the format of the data so it can fit into another context. However it will not provide any secrecy, authenticity or trust.",
  },
  {
    title: "Generation vs verification",
    text: "A generator can create something that looks valid. A verifier will check that a value already exists meets a specific rule or cryptographic requirement.",
  },
  {
    title: "Static vs runtime",
    text: "By pasting in text and having a local config you can catch lots of errors. However there is still runtime state when dealing with HTTP, DNS, containers, clusters and browsers.",
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
            className="transition-colors duration-200 hover:!text-[var(--gold-text)]"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Resources</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Explore Resources
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Many tools for developers have similar inputs but can be categorised by what they do 
            with that input. This page provides an overview of how our tools at Yoryantra can be
            used for formatting, parsing, validating, transforming, analysing, generating, 
            comparing or checking inputs. We also explain when you will need to go beyond the
            browser.
          </p>
        </div>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Browse by Topic
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              Discover practical guides on DevOps, encoding, JSON, security and SEO. Including
              explanations, examples and tools from Yoryantra to assist you with common tasks, 
              understanding and troubleshooting.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {resourceAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="self-start group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--gold-text)]">
                  {area.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {area.description}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--gold-text)]">
                  Read the guide →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-18 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              What do different tools do?
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              There are often small differences in the name of the tools which
              can have a big impact on what they actually do.
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
            Use Cases
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              If your goal is to determine if text is valid JSON, use a validator. If
              your goal is to determine if valid JSON conforms to an API
              contract, use a schema validator. If your goal is to determine what
              has changed between two payloads, use a diff. By using one in place
              of another you may get a technically accurate result but to the
              wrong question.
            </p>
            <p>
              Be aware of the limitations of tools. Whilst some tools will work
              purely on the text/bytes you provide others will rely on browser
              APIs or external data. You can’t guarantee that a configuration will
              work in deployment by checking it is valid. You can’t guarantee that
              an SEO tag will be indexed or shown by a search engine by generating it.
            </p>
            <p>
              Return the results to the system that actually makes the decision.
              Your API, runtime, browser, container engine, cluster, DNS provider,
              application security policy or search platform. Yoryantra is best
              used as a focused inspection and preparation tool.
            </p>
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Behind the Tools
              </h2>
              <p className="mt-3 leading-7 text-gray-600">
                How we choose, verify, and document our tools.
              </p>
              <Link
                href="/how-yoryantra-tools-are-built"
                className="mt-5 inline-flex font-semibold text-[var(--gold-text)]"
              >
                How Yoryantra tools are built →
              </Link>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Prefer to browse directly?
              </h2>
              <p className="mt-3 leading-7 text-gray-600">
                If you know what area you're looking for use our category pages. If
                you know the exact tool you want use our full tools page.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/categories" className="yoryantra-btn-outline">
                  Categories
                </Link>
                <Link href="/tools" className="yoryantra-btn-outline">
                  All Tools
                </Link>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
