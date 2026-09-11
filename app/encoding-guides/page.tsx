import Link from "next/link";

const contexts = [
  {
    title: "Binary data in text-only channels",
    text: "Base64 and Base64URL represent bytes as text. They are transport encodings, not encryption, signatures, or secrecy.",
    links: [
      { label: "Base64 Encoder Decoder", href: "/tools/base64-encoder-decoder" },
      { label: "URL Safe Base64 Converter", href: "/tools/url-safe-base64-converter" },
      { label: "Base32 Encoder Decoder", href: "/tools/base32-encoder-decoder" },
    ],
  },
  {
    title: "URLs and query strings",
    text: "Percent encoding works on bytes, while query forms can also treat plus signs as spaces. A full URL and one URL component need different handling.",
    links: [
      { label: "URL Encoder Decoder", href: "/tools/url-encoder-decoder" },
      { label: "URL Query Encoder Decoder", href: "/tools/url-query-encoder-decoder" },
      { label: "Percent Encoding Analyzer", href: "/tools/percent-encoding-analyzer" },
    ],
  },
  {
    title: "Markup and escaped text",
    text: "HTML entities, XML entities, Unicode escapes, and language string escapes solve different parsing problems even when the visible character is the same.",
    links: [
      { label: "HTML Encoder Decoder", href: "/tools/html-encoder-decoder" },
      { label: "XML Escape Unescape", href: "/tools/xml-escape-unescape" },
      { label: "Unicode Escape Sequence Converter", href: "/tools/unicode-escape-sequence-converter" },
    ],
  },
  {
    title: "Email, hostnames, and specialized formats",
    text: "MIME encoded-words, quoted-printable bodies, and Punycode exist because email headers, message bodies, and internationalized hostnames have their own representation rules.",
    links: [
      { label: "MIME Encoded-Word Decoder", href: "/tools/mime-encoded-word-decoder" },
      { label: "Quoted Printable Encoder Decoder", href: "/tools/quoted-printable-encoder-decoder" },
      { label: "Punycode Converter", href: "/tools/punycode-converter" },
    ],
  },
];

export const metadata = {
  title: "Encoding Guides for Base64, URLs, Unicode, HTML, and MIME | Yoryantra",
  description:
    "Understand text and byte representations across Base64, percent encoding, Unicode escapes, HTML/XML entities, MIME, Punycode, and URL-safe formats.",
  alternates: {
    canonical: "https://yoryantra.com/encoding-guides",
  },
  openGraph: {
    title: "Encoding Guides for Web Text and Bytes | Yoryantra",
    description:
      "Choose encoding by context and understand where Base64, URL encoding, entities, Unicode escapes, MIME, and Punycode differ.",
    url: "https://yoryantra.com/encoding-guides",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Encoding Guides for Web Text and Bytes | Yoryantra",
    description:
      "Encoding changes representation. Learn which representation belongs in URLs, markup, tokens, email, or byte-oriented workflows.",
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--light-gold)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Encoding Guides</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Encoding Changes Representation, Not Trust
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Encoding problems are usually context problems. The same character
            can become UTF-8 bytes, percent escapes in a URL, an HTML entity in
            markup, a Unicode escape in source text, or Base64 when binary data
            must pass through a text channel. Choosing the right transformation
            starts with where the value is going next.
          </p>
        </div>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
          <h2 className="text-2xl font-semibold text-gray-900">Text First, Bytes Second</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Unicode describes characters and code points. Encodings such as
              UTF-8 describe how those characters become bytes. Base64 then
              represents bytes using a restricted text alphabet. If you skip one
              of those layers, two systems can display the same text but produce
              different encoded output.
            </p>
            <p>
              This is why exact UTF-8 handling matters when converting text to
              hexadecimal, Base64, hashes, or escaped byte sequences. It also
              explains why malformed byte sequences should be surfaced instead
              of silently replaced with a generic replacement character.
            </p>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Choose by Destination Context</h2>
            <p className="mt-3 leading-7 text-gray-600">
              A transformation is useful only when its output matches the syntax
              rules of the destination that will consume it.
            </p>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {contexts.map((context) => (
              <div key={context.title} className="self-start rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{context.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{context.text}</p>
                <div className="mt-5 flex flex-col gap-2">
                  {context.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm font-semibold text-[var(--light-gold)] hover:underline">
                      {link.label} →
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 grid gap-6 lg:grid-cols-2">
          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7">
            <h2 className="text-xl font-semibold text-gray-900">Base64 vs Base64URL</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Standard Base64 uses <code>+</code> and <code>/</code> in its
              alphabet and commonly uses <code>=</code> padding. Base64URL uses
              <code>-</code> and <code>_</code> instead so the alphabet fits URL
              and filename contexts more comfortably, and many protocols omit
              padding. Changing the alphabet is not the same as percent-encoding
              a standard Base64 string.
            </p>
          </div>

          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7">
            <h2 className="text-xl font-semibold text-gray-900">Canonical Form Matters</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Some decoders accept several spellings of the same value: optional
              padding, lowercase or uppercase hex, redundant percent escapes, or
              non-canonical Base64 pad bits. Interoperability and signatures can
              depend on the exact representation, so a tolerant decoder should
              not make every accepted spelling look equally canonical.
            </p>
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">Escaping Is Context-Specific</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Escaping text for HTML does not make it safe as JavaScript source,
              a shell argument, CSS, SQL, or a URL. Each parser gives special
              meaning to a different set of characters. The correct question is
              not “is this string escaped?” but “escaped for which grammar, and
              at which point in the parsing chain?”
            </p>
            <p>
              The same rule applies to security: encoding is reversible and
              should not be used as a substitute for encryption, signatures,
              authorization, or secret storage. If the problem is trust rather
              than representation, move to the security workflow instead.
            </p>
          </div>
          <Link href="/security-guides" className="mt-5 inline-flex font-semibold text-[var(--light-gold)]">
            Continue to Security Guides →
          </Link>
        </section>

        <section className="mt-18 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">Primary references for representation rules</h2>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <a href="https://www.rfc-editor.org/rfc/rfc4648" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">Base-N Encodings — RFC 4648 ↗</a>
            <a href="https://www.rfc-editor.org/rfc/rfc3986" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">URI Generic Syntax — RFC 3986 ↗</a>
            <a href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">WHATWG URL Standard ↗</a>
            <a href="https://www.unicode.org/standard/standard.html" target="_blank" rel="noreferrer" className="text-[var(--green)] underline underline-offset-4">The Unicode Standard ↗</a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/categories/encoding-tools" className="yoryantra-btn-outline">Browse Encoding Tools</Link>
          <Link href="/resources" className="yoryantra-btn-outline">All Resource Guides</Link>
        </div>
      </section>
    </main>
  );
}
