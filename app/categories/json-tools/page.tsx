import Link from "next/link";
import { tools } from "@/app/data/tools";
import SectionCard from "@/app/components/SectionCard";

const jsonTools = tools.filter((tool) => tool.category === "JSON & Data Tools");

export const metadata = {
  title: "JSON & Data Tools for Formatting, Validation, and Conversion | Yoryantra",
  description:
    "Format, validate, compare, query, transform, and convert JSON, CSV, XML, YAML, SQL, schemas, JSON Pointer, JSON Patch, and related structured data.",
  alternates: {
    canonical: "https://yoryantra.com/categories/json-tools",
  },
  openGraph: {
    title: "JSON & Data Tools for Formatting, Validation, and Conversion | Yoryantra",
    description:
      "Work with structured data while keeping parsing, formatting, validation, querying, schemas, and lossy conversions distinct.",
    url: "https://yoryantra.com/categories/json-tools",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON & Data Tools for Formatting, Validation, and Conversion | Yoryantra",
    description:
      "Inspect and transform JSON, CSV, XML, YAML, SQL, schemas, pointers, patches, and related structured data.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Categories</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">JSON & Data Tools</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            JSON & Data Tools for Structure, Validation, and Transformation
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Structured-data work is not one operation. Reformatting JSON, validating
            it against a schema, following a JSON Pointer, creating a Patch, flattening
            nested objects, or converting records into CSV can all start from the same
            input while making very different promises about what is preserved.
          </p>
        </div>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">All JSON & Data Tools</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse all 32 tools for JSON, CSV, XML, YAML formatting, SQL formatting,
              schema work, paths, pointers, patches, merges, tables, environment data,
              form data, query conversion, filtering, grouping, and line-delimited JSON.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jsonTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">{tool.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">
            Four Operations That Are Easy to Confuse
          </h2>
          <div className="mt-6 space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900">Formatting changes presentation</h3>
              <p className="mt-2">
                A formatter should make valid input easier to read without quietly
                changing strings, numeric spellings, comments where the format supports
                them, or other information the tool claims to preserve.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Validation checks rules</h3>
              <p className="mt-2">
                JSON syntax validation answers whether the text parses. JSON Schema
                validation asks a second question about types, required properties,
                ranges, patterns, arrays, and other constraints defined by a schema.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Querying selects existing data</h3>
              <p className="mt-2">
                JSON paths, keys, and RFC 6901 JSON Pointers identify values already in
                a document. They do not themselves define whether those values are valid
                for an application.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Transformation can change the model</h3>
              <p className="mt-2">
                Flattening, merging, grouping, filtering, or converting between formats
                can alter ordering, types, nesting, duplicate-field behavior, or how
                missing and null values are represented. Those rules need to be explicit.
              </p>
            </div>
          </div>
        </SectionCard>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">
            Where Information Can Be Lost Even When Conversion Succeeds
          </h2>
          <div className="mt-5 space-y-5 text-gray-600 leading-relaxed">
            <p>
              CSV is fundamentally tabular, while JSON can contain nested objects,
              arrays, booleans, nulls, and numbers. Converting JSON to CSV therefore
              requires decisions about columns, nested values, missing fields, and how
              values become text. Converting back cannot always reconstruct the original
              structure or types without additional rules.
            </p>
            <p>
              Environment variables are strings as well. Mapping JSON to dotenv-style
              assignments introduces choices about nesting, arrays, nulls, quoting, and
              key names. Type inference in the reverse direction is a convenience, not a
              property stored in the .env file itself.
            </p>
            <p>
              Number handling deserves similar care. JSON permits numeric text that can
              exceed JavaScript's exact integer range. Tools that parse and reserialize
              values need to avoid implying byte-for-byte preservation when the runtime
              number model may change the original spelling or precision.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">Standards That Define the Core Semantics</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">RFC 8259 — JSON</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Defines the JSON data-interchange format, including objects, arrays, strings, numbers, literals, and interoperability considerations.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://json-schema.org/specification" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">JSON Schema specification</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Defines schema vocabularies used to describe and validate JSON instance structure and constraints.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://www.rfc-editor.org/rfc/rfc6901" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">RFC 6901 — JSON Pointer</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Defines the escaping and token rules used to identify a specific value within a JSON document.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://www.rfc-editor.org/rfc/rfc6902" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">RFC 6902 — JSON Patch</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Defines add, remove, replace, move, copy, and test operations applied through JSON Pointer paths.</p>
            </div>
          </div>
        </section>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">Why YAML and SQL Appear Here</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            The standalone YAML Formatter and SQL Formatter are representation-focused
            tools: their primary job is to reshape source text while preserving its
            intended data or query meaning. Deployment-specific YAML work such as
            Kubernetes validation, Compose checks, and YAML/JSON conversion remains in
            DevOps because the surrounding operational context is part of the task.
          </p>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">Related Tool Categories</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/categories/developer-tools" className="yoryantra-btn-outline">Developer Tools</Link>
            <Link href="/categories/devops-tools" className="yoryantra-btn-outline">DevOps Tools</Link>
            <Link href="/categories/encoding-tools" className="yoryantra-btn-outline">Encoding Tools</Link>
            <Link href="/categories/security-tools" className="yoryantra-btn-outline">Security Tools</Link>
            <Link href="/categories/seo-tools" className="yoryantra-btn-outline">SEO Tools</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
