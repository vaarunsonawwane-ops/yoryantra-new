import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center shrink-0">
          <img
            src="/logo.png"
            alt="Yoryantra"
            className="h-8 w-auto"
          />
        </Link>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-8 text-sm font-medium">

          <Link
            href="/"
            className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
          >
            Home
          </Link>

          <Link
            href="/tools"
            className="text-gray-700 hover:!text-[var(--light-gold)] transition-colors duration-200"
          >
            Tools
          </Link>

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

        </nav>
      </div>
    </header>
  );
}