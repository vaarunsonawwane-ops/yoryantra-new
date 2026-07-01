import Link from "next/link";

const workflowGroups = [
  {
    title: "Clean and validate incoming JSON",
    description:
      "Formatting, validation, minifying, and escaping solve different problems. Start by deciding whether you need readability, syntax checking, compact output, or a JSON-safe string.",
    steps: [
      {
        title: "Make the payload readable",
        detail:
          "Use JSON Formatter when the data is valid but difficult to inspect because it is compressed or poorly indented.",
        href: "/tools/json-formatter",
        linkLabel: "Open JSON Formatter",
      },
      {
        title: "Find syntax errors",
        detail:
          "Use JSON Validator when parsing fails or you need to locate invalid commas, quotes, brackets, or other structural problems.",
        href: "/tools/json-validator",
        linkLabel: "Open JSON Validator",
      },
      {
        title: "Reduce unnecessary whitespace",
        detail:
          "Use JSON Minifier when the data is already valid and you need compact output for storage, transport, or a test fixture.",
        href: "/tools/json-minifier",
        linkLabel: "Open JSON Minifier",
      },
      {
        title: "Prepare JSON for a string context",
        detail:
          "Use JSON Escape Unescape when JSON must be embedded inside logs, code, environment values, or another quoted string.",
        href: "/tools/json-escape-unescape",
        linkLabel: "Open JSON Escape Unescape",
      },
    ],
  },
  {
    title: "Validate structure with JSON Schema",
    description:
      "Valid JSON can still contain the wrong fields, types, or required values. Schema tools help check structure rather than syntax alone.",
    steps: [
      {
        title: "Create a starting schema",
        detail:
          "Use JSON Schema Generator to infer a draft schema from representative sample data.",
        href: "/tools/json-schema-generator",
        linkLabel: "Open JSON Schema Generator",
      },
      {
        title: "Validate data against the schema",
        detail:
          "Use JSON Schema Validator to check required fields, value types, nested objects, arrays, and other declared rules.",
        href: "/tools/json-schema-validator",
        linkLabel: "Open JSON Schema Validator",
      },
      {
        title: "Generate TypeScript types",
        detail:
          "Use JSON Schema to TypeScript Converter when a schema needs to become interfaces or types for application code.",
        href: "/tools/json-schema-to-typescript-converter",
        linkLabel: "Open JSON Schema to TypeScript Converter",
      },
      {
        title: "Test exact locations",
        detail:
          "Use JSON Pointer Evaluator or JSONPath Tester when you need to inspect a specific value inside a large nested document.",
        href: "/tools/json-pointer-evaluator",
        linkLabel: "Open JSON Pointer Evaluator",
      },
    ],
  },
  {
    title: "Compare, merge, and patch JSON safely",
    description:
      "A visual difference, a merged document, and a formal patch are separate outputs. Choose the tool that matches how the change will be reviewed or applied.",
    steps: [
      {
        title: "Inspect differences",
        detail:
          "Use JSON Diff Checker to compare two documents and review added, removed, or changed values.",
        href: "/tools/json-diff-checker",
        linkLabel: "Open JSON Diff Checker",
      },
      {
        title: "Combine documents",
        detail:
          "Use JSON Merge Tool when multiple objects need to be combined under a clear merge strategy.",
        href: "/tools/json-merge-tool",
        linkLabel: "Open JSON Merge Tool",
      },
      {
        title: "Create patch operations",
        detail:
          "Use JSON Patch Generator to produce add, remove, and replace operations using JSON Pointer paths.",
        href: "/tools/json-patch-generator",
        linkLabel: "Open JSON Patch Generator",
      },
      {
        title: "Normalize key order",
        detail:
          "Use JSON Sort Keys when stable ordering will make code review, snapshots, and comparisons easier.",
        href: "/tools/json-sort-keys",
        linkLabel: "Open JSON Sort Keys",
      },
    ],
  },
];

