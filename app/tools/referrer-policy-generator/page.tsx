import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Referrer Policy Generator – Browser Behavior | Yoryantra",
  description:
    "Build a Referrer-Policy header or meta element and compare same-origin, cross-origin, and HTTPS-to-HTTP referrer behavior before rollout.",
  keywords: [
    "Referrer Policy Generator",
    "Referrer-Policy header",
    "strict-origin-when-cross-origin",
    "no-referrer",
    "same-origin referrer policy",
    "referrer privacy",
    "Referer header",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/referrer-policy-generator",
  },
  openGraph: {
    title: "Referrer Policy Generator – Browser Behavior | Yoryantra",
    description:
      "Build a Referrer-Policy value and compare what browsers send across origin and downgrade boundaries.",
    url: "https://yoryantra.com/tools/referrer-policy-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Referrer Policy Generator – Browser Behavior | Yoryantra",
    description:
      "Build a Referrer-Policy value and compare what browsers send across origin and downgrade boundaries.",
  },
};

export default function ReferrerPolicyGeneratorPage() {
  return <ToolClient />;
}
