import Link from "next/link";

const questions = [
  {
    title: "Can it be parsed?",
    text: "Syntax validation answers whether the text is valid JSON. It does not know whether the fields are useful or acceptable to your application.",
    href: "/tools/json-validator",
    label: "JSON Validator",
  },
  {
    title: "Does it match a contract?",
    text: "Schema validation can check types, required members, ranges, patterns, and other declared constraints after the JSON itself parses.",
    href: "/tools/json-schema-validator",
    label: "JSON Schema Validator",
  },
  {
    title: "What changed or where is a value?",
    text: "Diff, Pointer, key extraction, filtering, and path tools answer structural questions without converting the document to another format.",
    href: "/tools/json-pointer-evaluator",
    label: "JSON Pointer Evaluator",
  },
  {
    title: "How should it be transformed?",
    text: "CSV, ENV, form data, query strings, Markdown, XML, and YAML have different data models. Conversion requires explicit choices about what cannot be represented directly.",
    href: "/tools/json-to-url-query-converter",
    label: "JSON to URL Query Converter",
  },
];

const conversionCases = [
  {
    title: "JSON → CSV",
    text: "CSV is tabular. Nested objects and arrays need flattening, serialization, or a chosen column strategy, and spreadsheets add formula-injection concerns.",
  },
  {
    title: "JSON → environment variables",
    text: "Environment values are strings. Objects, arrays, booleans, null, and numbers need a naming and serialization convention before round-tripping is possible.",
  },
  {
    title: "JSON → query or form values",
    text: "Repeated keys, arrays, nesting, spaces, nulls, and booleans have several conventions. The receiver decides which convention is correct.",
  },
  {
    title: "XML ↔ JSON",
    text: "XML has attributes, namespaces, mixed text, element order, and repeated children that do not map to one universal JSON shape.",
  },
];

export const metadata = {
  title: "JSON and Data Guides for Validation, Schemas, and Conversion | Yoryantra",
  description:
    "Separate JSON parsing, schema validation, comparison, querying, patching, and conversion while understanding number, duplicate-key, and cross-format data-loss risks.",
  alternates: {
    canonical: "https://yoryantra.com/json-guides",
  },
  openGraph: {
    title: "JSON and Data Guides | Yoryantra",
    description:
      "Practical guidance for JSON syntax, schemas, querying, comparison, patching, and conversions where different data models can lose information.",
    url: "https://yoryantra.com/json-guides",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON and Data Guides | Yoryantra",
    description:
      "Choose the right JSON operation and understand what formatting, validation, querying, and conversion do not guarantee.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--light-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">JSON Guides</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Valid JSON Can Still Be the Wrong Data
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            JSON syntax is deliberately small, but real data work is not. A
            document can parse correctly and still violate an API contract,
            lose meaning during conversion, hide a duplicate member, overflow a
            JavaScript-safe integer, or use a path that points somewhere other
            than you expected. The first step is to identify which of those
            questions you are actually asking.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">Four Different Questions About the Same JSON</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {questions.map((question) => (
              <div key={question.title} className="self-start rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{question.text}</p>
                <Link href={question.href} className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  {question.label} →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Formatting vs re-serialization</h2>
            <p className="mt-4 leading-7 text-gray-600">
              A careful formatter can preserve source spellings that a
              parse-and-stringify cycle may normalize. That matters for very
              large numbers, exponent notation, negative zero, duplicate member
              names, and any workflow where exact source tokens are useful for
              debugging.
            </p>
            <Link href="/tools/json-formatter" className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
              JSON Formatter →
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Three JSON Details That Deserve Attention</h2>
            <div className="mt-5 space-y-4 leading-8 text-gray-600">
              <p>
                <strong className="font-semibold text-gray-900">Numbers:</strong>
                {" "}JSON itself does not impose JavaScript&apos;s safe-integer limit,
                but many implementations parse numbers into IEEE 754 binary64.
                Large integer identifiers and high-precision decimals can change
                if a tool re-serializes them through ordinary JavaScript numbers.
              </p>
              <p>
                <strong className="font-semibold text-gray-900">Duplicate member names:</strong>
                {" "}interoperability becomes uncertain because parsers may keep
                the first value, the last value, all values, or reject the input.
                Avoid relying on duplicate keys even when a parser accepts them.
              </p>
              <p>
                <strong className="font-semibold text-gray-900">Object order:</strong>
                {" "}member ordering is often preserved by tools for readability,
                but applications should not treat object-member order as the
                meaning of the data unless their own contract explicitly does so.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Where Conversion Stops Being Lossless</h2>
            <p className="mt-3 leading-7 text-gray-600">
              JSON has arrays, objects, strings, numbers, booleans, and null.
              Other formats do not always have the same types or nesting model.
            </p>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {conversionCases.map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools/json-to-csv" className="yoryantra-btn-outline">JSON to CSV</Link>
            <Link href="/tools/json-to-env-converter" className="yoryantra-btn-outline">JSON to ENV</Link>
            <Link href="/tools/json-to-form-data-converter" className="yoryantra-btn-outline">JSON to Form Data</Link>
            <Link href="/tools/xml-to-json-converter" className="yoryantra-btn-outline">XML to JSON</Link>
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">Pointer, Path, and Patch Are Different Ideas</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              JSON Pointer is a standard way to identify one location using
              escaped path tokens. JSON Patch is a standard list of operations
              such as add, remove, and replace that uses Pointer paths. JSONPath
              is standardized by RFC 9535 for querying JSON values, although
              older implementations may still have dialect differences. A
              JSONPath expression is not interchangeable with a Pointer.
            </p>
            <p>
              Use a Pointer when another standard asks for a precise location,
              Patch when you need a set of document mutations, and a query/path
              tool when you are exploring or selecting values.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tools/json-pointer-evaluator" className="yoryantra-btn-outline">JSON Pointer Evaluator</Link>
            <Link href="/tools/json-patch-generator" className="yoryantra-btn-outline">JSON Patch Generator</Link>
            <Link href="/tools/json-path-tester" className="yoryantra-btn-outline">JSON Path Tester</Link>
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Primary references</h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <a href="https://www.rfc-editor.org/rfc/rfc8259" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">JSON — RFC 8259 ↗</a>
            <a href="https://json-schema.org/draft/2020-12" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">JSON Schema Draft 2020-12 ↗</a>
            <a href="https://www.rfc-editor.org/rfc/rfc6901" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">JSON Pointer — RFC 6901 ↗</a>
            <a href="https://www.rfc-editor.org/rfc/rfc6902" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">JSON Patch — RFC 6902 ↗</a>
            <a href="https://www.rfc-editor.org/rfc/rfc9535" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">JSONPath — RFC 9535 ↗</a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/categories/json-tools" className="yoryantra-btn-outline">Browse JSON & Data Tools</Link>
          <Link href="/devops-resources" className="yoryantra-btn-outline">DevOps Resources</Link>
          <Link href="/resources" className="yoryantra-btn-outline">All Resource Guides</Link>
        </div>
      </section>
    </main>
  );
}
