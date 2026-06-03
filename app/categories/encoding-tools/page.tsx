import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const encodingTools = tools.filter(
  (tool) => tool.category === "Encoding Tools"
);

const featuredTools = encodingTools.slice(0, 6);

export const metadata = {
  title: "Encoding Tools Online Free | Yoryantra",

  description:
    "Use free online encoding tools for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, text conversion, slugs, and QR code workflows.",

  keywords: [
    "encoding tools",
    "online encoding tools",
    "base64 encoder",
    "base64 decoder",
    "base64url encoder",
    "url encoder decoder",
    "html encoder decoder",
    "json escape unescape",
    "text converter",
    "slug generator",
  ],

  alternates: {
    canonical: "https://yoryantra.com/categories/encoding-tools",
  },

  openGraph: {
    title: "Encoding Tools Online Free | Yoryantra",

    description:
      "Free online encoding utilities for Base64, Base64URL, URL encoding, HTML entities, JSON escaping, text conversion, slugs, and QR codes.",

    url: "https://yoryantra.com/categories/encoding-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Encoding Tools Online Free | Yoryantra",

    description:
      "Free online encoding tools for Base64, URLs, HTML entities, JSON escaping, slugs, text conversion, and QR workflows.",
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
		  Encoding Tools
		  </span>

		</div>
	  
        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Encoding Tools for URLs, Base64, HTML, and Structured Text
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical encoding utilities to convert Base64 strings, encode
            URLs, handle HTML entities, escape JSON text, generate slugs, and
            prepare text values for development and SEO workflows.
          </p>
        </div>

		{/* INTRO */}
		<div className="mt-12 grid gap-6 md:grid-cols-3">
		<InfoCard
		  title="Made for Everyday Web and API Work"
		  description="URLs, Base64 values, HTML entities, encoded strings, and request payloads appear constantly in frontend, backend, and API workflows. These tools make them easier to inspect and transform."
		/>

		<InfoCard
		  title="Useful When Data Looks Broken or Unreadable"
		  description="Sometimes values arrive encoded, escaped, or difficult to interpret. Quickly decode, clean, convert, or re-encode data without opening extra software or writing helper scripts."
		/>

		<InfoCard
		  title="Fast Utilities for Debugging and Data Handling"
		  description="Whether you are testing APIs, debugging URLs, handling JWT-related formats, or cleaning browser-safe values, these tools are designed for quick everyday use."
		/>
		</div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular Encoding Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with common utilities for Base64, URLs, HTML entities,
              JSON-safe strings, and text transformation tasks.
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
              All Encoding Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse utilities for encoding, decoding, escaping, slug creation,
              QR code generation, and safe text transformation.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {encodingTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[var(--light-gold)]">
                  {tool.title}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-gray-600">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

		{/* USE CASES */}
		<SectionCard>
		  <h2 className="text-2xl font-semibold text-gray-900">
			Everyday Situations Where Encoding Tools Save Time
		  </h2>

		  <p className="mt-4 max-w-3xl text-gray-600 leading-relaxed">
			Encoded values show up everywhere — URLs, APIs, authentication flows,
			browser debugging, tracking links, escaped text, and structured payloads.
			These tools help make unreadable or messy values easier to work with during
			everyday development and troubleshooting.
		  </p>

		  <div className="mt-8 grid gap-4 md:grid-cols-2">
			{[
			  "Decode Base64 values when logs or payloads are hard to understand.",
			  "Work with Base64URL strings used in JWTs and authentication flows.",
			  "Encode URLs safely before sharing links or building requests.",
			  "Escape HTML entities before rendering user-generated content.",
			  "Prepare JSON-safe values for logs, scripts, or API payloads.",
			  "Generate cleaner URL slugs for pages, blogs, and landing pages.",
			  "Convert text formatting when content needs quick cleanup.",
			  "Create QR codes for links, campaigns, forms, or shared resources.",
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
            Why Encoding Tools Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Sometimes text needs to be encoded, decoded, escaped, or 
			  converted before it works properly in URLs, APIs, HTML, scripts, logs, 
			  or authentication systems.
            </p>

            <p>
              Small encoding mistakes can change values, break links, or create wrong results. 
			  Encoding tools help make these quick checks easier.
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
                What are encoding tools used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Encoding tools help convert text, URLs, HTML entities, Base64
                strings, and JSON-safe values into formats that work correctly
                across web systems.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for API debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Encoding and decoding are common while working with API
                payloads, JWT values, query strings, logs, and structured data.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between Base64 and Base64URL?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Base64URL is a URL-safe version of Base64 commonly used in JWTs
                and web authentication workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools upload my data?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser,
                so your encoded strings and text values are not uploaded unless
                a specific tool clearly needs an external URL check.
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
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Utilities
            </Link>

            <Link
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
            </Link>

            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Security Tools
            </Link>

            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>

            <Link
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
