import Link from "next/link";

export const metadata = {
  title: "Yoryantra | Practical Browser Tools for Everyday Work",

  description:
    "Practical browser tools for development, DevOps, security, SEO, JSON, encoding, and everyday technical work.",

  alternates: {
    canonical: "https://yoryantra.com",
  },

  openGraph: {
    title: "Yoryantra | Practical Tools for Everyday Work",

    description:
      "Simple browser tools to help you format, convert, check, clean, validate, and prepare things quickly — without unnecessary clutter.",

    url: "https://yoryantra.com",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Yoryantra | Practical Tools for Everyday Work",

    description:
      "Simple browser tools to help you format, convert, check, clean, validate, and prepare things quickly — without unnecessary clutter.",
  },
};

const categories = [
  {
    title: "Developer Tools",
    description:
      "Work with JSON, regex, UUIDs, timestamps, tokens, API requests, and everyday debugging tasks.",
    href: "/categories/developer-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Encode and decode Base64, URLs, HTML entities, JSON strings, slugs, and web text.",
    href: "/categories/encoding-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Format, validate, compare, convert, and inspect structured data used in APIs and applications.",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    description:
      "Inspect tokens, work with hashes and signatures, review headers, and prepare security-related values.",
    href: "/categories/security-tools",
  },
  {
    title: "SEO Tools",
    description:
      "Prepare metadata, review redirects and canonicals, check crawl signals, and build campaign URLs.",
    href: "/categories/seo-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "Review YAML, Docker, Kubernetes, environment files, cron schedules, and deployment configuration.",
    href: "/categories/devops-tools",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pt-4 pb-20 md:pt-8 md:pb-24">
        <div className="max-w-4xl">
		  <p className="text-sm font-medium text-[var(--light-gold)]">
		    ✦ Built for you
		  </p>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 md:text-5xl md:leading-tight">
            Practical browser tools for everyday technical work.
          </h1>

			<div className="mt-8 max-w-4xl space-y-5 text-lg leading-relaxed text-gray-600">
			  <p>
				Yoryantra is a growing collection of focused browser tools for
				development, DevOps, security, SEO, JSON, encoding, and related
				technical tasks.
			  </p>

			  <p>
				Use them to format data, validate files, inspect values, convert
				text, check configuration, and prepare information for another
				system.
			  </p>

			  <p>
				The idea is simple: open the tool, complete the task, understand
				the result, and continue your work without unnecessary clutter.
			  </p>
			</div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/tools"
              className="rounded-xl bg-[var(--green)] px-6 py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:opacity-95"
            >
              Explore Tools
            </Link>

            <Link
              href="/categories"
              className="rounded-xl border border-[var(--green)] bg-white px-6 py-3 text-sm font-medium text-[var(--green)] transition hover:-translate-y-0.5 hover:bg-green-50"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-gray-100 bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
              Browse tools by category
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Start with the type of task you need to complete, then move
              through related tools without searching through one long list.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-[var(--light-gold)]">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {category.description}
                </p>

                <p className="mt-5 text-sm font-medium text-[var(--light-gold)]">
                  Explore category →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY YORYANTRA */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-4xl">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-950">
            Why Yoryantra Exists
          </h2>

			<div className="mt-6 space-y-5 text-gray-600 leading-relaxed">
			  <p>
			    Yoryantra was created because many utility websites make small
			    technical tasks feel harder than they need to be.
			  </p>

			  <p>
			    Sometimes you only need to format a payload, inspect a token,
			    validate a file, convert a value, or check a configuration before
			    moving back to the main task.
			  </p>

			  <p>
			    You can also read{" "}
			    <Link
			      href="/how-yoryantra-tools-are-built"
			      className="font-semibold text-[var(--light-gold)] hover:underline"
			    >
			      how Yoryantra tools are selected, tested, and improved
			    </Link>
			    .
			  </p>
			</div>

        </div>
      </section>
    </main>
  );
}
