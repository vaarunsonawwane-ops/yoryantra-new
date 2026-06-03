import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Security.txt Generator | Create Security.txt File Online | Yoryantra",
  description:
    "Generate a security.txt file for vulnerability disclosure. Create Contact, Expires, Canonical, Policy, Encryption, Acknowledgments, Preferred-Languages, and Hiring fields.",
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
    title: "Security.txt Generator | Create Security.txt File Online | Yoryantra",
    description:
      "Generate a security.txt file for vulnerability disclosure. Create Contact, Expires, Canonical, Policy, Encryption, Acknowledgments, Preferred-Languages, and Hiring fields.",
    url: "https://yoryantra.com/tools/security-txt-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Security.txt Generator | Create Security.txt File Online | Yoryantra",
    description:
      "Generate a security.txt file for vulnerability disclosure. Create Contact, Expires, Canonical, Policy, Encryption, Acknowledgments, Preferred-Languages, and Hiring fields.",
  },
};

export default function SecurityTxtGeneratorPage() {
  return <ToolClient />;
}
