import Link from "next/link";
import { tools } from "@/app/data/tools";

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

            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="hover:text-[var(--light-gold)] transition-colors"
              >
                {tool.title}
              </Link>
            ))}

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