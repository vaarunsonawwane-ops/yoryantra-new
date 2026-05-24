import Link from "next/link";

export const metadata = {
  title: "Yoryantra | Practical Tools for Everyday Work",

  description:
    "Simple browser tools to help you format, convert, check, clean, validate, and prepare things quickly — without unnecessary clutter.",

  alternates: {
    canonical: "https://yoryantra.com",
  },
};

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
      "Useful tools for JSON, regex, UUIDs, timestamps, debugging, tokens, and daily development work.",
    href: "/categories/developer-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Encode, decode, escape, clean, translate, and prepare values quickly.",
    href: "/categories/encoding-tools",
  },
  {
    title: "JSON & Data Tools",
    description:
      "Format, validate, compare, convert, and prepare structured data without confusion.",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    description:
      "Check headers, inspect tokens, generate hashes, and prepare safer values during development.",
    href: "/categories/security-tools",
  },
  {
    title: "SEO Tools",
    description:
      "Prepare metadata, check redirects, create previews, and handle everyday SEO related work.",
    href: "/categories/seo-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "Work with cron expressions, YAML, environment files, timestamps, and infrastructure related values.",
    href: "/categories/devops-tools",
  },
];

export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
        <div className="max-w-4xl">
		  <p className="text-sm font-medium text-[var(--light-gold)]">
		    ✦ Built for you
		  </p>

          <h1 className="mt-8 text-4xl font-semibold tracking-tight text-gray-950 md:text-6xl md:leading-tight">
            Practical tools for everyday work — clean, fast, and easy to use.
          </h1>

			<div className="mt-8 max-w-4xl space-y-5 text-lg leading-relaxed text-gray-600">
			  <p>
				Yoryantra is a growing collection of browser-based tools created
				to help you find what you are looking for quickly and save your time.
			  </p>

			  <p>
				Whether it is formatting, converting, checking, cleaning,
				validating, encoding, decoding or preparing something quickly —
				everything is built to be quick and easy to use.
			  </p>

			  <p>
				When you need a tool, you should be able to open it, use it, and
				move on without unnecessary clutter.
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
              Explore by category
            </h2>

            <p className="mt-4 leading-relaxed text-gray-600">
              Find tools based on what you are looking for — development,
              encoding, JSON and data, security, SEO, DevOps, and more.
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
            Why Yoryantra
          </h2>

			<div className="mt-6 space-y-5 text-gray-600 leading-relaxed">
			  <p>
				Yoryantra was created because many utility websites are filled with
				unnecessary clutter around simple things..
			  </p>

			  <p>
				Here, the tool stays at the center. The page is kept clean so you
				can use what you came for and continue with your work.
			  </p>
			</div>

        </div>
      </section>
    </main>
  );
}
