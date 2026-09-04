import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "DNS Records Checker | A, MX, TXT, NS, CAA & More | Yoryantra",
  description:
    "Query common DNS records through Cloudflare DNS over HTTPS and inspect answers, TTLs, negative responses, authority data, MX priorities, and DNSSEC AD status.",
  alternates: {
    canonical: "https://yoryantra.com/tools/dns-records-checker",
  },
  openGraph: {
    title: "DNS Records Checker | Yoryantra",
    description:
      "Inspect resolver-visible A, AAAA, CNAME, MX, TXT, NS, SOA, and CAA records with clear DNS response interpretation.",
    url: "https://yoryantra.com/tools/dns-records-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DNS Records Checker | Yoryantra",
    description:
      "Check common DNS records and understand NOERROR, NXDOMAIN, TTLs, authority data, and resolver limitations.",
  },
};

export default function Page() {
  return <ToolClient />;
}
