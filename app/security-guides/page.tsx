import Link from "next/link";

const featuredCategories = [
  {
    title: "Security Tools",
    description:
      "JWTs, hashes, HMAC signatures, RSA keys, PEM files, CSP headers, and API keys.",
    href: "/categories/security-tools",
  },
  {
    title: "Developer Utilities",
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
      "Decode JWT tokens and inspect header, payload, and claims safely.",
    href: "/tools/jwt-decoder",
  },
  {
    title: "JWT Signature Verifier",
    description:
      "Verify JWT signatures against a secret during authentication testing.",
    href: "/tools/jwt-signature-verifier",
  },
  {
    title: "HMAC Generator",
    description:
      "Generate HMAC signatures for APIs, webhooks, and verification workflows.",
    href: "/tools/hmac-generator",
  },
  {
    title: "SHA256 Generator",
    description:
      "Generate SHA256 hashes for text, API checks, and verification workflows.",
    href: "/tools/sha256-generator",
  },
  {
    title: "RSA Key Generator",
    description:
      "Generate RSA public and private keys for signing and verification.",
    href: "/tools/rsa-key-generator",
  },
  {
    title: "PEM Formatter",
    description:
      "Format PEM certificates, public keys, and private keys cleanly.",
    href: "/tools/pem-formatter",
  },
  {
    title: "Random Token Generator",
    description:
      "Generate secure random tokens for APIs, sessions, and testing.",
    href: "/tools/random-token-generator",
  },
  {
    title: "CSP Generator",
    description:
      "Create Content Security Policy headers for frontend protection.",
    href: "/tools/csp-generator",
  },
];

export const metadata = {
  title: "Security Guides for Developers | Yoryantra",

  description:
    "Explore practical security guides and free online tools for JWTs, HMAC signatures, SHA256 hashes, RSA keys, PEM files, CSP headers, API keys, and authentication workflows.",

  keywords: [
    "security guides",
    "developer security guides",
    "jwt guide",
    "hmac signature",
    "sha256 generator",
    "rsa key generator",
    "pem formatter",
    "csp generator",
    "api security tools",
    "authentication tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/security-guides",
  },

  openGraph: {
    title: "Security Guides for Developers | Yoryantra",

    description:
      "Practical security guides and free tools for JWTs, HMAC signatures, SHA256 hashes, RSA keys, PEM files, CSP headers, API keys, and authentication workflows.",

    url: "https://yoryantra.com/security-guides",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Security Guides for Developers | Yoryantra",

    description:
      "Explore free security tools and guides for JWTs, hashing, signatures, keys, CSP headers, API keys, and authentication workflows.",
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
            Security Guides for Tokens, Hashes, Keys, and API Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Explore practical security resources and browser-based utilities for
            JWT debugging, HMAC signatures, SHA256 hashes, RSA keys, PEM
            formatting, random tokens, API keys, CSP headers, and authentication
            workflows used in modern development.
          </p>
        </div>

        {/* INTRO */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Built for Authentication Debugging
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Inspect JWTs, verify signatures, generate tokens, and prepare
              secure values used in login systems, APIs, sessions, and backend
              authentication flows.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Useful for Hashes and Signatures
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Create SHA256 hashes, HMAC signatures, bcrypt hashes, and other
              values used in verification, webhook security, and API request
              signing.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Practical Security Checks in the Browser
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Yoryantra keeps security utilities focused and lightweight so
              developers can quickly check tokens, keys, encoded strings, and
              headers during development.
            </p>
          </div>
        </div>

        {/* FEATURED CATEGORIES */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Security-Related Tool Categories
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with categories that support authentication, secure
              development, encoding, debugging, and deployment configuration.
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
              Popular Security Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Frequently used tools for token inspection, hashing, signing,
              public-key workflows, PEM formatting, CSP headers, and secure API
              development.
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
            Common Security Workflows
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Decoding JWT tokens during authentication debugging.",
              "Verifying JWT signatures while testing secure sessions.",
              "Generating HMAC signatures for APIs and webhooks.",
              "Creating SHA256 hashes for verification workflows.",
              "Generating RSA keys for signing and verification testing.",
              "Formatting PEM certificates and private keys before use.",
              "Creating random tokens and API keys during development.",
              "Building CSP headers to reduce frontend security risks.",
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
            Why Security Guides Matter for Developers
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Security work often depends on small values that must be handled
              correctly: tokens, signatures, hashes, keys, certificates,
              secrets, and HTTP security headers. A small mistake can break
              authentication, webhook validation, or API access.
            </p>

            <p>
              Practical security guides and utilities help developers inspect
              these values before they cause production issues. They make it
              easier to test signing workflows, verify encoded data, prepare
              keys, and review security-related configuration during daily
              development.
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
                What are security guides used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Security guides help developers understand and work with tokens,
                hashes, signatures, keys, CSP headers, API secrets, and
                authentication-related workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these resources useful for API security?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JWT decoding, HMAC signing, SHA256 hashing, API key
                generation, Base64URL handling, and webhook verification are all
                common API security tasks.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can these tools help with JWT authentication?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. JWT Decoder, JWT Signature Verifier, Base64URL Encoder
                Decoder, RSA Key Generator, and PEM Formatter can support JWT
                debugging and signing workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools replace a full security review?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. These tools are useful for development checks and debugging.
                Production security still needs secure architecture, access
                control, monitoring, dependency review, and proper operational
                practices.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Pages
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
              Developers
            </Link>

            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Utilities
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