const conversionTools = [
  {
    title: "JSON to CSV",
    description:
      "Convert arrays of objects into rows and columns. Review nested values before assuming every JSON structure maps cleanly to a table.",
    href: "/tools/json-to-csv",
  },
  {
    title: "CSV to JSON",
    description:
      "Convert CSV rows into JSON objects while checking headers, quoting, empty cells, and type interpretation.",
    href: "/tools/csv-to-json",
  },
  {
    title: "JSON to YAML Converter",
    description:
      "Convert JSON into YAML for configuration and infrastructure workflows while preserving the underlying data structure.",
    href: "/tools/json-to-yaml-converter",
  },
  {
    title: "YAML to JSON Converter",
    description:
      "Convert YAML into JSON when an API, script, or application expects strict JSON syntax.",
    href: "/tools/yaml-to-json-converter",
  },
  {
    title: "XML to JSON Converter",
    description:
      "Transform XML into JSON while reviewing attributes, repeated elements, text nodes, and other format differences.",
    href: "/tools/xml-to-json-converter",
  },
  {
    title: "JSON to Form Data Converter",
    description:
      "Turn JSON values into FormData-style entries for browser requests, uploads, and API testing.",
    href: "/tools/json-to-form-data-converter",
  },
];

const largeDataTools = [
  {
    title: "NDJSON Formatter Validator",
    description:
      "Validate and format newline-delimited JSON where each line represents a separate JSON record.",
    href: "/tools/ndjson-formatter-validator",
  },
  {
    title: "JSON Lines to JSON Converter",
    description:
      "Convert JSON Lines or NDJSON records into a standard JSON array, or move a JSON array back into line-based records.",
    href: "/tools/json-lines-to-json-converter",
  },
  {
    title: "JSON Array Filter Tool",
    description:
      "Filter large arrays by conditions without manually editing or scanning every object.",
    href: "/tools/json-array-filter-tool",
  },
  {
    title: "JSON Array Group By Tool",
    description:
      "Group array items by a selected field to inspect categories, counts, and repeated values.",
    href: "/tools/json-array-group-by-tool",
  },
  {
    title: "JSON Key Extractor",
    description:
      "Collect object keys and paths from nested data when documenting or auditing an unknown payload.",
    href: "/tools/json-key-extractor",
  },
  {
    title: "JSON Flatten Unflatten Tool",
    description:
      "Flatten nested structures into path-based keys or rebuild nested JSON from flattened data.",
    href: "/tools/json-flatten-unflatten-tool",
  },
];

