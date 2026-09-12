import Link from "next/link";

const linkClass =
  "text-gray-700 transition-colors duration-200 hover:!text-[var(--light-gold)] focus-visible:outline-none focus-visible:text-[var(--green)]";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row">
          <div className="max-w-sm">
            <p className="text-lg font-bold text-gray-900">Yoryantra</p>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Practical browser tools and guides for everyday technical work.
            </p>
          </div>

          <div className="grid w-full gap-10 text-sm sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">Explore</p>

              <Link href="/tools" className={linkClass}>
                Tools
              </Link>

              <Link href="/categories" className={linkClass}>
                Categories
              </Link>

              <Link href="/resources" className={linkClass}>
                Resources
              </Link>

              <Link href="/sitemap" className={linkClass}>
                Sitemap
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">Guides</p>

              <Link href="/developers" className={linkClass}>
                Developer Workflows
              </Link>

              <Link href="/devops-resources" className={linkClass}>
                DevOps Resources
              </Link>

              <Link href="/encoding-guides" className={linkClass}>
                Encoding Guides
              </Link>

              <Link href="/json-guides" className={linkClass}>
                JSON &amp; Data Guides
              </Link>

              <Link href="/security-guides" className={linkClass}>
                Security Guides
              </Link>

              <Link href="/seo-resources" className={linkClass}>
                SEO Resources
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">Yoryantra</p>

              <Link href="/about" className={linkClass}>
                About
              </Link>

              <Link href="/contact" className={linkClass}>
                Contact
              </Link>

              <Link
                href="/how-yoryantra-tools-are-built"
                className={linkClass}
              >
                How Tools Are Built
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">Legal</p>

              <Link href="/privacy-policy" className={linkClass}>
                Privacy Policy
              </Link>

              <Link href="/terms" className={linkClass}>
                Terms
              </Link>

              <Link href="/disclaimer" className={linkClass}>
                Disclaimer
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-gray-100 pt-5 text-sm text-gray-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Yoryantra. All rights reserved.</p>

          <p className="text-sm font-medium text-[var(--light-gold)]">
            Built with Gratitude 🙏
          </p>
        </div>
      </div>
    </footer>
  );
}
