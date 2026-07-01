import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const categories = [
  {
    title: "SEO Tools",
    description:
      "Metadata, indexing, redirects, hreflang, sitemaps, and technical SEO utilities.",
    href: "/categories/seo-tools",
    tools: [
      "Meta Tag Generator",
      "Hreflang Tag Generator",
      "robots.txt Generator",
    ],
  },

  {
    title: "Security Tools",
    description:
      "JWTs, hashes, tokens, API signing, CSP headers, and authentication checks.",
    href: "/categories/security-tools",
    tools: [
      "JWT Decoder",
      "SHA256 Generator",
      "RSA Key Generator",
    ],
  },

  {
    title: "JSON & Data Tools",
    description:
      "JSON formatting, validation, conversion, schema checks, and structured data utilities.",
    href: "/categories/json-tools",
    tools: [
      "JSON Formatter",
      "JSON Validator",
      "JSON Diff Checker",
    ],
  },

  {
    title: "DevOps Tools",
    description:
      "Docker, Kubernetes, YAML, cron expressions, and infrastructure tasks.",
    href: "/categories/devops-tools",
    tools: [
      "Docker Compose Validator",
      "Kubernetes YAML Validator",
      ".env File Parser",
    ],
  },

  {
    title: "Encoding Tools",
    description:
      "Base64, URL encoding, HTML entities, JSON escaping, and text transformation.",
    href: "/categories/encoding-tools",
    tools: [
      "Base64 Encoder Decoder",
      "URL Encoder Decoder",
      "HTML Encoder Decoder",
    ],
  },

  {
    title: "Developer Utilities",
    description:
      "Regex testing, timestamps, debugging, UUIDs, and development tasks.",
    href: "/categories/developer-tools",
    tools: [
      "Regex Tester",
      "UUID Generator",
      "Timestamp Converter",
    ],
  },
];

export const metadata = {
  title: "Browse Tools by Category | Yoryantra",

  description:
    "Browse Yoryantra tools by development, DevOps, security, SEO, JSON, and encoding category.",

  alternates: {
    canonical: "https://yoryantra.com/categories",
  },

  openGraph: {
    title: "Tool Categories | Yoryantra",

    description:
      "Find focused tools for development, DevOps, security, SEO, JSON, and encoding tasks.",

    url: "https://yoryantra.com/categories",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Tool Categories | Yoryantra",

    description:
      "Browse development, DevOps, security, SEO, JSON, and encoding tool categories.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">

        {/* HERO */}
        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 md:text-6xl md:leading-tight">
            Browse Tools by What You Need to Do
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-gray-600">
            Find focused tools for development, DevOps, security, SEO, JSON,
            and encoding without searching through one long list.
          </p>
        </div>

        {/* CATEGORY GRID */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

              <span className="mt-6 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                Explore category →
              </span>
            </Link>
          ))}
        </div>

		{/* WHY CATEGORIES */}
		<SectionCard>
		  <h2 className="text-2xl font-semibold text-gray-900">
			Why Yoryantra Groups Tools by Category
		  </h2>

		  <div className="mt-5 space-y-5 text-gray-600 leading-relaxed">
			<p>
			  Different tasks often need different kinds of tools. A developer
			  debugging an API, an SEO checking redirects, and someone validating
			  configuration files should not have to search through the same
			  unstructured list.
			</p>

			<p>
			  Categories keep related tools together, making it easier to compare
			  similar options and move between connected tasks such as formatting,
			  validation, conversion, inspection, and generation.
			</p>

			<p>
			  The categories are designed around practical workflows rather than
			  random utility collections, so you can reach the right tool faster
			  and understand where it fits in your work.
			</p>
		  </div>
		</SectionCard>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Popular Tool Areas
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>

            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Security Tools
            </Link>

            <Link
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
            </Link>

            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Utilities
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
