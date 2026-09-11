import Link from "next/link";

const primitives = [
  {
    title: "Hash",
    purpose: "Fingerprint data with a one-way digest.",
    boundary: "A plain hash does not authenticate who produced the data and is not password storage by itself.",
    href: "/tools/hash-generator",
    label: "Hash Generator",
  },
  {
    title: "HMAC",
    purpose: "Authenticate data with a shared secret and a hash construction.",
    boundary: "Both sides need the secret; compare the exact byte representation and protocol rules used by the sender.",
    href: "/tools/hmac-generator",
    label: "HMAC Generator",
  },
  {
    title: "Password hash",
    purpose: "Derive a deliberately expensive verifier from a password and salt.",
    boundary: "Password hashing has different goals from fast checksums or request signatures.",
    href: "/tools/bcrypt-generator",
    label: "bcrypt Generator",
  },
  {
    title: "Asymmetric key pair",
    purpose: "Separate public and private key material for protocols that use public-key cryptography.",
    boundary: "Generating a key pair does not choose a safe protocol, certificate policy, storage method, or rotation process for you.",
    href: "/tools/rsa-key-generator",
    label: "RSA Key Generator",
  },
];

const browserPolicies = [
  { label: "CSP Analyzer", href: "/tools/csp-analyzer" },
  { label: "Cookie Security Checker", href: "/tools/cookie-security-checker" },
  { label: "HSTS Header Generator", href: "/tools/hsts-header-generator" },
  { label: "Permissions Policy Header Generator", href: "/tools/permissions-policy-header-generator" },
  { label: "Referrer Policy Generator", href: "/tools/referrer-policy-generator" },
  { label: "Security.txt Generator", href: "/tools/security-txt-generator" },
];

export const metadata = {
  title: "Security Guides for JWTs, Hashes, HMAC, Keys, and Headers | Yoryantra",
  description:
    "Understand security-tool boundaries across JWT verification, hashing, HMAC, password hashing, keys, cookies, CSP, HSTS, and other browser security policies.",
  alternates: {
    canonical: "https://yoryantra.com/security-guides",
  },
  openGraph: {
    title: "Security Guides for Developers | Yoryantra",
    description:
      "Practical guidance for tokens, signatures, hashes, secrets, keys, cookies, and security headers without confusing readable output with trusted output.",
    url: "https://yoryantra.com/security-guides",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Guides for Developers | Yoryantra",
    description:
      "Decode, verify, hash, sign, and inspect with the right security boundary in mind.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--light-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Security Guides</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Readable Is Not the Same as Trusted
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Security values often look like encoded text: JWTs, hashes, keys,
            certificates, signatures, tokens, and HTTP headers. The dangerous
            mistake is to treat successful decoding or valid syntax as proof of
            authenticity, authorization, safety, or production readiness. Use a
            security tool only after deciding which property you need to check.
          </p>
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
            <h2 className="text-2xl font-semibold text-gray-900">A JWT Acceptance Chain</h2>
            <ol className="mt-5 space-y-4 leading-7 text-gray-600">
              <li><span className="font-semibold text-gray-900">1.</span> <strong className="text-gray-900">Parse:</strong> Is the compact token structurally readable?</li>
              <li><span className="font-semibold text-gray-900">2.</span> <strong className="text-gray-900">Verify:</strong> Does the signature match the expected algorithm and key material?</li>
              <li><span className="font-semibold text-gray-900">3.</span> <strong className="text-gray-900">Validate claims:</strong> Are issuer, audience, expiry, not-before time, and other required claims acceptable?</li>
              <li><span className="font-semibold text-gray-900">4.</span> <strong className="text-gray-900">Apply application policy:</strong> Does this token authorize this action in this system?</li>
            </ol>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              Stopping at step one is why a decoded JWT should never be described
              as “verified” simply because its header and payload are readable.
            </p>
          </div>

          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Useful JWT tools</h2>
            <div className="mt-5 flex flex-col gap-3 text-sm font-semibold">
              <Link href="/tools/jwt-decoder" className="text-[var(--light-gold)] hover:underline">JWT Decoder →</Link>
              <Link href="/tools/jwt-signature-verifier" className="text-[var(--light-gold)] hover:underline">JWT Signature Verifier →</Link>
              <Link href="/tools/jwt-expiration-checker" className="text-[var(--light-gold)] hover:underline">JWT Expiration Checker →</Link>
              <Link href="/tools/jwt-claims-inspector" className="text-[var(--light-gold)] hover:underline">JWT Claims Inspector →</Link>
              <Link href="/tools/jwt-secret-strength-checker" className="text-[var(--light-gold)] hover:underline">JWT Secret Strength Checker →</Link>
            </div>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Match the Primitive to the Property You Need</h2>
            <p className="mt-3 leading-7 text-gray-600">
              “Security” is not one operation. Integrity, authenticity, password
              verification, confidentiality, and authorization require different
              mechanisms.
            </p>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {primitives.map((item) => (
              <div key={item.title} className="self-start rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Use it to:</strong> {item.purpose}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Do not assume:</strong> {item.boundary}</p>
                <Link href={item.href} className="mt-5 inline-flex text-sm font-semibold text-[var(--light-gold)]">{item.label} →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">Headers Express Policy; Browsers Enforce It</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              CSP, HSTS, Permissions-Policy, Referrer-Policy, and cookie
              attributes are configuration inputs to browser behavior. A header
              generator can help build syntactically plausible policy text, but
              only a real response in the target application reveals deployment
              issues such as missing headers, conflicting directives, redirect
              placement, subdomain effects, or application resources blocked by
              policy.
            </p>
            <p>
              Prefer report-only or staged testing where the platform supports
              it, inspect browser developer tools, and keep policy scope as small
              as the application actually needs.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {browserPolicies.map((tool) => (
              <Link key={tool.href} href={tool.href} className="yoryantra-btn-outline">{tool.label}</Link>
            ))}
          </div>
        </section>

        <section className="mt-18 rounded-2xl border border-amber-200 bg-amber-50 p-7 md:p-9">
          <h2 className="text-xl font-semibold text-gray-900">Handle Secrets as Secrets</h2>
          <div className="mt-4 space-y-3 leading-7 text-gray-700">
            <p>
              Prefer sample, test, or redacted values when the task does not
              require a real production secret. Private keys, session tokens,
              signing secrets, passwords, and personal data deserve the same
              care in a browser tool that they receive in logs, terminals, and
              support tickets.
            </p>
            <p>
              When a Yoryantra tool runs locally, that reduces one class of data
              transfer; it does not make the surrounding device, clipboard,
              browser extensions, screenshots, or operational process trusted.
            </p>
          </div>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Primary references</h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <a href="https://www.rfc-editor.org/rfc/rfc7519" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">JSON Web Token — RFC 7519 ↗</a>
            <a href="https://www.rfc-editor.org/rfc/rfc2104" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">HMAC — RFC 2104 ↗</a>
            <a href="https://www.w3.org/TR/CSP3/" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Content Security Policy Level 3 ↗</a>
            <a href="https://www.rfc-editor.org/rfc/rfc6797" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">HTTP Strict Transport Security — RFC 6797 ↗</a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/categories/security-tools" className="yoryantra-btn-outline">Browse Security Tools</Link>
          <Link href="/encoding-guides" className="yoryantra-btn-outline">Encoding Guides</Link>
          <Link href="/resources" className="yoryantra-btn-outline">All Resource Guides</Link>
        </div>
      </section>
    </main>
  );
}
