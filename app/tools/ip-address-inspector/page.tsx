import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "IP Address Inspector | Validate IPv4 & IPv6 | Yoryantra",
  description:
    "Validate strict IPv4 and IPv6 syntax, normalize IPv6 notation, inspect IPv4-mapped addresses and zone identifiers, and classify common special-purpose ranges.",
  alternates: {
    canonical: "https://yoryantra.com/tools/ip-address-inspector",
  },
  openGraph: {
    title: "IP Address Inspector | Validate IPv4 & IPv6 | Yoryantra",
    description:
      "Validate IP address syntax, normalize IPv6, and inspect common special-purpose IPv4 and IPv6 ranges.",
    url: "https://yoryantra.com/tools/ip-address-inspector",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IP Address Inspector | Yoryantra",
    description:
      "Validate IPv4 and IPv6 syntax and classify common special-purpose address ranges.",
  },
};

export default function Page() {
  return <ToolClient />;
}
