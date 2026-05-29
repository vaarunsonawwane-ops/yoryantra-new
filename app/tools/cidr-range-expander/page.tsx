import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CIDR Range Expander | Expand CIDR to IP Addresses Online | Yoryantra",
  description:
    "Expand IPv4 CIDR ranges into IP addresses, calculate network details, host counts, first and last usable IPs, and copy clean output directly in your browser.",
  keywords: [
    "CIDR range expander",
    "CIDR to IP range",
    "CIDR calculator",
    "IP range expander",
    "subnet calculator",
    "IPv4 CIDR expander",
    "CIDR block tool",
    "network tools",
    "developer tools",
    "DevOps tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cidr-range-expander",
  },
  openGraph: {
    title: "CIDR Range Expander | Expand CIDR to IP Addresses Online | Yoryantra",
    description:
      "Expand IPv4 CIDR ranges into IP addresses, calculate network details, host counts, first and last usable IPs, and copy clean output directly in your browser.",
    url: "https://yoryantra.com/tools/cidr-range-expander",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CIDR Range Expander | Expand CIDR to IP Addresses Online | Yoryantra",
    description:
      "Expand IPv4 CIDR ranges into IP addresses, calculate network details, host counts, first and last usable IPs, and copy clean output directly in your browser.",
  },
};

export default function CIDRRangeExpanderPage() {
  return <ToolClient />;
}
