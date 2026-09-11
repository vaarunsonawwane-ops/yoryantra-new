import Link from "next/link";

const workflowGroups = [
  {
    title: "Request and response debugging",
    text: "Build or parse HTTP requests, compare headers, inspect API errors, and move between cURL and Fetch without assuming a local transformation sent a network request.",
    tools: [
      { label: "HTTP Request Parser", href: "/tools/http-request-parser" },
      { label: "cURL Command Parser", href: "/tools/curl-command-parser" },
      { label: "Fetch to cURL Converter", href: "/tools/fetch-to-curl-converter" },
      { label: "API Error Response Formatter", href: "/tools/api-error-response-formatter" },
    ],
  },
  {
    title: "Text, patterns, and URL structure",
    text: "Use syntax-aware parsers and testers when the meaning depends on delimiters, escaping, regular-expression flags, duplicate query keys, or URL resolution rules.",
    tools: [
      { label: "Regex Tester", href: "/tools/regex-tester" },
      { label: "Regex Replace Tester", href: "/tools/regex-replace-tester" },
      { label: "URL Parts Parser", href: "/tools/url-parts-parser" },
      { label: "Query String Builder", href: "/tools/query-string-builder" },
    ],
  },
  {
    title: "Time, identifiers, and small protocol values",
    text: "Convert timestamps with explicit units, inspect UUID structure, and generate identifiers without turning a convenience value into an application-level guarantee.",
    tools: [
      { label: "Timestamp Converter", href: "/tools/timestamp-converter" },
      { label: "Unix Timestamp Generator", href: "/tools/unix-timestamp-generator" },
      { label: "UUID Generator", href: "/tools/uuid-generator" },
      { label: "UUID Validator", href: "/tools/uuid-validator" },
    ],
  },
];

const relatedAreas = [
  {
    title: "JSON & Data",
    text: "Use this when the question is about JSON syntax, schemas, conversion, querying, patching, or structured-data shape.",
    href: "/json-guides",
  },
  {
    title: "Encoding",
    text: "Use this when the problem is a byte or text representation such as Base64, percent encoding, entities, or Unicode escapes.",
    href: "/encoding-guides",
  },
  {
    title: "Security",
    text: "Move here when readability is no longer enough and you need to reason about signatures, secrets, trust, or browser security policy.",
    href: "/security-guides",
  },
];

export const metadata = {
  title: "Developer Debugging Workflows for HTTP, URLs, Regex, and APIs | Yoryantra",
  description:
    "Choose developer tools for HTTP, cURL, Fetch, regex, URLs, timestamps, UUIDs, and API debugging while understanding local versus live behavior.",
  alternates: {
    canonical: "https://yoryantra.com/developers",
  },
  openGraph: {
    title: "Developer Debugging Workflows | Yoryantra",
    description:
      "Practical guidance for HTTP, API, URL, regex, timestamp, and identifier debugging with clear boundaries between local inspection and live behavior.",
    url: "https://yoryantra.com/developers",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Debugging Workflows | Yoryantra",
    description:
      "Choose the right parser, formatter, builder, tester, or converter for everyday development work.",
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
          <span className="text-gray-900">Developers</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 md:text-6xl md:leading-tight">
            Debug the Boundary Before You Debug the Whole Application
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A surprising number of development problems live at boundaries:
            text becoming bytes, a URL becoming a request, headers becoming
            application state, or a timestamp being interpreted in the wrong
            unit. Yoryantra&apos;s developer tools are most useful when you isolate
            one of those boundaries and ask a precise question about it.
          </p>
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
            <h2 className="text-2xl font-semibold text-gray-900">
              Parser, Formatter, Builder, or Tester?
            </h2>
            <div className="mt-5 space-y-4 leading-8 text-gray-600">
              <p>
                A <strong className="font-semibold text-gray-900">parser</strong>
                {" "}breaks an existing value into meaningful parts. A formatter
                changes presentation without intending to change meaning. A
                builder assembles a value from explicit choices. A tester runs a
                defined rule or behavior against input.
              </p>
              <p>
                Those operations are not substitutes for one another. Formatting
                a request does not prove a server will accept it. Parsing a URL
                does not prove the destination is reachable. Testing a regular
                expression shows JavaScript matching behavior, not whether the
                pattern expresses the business rule you intended.
              </p>
            </div>
          </div>

          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              A useful debugging order
            </h2>
            <ol className="mt-5 space-y-3 text-sm leading-6 text-gray-600">
              <li><strong className="text-gray-900">1.</strong> Confirm the raw input you actually have.</li>
              <li><strong className="text-gray-900">2.</strong> Parse or normalize only what is necessary.</li>
              <li><strong className="text-gray-900">3.</strong> Compare the result with the protocol or API contract.</li>
              <li><strong className="text-gray-900">4.</strong> Reproduce the behavior in the real client, server, or browser.</li>
            </ol>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Workflows Worth Separating
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              These groups intentionally mix related tools only where they help
              answer the same debugging question.
            </p>
          </div>

          <div className="mt-7 space-y-6">
            {workflowGroups.map((group) => (
              <div
                key={group.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 md:p-7"
              >
                <h3 className="text-lg font-semibold text-gray-900">{group.title}</h3>
                <p className="mt-3 max-w-4xl leading-7 text-gray-600">{group.text}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {group.tools.map((tool) => (
                    <Link key={tool.href} href={tool.href} className="yoryantra-btn-outline">
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">
            Local Inspection Is Different From Live HTTP
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              A browser utility can parse pasted request text, build a cURL
              command, compare two header sets, or explain the semantics of an
              HTTP method without contacting the target server. That is valuable
              because it makes the input deterministic and easy to inspect.
            </p>
            <p>
              Live behavior adds DNS resolution, TLS, proxies, redirects,
              authentication state, CORS, caches, service workers, server logic,
              and timing. For example, Yoryantra&apos;s Redirect Checker works from
              response information you provide; it does not silently crawl a URL
              and pretend a local analysis is a live network trace.
            </p>
            <p>
              When the bug depends on the network, capture the real request and
              response with browser DevTools, cURL, or the relevant client, then
              use a focused tool to inspect the part that is hard to read.
            </p>
          </div>
        </section>

        <section className="mt-18">
          <h2 className="text-2xl font-semibold text-gray-900">
            When the Problem Belongs Somewhere Else
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {relatedAreas.map((area) => (
              <Link
                key={area.href}
                href={area.href}
                className="group rounded-2xl border border-gray-200 bg-gray-50 p-6 transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {area.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{area.text}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Continue →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Useful primary references</h2>
          <p className="mt-3 max-w-3xl leading-7 text-gray-600">
            When a result depends on protocol behavior, compare it with the
            specification or platform documentation rather than relying on a
            utility summary alone.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <a href="https://www.rfc-editor.org/rfc/rfc9110" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">HTTP Semantics — RFC 9110 ↗</a>
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">MDN Fetch API ↗</a>
            <a href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">WHATWG URL Standard ↗</a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/categories/developer-tools" className="yoryantra-btn-outline">
            Browse Developer Tools
          </Link>
          <Link href="/resources" className="yoryantra-btn-outline">
            All Resource Guides
          </Link>
        </div>
      </section>
    </main>
  );
}
