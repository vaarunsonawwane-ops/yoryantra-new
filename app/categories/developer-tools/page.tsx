import Link from "next/link";
import { tools } from "@/app/data/tools";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const developerTools = tools.filter(
  (tool) => tool.category === "Developer Tools"
);

const representativeHrefs = new Set<string>([
  "/tools/http-request-parser",
  "/tools/regex-tester",
  "/tools/fetch-to-curl-converter",
  "/tools/url-parts-parser",
  "/tools/http-cache-header-analyzer",
  "/tools/api-error-response-formatter",
]);

const representativeTools = developerTools.filter((tool) =>
  representativeHrefs.has(tool.href)
);

export const metadata = {
  title: "Developer Tools for HTTP, Regex, URLs, and Debugging | Yoryantra",
  description:
    "Inspect HTTP text, translate cURL and Fetch requests, test regexes, parse URLs, work with timestamps and UUIDs, and debug implementation details.",
  alternates: {
    canonical: "https://yoryantra.com/categories/developer-tools",
  },
  openGraph: {
    title: "Developer Tools for HTTP, Regex, URLs, and Debugging | Yoryantra",
    description:
      "Developer utilities for inspecting requests and responses, translating request syntax, testing regexes, parsing URLs, and checking implementation details.",
    url: "https://yoryantra.com/categories/developer-tools",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Tools for HTTP, Regex, URLs, and Debugging | Yoryantra",
    description:
      "Inspect HTTP text, request syntax, regex behavior, URLs, timestamps, UUIDs, headers, and related debugging details.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:!text-[var(--light-gold)] transition-colors duration-200">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:!text-[var(--light-gold)] transition-colors duration-200">
            Categories
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Developer Tools</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Developer Tools for HTTP, Regex, URLs, and Everyday Debugging
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            These tools answer implementation questions that are small enough to
            isolate but important enough to derail debugging: what a raw request
            contains, how a regex matched, what changed between header sets, how a
            URL was parsed, or which parts of a cURL command a browser Fetch request
            cannot reproduce exactly.
          </p>
        </div>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">
            Start from the Artifact in Front of You
          </h2>
          <p className="mt-4 max-w-4xl text-gray-600 leading-relaxed">
            Similar-looking inputs can require different operations. Choosing the
            operation first avoids turning a formatter, parser, builder, or tester
            into something it was never meant to prove.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Raw HTTP or cURL:</strong>{" "}
                parse first when you need method, target, headers, cookies, body,
                authentication, or framing separated into inspectable pieces.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Values you are constructing:</strong>{" "}
                use builders for headers, query strings, authentication, Accept values,
                or commands when the desired pieces are already known.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Behavior you want to observe:</strong>{" "}
                use regex testers, method comparisons, cache analysis, or header diffs
                when the question is about a defined behavior rather than text shape.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">One syntax translated to another:</strong>{" "}
                review the conversion notes because cURL, Fetch, shells, and browsers do
                not share identical redirect, credential, quoting, or networking semantics.
              </p>
            </SectionMiniCard>
          </div>
        </SectionCard>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Representative Debugging Paths
            </h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              These six tools are deliberately selected to represent request parsing,
              regex work, syntax translation, URL inspection, cache reasoning, and API
              error analysis rather than simply showing the first items in the registry.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {representativeTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">All Developer Tools</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse all 32 tools for HTTP text, APIs, headers, URLs, regex,
              timestamps, UUIDs, query strings, cURL, Fetch, GraphQL, and related
              implementation work.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {developerTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {tool.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">
            Text Inspection Stops Where the Live Exchange Begins
          </h2>
          <div className="mt-5 space-y-5 text-gray-600 leading-relaxed">
            <p>
              A pasted request or response is a representation of an exchange, not
              the connection itself. TLS negotiation, redirects before or after the
              captured message, proxy rewriting, compression, browser CORS rules,
              authentication state, and intermediary caches can all change what
              happens on the network.
            </p>
            <p>
              That distinction is especially important for converters. A generated
              Fetch or cURL example can preserve method, headers, and body while still
              differing at runtime because the two clients expose different controls.
              The useful result is a transparent translation with limitations, not a
              claim that two execution environments are identical.
            </p>
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">Primary References</h2>
          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              <a href="https://www.rfc-editor.org/rfc/rfc9110" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
                RFC 9110
              </a>{" "}
              defines HTTP semantics, including methods, status codes, fields, and representation concepts used across the HTTP tools.
            </p>
            <p>
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
                MDN Fetch API documentation
              </a>{" "}
              explains browser Fetch behavior and the restrictions that matter when translating command-line requests.
            </p>
            <p>
              <a href="https://www.rfc-editor.org/rfc/rfc9562" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">
                RFC 9562
              </a>{" "}
              defines the UUID formats and variants used by the UUID generator and validator.
            </p>
          </div>
        </SectionCard>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">Related Tool Categories</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/categories/json-tools" className="yoryantra-btn-outline">JSON & Data Tools</Link>
            <Link href="/categories/security-tools" className="yoryantra-btn-outline">Security Tools</Link>
            <Link href="/categories/devops-tools" className="yoryantra-btn-outline">DevOps Tools</Link>
            <Link href="/categories/encoding-tools" className="yoryantra-btn-outline">Encoding Tools</Link>
            <Link href="/categories/seo-tools" className="yoryantra-btn-outline">SEO Tools</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
