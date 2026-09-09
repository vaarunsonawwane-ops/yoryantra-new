import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Security.txt Generator | RFC 9116 Disclosure File | Yoryantra",
  description:
    "Build RFC 9116 security.txt content with required Contact and Expires fields, optional disclosure fields, and well-known publishing guidance.",
  keywords: [
    "Security.txt Generator",
    "security.txt generator",
    "security txt file generator",
    "vulnerability disclosure generator",
    "security.txt creator",
    "well-known security.txt",
    "security contact file",
    "responsible disclosure",
    "web security tools",
    "security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/security-txt-generator",
  },
  openGraph: {
    title: "Security.txt Generator | RFC 9116 Disclosure File | Yoryantra",
    description:
      "Build RFC 9116 security.txt content with required Contact and Expires fields, optional disclosure fields, and well-known publishing guidance.",
    url: "https://yoryantra.com/tools/security-txt-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security.txt Generator | RFC 9116 Disclosure File | Yoryantra",
    description:
      "Build RFC 9116 security.txt content with required Contact and Expires fields, optional disclosure fields, and well-known publishing guidance.",
  },
};

export default function SecurityTxtGeneratorPage() {
  return <ToolClient />;
}
