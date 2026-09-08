import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Permissions-Policy Header Generator | Yoryantra",
  description:
    "Build Permissions-Policy headers with explicit feature allowlists, exact origins, browser-support cautions, and server configuration output.",
  keywords: [
    "Permissions-Policy header generator",
    "Permissions Policy",
    "browser feature allowlist",
    "camera permissions policy",
    "microphone permissions policy",
    "geolocation permissions policy",
    "Permissions Policy iframe",
    "security headers",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/permissions-policy-header-generator",
  },
  openGraph: {
    title: "Permissions-Policy Header Generator | Yoryantra",
    description:
      "Build Permissions-Policy headers with explicit feature allowlists, exact origins, and browser-support cautions.",
    url: "https://yoryantra.com/tools/permissions-policy-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Permissions-Policy Header Generator | Yoryantra",
    description:
      "Build Permissions-Policy headers with explicit feature allowlists, exact origins, and browser-support cautions.",
  },
};

export default function PermissionsPolicyHeaderGeneratorPage() {
  return <ToolClient />;
}