export const metadata = {
  title: "JSON Workflows for Validation, Conversion, and APIs | Yoryantra",
  description:
    "Follow practical JSON workflows for formatting, syntax validation, schema checks, comparison, patches, conversions, JSON Lines, arrays, and API payload debugging.",
  keywords: [
    "JSON workflow guide",
    "JSON validation workflow",
    "JSON schema guide",
    "JSON comparison workflow",
    "JSON conversion guide",
    "JSON Lines tools",
    "API JSON debugging",
    "structured data workflow",
  ],
  alternates: {
    canonical: "https://yoryantra.com/json-guides",
  },
  openGraph: {
    title: "JSON Workflows for Validation, Conversion, and APIs | Yoryantra",
    description:
      "Practical workflows for choosing and using Yoryantra JSON tools for formatting, validation, schemas, comparison, patches, conversions, arrays, and API payloads.",
    url: "https://yoryantra.com/json-guides",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Workflows for Validation, Conversion, and APIs | Yoryantra",
    description:
      "Choose the right Yoryantra JSON tool for formatting, validation, schemas, comparison, patching, conversions, arrays, and API debugging.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link
            href="/"
            className="transition-colors duration-200 hover:!text-[var(--light-gold)]"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-900">JSON Guides</span>
        </div>

        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--light-gold)]">
            Practical JSON workflows
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Choose the Right JSON Tool for the Data Problem
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            This guide explains when to format, validate, compare, merge,
            patch, convert, filter, or inspect JSON during API debugging,
            backend development, testing, and structured-data work.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/categories/json-tools" className="yoryantra-btn-outline">
              Browse all JSON & Data Tools
            </Link>

            <Link href="/contact" className="yoryantra-btn-outline">
              Report a tool issue
            </Link>
          </div>
        </div>

        <section className="mt-14 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Before Changing a JSON Payload
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Formatting changes whitespace and indentation, not the meaning of valid JSON.",
              "Valid JSON can still be wrong for the application when fields, types, or required values do not match expectations.",
              "Duplicate object keys are ambiguous because parsers may keep different values.",
              "Large integers can lose precision in JavaScript-based workflows when they exceed the safe integer range.",
              "JSON does not support comments, trailing commas, single-quoted property names, or undefined values.",
              "Conversions between JSON, CSV, XML, YAML, and form data may be lossy when the formats express structure differently.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-relaxed text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Three Common JSON Workflows
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Similar JSON tools exist because readability, syntax validation,
              schema validation, comparison, merging, and patch generation are
              different operations.
            </p>
          </div>

          <div className="mt-8 space-y-8">
            {workflowGroups.map((group) => (
              <article
                key={group.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
              >
                <div className="max-w-3xl">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {group.title}
                  </h3>

                  <p className="mt-3 leading-relaxed text-gray-600">
                    {group.description}
                  </p>
                </div>

                <div className="mt-7 grid gap-5 md:grid-cols-2">
                  {group.steps.map((step, index) => (
                    <div
                      key={step.href}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--light-gold)]">
                        Step {index + 1}
                      </p>

                      <h4 className="mt-2 text-lg font-semibold text-gray-900">
                        {step.title}
                      </h4>

                      <p className="mt-3 text-sm leading-relaxed text-gray-600">
                        {step.detail}
                      </p>

                      <Link
                        href={step.href}
                        className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)] transition-opacity hover:opacity-75"
                      >
                        {step.linkLabel} →
                      </Link>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Converting JSON Into Other Formats
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Choose the destination format based on the next system. Always
              review nested objects, arrays, empty values, dates, numbers, and
              repeated elements because not every structure converts perfectly.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {conversionTools.map((tool) => (
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

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Open tool →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Working With Large Arrays and JSON Lines
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Line-based records and large arrays often need filtering,
              grouping, key extraction, or flattening before they are useful for
              debugging, import, reporting, or transformation.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {largeDataTools.map((tool) => (
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

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Open tool →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            A Practical JSON Review Checklist
          </h2>

          <ol className="mt-6 space-y-4 text-gray-700">
            {[
              "Keep the original payload before formatting, sorting, merging, or converting it.",
              "Validate JSON syntax before diagnosing application-level problems.",
              "Check field types, required properties, and nested structure against the real contract or schema.",
              "Review large numbers, dates, null values, empty strings, arrays, and duplicate keys carefully.",
              "Compare the transformed output with the source before sending it to another system.",
              "Use redacted or sample data when the payload contains secrets, personal information, tokens, or production records.",
            ].map((item, index) => (
              <li
                key={item}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-xs font-semibold text-[var(--brand-green)]">
                  {index + 1}
                </span>

                <span className="pt-1 text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-7">
            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between formatting and validating JSON?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                Formatting changes indentation and whitespace for readability.
                Validation checks whether the text follows valid JSON syntax.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Why can valid JSON still fail in an API?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                The payload may use the wrong field names, value types,
                required properties, nesting, enum values, or application rules
                even though the JSON syntax is valid.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is JSON-to-CSV conversion always lossless?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                No. CSV is tabular, while JSON can contain nested objects and
                arrays. Complex values may need flattening, string conversion,
                or a custom mapping.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                What is the difference between JSON and JSON Lines?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                Standard JSON can contain one complete value such as an object
                or array. JSON Lines stores one independent JSON value per line,
                which is useful for logs, streams, and large record sets.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Continue With the Full JSON & Data Collection
          </h2>

          <p className="mt-3 max-w-3xl leading-relaxed text-gray-600">
            Use the JSON & Data Tools category when you already know the task
            and want to browse the complete collection. This guide remains
            focused on workflow, tool selection, limitations, and data-quality
            decisions.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/categories/json-tools" className="yoryantra-btn-outline">
              View all JSON & Data Tools
            </Link>

            <Link href="/developers" className="yoryantra-btn-outline">
              For Developers
            </Link>

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>

            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
