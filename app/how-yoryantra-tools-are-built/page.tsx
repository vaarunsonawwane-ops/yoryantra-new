import Link from "next/link";

const reviewSteps = [
  {
    number: "01",
    title: "Define one real task",
    description:
      "A tool starts with a concrete question: parse this request, validate this manifest, compare these headers, encode these bytes, or inspect this token. The task comes before the interface.",
  },
  {
    number: "02",
    title: "Check the governing behavior",
    description:
      "When a protocol, format, browser API, or platform has authoritative documentation, the implementation is checked against that source instead of relying on generic descriptions.",
  },
  {
    number: "03",
    title: "Test normal, boundary, and malformed input",
    description:
      "Common examples are not enough. Review includes empty input, invalid syntax, Unicode or byte boundaries, duplicate fields, unusual sizes, and cases that can produce misleading output.",
  },
  {
    number: "04",
    title: "Separate result from assurance",
    description:
      "A decoded value is not automatically trusted, a formatted file is not automatically valid, and a static configuration check is not a deployment test. Those boundaries are part of the tool, not an afterthought.",
  },
  {
    number: "05",
    title: "Review the whole page",
    description:
      "Interface behavior, errors, examples, explanatory content, metadata, related tools, mobile layout, and shared card wording are reviewed together so the page supports the actual task.",
  },
  {
    number: "06",
    title: "Freeze only after the final diff",
    description:
      "A completed tool is compared with the intended scope so unrelated features, copied wording, stale claims, or accidental structural changes are caught before release.",
  },
];

export const metadata = {
  title: "How Yoryantra Tools Are Built and Reviewed | Yoryantra",
  description:
    "See how Yoryantra selects tool ideas, checks technical behavior, tests edge cases, writes supporting guidance, handles privacy boundaries, and reviews changes before release.",
  alternates: {
    canonical: "https://yoryantra.com/how-yoryantra-tools-are-built",
  },
  openGraph: {
    title: "How Yoryantra Tools Are Built and Reviewed | Yoryantra",
    description:
      "A transparent look at Yoryantra's tool-selection, technical review, testing, privacy, writing, and release process.",
    url: "https://yoryantra.com/how-yoryantra-tools-are-built",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "How Yoryantra Tools Are Built and Reviewed | Yoryantra",
    description:
      "How Yoryantra turns a narrow technical task into a tested tool with clear limits and useful supporting guidance.",
  },
};

export default function HowYoryantraToolsAreBuiltPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 flex items-center text-sm text-gray-500">
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--light-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">How Yoryantra Tools Are Built</span>
        </div>

        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--light-gold)]">
            Yoryantra methodology
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            How Yoryantra Tools Are Built and Reviewed
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-600">
            Yoryantra is an independent, creator-built project. The goal is not
            to collect the largest possible number of utilities. Each page should
            solve a defined technical task, explain the parts that can be
            misunderstood, and be honest about what a browser-based result can
            and cannot establish.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/tools" className="yoryantra-btn-outline">Browse all tools</Link>
            <Link href="/about" className="yoryantra-btn-outline">About Yoryantra</Link>
            <Link href="/contact" className="yoryantra-btn-outline">Report a tool issue</Link>
          </div>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">What Makes a Tool Worth Building</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              A candidate tool should remove a small but real piece of friction:
              repetitive conversion, hard-to-read protocol text, error-prone
              manual calculation, configuration inspection, or a format rule
              that is easier to understand when the result is shown directly.
            </p>
            <p>
              Similar-looking tools can still earn separate pages when they
              answer genuinely different questions. Decoding a JWT is different
              from verifying its signature. Formatting JSON is different from
              checking it against a schema. Parsing a request is different from
              sending one. Those distinctions are part of Yoryantra&apos;s structure.
            </p>
            <p>
              A page should not exist only because a keyword or neighboring site
              has one. If the task cannot be made useful, technically specific,
              and understandable on its own, adding another page does not improve
              the project.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">The Review Process</h2>
          <p className="mt-3 max-w-3xl leading-8 text-gray-600">
            Different tools need different tests and explanations, but these six
            review questions stay consistent.
          </p>
          <div className="mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2">
            {reviewSteps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <span className="min-w-8 pt-0.5 text-xs font-semibold tracking-wider text-[var(--light-gold)]">{step.number}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
            <h2 className="text-xl font-semibold text-gray-900">Technical sources are chosen by the task</h2>
            <p className="mt-4 leading-7 text-gray-600">
              An HTTP tool may need an RFC. A browser feature may need MDN or a
              WHATWG/W3C specification. Docker and Kubernetes tools should point
              back to their platform documentation. SEO guidance should prefer
              Google Search Central when the claim is specifically about Google
              Search. References are added when they clarify behavior, not to
              decorate every page with links.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7">
            <h2 className="text-xl font-semibold text-gray-900">Tests follow the risk of the tool</h2>
            <p className="mt-4 leading-7 text-gray-600">
              A simple text transform may mainly need exact-input and Unicode
              cases. A parser needs malformed and ambiguous input. A security or
              protocol utility needs stricter checks around byte representation,
              algorithms, trust boundaries, and claims that could otherwise
              sound stronger than the result really is.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">Browser-First Processing and Privacy Boundaries</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Where the task can be completed in the browser, Yoryantra prefers
              local processing. That keeps ordinary pasted text, structured
              data, and generated values on the device instead of requiring a
              processing server merely to transform them.
            </p>
            <p>
              Some tasks inherently depend on external state. DNS checks, live
              URL behavior, remote headers, or other network-dependent work may
              require an external request. A tool should make that boundary
              visible instead of making a remote check look local.
            </p>
            <p>
              Local processing is not a blanket security guarantee. Real secrets
              can still be exposed through the device, browser extensions,
              clipboard history, screenshots, or someone with access to the
              session. Sample or redacted data is the better choice whenever the
              task does not require a production credential.
            </p>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm md:p-9">
          <h2 className="text-2xl font-semibold text-gray-900">Supporting Content Has to Earn Its Place</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Yoryantra does not use a fixed recipe such as four FAQs, three use
              cases, and the same headings on every page. Some tools need a
              standards note. Some need a worked example, a troubleshooting
              section, a security warning, or an explanation of a lossy
              conversion. Some do not need an FAQ at all.
            </p>
            <p>
              The editorial test is simple: after using the tool, does the page
              help someone understand the result, avoid a likely mistake, or
              make a better technical decision? Content that only repeats the
              title, pads word count, or exists to target a phrase does not meet
              that test.
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">What a Yoryantra Result Does Not Replace</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              A formatter does not replace application validation. A static
              Docker or Kubernetes check does not replace the real runtime. A
              generated security header does not replace browser testing and a
              security review. An SEO preview does not predict a search engine&apos;s
              final indexing or presentation decision.
            </p>
            <p>
              Tools are designed to make one part of the work easier to inspect
              or prepare. The final decision still belongs to the system that
              consumes the output and the person responsible for that system.
            </p>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Corrections are part of the process</h2>
          <p className="mt-3 leading-7 text-gray-600">
            If a tool produces a wrong result, overstates what it can verify, or
            explains a technical rule unclearly, that is a defect worth fixing.
            Yoryantra revisits existing pages in small batches so working behavior
            can be preserved while the specific problem is corrected.
          </p>
          <Link href="/contact" className="mt-5 inline-flex font-semibold text-[var(--light-gold)]">
            Report a problem or unclear result →
          </Link>
        </section>
      </section>
    </main>
  );
}
