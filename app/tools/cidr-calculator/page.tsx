import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CIDR Calculator | Calculate Subnets, Hosts & IP Ranges",

  description:
    "Calculate CIDR ranges, subnet masks, broadcast addresses, wildcard masks, usable IP ranges, and host counts instantly.",

  keywords: [
    "CIDR Calculator",
    "Subnet Calculator",
    "IPv4 CIDR Tool",
    "Network Address Calculator",
    "Broadcast Address Calculator",
    "Subnet Mask Calculator",
    "Usable Host Range",
    "Wildcard Mask Calculator",
    "CIDR Notation Tool",
    "IP Range Calculator",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/cidr-calculator",
  },

  openGraph: {
    title: "CIDR Calculator | Yoryantra",
    description:
      "Calculate subnet masks, network ranges, usable IPs, wildcard masks, and broadcast addresses instantly.",
    url: "https://yoryantra.com/tools/cidr-calculator",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CIDR Calculator | Yoryantra",
    description:
      "Calculate subnet masks, network ranges, usable IPs, wildcard masks, and broadcast addresses instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}