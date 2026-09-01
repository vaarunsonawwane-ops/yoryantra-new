import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Security Header Generator | CSP & HSTS | Yoryantra",
  description:
    "Generate HTTP security headers for HSTS, CSP, framing, MIME, referrer, permissions and cross-origin policies with practical deployment warnings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/security-header-generator",
  },
  openGraph: {
    title: "Security Header Generator | Yoryantra",
    description:
      "Build security-header starters while reviewing HSTS preload commitments, CSP breakage risk, framing policy, browser permissions, and deployment boundaries.",
    url: "https://yoryantra.com/tools/security-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Security Header Generator | Yoryantra",
    description:
      "Generate HTTP security-header starters with CSP, HSTS, framing, MIME, referrer, permissions, and policy-interaction guidance.",
  },
};

export default function Page() {
  return <ToolClient />;
}
