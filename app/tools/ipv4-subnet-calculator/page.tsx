import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "IPv4 Subnet Calculator | CIDR Ranges and Splits | Yoryantra",
  description:
    "Calculate IPv4 CIDR boundaries, subnet and wildcard masks, host ranges, binary form, and equal-size subnet splits.",
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
    title: "IPv4 Subnet Calculator | CIDR Ranges and Splits | Yoryantra",
    description:
      "Calculate IPv4 CIDR boundaries, subnet and wildcard masks, host ranges, binary form, and equal-size subnet splits.",
    url: "https://yoryantra.com/tools/ipv4-subnet-calculator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPv4 Subnet Calculator | CIDR Ranges and Splits | Yoryantra",
    description:
      "Calculate IPv4 CIDR boundaries, subnet and wildcard masks, host ranges, binary form, and equal-size subnet splits.",
  },
};

export default function IPv4SubnetCalculatorPage() {
  return <ToolClient />;
}
