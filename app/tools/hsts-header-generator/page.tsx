import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HSTS Header Generator | Create Strict-Transport-Security Headers | Yoryantra",
  description:
    "Generate Strict-Transport-Security headers for HTTPS sites. Configure max-age, includeSubDomains, preload, rollout warnings, and copy clean HSTS output in your browser.",
  keywords: [
    "HSTS Header Generator",
    "Strict-Transport-Security generator",
    "HSTS generator",
    "HSTS preload header",
    "Strict Transport Security header",
    "HSTS max-age generator",
    "security header generator",
    "HTTPS security header",
    "security tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/hsts-header-generator",
  },
  openGraph: {
    title: "HSTS Header Generator | Create Strict-Transport-Security Headers | Yoryantra",
    description:
      "Generate Strict-Transport-Security headers for HTTPS sites. Configure max-age, includeSubDomains, preload, rollout warnings, and copy clean HSTS output in your browser.",
    url: "https://yoryantra.com/tools/hsts-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HSTS Header Generator | Create Strict-Transport-Security Headers | Yoryantra",
    description:
      "Generate Strict-Transport-Security headers for HTTPS sites. Configure max-age, includeSubDomains, preload, rollout warnings, and copy clean HSTS output in your browser.",
  },
};

export default function HSTSHeaderGeneratorPage() {
  return <ToolClient />;
}
