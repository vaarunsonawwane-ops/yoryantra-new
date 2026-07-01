import Link from "next/link";

const workflowGroups = [
  {
    title: "JWT and token debugging",
    description:
      "Use the JWT tools according to the question you are trying to answer. Decoding, claim inspection, expiry checks, signature verification, and secret review are separate tasks.",
    steps: [
      {
        title: "Read the token contents",
        detail:
          "Start with JWT Decoder when you need to inspect the header and payload. Decoding does not verify that the token is trustworthy.",
        href: "/tools/jwt-decoder",
        linkLabel: "Open JWT Decoder",
      },
      {
        title: "Review important claims",
        detail:
          "Use JWT Claims Inspector to check fields such as exp, iat, nbf, iss, aud, roles, scopes, and subject values.",
        href: "/tools/jwt-claims-inspector",
        linkLabel: "Open JWT Claims Inspector",
      },
      {
        title: "Check time-based validity",
        detail:
          "Use JWT Expiration Checker when the main problem is whether a token is expired, not active yet, or affected by clock differences.",
        href: "/tools/jwt-expiration-checker",
        linkLabel: "Open JWT Expiration Checker",
      },
      {
        title: "Verify the signature separately",
        detail:
          "Use JWT Signature Verifier only when you have the correct verification secret and understand the expected signing algorithm.",
        href: "/tools/jwt-signature-verifier",
        linkLabel: "Open JWT Signature Verifier",
      },
    ],
  },
  {
    title: "Content Security Policy workflow",
    description:
      "Choose the CSP tool based on whether you are creating a policy, reviewing an existing policy, or investigating browser violation reports.",
    steps: [
      {
        title: "Create a quick starting policy",
        detail:
          "CSP Generator is the simpler option for preparing a basic Content-Security-Policy header.",
        href: "/tools/csp-generator",
        linkLabel: "Open CSP Generator",
      },
      {
        title: "Configure directives in detail",
        detail:
          "CSP Policy Builder is better when you need directive-level controls, report-only mode, reporting settings, and deployment output.",
        href: "/tools/csp-policy-builder",
        linkLabel: "Open CSP Policy Builder",
      },
      {
        title: "Review an existing policy",
        detail:
          "CSP Analyzer inspects a policy that already exists and highlights missing protections or potentially unsafe values.",
        href: "/tools/csp-analyzer",
        linkLabel: "Open CSP Analyzer",
      },
      {
        title: "Investigate blocked resources",
        detail:
          "CSP Report Analyzer parses violation reports and groups blocked resources, directives, documents, and recurring patterns.",
        href: "/tools/csp-report-analyzer",
        linkLabel: "Open CSP Report Analyzer",
      },
    ],
  },
  {
    title: "Certificates, keys, and PEM files",
    description:
      "Formatting, inspecting, generating, and renewing certificate material are different operations. Use the narrowest tool for the job.",
    steps: [
      {
        title: "Normalize PEM text",
        detail:
          "PEM Formatter fixes block structure and line wrapping. It does not prove that a key or certificate is valid or trusted.",
        href: "/tools/pem-formatter",
        linkLabel: "Open PEM Formatter",
      },
      {
        title: "Inspect a certificate",
        detail:
          "PEM Certificate Viewer helps read certificate details without changing the original PEM content.",
        href: "/tools/pem-certificate-viewer",
        linkLabel: "Open PEM Certificate Viewer",
      },
      {
        title: "Generate an RSA key pair",
        detail:
          "RSA Key Generator creates public and private key material for development and testing workflows.",
        href: "/tools/rsa-key-generator",
        linkLabel: "Open RSA Key Generator",
      },
      {
        title: "Plan certificate renewal",
        detail:
          "TLS Certificate Expiry Reminder Generator creates a renewal checklist and calendar-ready reminder plan.",
        href: "/tools/tls-certificate-expiry-reminder-generator",
        linkLabel: "Open TLS Expiry Reminder Generator",
      },
    ],
  },
];

