import "./globals.css";

export const metadata = {
  title: "YORYANTRA",
  description:
    "Smart utilities for structured workflows, productivity, and modern work.",
  icons: {
    icon: "/YoryantraFavicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
<body className="bg-white text-gray-900">

  {/* HEADER */}
  <header className="bg-white sticky top-0 z-50 border-b border-gray-100">
    <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

      {/* LOGO */}
      <a href="/">
        <img
          src="/YoryantraLogo.png"
          alt="YORYANTRA"
          className="w-[140px] md:w-[180px] h-auto"
        />
      </a>

      {/* MENU */}
      <nav className="hidden md:flex items-center gap-10 text-sm font-medium">

        <a href="/" className="text-gray-900">
          Home
        </a>

        <a href="/tools" className="hover:text-[var(--gold)] transition">
          Tools
        </a>

        <a href="/categories" className="hover:text-[var(--gold)] transition">
          Categories
        </a>

        <a href="/about" className="hover:text-[var(--gold)] transition">
          About
        </a>

        <a href="/contact" className="hover:text-[var(--gold)] transition">
          Contact
        </a>

      </nav>
    </div>
  </header>

  {/* PAGE CONTENT */}
  {children}

  {/* FOOTER */}
  <footer className="border-t border-gray-200 mt-20">
    <div className="max-w-7xl mx-auto px-6 py-12">

      <div className="flex flex-wrap gap-6 text-sm text-gray-600">

        <a href="/about" className="hover:text-[var(--gold)]">
          About Us
        </a>

        <a href="/contact" className="hover:text-[var(--gold)]">
          Contact
        </a>

        <a href="/privacy-policy" className="hover:text-[var(--gold)]">
          Privacy Policy
        </a>

        <a href="/terms-and-conditions" className="hover:text-[var(--gold)]">
          Terms & Conditions
        </a>

        <a href="/disclaimer" className="hover:text-[var(--gold)]">
          Disclaimer
        </a>

        <a href="/sitemap" className="hover:text-[var(--gold)]">
          Sitemap
        </a>

      </div>

      <div className="mt-8 text-sm text-gray-500">
        © 2026 Yoryantra
        <br />
        Built with Gratitude 🙏
      </div>

    </div>
  </footer>

</body>
    </html>
  );
}