"use client";

import { useState } from "react";
import Link from "next/link";

const navigation = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/tools",
    label: "Tools",
  },
  {
    href: "/categories",
    label: "Categories",
  },
  {
    href: "/developers",
    label: "Developers",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LOGO */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={closeMobileMenu}
        >
          <img
            src="/logo.png"
            alt="Yoryantra"
            className="h-9 w-auto md:h-10"
          />
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 text-sm font-medium md:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-700 transition-colors duration-200 hover:!text-[var(--light-gold)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          aria-label={
            isMobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
          aria-controls="yoryantra-mobile-navigation"
          onClick={() =>
            setIsMobileMenuOpen((currentState) => !currentState)
          }
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[var(--green)] transition hover:border-[var(--light-gold)] hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--light-gold)] focus-visible:ring-offset-2 md:hidden"
        >
          {isMobileMenuOpen ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
            >
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* MOBILE NAVIGATION */}
      <nav
        id="yoryantra-mobile-navigation"
        aria-label="Mobile navigation"
        className={`border-t border-gray-100 bg-white px-6 pb-5 pt-2 md:hidden ${
          isMobileMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className="border-b border-gray-100 py-3 text-sm font-medium text-gray-700 transition-colors duration-200 last:border-b-0 hover:!text-[var(--light-gold)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
