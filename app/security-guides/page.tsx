import Link from "next/link";

const primitives = [
  {
    title: "Hash",
    Use For: "Create a one way digest of your data to use as a fingerprint.",
    Don’t Assume : "A simple hash will not verify the source of the data. It is not a password storage mechanism.",
    href: "/tools/hash-generator",
    label: "Hash Generator",
  },
  {
    title: "HMAC",
    Use For: "Use a shared secret to verify data using a hash.",
    Don’t Assume: "Both parties must know the secret. Compare the exact bytes and protocol used by the sender.",
    href: "/tools/hmac-generator",
    label: "HMAC Generator",
  },
  {
    title: "Password hash",
    Use For: "Create a slow verifier from a password and salt.",
    Don’t Assume: "Password hashing has a different purpose to quick checksums or signing requests.",
    href: "/tools/bcrypt-generator",
    label: "bcrypt Generator",
  },
  {
    title: "Asymmetric key pair",
    Use For: "Split private and public keys for protocols using public key cryptography.",
    Don’t Assume: "Creating a key pair will not select a secure protocol, certificate policy, storage or rotation.",
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
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--gold-text)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Security Guides</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Readable Does Not Mean Verifiable
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Security often involves using encoded data (JWTs, hashes, keys, 
			certificates, signatures, tokens, HTTP headers). Being able to 
			decode or having valid syntax is a dangerous assumption and 
			should not be considered as valid or safe. Only use a security 
			tool once you have decided which security check you want to perform.
          </p>
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
            <h2 className="text-2xl font-semibold text-gray-900">JWT Verification Flow</h2>
            <ol className="mt-5 space-y-4 leading-7 text-gray-600">
              <li><span className="font-semibold text-gray-900">1.</span> <strong className="text-gray-900">Parse:</strong> Is the compact token readable?</li>
              <li><span className="font-semibold text-gray-900">2.</span> <strong className="text-gray-900">Verify:</strong> Does the signature use the correct algorithm and key?</li>
              <li><span className="font-semibold text-gray-900">3.</span> <strong className="text-gray-900">Validate claims:</strong> Are the claims (issuer, audience, expiry, not before and any other required claims) valid?</li>
              <li><span className="font-semibold text-gray-900">4.</span> <strong className="text-gray-900">Apply Policy:</strong> Does the token allow this action on this system?</li>
            </ol>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              If you stop at step 1 then you should never refer to a decoded 
			  JWT as being verified.
            </p>
          </div>

          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">Useful JWT tools</h2>
            <div className="mt-5 flex flex-col gap-3 text-sm font-semibold">
              <Link href="/tools/jwt-signature-verifier" className="text-[var(--gold-text)] hover:underline">JWT Signature Verifier →</Link>
              <Link href="/tools/jwt-claims-inspector" className="text-[var(--gold-text)] hover:underline">JWT Claims Inspector →</Link>
              <Link href="/tools/jwt-secret-strength-checker" className="text-[var(--gold-text)] hover:underline">JWT Secret Strength Checker →</Link>
            </div>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Use the Right Primitive for the Right Purpose</h2>
            <p className="mt-3 leading-7 text-gray-600">
              Security is not a single task. Each mechanism will differ depending 
			  on your purpose (Integrity, Authenticity, Password Verification, 
			  Confidentiality, Authorisation).
            </p>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {primitives.map((item) => (
              <div key={item.title} className="self-start rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Use it to:</strong> {item.purpose}</p>
                <p className="mt-2 text-sm leading-6 text-gray-600"><strong className="text-gray-900">Do not assume:</strong> {item.boundary}</p>
                <Link href={item.href} className="mt-5 inline-flex text-sm font-semibold text-[var(--gold-text)]">{item.label} →</Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">Headers & Browser Policies</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Headers such as CSP, HSTS, Permissions-Policy, Referrer-Policy and 
			  cookie attributes can be used to configure your browser. Whilst a header 
			  generator can help you create a syntactically correct policy, 
			  only a real response from your target application will show any 
			  issues with your deployment (missing headers, conflicting policies, 
			  redirects, subdomains and blocked resources).
            </p>
            <p>
              Try to use report mode or staged if possible on the platform. 
			  Check the developer tools on your browser. Keep the policy 
			  as small as possible for your application..
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {browserPolicies.map((tool) => (
              <Link key={tool.href} href={tool.href} className="yoryantra-btn-outline">{tool.label}</Link>
            ))}
          </div>
        </section>

        <section className="mt-18 rounded-2xl border border-amber-200 bg-amber-50 p-7 md:p-9">
          <h2 className="text-xl font-semibold text-gray-900">Secrets</h2>
          <div className="mt-4 space-y-3 leading-7 text-gray-700">
            <p>
              Where possible use sample/test/redacted data. Any private keys, 
			  session tokens, signing secrets, passwords or personal 
			  data should be treated with the same care as they would be in logs, 
			  terminal or support tickets. 
            </p>
            <p>
              If you are running a Yoryantra tool locally it will reduce one 
			  category of data transfer but doesn’t mean that your device, 
			  clipboard, extensions, screenshots or process are trusted.
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
