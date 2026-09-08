import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Cookie Security Checker – Set-Cookie Flags & Scope | Yoryantra",
  description:
    "Check Set-Cookie headers for Secure, HttpOnly, SameSite, Domain, Path, prefix rules, Partitioned cookies, expiry, and duplicate attributes.",
  keywords: [
    "Cookie Security Checker",
    "Set-Cookie checker",
    "Secure cookie",
    "HttpOnly cookie",
    "SameSite cookie",
    "cookie prefix rules",
    "Partitioned cookie",
    "cookie Domain Path",
    "RFC 10025 cookies",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-security-checker",
  },
  openGraph: {
    title: "Cookie Security Checker – Set-Cookie Flags & Scope | Yoryantra",
    description:
      "Check Set-Cookie flags, scope, prefix rules, Partitioned requirements, expiry, and duplicate attributes.",
    url: "https://yoryantra.com/tools/cookie-security-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Security Checker – Set-Cookie Flags & Scope | Yoryantra",
    description:
      "Check Set-Cookie flags, scope, prefix rules, Partitioned requirements, expiry, and duplicate attributes.",
  },
};

export default function CookieSecurityCheckerPage() {
  return <ToolClient />;
}
