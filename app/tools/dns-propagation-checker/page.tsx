import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "DNS Propagation Checker: Google vs Cloudflare | Yoryantra",
  description:
    "Compare A, AAAA, CNAME, MX, TXT, NS, SOA, and CAA answers and TTLs from Google Public DNS and Cloudflare resolver APIs.",
  keywords: [
    "DNS propagation checker",
    "DNS resolver comparison",
    "Google DNS checker",
    "Cloudflare DNS checker",
    "DNS record checker",
    "A record checker",
    "TXT record checker",
    "MX record checker",
    "DNS TTL checker",
    "DNS over HTTPS JSON",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/dns-propagation-checker",
  },
  openGraph: {
    title: "DNS Propagation Checker: Google vs Cloudflare | Yoryantra",
    description:
      "Compare DNS record answers, response codes, related records, and TTLs from two public resolver APIs.",
    url: "https://yoryantra.com/tools/dns-propagation-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DNS Propagation Checker: Google vs Cloudflare | Yoryantra",
    description:
      "Compare DNS record answers, response codes, related records, and TTLs from two public resolver APIs.",
  },
};

export default function DNSPropagationCheckerPage() {
  return <ToolClient />;
}
