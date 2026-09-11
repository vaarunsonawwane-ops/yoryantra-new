export const metadata = {
  title: "Terms of Use | Yoryantra",
  description:
    "Read the terms that apply when using Yoryantra tools, technical content, references, and website services.",
  alternates: {
    canonical: "https://yoryantra.com/terms",
  },
};

const updated = "September 11, 2026";

export default function TermsPage() {
  return (
    <main className="bg-white text-gray-700">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight text-gray-950">
          Terms of Use
        </h1>

        <p className="mt-4 text-sm text-gray-500">Last updated: {updated}</p>

        <div className="mt-8 space-y-10 leading-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Using Yoryantra
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                By accessing or using Yoryantra, you agree to use the website,
                its tools, and its content responsibly and for lawful purposes.
              </p>
              <p>
                Do not use Yoryantra to interfere with systems you do not own
                or have permission to test, to distribute malicious material,
                to evade access controls, or to violate applicable law or the
                rights of another person or organization.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Tool results and technical decisions
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                Yoryantra tools are designed to help with defined technical
                tasks, but a browser result does not automatically establish
                what a production server, network, cloud platform, search
                engine, security control, or other external system will do.
              </p>
              <p>
                You are responsible for reviewing outputs and verifying
                important results in the environment where you intend to use
                them. Do not treat a formatter, parser, decoder, validator, or
                generator as a substitute for the checks required by your own
                system or workflow.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Availability and changes
            </h2>
            <p className="mt-4">
              Yoryantra may correct, improve, replace, suspend, or remove a
              tool, page, feature, or explanation when necessary. The website
              is provided on an &quot;as is&quot; and &quot;as available&quot;
              basis, and uninterrupted or error-free availability is not
              guaranteed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              External standards and third-party services
            </h2>
            <p className="mt-4">
              Some pages link to standards, official documentation, or other
              external services. Those resources are maintained by their
              respective publishers. A link is provided for context or
              verification and does not mean Yoryantra controls that external
              content or guarantees that it will remain unchanged.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Limitation of responsibility
            </h2>
            <p className="mt-4">
              To the extent permitted by applicable law, Yoryantra is not
              responsible for loss or damage arising from reliance on a tool
              result, inability to access the website, misuse of an output, or
              a decision made without appropriate independent verification.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Updates to these terms
            </h2>
            <p className="mt-4">
              These terms may change as Yoryantra evolves. The date at the top
              of this page will be updated when the terms are revised.
              Continued use of the website after an update means the revised
              terms apply to that continued use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Questions
            </h2>
            <p className="mt-4">
              Questions about these terms can be sent through the{" "}
              <a
                href="/contact"
                className="font-medium text-[var(--green)] underline decoration-1 underline-offset-4 hover:no-underline"
              >
                Contact page
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
