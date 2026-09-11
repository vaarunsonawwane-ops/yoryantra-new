import Link from "next/link";
import { tools } from "@/app/data/tools";
import SectionCard from "@/app/components/SectionCard";
import SectionMiniCard from "@/app/components/SectionMiniCard";

const encodingTools = tools.filter((tool) => tool.category === "Encoding Tools");

const representativeHrefs = new Set<string>([
  "/tools/base64-encoder-decoder",
  "/tools/url-encoder-decoder",
  "/tools/unicode-escape-sequence-converter",
  "/tools/html-escape-unescape",
  "/tools/punycode-converter",
  "/tools/mime-encoded-word-decoder",
]);

const representativeTools = encodingTools.filter((tool) =>
  representativeHrefs.has(tool.href)
);

export const metadata = {
  title: "Encoding Tools for Base64, URLs, Unicode, and Text | Yoryantra",
  description:
    "Encode, decode, escape, and inspect Base64, Base32, Base58, hex, percent encoding, Unicode escapes, HTML or XML entities, MIME text, Punycode, and related representations.",
  alternates: {
    canonical: "https://yoryantra.com/categories/encoding-tools",
  },
  openGraph: {
    title: "Encoding Tools for Base64, URLs, Unicode, and Text | Yoryantra",
    description:
      "Work with byte encodings, URL components, Unicode escapes, markup entities, MIME text, Punycode, and other text representations.",
    url: "https://yoryantra.com/categories/encoding-tools",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Encoding Tools for Base64, URLs, Unicode, and Text | Yoryantra",
    description:
      "Inspect and convert byte, URL, Unicode, markup, MIME, and identifier representations with their context kept explicit.",
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
          <span className="text-gray-900">Encoding Tools</span>
        </div>

        <div className="max-w-4xl">
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Encoding Tools for Bytes, URLs, Unicode, and Markup
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-gray-600">
            Encoding changes how information is represented. The difficult part is
            rarely pressing “encode” or “decode”; it is knowing whether the input is
            text or bytes, which alphabet or escaping rules apply, and what the
            surrounding format will do with reserved characters.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-gray-900">Choose the Layer Before the Codec</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Bytes → restricted text:</strong>{" "}
                Base64, Base32, Base58, hex, and octal represent byte sequences with different alphabets and canonical rules.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Text → escaped syntax:</strong>{" "}
                Unicode escapes, JavaScript-style escapes, HTML or XML entities, and shell quoting protect text inside another grammar.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">URL components:</strong>{" "}
                complete URLs, path segments, query values, and form data do not apply percent encoding or plus-sign handling identically.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Email transport:</strong>{" "}
                MIME encoded-words belong in headers, while quoted-printable and Base64 transfer encodings describe message-body bytes.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">International identifiers:</strong>{" "}
                Punycode represents internationalized domain labels in an ASCII-compatible form; it is not a general-purpose text encoder.
              </p>
            </SectionMiniCard>
            <SectionMiniCard>
              <p className="text-sm leading-relaxed text-gray-700">
                <strong className="text-gray-900">Not a secrecy layer:</strong>{" "}
                Base64, hex, entities, escapes, QR data, and similar transformations are reversible representations, not encryption.
              </p>
            </SectionMiniCard>
          </div>
        </section>

        <section className="mt-16">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold text-gray-900">Representative Encoding Boundaries</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              These tools were selected to span byte encoding, URL components,
              Unicode escapes, markup entities, internationalized domain names, and
              MIME header text.
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
            <h2 className="text-2xl font-semibold text-gray-900">All Encoding Tools</h2>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Browse all 32 tools for Base64 and Base64URL, Base32, Base58, hex and
              octal bytes, percent encoding, Unicode escapes, HTML or XML entities,
              MIME text, Punycode, PEM text, QR data, and related transformations.
            </p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {encodingTools.map((tool) => (
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

        <SectionCard>
          <h2 className="text-2xl font-semibold text-gray-900">
            Decodable, Valid, and Canonical Are Three Different Claims
          </h2>
          <div className="mt-5 space-y-5 text-gray-600 leading-relaxed">
            <p>
              A permissive decoder may accept text that a standards-oriented encoder
              should never produce. Base64 padding rules vary by profile, Base64URL
              uses a different alphabet, percent escapes can be malformed, and Unicode
              escapes can encode unmatched surrogate code units. Successfully producing
              bytes does not prove the spelling was canonical for the intended format.
            </p>
            <p>
              The next boundary is text decoding. Arbitrary bytes are not automatically
              valid UTF-8, and silently replacing invalid byte sequences can hide data
              loss. Several Yoryantra tools therefore expose byte-oriented output,
              code-point information, or validation notes instead of forcing every
              decoded value into readable text.
            </p>
          </div>
        </SectionCard>

        <section className="mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-gray-900">Standards Behind the Representations</h2>
          <div className="mt-5 space-y-4 text-gray-600 leading-relaxed">
            <p>
              <a href="https://www.rfc-editor.org/rfc/rfc4648" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 4648</a>{" "}
              defines Base16, Base32, Base64, and the URL-safe Base64 alphabet, including canonical encoding concerns such as pad bits.
            </p>
            <p>
              The <a href="https://url.spec.whatwg.org/" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">WHATWG URL Standard</a>{" "}
              documents browser URL parsing, percent-encoding sets, query serialization, and form-related URL behavior.
            </p>
            <p>
              <a href="https://www.rfc-editor.org/rfc/rfc2045" target="_blank" rel="noreferrer" className="font-medium text-[var(--green)] underline underline-offset-4">RFC 2045</a>{" "}
              defines MIME transfer encodings such as quoted-printable and Base64 for message bodies.
            </p>
          </div>
        </section>

        <section className="mt-16 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-semibold text-gray-900">Related Tool Categories</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/categories/json-tools" className="yoryantra-btn-outline">JSON & Data Tools</Link>
            <Link href="/categories/developer-tools" className="yoryantra-btn-outline">Developer Tools</Link>
            <Link href="/categories/security-tools" className="yoryantra-btn-outline">Security Tools</Link>
            <Link href="/categories/devops-tools" className="yoryantra-btn-outline">DevOps Tools</Link>
            <Link href="/categories/seo-tools" className="yoryantra-btn-outline">SEO Tools</Link>
          </div>
        </section>
      </section>
    </main>
  );
}
