import Link from "next/link";

const contexts = [
  {
    title: "Encoding binary data for text-based transports",
    text: "Base64 and Base64URL encode bytes into text. They are not encryption, signing or confidentiality methods.",
    links: [
      { label: "Base64 Encoder Decoder", href: "/tools/base64-encoder-decoder" },
      { label: "URL Safe Base64 Converter", href: "/tools/url-safe-base64-converter" },
      { label: "Base32 Encoder Decoder", href: "/tools/base32-encoder-decoder" },
    ],
  },
  {
    title: "URLs and query strings",
    text: "Percent encoding is applied to bytes. Query strings may also use + to represent space. A complete URL and partial URL will require different treatments.",
    links: [
      { label: "URL Encoder Decoder", href: "/tools/url-encoder-decoder" },
      { label: "URL Query Encoder Decoder", href: "/tools/url-query-encoder-decoder" },
      { label: "Percent Encoding Analyzer", href: "/tools/percent-encoding-analyzer" },
    ],
  },
  {
    title: "Markup and escaped text",
    text: "HTML Entities, XML Entities, Unicode Escapes and Language String Escapes are used to escape text to solve different parsing issues.",
    links: [
      { label: "HTML Escape Unescape", href: "/tools/html-escape-unescape" },
      { label: "XML Escape Unescape", href: "/tools/xml-escape-unescape" },
      { label: "Unicode Escape Sequence Converter", href: "/tools/unicode-escape-sequence-converter" },
    ],
  },
  {
    title: "Email, Hostnames and Specialised Formats",
    text: "MIME Encoded Words, Quoted Printable and Punycode are used to represent email headers, message body and internationalised hostnames.",
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
          <Link href="/" className="transition-colors duration-200 hover:!text-[var(--gold-text)]">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Encoding Guides</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-5xl">
            Encoding is usually contextual. 
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The way characters are converted depends on the situation. You might 
			encode them in UTF-8 bytes, percent encode them inside a URL, 
			convert them to HTML entities, Unicode escapes or even Base64 if 
			you need to encode binary data using text.
          </p>
        </div>

        <section className="mt-16 rounded-2xl border border-gray-200 bg-gray-50 p-7 md:p-9">
          <h2 className="text-2xl font-semibold text-gray-900">Text to bytes</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Unicode is used to define the characters and code points. The encoding 
			  (e.g. UTF-8) defines how to convert these to bytes. Finally the bytes 
			  can be converted to Base64 so they can be represented with a 
			  limited text alphabet. If you miss out any of these steps you 
			  will end up with two systems that show the same text but will encode 
			  it differently.
            </p>
            <p>
              It is important to be precise with how you handle UTF-8 when converting 
			  text to hex, Base64, hashes or escaped bytes. Malformed bytes should also 
			  be exposed.
            </p>
          </div>
        </section>

        <section className="mt-18">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Choose a context for your transformation</h2>
            <p className="mt-3 leading-7 text-gray-600">
              Choose a context for your transformation.
            </p>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {contexts.map((context) => (
              <div key={context.title} className="self-start rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{context.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{context.text}</p>
                <div className="mt-5 flex flex-col gap-2">
                  {context.links.map((link) => (
                    <Link key={link.href} href={link.href} className="text-sm font-semibold text-[var(--gold-text)] hover:underline">
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
              Standard Base64 includes <code>+</code> and <code>/</code> the character set, often with 
			  <code>=</code> padding. Base64URL replaces these with 
              <code>-</code> and <code>_</code> to better fit with URL and filename characters. 
			  Many protocols do not include padding. This is not the same as percent encoding a 
			  standard Base64 string.
            </p>
          </div>

          <div className="self-start rounded-2xl border border-gray-200 bg-white p-7">
            <h2 className="text-xl font-semibold text-gray-900">Canonical Forms</h2>
            <p className="mt-4 leading-7 text-gray-600">
              Some decoders will take multiple forms of the same value. Padding 
			  is not required, hex may be in any case, percent encoding may be 
			  overkill and Base64 may not be canonical. For interoperability 
			  and signing the exact value may matter. A forgiving decoder should 
			  not present all values as the canonical form.
            </p>
          </div>
        </section>

        <section className="mt-18 max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-900">Different escaping</h2>
          <div className="mt-5 space-y-4 leading-8 text-gray-600">
            <p>
              Escaped text for HTML is not safe to use as JavaScript source, shell 
			  arguments, CSS, SQL or URLs. Each parser will have specific characters 
			  with special meaning. The important thing to consider is what grammar 
			  the string is escaped for and when in the parsing process.
            </p>
            <p>
              Encoding is not a reversible process and should not be used as a 
			  replacement for encryption, signing, authorisation or confidentiality. 
			  If the issue is a trust issue then head over to the security workflow.
            </p>
          </div>
          <Link href="/security-guides" className="mt-5 inline-flex font-semibold text-[var(--gold-text)]">
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
