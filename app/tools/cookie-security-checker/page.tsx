import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cookie Security Checker | Review Secure HttpOnly SameSite Cookies | Yoryantra",
  description:
    "Review Set-Cookie headers for common security issues. Check Secure, HttpOnly, SameSite, expiry, Domain, Path, cookie prefixes, Partitioned cookies, and risky settings in your browser.",
  keywords: [
    "Cookie Security Checker",
    "Set-Cookie header checker",
    "HttpOnly cookie checker",
    "Secure cookie checker",
    "SameSite cookie checker",
    "cookie security scanner",
    "Partitioned cookie checker",
    "cookie header analyzer",
    "session cookie checker",
    "security tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-security-checker",
  },
  openGraph: {
    title: "Cookie Security Checker | Review Secure HttpOnly SameSite Cookies | Yoryantra",
    description:
      "Review Set-Cookie headers for common security issues. Check Secure, HttpOnly, SameSite, expiry, Domain, Path, cookie prefixes, Partitioned cookies, and risky settings in your browser.",
    url: "https://yoryantra.com/tools/cookie-security-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Security Checker | Review Secure HttpOnly SameSite Cookies | Yoryantra",
    description:
      "Review Set-Cookie headers for common security issues. Check Secure, HttpOnly, SameSite, expiry, Domain, Path, cookie prefixes, Partitioned cookies, and risky settings in your browser.",
  },
};

export default function CookieSecurityCheckerPage() {
  return <ToolClient />;
}
