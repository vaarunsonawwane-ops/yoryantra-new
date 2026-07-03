import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Security Headers Scanner | Browser-Visible Header Review | Yoryantra",
  description:
    "Review browser-visible CSP, HSTS, framing, MIME, referrer, permissions, and cross-origin response headers. Results may be limited by CORS and header exposure rules.",
  keywords: [
    "security headers scanner",
    "security headers checker",
    "http security headers",
    "csp header checker",
    "hsts header checker",
    "x frame options checker",
    "referrer policy checker",
    "permissions policy checker",
    "browser visible response headers",
    "developer security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/security-headers-scanner",
  },
  openGraph: {
    title: "Security Headers Scanner | Browser-Visible Header Review | Yoryantra",
    description:
      "Review security-related response headers that a browser is allowed to expose for a URL.",
    url: "https://yoryantra.com/tools/security-headers-scanner",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Headers Scanner | Yoryantra",
    description:
      "Review browser-visible CSP, HSTS, framing, MIME, referrer, permissions, and cross-origin headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
