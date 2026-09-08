import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HSTS Header Generator – max-age & Preload | Yoryantra",
  description:
    "Build Strict-Transport-Security headers with exact max-age values, includeSubDomains, preload cautions, rollout guidance, and server configuration output.",
  keywords: [
    "HSTS header generator",
    "Strict-Transport-Security",
    "HSTS max-age",
    "includeSubDomains",
    "HSTS preload",
    "RFC 6797",
    "Nginx HSTS header",
    "Apache HSTS header",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/hsts-header-generator",
  },
  openGraph: {
    title: "HSTS Header Generator – max-age & Preload | Yoryantra",
    description:
      "Build Strict-Transport-Security headers with exact max-age values, subdomain scope, preload cautions, and deployment-ready output.",
    url: "https://yoryantra.com/tools/hsts-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HSTS Header Generator – max-age & Preload | Yoryantra",
    description:
      "Build HSTS headers with exact max-age values, subdomain scope, preload cautions, and server configuration output.",
  },
};

export default function HSTSHeaderGeneratorPage() {
  return <ToolClient />;
}
