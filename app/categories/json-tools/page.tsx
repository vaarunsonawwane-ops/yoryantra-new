import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";

const jsonTools = tools.filter(
  (tool) => tool.category === "JSON & Data Tools"
);

const featuredTools = jsonTools.slice(0, 6);

export const metadata = {
  title: "JSON Tools Online Free | Yoryantra",

  description:
    "Use free online JSON tools for formatting, validation, minifying, diff checking, schema validation, JSON escaping, and JSON conversion workflows.",

  keywords: [
    "json tools",
    "online json tools",
    "json formatter",
    "json validator",
    "json minifier",
    "json diff checker",
    "json schema validator",
    "json to yaml converter",
    "xml to json converter",
    "developer json tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/categories/json-tools",
  },

  openGraph: {
    title: "JSON Tools Online Free | Yoryantra",

    description:
      "Free online JSON utilities for formatting, validation, minifying, comparing, schema checks, escaping, and data conversion.",

    url: "https://yoryantra.com/categories/json-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Tools Online Free | Yoryantra",

    description:
      "Free online JSON tools for formatting, validation, schema checks, diff comparison, escaping, and conversion workflows.",
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
    JSON & Data Tools
  </span>

</div>
	  
        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            JSON Tools for Formatting, Validation, and Data Conversion
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical JSON tools to format, validate, minify, compare,
            escape, and convert structured data during API debugging, backend
            development, configuration work, and data transformation tasks.
          </p>
        </div>

		{/* INTRO */}
		<div className="mt-12 grid gap-6 md:grid-cols-3">
		  <InfoCard
			title="Built for API Debugging"
			description="Format responses, validate payloads, compare JSON objects, and inspect structured data while working with APIs and backend systems."
		  />

		  <InfoCard
			title="Useful for Structured Data Workflows"
			description="Convert between JSON, YAML, and XML formats for configuration files, integrations, automation, and application data handling."
		  />

		  <InfoCard
			title="Fast Browser-Based Utilities"
			description="Most tools run directly inside your browser, making it easier to inspect, clean, and transform data without uploading content."
		  />
		</div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular JSON Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with common utilities for formatting JSON, validating data,
              comparing API responses, and checking schema rules.
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
              All JSON & Data Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse tools for formatting, validating, converting, escaping,
              comparing, and cleaning structured data.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jsonTools.map((tool) => (
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
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Where These JSON Tools Help
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Formatting API responses for easier debugging.",
              "Validating JSON before sending payloads to APIs.",
              "Comparing two JSON objects during testing.",
              "Checking JSON data against schema rules.",
              "Escaping JSON strings for logs, scripts, and payloads.",
              "Converting JSON into YAML configuration files.",
              "Transforming XML responses into JSON for modern APIs.",
              "Minifying JSON before storage or transmission.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* WHY MATTERS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Why JSON Tools Matter for Developers
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              JSON is used across APIs, databases, configuration files, logs,
              frontend applications, backend services, and automation systems.
              Small formatting or validation issues can break integrations and
              slow down debugging.
            </p>

            <p>
              Browser-based JSON utilities make common data tasks faster. They
              help developers inspect payloads, fix syntax errors, compare
              responses, validate schemas, and convert data formats during daily
              development work.
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
                What are JSON tools used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                JSON tools help developers format, validate, compare, minify,
                escape, and convert structured JSON data during development and
                debugging.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for API development?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JSON formatting, validation, schema checks, and diff
                comparison are commonly used while building and debugging APIs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I convert JSON into YAML or XML-related formats?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. This category includes JSON to YAML conversion, YAML to
                JSON conversion, and XML to JSON conversion tools.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON data uploaded to a server?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools process data locally inside your browser,
                so your structured data is not uploaded unless a specific tool
                clearly needs an external URL check.
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
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>

            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Security Tools
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
