import Link from "next/link";

export const metadata = {
  title: "Sitemap | Yoryantra",

  description:
    "Browse all important pages and tools available on Yoryantra.",
};

export default function SitemapPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">

      <h1 className="text-4xl font-bold text-gray-900 mb-10">
        Sitemap
      </h1>

      <div className="space-y-10">

        {/* MAIN */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Main Pages
          </h2>

          <div className="flex flex-col gap-3 text-gray-700">

            <Link href="/" className="hover:text-[var(--light-gold)] transition-colors">
              Home
            </Link>

            <Link href="/tools" className="hover:text-[var(--light-gold)] transition-colors">
              Tools
            </Link>

            <Link href="/about" className="hover:text-[var(--light-gold)] transition-colors">
              About
            </Link>

            <Link href="/contact" className="hover:text-[var(--light-gold)] transition-colors">
              Contact
            </Link>

          </div>
        </div>

        {/* TOOLS */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Tools
          </h2>

          <div className="flex flex-col gap-3 text-gray-700">

            <Link href="/tools/json-formatter" className="hover:text-[var(--light-gold)] transition-colors">
              JSON Formatter
            </Link>

            <Link href="/tools/base64-encoder-decoder" className="hover:text-[var(--light-gold)] transition-colors">
              Base64 Encoder Decoder
            </Link>

            <Link href="/tools/jwt-decoder" className="hover:text-[var(--light-gold)] transition-colors">
              JWT Decoder
            </Link>

            <Link href="/tools/regex-tester" className="hover:text-[var(--light-gold)] transition-colors">
              Regex Tester
            </Link>

            <Link href="/tools/timestamp-converter" className="hover:text-[var(--light-gold)] transition-colors">
              Timestamp Converter
            </Link>

            <Link href="/tools/sql-formatter" className="hover:text-[var(--light-gold)] transition-colors">
              SQL Formatter
            </Link>

            <Link href="/tools/url-encoder-decoder" className="hover:text-[var(--light-gold)] transition-colors">
              URL Encoder Decoder
            </Link>

            <Link href="/tools/slug-generator" className="hover:text-[var(--light-gold)] transition-colors">
              Slug Generator
            </Link>

            <Link href="/tools/text-case-converter" className="hover:text-[var(--light-gold)] transition-colors">
              Text Case Converter
            </Link>

            <Link href="/tools/word-counter" className="hover:text-[var(--light-gold)] transition-colors">
              Word Counter
            </Link>

          </div>
        </div>

        {/* LEGAL */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Legal
          </h2>

          <div className="flex flex-col gap-3 text-gray-700">

            <Link href="/privacy-policy" className="hover:text-[var(--light-gold)] transition-colors">
              Privacy Policy
            </Link>

            <Link href="/terms" className="hover:text-[var(--light-gold)] transition-colors">
              Terms of Use
            </Link>

            <Link href="/disclaimer" className="hover:text-[var(--light-gold)] transition-colors">
              Disclaimer
            </Link>

          </div>
        </div>

      </div>

    </div>
  );
}