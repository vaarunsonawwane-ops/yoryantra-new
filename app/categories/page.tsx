import Link from "next/link";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";
import { tools } from "@/app/data/tools";

const categories = [
  {
    title: "SEO Tools",
    description:
      "Work with crawl directives, metadata, canonicals, hreflang, sitemaps, redirects, indexability, and search previews.",
    href: "/categories/seo-tools",
    examples: ["Meta Tag Generator", "Hreflang Validator", "Indexability Checker"],
  },
  {
    title: "Security Tools",
    description:
      "Inspect JWTs, hashes, browser security headers, cookies, keys, CSP policies, and authentication-related values.",
    href: "/categories/security-tools",
    examples: ["JWT Signature Verifier", "CSP Analyzer", "Cookie Security Checker"],
  },
  {
    title: "JSON & Data Tools",
    description:
      "Format, validate, compare, transform, and inspect JSON, CSV, XML, YAML, SQL, schemas, and related data structures.",
    href: "/categories/json-tools",
    examples: ["JSON Formatter", "JSON Schema Validator", "JSON Patch Generator"],
  },
  {
    title: "DevOps Tools",
    description:
      "Review Docker, Kubernetes, cron, DNS, CIDR, environment files, GitHub Actions, Nginx, and deployment configuration.",
    href: "/categories/devops-tools",
    examples: ["Docker Compose Validator", "Kubernetes YAML Validator", "GitHub Actions YAML Validator"],
  },
  {
    title: "Encoding Tools",
    description:
      "Move between text and byte representations such as Base64, Base58, hex, percent encoding, Unicode escapes, and entities.",
    href: "/categories/encoding-tools",
    examples: ["Base64 Encoder Decoder", "Percent Encoding Analyzer", "Unicode Escape Sequence Converter"],
  },
  {
    title: "Developer Tools",
    description:
      "Handle HTTP text, regex, URLs, timestamps, UUIDs, cURL and Fetch translation, headers, and everyday debugging tasks.",
    href: "/categories/developer-tools",
    examples: ["HTTP Request Parser", "Regex Match Tester", "Fetch to cURL Converter"],
  },
];

export const metadata = {
  title: "Enjoy Browsing Free Developer Tools by Category | Yoryantra",
  description:
    "Find the right tool to help with your next task. Browse free developer tools for JSON, regex, SEO, DevOps, security and encoding, neatly organised by category.",
  alternates: {
    canonical: "https://yoryantra.com/categories",
  },
  openGraph: {
    title: "Enjoy Browsing Free Developer Tools by Category | Yoryantra",
    description:
      "Find the right tool to help with your next task. Browse free developer tools for JSON, regex, SEO, DevOps, security and encoding, neatly organised by category.",
    url: "https://yoryantra.com/categories",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enjoy Browsing Free Developer Tools by Category | Yoryantra",
    description:
      "Find the right tool to help with your next task. Browse free developer tools for JSON, regex, SEO, DevOps, security and encoding, neatly organised by category.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 md:text-6xl md:leading-tight">
            Browse Tools by the Problem You Are Solving
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            Yoryantra groups {tools.length} tools into six practical areas. The categories
            follow the main question each tool answers, because the same format can
            play very different roles in development, deployment, security, search,
            or data work.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--gold-text)]">
                {category.title}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {category.description}
              </p>

              <p className="mt-5 text-xs leading-relaxed text-gray-500">
                Examples: {category.examples.join(", ")}
              </p>

              <span className="mt-6 inline-flex text-sm font-semibold text-[var(--gold-text)]">
                Explore category →
              </span>
            </Link>
          ))}
        </div>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">
            When Categories Appear to Overlap
          </h2>

          <p className="mt-4 max-w-4xl text-gray-600 leading-relaxed">
            Categories are defined by their purpose, not file type. This can
            cause issues when a technology is used in multiple scenarios.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-[#FAF6EB] p-5">
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Encoding vs security:</strong>{" "}
                Base64 and percent encoding technologies. JWT validation,
                HMACs, hashing passwords, and verifying security policies.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-[#FAF6EB] p-5">
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">JSON & Data vs DevOps:</strong>{" "}
                Formatting YAML is a data manipulation task. Validating a Kubernetes
                manifest or resolving Compose environment variables is related to deployment
                configuration.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-[#FAF6EB] p-5">
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Developer vs SEO:</strong>{" "}
                Parsing an HTTP response is a general implementation task, Interpreting 
                canonical, robots, hreflang, sitemap, or indexability signals is related
                to search diagnostics.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-[#FAF6EB] p-5">
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Formatting vs validation:</strong>{" "}
                Just because something is easier to read doesn’t mean it meets the 
                requirements of a schema, protocol,runtime, or application.
              </p>
            </div>
			</div>
        </SectionCard>

        <section className="mt-16 max-w-4xl border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Category Pages Explain the Boundaries; Tool Pages Handle the Exact Case
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Category Pages – Provide Guidance on Applicability. Tool Pages – Provide Detailed Information
            Category pages help you select the correct type of operation, and will show you 
            where static browser checks are not applicable. Each tool page provides information
            on its inputs, functionality, limitations, special cases and any relevant standards.
          </p>
        </section>
      </section>
    </main>
  );
}
