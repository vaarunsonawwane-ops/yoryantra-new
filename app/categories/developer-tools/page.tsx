import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const developerTools = tools.filter(
  (tool) => tool.category === "Developer Tools"
);

const featuredTools =
  developerTools.slice(0, 6);

export const metadata = {
  title:
    "Developer Tools Online Free | Yoryantra",

  description:
    "Use free online developer tools for regex testing, JWT decoding, JSON formatting, Base64 encoding, timestamps, UUID generation, and debugging workflows.",

  keywords: [
    "developer tools",
    "online developer tools",
    "regex tester",
    "jwt decoder",
    "json formatter",
    "base64 encoder",
    "uuid generator",
    "timestamp converter",
    "debugging tools",
    "developer utilities",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/categories/developer-tools",
  },

  openGraph: {
    title:
      "Developer Tools Online Free | Yoryantra",

    description:
      "Free online developer utilities for debugging, encoding, JSON formatting, JWT inspection, timestamps, and regex testing.",

    url:
      "https://yoryantra.com/categories/developer-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Developer Tools Online Free | Yoryantra",

    description:
      "Free online developer utilities for debugging, formatting, encoding, and testing workflows.",
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
    Developer Utilities
  </span>

</div>

        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Developer Tools for Debugging, Formatting, and Everyday Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical developer tools for debugging APIs, formatting JSON,
            decoding JWT tokens, testing regex patterns, converting timestamps,
            generating UUIDs, and handling encoded data during development.
          </p>
        </div>

		{/* INTRO */}
		<div className="mt-12 grid gap-6 md:grid-cols-3">
		<InfoCard
		  title="Small Tasks Developers Repeat Every Day"
		  description="From debugging payloads to formatting data and decoding values, these tools help reduce repetitive development friction during everyday work."
		/>

		<InfoCard
		  title="Built for Quick Checks, Not Complexity"
		  description="Sometimes you just want to inspect a JWT, format JSON, compare data, or validate an output without opening another tool or writing extra code."
		/>

		<InfoCard
		  title="Useful Across Frontend, Backend, and APIs"
		  description="Whether you work with APIs, authentication, testing, payloads, debugging, or browser logic, these utilities are designed to save time during development."
		/>
		</div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular Developer Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Frequently used utilities for API debugging, data inspection,
              encoding workflows, and structured data formatting.
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
              All Developer Utilities
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse tools for debugging, encoding, formatting, parsing, and
              testing during frontend and backend development.
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
			Small Development Tasks These Tools Make Easier
		  </h2>

		  <p className="mt-4 max-w-3xl text-gray-600 leading-relaxed">
			Development often slows down because of tiny repetitive tasks — checking a
			JWT payload, cleaning JSON, debugging encoded values, comparing responses,
			or quickly testing a regex before shipping code. These utilities are built
			for those everyday moments.
		  </p>

		  <div className="mt-8 grid gap-4 md:grid-cols-2">
			{[
			  "Quickly inspect API responses when something looks wrong.",
			  "Format messy JSON payloads before debugging or sharing them.",
			  "Check JWT tokens and encoded values during authentication work.",
			  "Test regex patterns before adding them to production logic.",
			  "Convert timestamps when logs or backend values are hard to read.",
			  "Generate UUIDs and identifiers during testing or development.",
			  "Inspect URL parameters and query strings while debugging requests.",
			  "Validate or clean structured data before deployment or release.",
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
            Why Browser-Based Developer Utilities Matter
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
			  When building something, developers often need to quickly format data, 
			  check values, test APIs, decode tokens, inspect payloads, or 
			  validate small things before continuing.
            </p>

            <p>
			  Developer tools help make these quick checks easier without needing 
			  to install software or leave the browser.
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
                What are developer utilities?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Developer utilities are tools that help with debugging,
                formatting, encoding, parsing, validation, and testing during
                software development.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for frontend and backend developers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. These tools support frontend development, backend APIs,
                DevOps workflows, testing, and structured data handling.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools require installation?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Most tools work directly inside your browser without any
                installation or signup.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are inputs processed on external servers?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser
                unless a specific utility requires an external URL check.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Tool Categories
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
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
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
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