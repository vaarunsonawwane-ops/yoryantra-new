import Link from "next/link";
import { tools } from "@/app/data/tools";

export const metadata = {
  title: "Sitemap | Yoryantra",

  description:
    "Browse all pages, categories, and tools available on Yoryantra.",

  alternates: {
    canonical: "https://yoryantra.com/sitemap",
  },
};

const categoryOrder = [
  "Developer Tools",
  "DevOps Tools",
  "Encoding Tools",
  "JSON & Data Tools",
  "Security Tools",
  "SEO Tools",
];

const categoryLinks = [
  {
    title: "Developer Tools",
    href: "/categories/developer-tools",
  },
  {
    title: "DevOps Tools",
    href: "/categories/devops-tools",
  },
  {
    title: "Encoding Tools",
    href: "/categories/encoding-tools",
  },
  {
    title: "JSON & Data Tools",
    href: "/categories/json-tools",
  },
  {
    title: "Security Tools",
    href: "/categories/security-tools",
  },
  {
    title: "SEO Tools",
    href: "/categories/seo-tools",
  },
];

export default function SitemapPage() {
  const groupedTools = categoryOrder.map((category) => ({
    category,
    tools: tools.filter((tool) => tool.category === category),
  }));

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-[var(--dark)]">
          Sitemap
        </h1>

        <p className="mt-4 text-gray-600 leading-relaxed">
          Browse all important pages, categories, and practical tools available
          on Yoryantra.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900">
          Main Pages
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Home", href: "/" },
            { title: "Tools", href: "/tools" },
            { title: "Categories", href: "/categories" },
            { title: "About", href: "/about" },
            { title: "Contact", href: "/contact" },
            { title: "Privacy Policy", href: "/privacy-policy" },
            { title: "Terms", href: "/terms" },
            { title: "Disclaimer", href: "/disclaimer" },
          ].map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-700 transition hover:border-gray-300"
            >
              {page.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-semibold text-gray-900">
          Categories
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categoryLinks.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-700 transition hover:border-gray-300"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            Tools
          </h2>

          <p className="text-sm text-gray-500">
            {tools.length} tools across {categoryOrder.length} categories
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {groupedTools.map(({ category, tools: categoryTools }) => (
            <div
              key={category}
              className="rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category}
                </h3>

                <span className="text-sm text-gray-500">
                  {categoryTools.length}
                </span>
              </div>

              <div className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {categoryTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className="text-[15px] leading-6 text-gray-700 transition hover:text-[var(--green)]"
                  >
                    {tool.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