const headerChecklist = [
  {
    title: "Scan the current response headers",
    description:
      "Start with Security Headers Scanner when you need to see which protections a live response exposes.",
    href: "/tools/security-headers-scanner",
  },
  {
    title: "Prepare a complete header set",
    description:
      "Use Security Header Generator to create a practical group of common HTTP security headers.",
    href: "/tools/security-header-generator",
  },
  {
    title: "Configure HSTS carefully",
    description:
      "Use HSTS Header Generator only after confirming that the site and required subdomains are ready for HTTPS-only access.",
    href: "/tools/hsts-header-generator",
  },
  {
    title: "Control browser features",
    description:
      "Permissions Policy Header Generator helps restrict camera, microphone, geolocation, payment, USB, and other features.",
    href: "/tools/permissions-policy-header-generator",
  },
  {
    title: "Review referrer behaviour",
    description:
      "Referrer Policy Generator helps choose what referrer information browsers may send to other pages.",
    href: "/tools/referrer-policy-generator",
  },
  {
    title: "Investigate CORS responses",
    description:
      "CORS Header Checker helps inspect allowed origins, credentials, methods, and response-header combinations.",
    href: "/tools/cors-header-checker",
  },
];

const secretAndHashTools = [
  {
    title: "Hash Generator",
    description:
      "Generate common digest values for checksums and comparisons. Fast hashes should not be treated as password-storage algorithms.",
    href: "/tools/hash-generator",
  },
  {
    title: "Hash Algorithm Identifier",
    description:
      "Estimate possible hash formats from length, character set, prefixes, and common patterns. Identification is not guaranteed.",
    href: "/tools/hash-algorithm-identifier",
  },
  {
    title: "HMAC Generator",
    description:
      "Create keyed message authentication codes for webhook, API-signing, and integrity-testing workflows.",
    href: "/tools/hmac-generator",
  },
  {
    title: "bcrypt Generator",
    description:
      "Create salted bcrypt password hashes for development and testing. Production applications should hash inside their trusted backend.",
    href: "/tools/bcrypt-generator",
  },
  {
    title: "JWT Secret Strength Checker",
    description:
      "Review JWT or HMAC secrets for weak words, repeated patterns, short length, and low estimated entropy.",
    href: "/tools/jwt-secret-strength-checker",
  },
  {
    title: "Subresource Integrity Hash Generator",
    description:
      "Generate integrity attributes for scripts and styles loaded from external sources.",
    href: "/tools/subresource-integrity-hash-generator",
  },
];

