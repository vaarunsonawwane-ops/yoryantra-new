import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "IPv4 Subnet Calculator | Advanced CIDR and Subnet Tool | Yoryantra",
  description:
    "Calculate IPv4 subnet details, CIDR ranges, subnet masks, wildcard masks, usable hosts, binary notation, and subnet splits directly in your browser.",
  keywords: [
    "IPv4 subnet calculator",
    "advanced subnet calculator",
    "CIDR calculator",
    "subnet mask calculator",
    "IP subnet calculator",
    "network calculator",
    "IPv4 CIDR tool",
    "wildcard mask calculator",
    "DevOps tools",
    "network tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/ipv4-subnet-calculator",
  },
  openGraph: {
    title: "IPv4 Subnet Calculator | Advanced CIDR and Subnet Tool | Yoryantra",
    description:
      "Calculate IPv4 subnet details, CIDR ranges, subnet masks, wildcard masks, usable hosts, binary notation, and subnet splits directly in your browser.",
    url: "https://yoryantra.com/tools/ipv4-subnet-calculator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPv4 Subnet Calculator | Advanced CIDR and Subnet Tool | Yoryantra",
    description:
      "Calculate IPv4 subnet details, CIDR ranges, subnet masks, wildcard masks, usable hosts, binary notation, and subnet splits directly in your browser.",
  },
};

export default function IPv4SubnetCalculatorPage() {
  return <ToolClient />;
}
