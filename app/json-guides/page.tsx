import Link from "next/link";

const conversionCases = [
  {
    title: "JSON → CSV",
    text: "CSV is a table format, nested objects and arrays must be flattened/serialized or decided to have certain columns. Spreadsheets also introduce injection of formulae..",
  },
  {
    title: "JSON → environment variables",
    text: "Environment variables are strings. Objects, arrays, booleans, nulls and numbers must be given naming and serialization rules.",
  },
  {
    title: "JSON → query or form values",
    text: "Multiple rules exist for dealing with duplicate keys, arrays, nesting, whitespace, nulls and booleans. The recipient will decide what is the correct rule.",
  },
  {
    title: "XML ↔ JSON",
    text: "XML has attributes, namespaces, mixed content, ordered elements and duplicate children. There is not a single JSON format that can represent this.",
  },
];

export const metadata = {
  title: "Fix JSON Errors: Validation, Schema & Conversion | Yoryantra",
  description:
    "Understand JSON schema, validation, paths and patches, and check what can go wrong when converting JSON to other formats.",
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
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--gold-text)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">JSON Guides</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Valid JSON does not necessarily mean correct data
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            JSON is a very simple syntax and can be invalid in many ways. 
			Your JSON may be valid but might cause issues with your API 
			agreement, could cause data loss, have duplicate members, go 
			beyond the integer limits of JavaScript or not have the correct path.
          </p>
        </div>

        <section className="mt-18 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Formatting</h2>
            <p className="mt-4 leading-7 text-gray-600">
              If you’re careful with your formatting then you can retain the 
			  original formatting of your data. This is useful for large numbers, 
			  exponents, negative zero, duplicated member names and anything where 
			  knowing the exact original token is helpful for debugging.
            </p>
            <Link href="/tools/json-formatter" className="mt-5 inline-flex text-sm font-semibold text-[var(--gold-text)]">
              JSON Formatter →
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Three Things to Watch out for when using JSON</h2>
            <div className="mt-5 space-y-4 leading-8 text-gray-600">
              <p>
                <strong className="font-semibold text-gray-900">Numbers:</strong>
                {" "}Although there are no restrictions on numbers in JSON as there 
				are in JavaScript for safe integers, many implementations will parse 
				them as IEEE 754 binary64. This can cause issues if your large integers
				or high precision decimals change when re-serialised.
              </p>
              <p>
                <strong className="font-semibold text-gray-900">Duplicate Member Names:</strong>
                {" "}Interoperability is not guaranteed as different parsers may handle 
				duplicates in different ways. This could be taking the first, last, all 
				or rejecting the input. Try not to depend on duplicate keys.
              </p>
              <p>
                <strong className="font-semibold text-gray-900">Order:</strong>
                {" "}Whilst many tools will preserve the order of members in an object, 
				it should not be assumed that the order of members in an object has 
				any meaning unless agreed upon.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Where Conversion Is Not Lossless</h2>
            <p className="mt-3 leading-7 text-gray-600">
              JSON contains arrays, objects, strings, numbers, booleans and nulls. 
			  Not every format will have the same data types and structure.
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
          <h2 className="text-2xl font-semibold text-gray-900">Pointer, Path & Patch</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              JSON Pointer allows you to reference a specific location via an 
			  escaped path. JSON Patch provides a set of standard operations 
			  (add, remove, replace) that use Pointers to define the paths. 
			  JSONPath is a standardised way to query JSON values as defined by RFC 9535. 
			  Older implementations may vary between dialects. JSONPath expressions are 
			  not the same as Pointers.
            </p>
            <p>
              Use a Pointer when another standard requires a specific location. 
			  Use a Patch when you want to make changes to a document. Use a 
			  query/path tool when you want to explore or select values.
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
        </div>
      </section>
    </main>
  );
}