export const metadata = {
  title: "Developer Security Workflows and Tool Selection | Yoryantra",
  description:
    "Follow practical security workflows for JWTs, CSP, headers, certificates, keys, hashes, HMAC signatures, cookies, and secure development checks.",
  keywords: [
    "developer security workflows",
    "JWT debugging guide",
    "CSP workflow",
    "security headers guide",
    "PEM certificate tools",
    "HMAC testing",
    "developer security checklist",
    "web security tools guide",
  ],
  alternates: {
    canonical: "https://yoryantra.com/security-guides",
  },
  openGraph: {
    title: "Developer Security Workflows and Tool Selection | Yoryantra",
    description:
      "Practical workflows for choosing and using Yoryantra security tools for JWTs, CSP, headers, certificates, keys, hashes, and HMAC signatures.",
    url: "https://yoryantra.com/security-guides",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Developer Security Workflows and Tool Selection | Yoryantra",
    description:
      "Choose the right Yoryantra security tool for JWT, CSP, header, certificate, key, hash, and HMAC tasks.",
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

          <span className="text-gray-900">Security Guides</span>
        </div>

        <div className="max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--light-gold)]">
            Practical security workflows
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Choose the Right Security Tool for the Task
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            This page is not another list of every Security Tool. It explains
            which tool to use, what each result can tell you, and where a quick
            browser check stops being enough.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Browse all Security Tools
            </Link>

            <Link href="/contact" className="yoryantra-btn-outline">
              Report a tool issue
            </Link>
          </div>
        </div>

        <section className="mt-14 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Before Using a Browser Security Tool
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Use sample or redacted values when a token, secret, private key, cookie, or certificate may be sensitive.",
              "Decoding data does not verify its source, integrity, trust, or safety.",
              "A generated header or policy is a starting point and still needs testing in the real application.",
              "Formatting a certificate or key does not prove that it is valid, correctly paired, or trusted.",
              "Hash identification is an estimate because different algorithms can produce similar-looking values.",
              "Production security still requires access control, dependency review, monitoring, patching, and human review.",
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
              Three Common Security Workflows
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Start with the question you need to answer. Similar tools are
              separated because decoding, validation, generation, inspection,
              and report analysis are not the same operation.
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
              Reviewing Website Security Headers
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              Header tools are most useful when used in sequence: inspect what
              exists, generate only the missing protection, deploy carefully,
              and then test the real response again.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {headerChecklist.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Open tool →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
            Do not deploy a strict header only because a generator labels it as
            recommended. Test third-party scripts, forms, authentication,
            embedded content, downloads, APIs, and browser compatibility in the
            actual application.
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Hashes, HMAC Signatures, and Secrets
            </h2>

            <p className="mt-3 leading-relaxed text-gray-600">
              These values can look similar while serving different purposes.
              A digest, keyed signature, password hash, random secret, and
              integrity attribute should not be used interchangeably.
            </p>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {secretAndHashTools.map((tool) => (
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
            A Practical Review Checklist
          </h2>

          <ol className="mt-6 space-y-4 text-gray-700">
            {[
              "Identify the exact question: decode, inspect, generate, verify, compare, or analyze.",
              "Remove or replace sensitive production data before pasting input.",
              "Read the tool limitations before trusting the result.",
              "Compare the output with the application, standard, or provider documentation that governs the real workflow.",
              "Test generated policies, headers, keys, or configuration in a controlled environment.",
              "Record the final decision and review it again when the application or infrastructure changes.",
            ].map((item, index) => (
              <li
                key={item}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-green-200 bg-green-50 text-xs font-semibold text-[var(--brand-green)]">
                  {index + 1}
                </span>

                <span className="text-sm leading-relaxed">{item}</span>
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
                Does decoding a JWT prove that it is valid?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                No. Decoding only makes the header and payload readable. Trust
                also depends on signature verification, the expected algorithm,
                key management, claims, issuer, audience, timing, and the
                application&apos;s own validation rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Is a generated CSP safe to deploy immediately?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                Not automatically. Start in report-only mode where practical,
                collect violations, review required sources, remove unnecessary
                allowances, and test the real application before enforcing the
                policy.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can a PEM formatter validate a certificate?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                No. Formatting corrects text structure and wrapping. Certificate
                validity, trust chains, expiry, hostname coverage, key pairing,
                and revocation require separate checks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are the browser tools a replacement for a security review?
              </h3>

              <p className="mt-2 leading-relaxed text-gray-600">
                No. They help with focused development and debugging tasks.
                Production security still needs architecture review, secure
                coding, dependency management, access controls, monitoring,
                incident readiness, and ongoing maintenance.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Continue With the Full Security Collection
          </h2>

          <p className="mt-3 max-w-3xl leading-relaxed text-gray-600">
            Use the Security Tools category when you already know the task and
            want to browse all available utilities. This guide remains focused
            on workflow, tool selection, limitations, and safe interpretation.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              View all Security Tools
            </Link>

            <Link href="/developers" className="yoryantra-btn-outline">
              Developer Resources
            </Link>

            <Link
              href="/categories/devops-tools"
              className="yoryantra-btn-outline"
            >
              DevOps Tools
            </Link>

            <Link
              href="/categories/encoding-tools"
              className="yoryantra-btn-outline"
            >
              Encoding Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
