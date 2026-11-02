import Link from "next/link";

const workflowGroups = [
  {
    title: "Debugging requests and responses",
    text: "Build or parse HTTP requests, compare headers, debug API errors and switch between cURL and Fetch without assuming you have done any local processing.",
    tools: [
      { label: "HTTP Request Parser", href: "/tools/http-request-parser" },
      { label: "cURL Command Parser", href: "/tools/curl-command-parser" },
      { label: "Fetch to cURL Converter", href: "/tools/fetch-to-curl-converter" },
      { label: "API Error Response Formatter", href: "/tools/api-error-response-formatter" },
    ],
  },
  {
    title: "Text, patterns, URLs",
    text: "Use syntax-sensitive tools to test and parse text where the meaning is determined by delimiters, escaping, regex flags, duplicated query keys and URL resolution rules.",
    tools: [
      { label: "Regex Match Tester", href: "/tools/regex-match-tester" },
      { label: "Regex Replace Tester", href: "/tools/regex-replace-tester" },
      { label: "URL Parts Parser", href: "/tools/url-parts-parser" },
      { label: "Query String Builder", href: "/tools/query-string-builder" },
    ],
  },
  {
    title: "Time, IDs, and small protocol values",
    text: "Convert time values with explicit units, examine the structure of UUIDs and generate IDs without making any guarantees at an application level.",
    tools: [
      { label: "Unix Timestamp Generator", href: "/tools/unix-timestamp-generator" },
      { label: "UUID Generator", href: "/tools/uuid-generator" },
      { label: "UUID Validator", href: "/tools/uuid-validator" },
    ],
  },
];

const relatedAreas = [
  {
    title: "JSON & Data",
    text: "Use this when your issue relates to JSON syntax, schemas, data conversion, querying, patching or structured data..",
    href: "/json-guides",
  },
  {
    title: "Encoding",
    text: "when your problem relates to encoded bytes/text (Base64, percent encoding, entities, Unicode escapes etc).",
    href: "/encoding-guides",
  },
  {
    title: "Security",
    text: "Issue related to security, signatures, secrets, trust or browser security policies and it's no longer just about readability.",
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
            className="transition-colors duration-200 hover:!text-[var(--gold-text)]"
          >
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Developers</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-950 md:text-6xl md:leading-tight">
            Debugging the Boundary
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            A surprising number of issues occur at boundaries. For example, 
			converting between text and bytes, URL to request, 
            header to application state, or timestamp with incorrect units. 
			The developer tools within Yoryantra allow you to gain
            the most value when you have isolated a single boundary and have a specific question to ask.
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
                {" "}will decompose an existing value. A formatter will format 
				a value without changing its meaning. 
                A builder will create a value through an explicit process.
				A tester will apply a specific rule or behaviour.
              </p>
              <p>
                These are not interchangeable. If we format a request this does 
				not prove that a server will accept it. Parsing a URL
                does not prove we can reach the destination. Testing a regular 
				expression tells us how JavaScript will match, but does
                not tell us if the regular expression represents the business rule 
				we intended.
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
              Workflow Types to Consider Splitting
            </h2>
            <p className="mt-3 leading-7 text-gray-600">
              These workflows deliberately combine related tools to help with debugging.
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
            Local Inspection
          </h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              A variety of browser tools exist to help you understand requests.
              You can generate a cURL command from request text, compare
              two headers, or determine what a given HTTP method does
              without needing to make a request to the server. This provides
			  deterministic input which is easy to inspect.
            </p>
            <p>
              There are many more factors to consider when making your request
              live. DNS lookups, TLS, proxies, redirects, auth state, CORS,
              caching, service workers, server logic and timing all need to be
              considered. Tools such as Yoryantra's Redirect Checker will use
              the response information you provide, rather than silently crawling a URL.
            </p>
            <p>
              If the bug is network dependent then you should capture the
              actual request and response using your browsers DevTools, cURL
              or the appropriate client. Use a specific tool to inspect the
			  difficult to read part.
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
                <h3 className="font-semibold text-gray-900 group-hover:text-[var(--gold-text)]">
                  {area.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{area.text}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--gold-text)]">
                  Continue →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Useful primary references</h2>
          <p className="mt-3 max-w-3xl leading-7 text-gray-600">
            If you're seeing something that depends on the behaviour of the protocol 
			then it's best to refer back to the specification or platform documentation.
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
