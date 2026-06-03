import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Referrer Policy Generator | Generate Referrer-Policy Header Online | Yoryantra",
  description:
    "Generate Referrer-Policy headers for websites. Compare strict-origin-when-cross-origin, no-referrer, same-origin, origin, and other browser referrer privacy policies.",
  keywords: [
    "Referrer Policy Generator",
    "Referrer-Policy header generator",
    "referrer policy checker",
    "referrer policy header",
    "strict-origin-when-cross-origin",
    "no-referrer policy",
    "security headers",
    "privacy headers",
    "web security tools",
    "security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/referrer-policy-generator",
  },
  openGraph: {
    title: "Referrer Policy Generator | Generate Referrer-Policy Header Online | Yoryantra",
    description:
      "Generate Referrer-Policy headers for websites. Compare strict-origin-when-cross-origin, no-referrer, same-origin, origin, and other browser referrer privacy policies.",
    url: "https://yoryantra.com/tools/referrer-policy-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Referrer Policy Generator | Generate Referrer-Policy Header Online | Yoryantra",
    description:
      "Generate Referrer-Policy headers for websites. Compare strict-origin-when-cross-origin, no-referrer, same-origin, origin, and other browser referrer privacy policies.",
  },
};

export default function ReferrerPolicyGeneratorPage() {
  return <ToolClient />;
}
