import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Redirect Chain Checker | HTTP Hops | Yoryantra",
  description:
    "Analyze HTTP redirect traces, resolve relative Location values, follow method semantics, detect loops and HTTPS downgrades, and identify incomplete chains.",
  alternates: {
    canonical: "https://yoryantra.com/tools/redirect-chain-checker",
  },
  openGraph: {
    title: "Redirect Chain Checker | Yoryantra",
    description:
      "Turn raw response headers into a readable redirect path with status, destination, method, loop, downgrade, and final-response diagnostics.",
    url: "https://yoryantra.com/tools/redirect-chain-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Redirect Chain Checker | Yoryantra",
    description:
      "Analyze HTTP redirect hops from a captured response-header trace.",
  },
};

export default function Page() {
  return <ToolClient />;
}
