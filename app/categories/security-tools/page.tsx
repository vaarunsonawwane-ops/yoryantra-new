import Link from "next/link";
import { tools } from "@/app/data/tools";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const securityTools = tools.filter((tool) => tool.category === "Security Tools");

const representativeHrefs = new Set<string>([
  "/tools/jwt-signature-verifier",
  "/tools/cookie-security-checker",
  "/tools/csp-analyzer",
  "/tools/jwt-secret-strength-checker",
  "/tools/pem-certificate-viewer",
  "/tools/security-txt-generator",
]);

const representativeTools = securityTools.filter((tool) =>
  representativeHrefs.has(tool.href)
);

export const metadata = {
  title: "Security Tools for JWTs, Hashes, Headers, and Keys | Yoryantra",
  description:
    "Inspect JWTs, hashes, HMACs, passwords, browser security headers, cookies, CSP, keys, certificates, tokens, and security.txt with explicit trust boundaries.",
  alternates: {
    canonical: "https://yoryantra.com/categories/security-tools",
  },
  openGraph: {
    title: "Security Tools for JWTs, Hashes, Headers, and Keys | Yoryantra",
    description:
      "Security utilities that distinguish decoding from verification, representation from secrecy, and configuration checks from security assurance.",
    url: "https://yoryantra.com/categories/security-tools",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Tools for JWTs, Hashes, Headers, and Keys | Yoryantra",
    description:
      "Inspect tokens, hashes, secrets, headers, cookies, CSP, certificates, and related security configuration without overstating what a browser check proves.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/categories" className="hover:!text-[var(--light-gold)] transition-colors duration-200">Categories</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Security Tools</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Security Tools That Keep Inspection Separate from Trust
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Security data is easy to overread. A JWT can be decoded without being
            authentic, a strong-looking hash may reveal nothing about how a password
            was stored, and the presence of a response header does not prove the
            surrounding application is secure. These tools are designed around those
            distinctions rather than a single pass/fail security score.
          </p>
        </div>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">Start with the Claim You Need to Establish</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">“What does this token contain?”</strong>{" "}
                Decode JWT structure or claims. That reveals data, not whether the issuer, signature, audience, time window, or application policy should trust it.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">“Does this MAC or signature match?”</strong>{" "}
                Verification needs the exact algorithm, key material, and signed bytes. A cryptographic match still does not replace issuer or authorization checks.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">“Is this secret suitable?”</strong>{" "}
                Length, randomness, algorithm requirements, reuse, storage, rotation, and exposure all matter. A local strength check can only inspect the value you provide.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">“Is this browser policy configured sensibly?”</strong>{" "}
                CSP, HSTS, cookie attributes, referrer policy, and Permissions Policy can be checked for obvious issues, but application security extends far beyond headers.
              </p>
            </SectionMiniCard>
          </div>
        </SectionCard>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Representative Security Questions</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              These selections cover signature verification, cookies, CSP, signing
              secrets, certificate inspection, and vulnerability-contact metadata.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {representativeTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">{tool.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{tool.description}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">Open tool →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">All Security Tools</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse all 32 tools for JWTs, hashes, HMACs, bcrypt, random secrets,
              RSA keys, PEM and certificates, CSP, CORS, cookies, HSTS, Permissions
              Policy, SRI, Referrer Policy, security.txt, and TLS-expiry planning.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {securityTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--light-gold)]">{tool.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">Hashing, HMAC, Password Hashing, and Encryption Are Not Interchangeable</h2>
          <div className="mt-5 space-y-5 text-gray-600 leading-relaxed">
            <p>
              A general cryptographic hash produces a digest from input bytes and does
              not use a secret key. HMAC combines a cryptographic hash with a shared
              secret to authenticate a message. Password hashing such as bcrypt is
              deliberately designed to make password guessing more expensive and uses
              salts and a work factor. None of those operations is reversible encryption.
            </p>
            <p>
              The category also contains encoding helpers because security formats use
              encodings internally, but representation should not be mistaken for
              protection. Base64URL makes bytes safe for compact text formats; it does
              not hide them from someone who can read the token.
            </p>
          </div>
        </section>

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">Handling Secret Material in Browser Tools</h2>
          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              Local browser processing reduces the need to send pasted values to a
              Yoryantra application server, but “local” does not make sensitive data
              risk-free. Clipboard history, browser extensions, screenshots, crash
              reports, screen sharing, and the device itself remain possible exposure paths.
            </p>
            <p>
              Use test keys or disposable examples when the real secret is not required.
              If production credentials, private keys, signing secrets, or bearer tokens
              are exposed outside their intended environment, treat rotation and incident
              handling as operational security decisions rather than formatting problems.
            </p>
          </div>
        </SectionCard>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900">References for the Security Boundaries Used Here</h2>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">RFC 7519 — JWT</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Defines JWT claims and compact token structure; signature and encryption mechanisms are supplied by the JOSE specifications it references.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">OWASP HTTP Security Response Headers Cheat Sheet</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Provides deployment context for CSP, HSTS, framing, MIME sniffing, referrer, permissions, and cross-origin response policies.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <a href="https://www.rfc-editor.org/rfc/rfc9116" target="_blank" rel="noreferrer" className="font-semibold text-[var(--green)] underline underline-offset-4">RFC 9116 — security.txt</a>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Defines the security.txt format for publishing vulnerability-reporting contact and policy information.</p>
            </div>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">Related Tool Categories</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/categories/developer-tools" className="yoryantra-btn-outline">Developer Tools</Link>
            <Link href="/categories/encoding-tools" className="yoryantra-btn-outline">Encoding Tools</Link>
            <Link href="/categories/devops-tools" className="yoryantra-btn-outline">DevOps Tools</Link>
            <Link href="/categories/json-tools" className="yoryantra-btn-outline">JSON & Data Tools</Link>
            <Link href="/categories/seo-tools" className="yoryantra-btn-outline">SEO Tools</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
