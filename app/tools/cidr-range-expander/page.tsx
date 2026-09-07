import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CIDR Range Expander for IPv4 Address Lists | Yoryantra",
  description:
    "Expand IPv4 CIDR blocks into bounded line, CSV, or JSON address lists with subnet details and correct /31 or /32 handling.",
  keywords: [
    "CIDR range expander",
    "CIDR to IP range",
    "IPv4 range expander",
    "CIDR address list",
    "subnet address list",
    "CIDR to CSV",
    "CIDR to JSON",
    "IPv4 subnet expander",
    "RFC 3021 /31",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cidr-range-expander",
  },
  openGraph: {
    title: "CIDR Range Expander for IPv4 Address Lists | Yoryantra",
    description:
      "Enumerate IPv4 CIDR blocks with explicit boundary rules, output formats, and browser-safe expansion limits.",
    url: "https://yoryantra.com/tools/cidr-range-expander",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CIDR Range Expander for IPv4 Address Lists | Yoryantra",
    description:
      "Enumerate IPv4 CIDR blocks with explicit boundary rules, output formats, and browser-safe expansion limits.",
  },
};

export default function CIDRRangeExpanderPage() {
  return <ToolClient />;
}
