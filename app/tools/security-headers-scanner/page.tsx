import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Security Headers Scanner | Paste or Browser-Check Response Headers | Yoryantra",
  description:
    "Inspect pasted HTTP response headers for CSP, HSTS, framing, MIME, referrer, permissions, and cross-origin policies, with an optional CORS-limited browser URL check.",
  keywords: [
    "security headers scanner",
    "http security headers",
    "response header checker",
    "csp header checker",
    "hsts header checker",
    "x frame options checker",
    "referrer policy checker",
    "permissions policy checker",
    "coop coep corp headers",
    "security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/security-headers-scanner",
  },
  openGraph: {
    title: "Security Headers Scanner | Paste or Browser-Check Response Headers | Yoryantra",
    description:
      "Inspect pasted security response headers reliably, or try a browser URL check when CORS exposes the values.",
    url: "https://yoryantra.com/tools/security-headers-scanner",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security Headers Scanner | Yoryantra",
    description:
      "Inspect pasted CSP, HSTS, framing, MIME, referrer, permissions, and cross-origin response headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
