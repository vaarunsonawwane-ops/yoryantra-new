import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* BRAND */}
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Yoryantra
            </h2>
            <p className="text-sm text-gray-600 mt-2 max-w-sm">
              Simple, fast, and focused utilities — without unnecessary clutter.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex gap-12 text-sm">

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">Tools</p>
              <Link href="/tools" className="text-gray-700 hover:text-[var(--light-gold)]">
                All Tools
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">Company</p>
              <Link href="/about" className="text-gray-700 hover:text-[var(--light-gold)]">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-[var(--light-gold)]">
                Contact
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-semibold text-gray-900">Legal</p>
              <Link href="/privacy-policy" className="text-gray-700 hover:text-[var(--light-gold)]">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-700 hover:text-[var(--light-gold)]">
                Terms
              </Link>
            </div>

          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between text-sm text-gray-500">

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