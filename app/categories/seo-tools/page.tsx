import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const seoTools = tools.filter(
  (tool) => tool.category === "SEO Tools"
);

const featuredTools = seoTools.slice(0, 6);

export const metadata = {
  title: "SEO Tools for Metadata, Indexing, Redirects, and Technical SEO | Yoryantra",

  description:
    "Use practical SEO tools for meta tags, Open Graph, hreflang, robots.txt, sitemaps, redirects, UTM links, indexing checks, and technical SEO workflows.",

  keywords: [
    "seo tools",
    "seo audit tools",
    "technical seo tools",
    "online seo tools",
    "meta tag generator",
    "hreflang generator",
    "robots.txt generator",
    "sitemap generator",
    "utm builder",
    "redirect checker",
  ],

  alternates: {
    canonical: "https://yoryantra.com/categories/seo-tools",
  },

  openGraph: {
    title: "SEO Tools for Metadata, Indexing, Redirects, and Technical SEO | Yoryantra",

    description:
      "Practical SEO tools for metadata, indexing, redirects, hreflang, sitemaps, robots rules, and campaign tracking workflows.",

    url: "https://yoryantra.com/categories/seo-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "SEO Tools for Metadata, Indexing, Redirects, and Technical SEO | Yoryantra",

    description:
      "SEO tools for technical SEO, metadata, indexing, redirects, sitemaps, robots rules, and campaign tracking.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
	  
{/* BREADCRUMB */}
<div className="mb-8 flex items-center text-sm text-gray-500">

  <Link
    href="/"
    className="hover:!text-[var(--light-gold)] transition-colors duration-200"
  >
    Home
  </Link>

  <span className="mx-2">/</span>

  <Link
    href="/categories"
    className="hover:!text-[var(--light-gold)] transition-colors duration-200"
  >
    Categories
  </Link>

  <span className="mx-2">/</span>

  <span className="text-gray-900">
    SEO Tools
  </span>

</div>
	  
        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Technical SEO Tools for Metadata, Indexing, and Site Audits
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical SEO tools to create metadata, inspect redirects,
            build tracking URLs, generate hreflang tags, prepare robots.txt
            rules, and improve how search engines understand your website.
          </p>
        </div>

		{/* INTRO */}
		<div className="mt-12 grid gap-6 md:grid-cols-3">
		<InfoCard
		  title="Fix Small Technical SEO Issues Before They Grow"
		  description="Metadata, redirects, canonicals, robots rules, structured URLs, and crawl settings can quietly affect visibility. These tools help surface and simplify those technical details."
		/>

		<InfoCard
		  title="Useful for Marketers, Developers, and Site Owners"
		  description="Whether you manage landing pages, content sites, applications, or technical SEO tasks, these utilities are designed to make everyday checks faster and easier."
		/>

		<InfoCard
		  title="Quick Checks Without Complex SEO Software"
		  description="Generate, inspect, validate, and troubleshoot common SEO elements directly in your browser without jumping between multiple dashboards or tools."
		/>
		</div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular SEO Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with these frequently used tools for metadata, search
              appearance, indexing rules, and international SEO setup.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
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

        {/* ALL TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              All SEO Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse the complete SEO tool set for technical checks, campaign
              URLs, metadata generation, and search optimization tasks.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {seoTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {tool.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

		{/* USE CASES */}
		<SectionCard>
		  <h2 className="text-2xl font-semibold text-gray-900">
			Small Technical SEO Tasks These Tools Help Simplify
		  </h2>

		  <p className="mt-4 max-w-3xl text-gray-600 leading-relaxed">
			Technical SEO is often about small details that quietly affect visibility —
			redirects, metadata, canonical signals, tracking links, crawl rules, and
			structured page information. These tools help make those everyday checks
			faster and easier to manage.
		  </p>

		  <div className="mt-8 grid gap-4 md:grid-cols-2">
			{[
			  "Create titles and meta descriptions while preparing pages for search.",
			  "Generate Open Graph tags so links look cleaner when shared socially.",
			  "Prepare hreflang tags for multilingual or international websites.",
			  "Check redirects when pages move or URLs stop behaving as expected.",
			  "Generate sitemap and robots-related files during SEO setup.",
			  "Build UTM links for campaign tracking and analytics reporting.",
			  "Review canonical URLs when duplicate page signals become confusing.",
			  "Inspect tracking parameters and messy URLs during debugging.",
			].map((item) => (
			  <SectionMiniCard key={item}>
				<p className="text-sm leading-relaxed text-gray-700">
				  {item}
				</p>
			  </SectionMiniCard>
			))}
		  </div>
		</SectionCard>

        {/* WHY MATTERS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why Technical SEO Tools Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Technical SEO includes things like redirects, metadata, canonical tags, 
			  robots.txt, sitemaps, URLs, and page signals used by search engines.
            </p>

            <p>
              Small mistakes can affect how pages are crawled, understood, or 
			  indexed. SEO tools help make these checks easier before publishing 
			  changes.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                What are SEO tools used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                SEO tools help improve how search engines discover, understand,
                preview, and rank website pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for technical SEO?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This category focuses on technical SEO tasks such as
                metadata, redirects, canonical URLs, hreflang tags, robots.txt,
                sitemap structure, and tracking URLs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can developers use these SEO tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. These tools are useful for developers building websites,
                landing pages, frontend apps, and SEO-focused pages.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools upload my data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools run directly in your browser. Inputs are
                not uploaded unless a specific tool clearly needs an external
                URL check.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED CATEGORIES */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Tool Categories
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
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
