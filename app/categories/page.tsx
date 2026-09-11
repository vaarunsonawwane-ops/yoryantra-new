import Link from "next/link";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

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
    examples: ["HTTP Request Parser", "Regex Tester", "Fetch to cURL Converter"],
  },
];

export const metadata = {
  title: "Browse Tools by Category | Yoryantra",
  description:
    "Browse Yoryantra by development, DevOps, security, SEO, JSON and data, or encoding workflow.",
  alternates: {
    canonical: "https://yoryantra.com/categories",
  },
  openGraph: {
    title: "Tool Categories | Yoryantra",
    description:
      "Choose tools by the kind of problem you are solving: development, DevOps, security, SEO, data, or encoding.",
    url: "https://yoryantra.com/categories",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tool Categories | Yoryantra",
    description:
      "Browse Yoryantra by development, DevOps, security, SEO, JSON and data, or encoding workflow.",
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
            Yoryantra groups 192 tools into six practical areas. The categories
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
              <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                {category.title}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                {category.description}
              </p>

              <p className="mt-5 text-xs leading-relaxed text-gray-500">
                Examples: {category.examples.join(", ")}
              </p>

              <span className="mt-6 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                Explore category →
              </span>
            </Link>
          ))}
        </div>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">
            When Two Categories Seem to Overlap
          </h2>

          <p className="mt-4 max-w-4xl text-gray-600 leading-relaxed">
            Category boundaries are based on purpose rather than file extension.
            That matters when one technology appears in several workflows.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Encoding vs security:</strong>{" "}
                Base64 and percent encoding change representation. JWT verification,
                HMACs, password hashing, and security-policy checks answer trust or
                protection questions.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">JSON & Data vs DevOps:</strong>{" "}
                formatting YAML is a data-shaping task; validating a Kubernetes
                manifest or resolving Compose environment variables is deployment
                configuration work.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Developer vs SEO:</strong>{" "}
                parsing an HTTP response is a general implementation task, while
                interpreting canonical, robots, hreflang, sitemap, or indexability
                signals belongs to search diagnostics.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Formatting vs validation:</strong>{" "}
                making text easier to read does not prove that it satisfies a schema,
                protocol, runtime, or application requirement.
              </p>
            </SectionMiniCard>
          </div>
        </SectionCard>

        <section className="mt-16 max-w-4xl border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Category Pages Explain the Boundaries; Tool Pages Handle the Exact Case
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            A category page helps you choose the right kind of operation and understand
            where static browser checks stop. Each individual tool then documents its
            own input rules, behavior, limitations, edge cases, and relevant standards.
            That separation keeps navigation useful without reducing technical topics to
            one generic explanation.
          </p>
        </section>
      </section>
    </main>
  );
}
