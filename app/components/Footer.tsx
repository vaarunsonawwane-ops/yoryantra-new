import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between gap-12">

          {/* BRAND */}
          <div className="max-w-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Yoryantra
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Simple, fast, and focused utilities — without unnecessary clutter.
            </p>
          </div>

		 {/* LINKS */}
		<div className="flex flex-wrap gap-12 text-sm">

		  {/* RESOURCES */}
		  <div className="flex flex-col gap-3">
			<p className="font-semibold text-gray-900">
			  Resources
			</p>

			<Link
			  href="/developers"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Developers
			</Link>

			<Link
			  href="/categories"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Categories
			</Link>

			<Link
			  href="/tools"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Tools
			</Link>

			<Link
			  href="/sitemap"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Sitemap
			</Link>
		  </div>

		  {/* TOOLS */}
		  <div className="flex flex-col gap-3">
			<p className="font-semibold text-gray-900">
			  Tools
			</p>

			<Link
			  href="/tools"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  All Tools
			</Link>
		  </div>

		  {/* COMPANY */}
		  <div className="flex flex-col gap-3">
			<p className="font-semibold text-gray-900">
			  Company
			</p>

			<Link
			  href="/about"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  About
			</Link>

			<Link
			  href="/contact"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Contact
			</Link>
		  </div>

		  {/* LEGAL */}
		  <div className="flex flex-col gap-3">
			<p className="font-semibold text-gray-900">
			  Legal
			</p>

			<Link
			  href="/privacy-policy"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Privacy Policy
			</Link>

			<Link
			  href="/terms"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Terms
			</Link>

			<Link
			  href="/disclaimer"
			  className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
			>
			  Disclaimer
			</Link>
		  </div>

		</div>

        {/* BOTTOM BAR */}
        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm text-gray-500">

          <p>
            © {new Date().getFullYear()} Yoryantra. All rights reserved.
          </p>

          <p>
            Built with Gratitude 🙏
          </p>

        </div>

      </div>
    </footer>
  );
}