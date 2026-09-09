import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Subresource Integrity Hash Generator – SRI | Yoryantra",
  description:
    "Hash exact UTF-8 script or stylesheet text with SHA-256, SHA-384, or SHA-512 and generate SRI integrity values or HTML tags.",
  keywords: [
    "Subresource Integrity Hash Generator",
    "SRI hash generator",
    "SHA384 integrity",
    "integrity attribute",
    "script integrity hash",
    "stylesheet integrity hash",
    "CDN SRI",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/subresource-integrity-hash-generator",
  },
  openGraph: {
    title: "Subresource Integrity Hash Generator – SRI | Yoryantra",
    description:
      "Generate SRI hashes from exact UTF-8 resource text and build integrity attributes for scripts and stylesheets.",
    url: "https://yoryantra.com/tools/subresource-integrity-hash-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subresource Integrity Hash Generator – SRI | Yoryantra",
    description:
      "Generate SRI hashes from exact UTF-8 resource text and build integrity attributes for scripts and stylesheets.",
  },
};

export default function SubresourceIntegrityHashGeneratorPage() {
  return <ToolClient />;
}
