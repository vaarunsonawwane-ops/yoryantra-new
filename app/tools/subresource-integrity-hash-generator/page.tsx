import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Subresource Integrity Hash Generator | Generate SRI Hashes Online | Yoryantra",
  description:
    "Generate Subresource Integrity hashes for scripts and styles. Create SHA-256, SHA-384, and SHA-512 integrity attributes for CDN resources directly in your browser.",
  keywords: [
    "Subresource Integrity Hash Generator",
    "SRI hash generator",
    "integrity attribute generator",
    "SHA384 SRI generator",
    "script integrity hash",
    "stylesheet integrity hash",
    "CDN integrity checker",
    "web security tools",
    "security tools",
    "developer security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/subresource-integrity-hash-generator",
  },
  openGraph: {
    title: "Subresource Integrity Hash Generator | Generate SRI Hashes Online | Yoryantra",
    description:
      "Generate Subresource Integrity hashes for scripts and styles. Create SHA-256, SHA-384, and SHA-512 integrity attributes for CDN resources directly in your browser.",
    url: "https://yoryantra.com/tools/subresource-integrity-hash-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subresource Integrity Hash Generator | Generate SRI Hashes Online | Yoryantra",
    description:
      "Generate Subresource Integrity hashes for scripts and styles. Create SHA-256, SHA-384, and SHA-512 integrity attributes for CDN resources directly in your browser.",
  },
};

export default function SubresourceIntegrityHashGeneratorPage() {
  return <ToolClient />;
}
