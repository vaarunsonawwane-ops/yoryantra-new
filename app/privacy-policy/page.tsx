export const metadata = {
  title: "Privacy Policy | Yoryantra",
  description:
    "Learn how Yoryantra handles tool inputs, analytics, advertising, cookies, technical data, and privacy choices.",
  alternates: {
    canonical: "https://yoryantra.com/privacy-policy",
  },
};

const updated = "September 11, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white text-gray-700">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
        <h1 className="text-4xl font-bold tracking-tight text-gray-950">
          Privacy Policy
        </h1>

        <p className="mt-4 text-sm text-gray-500">Last updated: {updated}</p>

        <div className="mt-8 space-y-10 leading-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              How Yoryantra approaches privacy
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                Yoryantra is designed around browser-first tools and limited
                data collection. You do not need an account to use the tools.
              </p>
              <p>
                Most tool inputs are processed directly in your browser and
                are not intentionally sent to Yoryantra for processing. Some
                tools need a network request to inspect an external URL,
                resolver, or remote response. When a tool depends on a remote
                request, that boundary should be explained on the relevant
                tool page.
              </p>
              <p>
                Avoid entering passwords, private keys, production tokens, or
                other secrets into any website unless the tool and workflow
                genuinely require it and you understand where the data is
                processed.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Analytics
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                Yoryantra uses Google Analytics to understand general website
                usage, such as page visits, device or browser information, and
                how visitors move through the site. This helps identify broken
                pages, improve performance, and understand which parts of the
                website are useful.
              </p>
              <p>
                Google Analytics may use cookies or similar identifiers and
                may process technical information according to Google&apos;s own
                policies and the consent choices available to you.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Advertising, cookies, and similar technologies
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                Yoryantra may use Google AdSense to show limited advertising
                that helps support hosting, maintenance, and continued
                improvement of the website.
              </p>
              <p>
                When Google advertising services are present, Google and its
                partners may place or read cookies, use web beacons, process IP
                addresses, or use other identifiers for purposes such as ad
                delivery, measurement, fraud prevention, frequency controls,
                and ad personalization where permitted.
              </p>
              <p>
                Your browser and any consent controls shown on the site may let
                you manage cookies or advertising choices. Where consent is
                required, advertising or analytics behavior can depend on the
                choices you make through the available consent mechanism.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Hosting and technical request data
            </h2>
            <div className="mt-4 space-y-4">
              <p>
                Like most websites, Yoryantra&apos;s hosting and security
                infrastructure may process technical request information such
                as IP address, requested URL, browser or device details,
                timestamps, and diagnostic or security signals needed to
                deliver and protect the website.
              </p>
              <p>
                Tool inputs processed only inside your browser are different
                from this ordinary website request data. A browser-local tool
                does not need to send its input to a server merely to perform
                its local calculation or transformation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              External links and remote services
            </h2>
            <p className="mt-4">
              Yoryantra links to standards, documentation, and other external
              websites. Those services have their own privacy practices. A
              remote-checking tool may also contact an external service or the
              destination you ask it to inspect; the relevant tool page should
              explain that behavior when it applies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Google&apos;s use of data
            </h2>
            <p className="mt-4">
              Google explains how information is handled when websites use
              services such as Google Analytics and Google advertising in{" "}
              <a
                href="https://policies.google.com/technologies/partner-sites?hl=en"
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-[var(--green)] underline decoration-1 underline-offset-4 hover:no-underline"
              >
                How Google uses information from sites or apps that use its services ↗
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Changes to this policy
            </h2>
            <p className="mt-4">
              This policy may be updated when Yoryantra&apos;s tools, service
              providers, analytics, advertising, or privacy practices change.
              The date at the top of this page will be updated when the policy
              is revised.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-950">
              Privacy questions
            </h2>
            <p className="mt-4">
              For questions about this policy or Yoryantra&apos;s privacy
              practices, email{" "}
              <a
                href="mailto:contactyoryantra@gmail.com"
                className="font-medium text-[var(--green)] underline decoration-1 underline-offset-4 hover:no-underline"
              >
                contactyoryantra@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
