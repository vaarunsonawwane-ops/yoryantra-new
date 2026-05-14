import Link from "next/link";

export const metadata = {
  title: "Tool Categories | Yoryantra",

  description:
    "Explore Yoryantra tool categories including formatters, encoders, developer utilities, text tools, and productivity utilities.",
};

const categories = [
  {
    title: "Formatters",
    description:
      "Clean, beautify, and structure JSON, SQL, and other formatted content instantly.",
    tools: [
      {
        name: "JSON Formatter",
        href: "/tools/json-formatter",
      },
      {
        name: "SQL Formatter",
        href: "/tools/sql-formatter",
      },
    ],
  },

  {
    title: "Encoders & Decoders",
    description:
      "Encode and decode Base64, URLs, JWT tokens, and other web-friendly formats.",
    tools: [
      {
        name: "Base64 Encoder Decoder",
        href: "/tools/base64-encoder-decoder",
      },
      {
        name: "URL Encoder Decoder",
        href: "/tools/url-encoder-decoder",
      },
      {
        name: "JWT Decoder",
        href: "/tools/jwt-decoder",
      },
    ],
  },

  {
    title: "Text Utilities",
    description:
      "Useful tools for writing, formatting, counting, transforming, and cleaning text.",
    tools: [
      {
        name: "Text Case Converter",
        href: "/tools/text-case-converter",
      },
      {
        name: "Slug Generator",
        href: "/tools/slug-generator",
      },
      {
        name: "Word Counter",
        href: "/tools/word-counter",
      },
    ],
  },

  {
    title: "Developer Utilities",
    description:
      "Practical utilities for developers, debugging workflows, and everyday coding tasks.",
    tools: [
      {
        name: "Regex Tester",
        href: "/tools/regex-tester",
      },
      {
        name: "Timestamp Converter",
        href: "/tools/timestamp-converter",
      },
    ],
  },
];

export default function CategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">

      {/* HEADER */}
      <div className="max-w-3xl">

        <h1 className="text-4xl font-bold text-gray-900">
          Tool Categories
        </h1>

        <p className="mt-5 text-lg text-gray-600 leading-relaxed">
          Explore thoughtfully organized utility categories across
          formatting, encoding, productivity, development,
          and text-processing workflows.
        </p>

      </div>

      {/* CATEGORY GRID */}
      <div className="grid md:grid-cols-2 gap-8 mt-14">

        {categories.map((category) => (
          <div
            key={category.title}
            className="border border-gray-200 rounded-3xl p-8 bg-white"
          >

            <h2 className="text-2xl font-semibold text-gray-900">
              {category.title}
            </h2>

            <p className="mt-4 text-gray-600 leading-relaxed">
              {category.description}
            </p>

            <div className="mt-6 flex flex-col gap-3">

              {category.tools.map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="text-gray-700 hover:text-[var(--light-gold)] transition-colors duration-200"
                >
                  → {tool.name}
                </Link>
              ))}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}