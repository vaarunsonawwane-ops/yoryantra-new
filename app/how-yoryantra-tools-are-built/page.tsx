import Link from "next/link";

export const metadata = {
  title: "How Yoryantra Tools Are Built | Yoryantra",

  description:
    "Learn how Yoryantra selects, builds, tests, reviews, and improves practical browser-based tools.",

  alternates: {
    canonical: "https://yoryantra.com/how-yoryantra-tools-are-built",
  },

  openGraph: {
    title: "How Yoryantra Tools Are Built | Yoryantra",

    description:
      "A simple explanation of how Yoryantra selects, builds, tests, reviews, and improves practical browser-based tools.",

    url: "https://yoryantra.com/how-yoryantra-tools-are-built",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "How Yoryantra Tools Are Built | Yoryantra",

    description:
      "See how Yoryantra tools are selected, tested, reviewed, and improved.",
  },
};

const reviewSteps = [
  {
    number: "01",
    title: "Start with a real task",
    description:
      "A tool should solve a clear problem such as formatting data, validating a file, decoding a value, checking configuration, or preparing information for another system.",
  },
  {
    number: "02",
    title: "Keep the workflow focused",
    description:
      "Each page is built around one main task. Related features are included only when they help complete that task without making the tool confusing.",
  },
  {
    number: "03",
    title: "Test normal and incorrect input",
    description:
      "Tools are checked with common examples, empty input, malformed values, unexpected characters, and other cases that may cause confusing output.",
  },
  {
    number: "04",
    title: "Explain what the result means",
    description:
      "A useful result should be readable and practical. When a tool cannot confirm validity, trust, safety, or production readiness, that limitation should be stated clearly.",
  },
  {
    number: "05",
    title: "Review the page as a whole",
    description:
      "The tool, examples, instructions, related links, metadata, and explanatory content are reviewed together so the page supports the task instead of only displaying a form.",
  },
  {
    number: "06",
    title: "Improve older tools when needed",
    description:
      "Existing pages are revisited when wording, usability, technical behaviour, internal links, or supporting guidance can be made clearer.",
  },
];

export default function HowYoryantraToolsAreBuiltPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-5xl px-6 py-16">
        {/* BREADCRUMB */}
        <div className="mb-10 flex items-center text-sm text-gray-500">
          <Link
            href="/"
            className="transition-colors duration-200 hover:!text-[var(--light-gold)]"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-900">
            How Yoryantra Tools Are Built
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--light-gold)]">
            Yoryantra methodology
          </p>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            How Yoryantra Tools Are Built
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-gray-600">
            Yoryantra is built around practical tasks, not random tool counts.
            The aim is to create focused utilities that are easy to understand,
            useful in real work, and honest about what they can and cannot confirm.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="yoryantra-btn-outline"
            >
              Browse all tools
            </Link>

            <Link
              href="/contact"
              className="yoryantra-btn-outline"
            >
              Report a tool issue
            </Link>
          </div>
        </div>

        {/* SELECTION */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            How a Tool Is Chosen
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-8">
            <p>
              A tool is considered when it solves a clear development, DevOps,
              security, SEO, JSON, data, or encoding task. The task should be
              specific enough that someone can understand why the tool exists
              and when to use it.
            </p>

            <p>
              Yoryantra avoids adding utilities only to make the collection look
              larger. A tool should save time, reduce repetitive work, make a
              technical value easier to inspect, or help someone prepare data
              before using it elsewhere.
            </p>

            <p>
              Similar tools may still exist when they answer different questions.
              For example, decoding, validating, generating, comparing, and
              converting are separate operations even when they work with the
              same type of data.
            </p>
          </div>
        </section>

        {/* REVIEW STEPS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            The Review Process
          </h2>

          <p className="mt-3 max-w-3xl text-gray-600 leading-8">
            The process is kept simple, but each step has a purpose.
          </p>

          <div className="mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2">
            {reviewSteps.map((step) => (
              <div
                key={step.number}
                className="flex items-start gap-4"
              >
                <span className="min-w-8 pt-0.5 text-xs font-semibold tracking-wider text-[var(--light-gold)]">
                  {step.number}
                </span>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOCAL PROCESSING */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Local Processing and External Requests
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-8">
            <p>
              Most Yoryantra tools process input directly inside the browser.
              This is useful for quick checks and helps avoid sending ordinary
              text, code, or structured data to a separate processing server.
            </p>

            <p>
              Some tools may need to inspect an external URL, response, header,
              redirect, certificate, or other remote resource. In those cases,
              an internet request is required for the tool to complete its task.
            </p>

            <p>
              Sensitive production data should still be handled carefully. Use
              sample or redacted values when input may contain passwords,
              private keys, tokens, personal information, or confidential data.
            </p>
          </div>
        </section>

        {/* LIMITATIONS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            What Tool Results Can and Cannot Confirm
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-8">
            <p>
              A formatter can improve readability without proving that the data
              is correct for a specific application. A decoder can make a value
              readable without proving that it is trustworthy. A generated
              configuration can be a useful starting point without being ready
              for production.
            </p>

            <p>
              Yoryantra aims to make these boundaries clear. Important outputs
              should be checked against the real application, relevant
              documentation, standards, provider requirements, or the environment
              where the result will be used.
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            How Supporting Content Is Written
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-8">
            <p>
              Tool pages are written to support the actual task. Explanations,
              examples, FAQs, and related links should help someone understand
              the workflow rather than repeat the same generic sections on every
              page.
            </p>

            <p>
              The wording is kept direct and practical. Yoryantra avoids
              unnecessary jargon, exaggerated claims, and content added only to
              make a page longer.
            </p>
          </div>
        </section>

        {/* MAINTENANCE */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Reviewing and Improving Existing Tools
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-8">
            <p>
              Yoryantra is improved in small, careful batches. Older tools may be
              updated when their interface, instructions, examples, related
              links, or technical behaviour can be made clearer.
            </p>

            <p>
              Changes are made with the aim of preserving what already works.
              A page should not be redesigned or rewritten only for the sake of
              looking new.
            </p>

            <p>
              If a tool produces an incorrect result, has unclear wording, or
              behaves unexpectedly, it can be reported through the{" "}
              <Link
                href="/contact"
                className="font-semibold text-[var(--light-gold)] hover:underline"
              >
                Contact page
              </Link>
              .
            </p>
          </div>
        </section>

        {/* CLOSING */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            The Simple Goal
          </h2>

          <p className="mt-4 max-w-3xl leading-8 text-gray-600">
            Build useful tools, explain them honestly, keep the experience clean,
            and respect the time of the person using them.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/about"
              className="yoryantra-btn-outline"
            >
              About Yoryantra
            </Link>

            <Link
              href="/categories"
              className="yoryantra-btn-outline"
            >
              Browse categories
            </Link>

            <Link
              href="/privacy-policy"
              className="yoryantra-btn-outline"
            >
              Privacy Policy
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
