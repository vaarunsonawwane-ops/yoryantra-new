import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "IPv4 CIDR Calculator for Prefixes and Host Ranges | Yoryantra",
  description:
    "Calculate IPv4 CIDR boundaries, subnet and wildcard masks, address counts, usable ranges, and RFC 3021 /31 point-to-point behavior.",
  keywords: [
    "CIDR calculator",
    "IPv4 subnet calculator",
    "subnet mask calculator",
    "network address calculator",
    "broadcast address calculator",
    "wildcard mask calculator",
    "usable IP range",
    "RFC 3021 /31",
    "IPv4 prefix calculator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/cidr-calculator",
  },
  openGraph: {
    title: "IPv4 CIDR Calculator for Prefixes and Host Ranges | Yoryantra",
    description:
      "Resolve IPv4 CIDR boundaries, masks, address counts, usable ranges, and /31 or /32 semantics.",
    url: "https://yoryantra.com/tools/cidr-calculator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IPv4 CIDR Calculator for Prefixes and Host Ranges | Yoryantra",
    description:
      "Resolve IPv4 CIDR boundaries, masks, address counts, usable ranges, and /31 or /32 semantics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
