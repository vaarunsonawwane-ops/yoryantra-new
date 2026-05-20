import Link from "next/link";
import { tools } from "@/app/data/tools";
import InfoCard from "@/app/components/InfoCard";

const securityTools = tools.filter(
  (tool) => tool.category === "Security Tools"
);

const featuredTools = securityTools.slice(0, 6);

export const metadata = {
  title: "Security Tools Online Free | Yoryantra",

  description:
    "Use free online security tools for JWT decoding, HMAC signatures, SHA256 hashes, bcrypt, RSA keys, PEM formatting, CSP headers, API keys, and token workflows.",

  keywords: [
    "security tools",
    "online security tools",
    "developer security tools",
    "jwt decoder",
    "hmac generator",
    "sha256 generator",
    "bcrypt generator",
    "rsa key generator",
    "pem formatter",
    "csp generator",
    "api key generator",
    "random token generator",
  ],

  alternates: {
    canonical: "https://yoryantra.com/categories/security-tools",
  },

  openGraph: {
    title: "Security Tools Online Free | Yoryantra",

    description:
      "Free online security utilities for JWTs, HMAC signatures, SHA256 hashes, bcrypt, RSA keys, PEM files, CSP headers, API keys, and tokens.",

    url: "https://yoryantra.com/categories/security-tools",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Security Tools Online Free | Yoryantra",

    description:
      "Free online security tools for authentication, hashing, tokens, signatures, keys, and secure development workflows.",
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

  <Link
    href="/categories"
    className="hover:!text-[var(--light-gold)] transition-colors duration-200"
  >
    Categories
  </Link>

  <span className="mx-2">/</span>

  <span className="text-gray-900">
    Security Tools
  </span>

</div>
	  
        {/* HERO */}
        <div className="max-w-3xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Security Tools for Tokens, Hashes, Keys, and API Workflows
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Use practical security tools to decode JWTs, generate HMAC
            signatures, create SHA256 hashes, format PEM keys, generate RSA key
            pairs, build CSP headers, and prepare secure API values during
            development.
          </p>
        </div>

		{/* INTRO */}
		<div className="mt-12 grid gap-6 md:grid-cols-3">
		<InfoCard
		  title="Useful for Authentication, Tokens, and Verification"
		  description="JWTs, API secrets, hashes, signatures, and encrypted values often appear during authentication and backend workflows. These tools help inspect, generate, and verify them quickly."
		/>

		<InfoCard
		  title="Built for Everyday Security-Related Checks"
		  description="Whether you are validating a token, checking a signature, generating a hash, or testing secure values during development, these utilities reduce repetitive debugging effort."
		/>

		<InfoCard
		  title="Fast Local Checks Without Extra Setup"
		  description="Most tools work directly in your browser so you can inspect sensitive values, compare outputs, and run quick security-related checks without extra software."
		/>
		</div>

        {/* FEATURED TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              Popular Security Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Start with frequently used tools for JWT debugging, API signing,
              password hashing, and secure backend development workflows.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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

        {/* ALL TOOLS */}
        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">
              All Security Tools
            </h2>

            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse the complete security utility set for tokens, signatures,
              hashes, keys, headers, and authentication-related debugging.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {securityTools.map((tool) => (
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
              </Link>
            ))}
          </div>
        </section>

        {/* USE CASES */}
        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900">
            Where These Security Tools Help
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Decoding JWT tokens during authentication debugging.",
              "Generating HMAC signatures for API and webhook testing.",
              "Creating SHA256 hashes for verification workflows.",
              "Generating bcrypt hashes for password storage tests.",
              "Formatting PEM keys and certificates before using them.",
              "Creating RSA key pairs for signing and verification workflows.",
              "Generating random tokens and API keys for development.",
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
            Why Security Utilities Matter for Developers
          </h2>

          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Security work often involves small but important values such as
              tokens, signatures, hashes, keys, certificates, and HTTP security
              headers. A small formatting mistake can break authentication,
              webhook verification, or API access.
            </p>

            <p>
              Browser-based security utilities make common checks faster during
              development. They help developers inspect encoded values, test
              signing workflows, verify hashes, and prepare secure configuration
              before moving changes into production.
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
                What are online security tools used for?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Security tools help developers inspect tokens, generate hashes,
                create signatures, format keys, build security headers, and test
                authentication-related workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are these tools useful for API security?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. These utilities are useful for JWT inspection, HMAC
                signatures, API keys, webhook verification, Base64URL handling,
                and secure backend testing.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Can I use these tools for password-related testing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Yes. Tools such as bcrypt Generator, SHA256 Generator, Random
                Token Generator, and API Key Generator can help with development
                and testing workflows.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Are private keys and tokens uploaded anywhere?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                Most Yoryantra tools run locally inside your browser. Sensitive
                values are not uploaded unless a specific tool clearly requires
                an external URL check.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Do these tools replace professional security testing?
              </h3>

              <p className="mt-2 text-gray-600 leading-relaxed">
                No. These tools are useful for development, debugging, and quick
                checks. Production security still needs proper reviews,
                monitoring, access control, and secure infrastructure practices.
              </p>
            </div>
          </div>
        </section>

        {/* RELATED CATEGORIES */}
        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">
            Related Tool Categories
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/categories/developer-tools"
              className="yoryantra-btn-outline"
            >
              Developer Utilities
            </Link>

            <Link
              href="/categories/json-tools"
              className="yoryantra-btn-outline"
            >
              JSON & Data Tools
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

            <Link
              href="/categories/seo-tools"
              className="yoryantra-btn-outline"
            >
              SEO Tools
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
