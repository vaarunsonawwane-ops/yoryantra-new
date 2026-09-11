export const metadata = {
  title: "Disclaimer | Yoryantra",
  description:
    "Understand the limits of Yoryantra tool results, technical explanations, external references, and browser-based checks.",
  alternates: {
    canonical: "https://yoryantra.com/disclaimer",
  },
};

const updated = "September 11, 2026";

export default function DisclaimerPage() {
  return (
    <main className="bg-white text-gray-700">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight text-gray-950">
          Disclaimer
        </h1>

        <p className="mt-4 text-sm text-gray-500">Last updated: {updated}</p>

        <div className="mt-8 space-y-10 leading-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              What Yoryantra provides
            </h2>
            <p className="mt-4">
              Yoryantra provides browser-based technical utilities and
              supporting explanations for tasks such as formatting, parsing,
              conversion, inspection, validation, generation, and debugging.
              The tools are intended to make a defined task easier to inspect
              or complete; they are not a guarantee about an external system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              A tool result has a boundary
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                A locally valid value can still fail in a server, browser,
                deployment, API, search engine, certificate chain, security
                policy, or other environment that applies additional rules.
              </p>
              <p>
                For example, decoding a token does not verify it, valid YAML
                does not prove a Kubernetes resource will be accepted, and a
                technically correct SEO signal does not guarantee crawling,
                indexing, appearance, or ranking.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Accuracy and verification
            </h2>
            <p className="mt-4">
              Yoryantra is reviewed and improved with the aim of keeping tools
              and explanations accurate, but completeness, suitability, and
              error-free operation cannot be guaranteed for every input,
              platform version, browser, or external service. Verify important
              outputs against the relevant specification, official
              documentation, and your actual target environment before relying
              on them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Security-sensitive information
            </h2>
            <p className="mt-4">
              Do not paste real passwords, private keys, access tokens, or
              production secrets into a tool merely for convenience. Even when
              a tool is designed to process data locally, you remain
              responsible for deciding whether the information is appropriate
              to place in a browser-based workflow.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              External references
            </h2>
            <p className="mt-4">
              Links to standards, vendor documentation, search documentation,
              or other third-party material are provided to help you verify or
              understand a topic. Yoryantra does not control those external
              resources and cannot guarantee their continued availability or
              unchanged content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Responsibility for use
            </h2>
            <p className="mt-4">
              You are responsible for how you use Yoryantra and its outputs.
              To the extent permitted by applicable law, Yoryantra is not
              responsible for loss or damage resulting from misuse of a tool,
              reliance on an unverified result, or use outside the tool&apos;s
              stated scope.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
