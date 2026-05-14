import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between gap-12">

          {/* BRAND */}
          <div className="max-w-sm">
            <h2 className="text-lg font-bold text-gray-900">
              Yoryantra
            </h2>

            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Simple, fast, and focused utilities — without unnecessary clutter.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex flex-wrap gap-12 text-sm">

            {/* TOOLS */}
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
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
            </div>

          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between gap-3 text-sm text-gray-500">

          <p>
            © {new Date().getFullYear()} Yoryantra. All rights reserved.
          </p>

          <p>
            Built with simplicity and focus.
          </p>

        </div>

      </div>
    </footer>
  );
}