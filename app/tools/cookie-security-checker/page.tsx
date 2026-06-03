import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cookie Security Checker | Check HttpOnly Secure SameSite Cookies | Yoryantra",
  description:
    "Check Set-Cookie headers for common security issues. Review HttpOnly, Secure, SameSite, expiry, domain, path, prefix rules, and risky cookie settings directly in your browser.",
  keywords: [
    "Cookie Security Checker",
    "Set-Cookie header checker",
    "HttpOnly cookie checker",
    "Secure cookie checker",
    "SameSite cookie checker",
    "cookie security scanner",
    "cookie header analyzer",
    "session cookie checker",
    "security tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-security-checker",
  },
  openGraph: {
    title: "Cookie Security Checker | Check HttpOnly Secure SameSite Cookies | Yoryantra",
    description:
      "Check Set-Cookie headers for common security issues. Review HttpOnly, Secure, SameSite, expiry, domain, path, prefix rules, and risky cookie settings directly in your browser.",
    url: "https://yoryantra.com/tools/cookie-security-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Security Checker | Check HttpOnly Secure SameSite Cookies | Yoryantra",
    description:
      "Check Set-Cookie headers for common security issues. Review HttpOnly, Secure, SameSite, expiry, domain, path, prefix rules, and risky cookie settings directly in your browser.",
  },
};

export default function CookieSecurityCheckerPage() {
  return <ToolClient />;
}
