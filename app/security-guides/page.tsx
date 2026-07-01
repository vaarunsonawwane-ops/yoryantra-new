import Link from "next/link";

const featuredCategories = [
  {
    title: "Security Tools",
    description:
      "JWTs, hashes, HMAC signatures, RSA keys, PEM files, CSP headers, and API keys.",
    href: "/categories/security-tools",
  },
  {
    title: "Developer Tools",
    description:
      "Debugging, tokens, timestamps, UUIDs, regex testing, and daily development tools.",
    href: "/categories/developer-tools",
  },
  {
    title: "Encoding Tools",
    description:
      "Base64, Base64URL, URL encoding, HTML entities, and JSON-safe strings.",
    href: "/categories/encoding-tools",
  },
  {
    title: "DevOps Tools",
    description:
      "Configuration, YAML, containers, environment variables, and deployment checks.",
    href: "/categories/devops-tools",
  },
];

const popularSecurityTools = [
  {
    title: "JWT Decoder",
    description:
      "Decode JWT headers and payloads for inspection. Decoding does not verify trust.",
    href: "/tools/jwt-decoder",
  },
  {
    title: "JWT Signature Verifier",
    description:
      "Verify supported JWT signatures with the expected secret during testing.",
    href: "/tools/jwt-signature-verifier",
  },
  {
    title: "HMAC Generator",
    description:
      "Generate keyed HMAC values for APIs, webhooks, and integrity checks.",
    href: "/tools/hmac-generator",
  },
  {
    title: "SHA256 Generator",
    description:
      "Generate SHA256 digests for checksums, comparisons, and test workflows.",
    href: "/tools/sha256-generator",
  },
  {
    title: "RSA Key Generator",
    description:
      "Generate RSA public and private keys for development and testing.",
    href: "/tools/rsa-key-generator",
  },
  {
    title: "PEM Formatter",
    description:
      "Normalize PEM block structure and line wrapping without validating trust.",
    href: "/tools/pem-formatter",
  },
  {
    title: "Random Token Generator",
    description:
      "Generate random tokens for APIs, sessions, and development environments.",
    href: "/tools/random-token-generator",
  },
  {
    title: "CSP Generator",
    description:
      "Create a basic CSP header as a starting point for application testing.",
    href: "/tools/csp-generator",
  },
];

export const metadata = {
  title: "Security Workflows and Tool Selection for Developers | Yoryantra",

  description:
    "Follow practical security workflows for JWTs, HMAC signatures, hashes, RSA keys, PEM files, CSP headers, API keys, and authentication debugging.",

  keywords: [
    "developer security workflows",
    "security tool selection",
    "JWT debugging workflow",
    "hmac signature",
    "sha256 generator",
    "rsa key generator",
    "pem formatter",
    "csp generator",
    "browser security tools",
    "authentication tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/security-guides",
  },

  openGraph: {
    title: "Security Workflows and Tool Selection for Developers | Yoryantra",

    description:
      "Practical security workflows and tools for JWTs, HMAC signatures, hashes, RSA keys, PEM files, CSP headers, API keys, and authentication debugging.",

    url: "https://yoryantra.com/security-guides",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Security Workflows and Tool Selection for Developers | Yoryantra",

    description:
      "Choose the right security tool for JWT debugging, hashing, signatures, keys, CSP headers, API keys, and authentication workflows.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* BREADCRUMB */}
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link
            href="/"
            className="hover:!text-[var(--light-gold)] transition-colors duration-200"
          >
            Home
          </Link>

          <span className="mx-2">/</span>

          <span className="text-gray-900">
            Security Guides
          </span>
        </div>

        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Security Workflows for Tokens, Hashes, Keys, and APIs
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Debug tokens, verify signatures, inspect certificates, and review
            browser security configuration with focused tools for development and
            testing.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Debug Tokens and Authentication
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Inspect JWT contents, claims, expiry, and signatures while troubleshooting
              login, session, and API authentication.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Work With Hashes, Keys, and Signatures
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Choose the correct tool for checksums, HMAC verification, password hashing,
              RSA keys, and PEM files.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h2 className="text-base font-semibold leading-snug text-gray-900">
              Review Headers and Browser Policies
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Build and inspect CSP and security headers, then test the final
              configuration in the real application.
            </p>
          </div>
        </div>


        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Related Tool Categories for Security Work
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Use these categories when the task extends beyond one security
              check into debugging, encoding, deployment configuration, or
              general development work.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {featuredCategories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {category.description}
                </p>

                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">
                  Explore category →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* POPULAR TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Common Security Tools and When to Use Them
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with these tools for token inspection, keyed signatures,
              checksums, public-key workflows, PEM formatting, CSP headers, and
              secure API testing.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {popularSecurityTools.map((tool) => (
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

        {/* WORKFLOWS */}
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Practical Security Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Decode JWT contents when you need to inspect headers and claims.",
              "Verify JWT signatures separately when you have the expected secret or public key.",
              "Generate HMAC signatures for API requests, webhooks, and integrity checks.",
              "Create SHA256 hashes for checksums and comparison workflows.",
              "Generate RSA key pairs for development, signing, and verification tests.",
              "Normalize PEM certificates and keys before parsing or testing them.",
              "Create random tokens and API keys for local development and test environments.",
              "Build and review CSP headers before testing them in the real application.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* WHY MATTERS */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            How to Interpret Security Tool Results
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Security work often depends on values that look similar but
              serve different purposes: tokens, signatures, hashes, keys,
              certificates, secrets, and HTTP security headers. Confusing one
              for another can break authentication, webhook validation, or API
              access.
            </p>

            <p>
              These tools help inspect structure, formatting, claims, and
              generated output during development. Always compare the result
              with the application requirements, relevant standards, and the
              production environment before relying on it.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900">
                How should I choose between similar security tools?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Start with the exact task: decode, inspect, generate, verify,
                format, or analyze. Similar tools are separated because those
                operations answer different questions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can these tools help with API and webhook debugging?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JWT decoding, HMAC generation, hashing, API key
                generation, Base64URL handling, and signature checks are common
                parts of API and webhook debugging.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Does decoding a JWT prove that it is valid?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. Decoding only makes the header and payload readable.
                Trust also depends on signature verification, the expected
                algorithm, claims, issuer, audience, timing, and application
                rules.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do browser-based security tools replace a full security review?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. These tools support focused development checks and
                debugging. Production security still requires secure
                architecture, access control, dependency review, monitoring,
                patching, and operational safeguards.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Continue Exploring Yoryantra
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/categories/security-tools"
              className="yoryantra-btn-outline"
            >
              Security Tools
            </Link>

            <Link
              href="/developers"
              className="yoryantra-btn-outline"
            >
              For Developers
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Tools
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
