import ToolClient from "./ToolClient";

export const metadata = {
  title: "DNS Records Checker | A, AAAA, MX, TXT, NS & More | Yoryantra",
  description:
    "Query common DNS records through Cloudflare DNS over HTTPS and inspect answers, TTL values, DNS response codes, CNAMEs, MX, TXT, NS, SOA, and CAA records.",
  alternates: {
    canonical: "https://yoryantra.com/tools/dns-records-checker",
  },
  openGraph: {
    title: "DNS Records Checker | A, AAAA, MX, TXT, NS & More | Yoryantra",
    description:
      "Check common DNS record types through Cloudflare DNS over HTTPS and inspect answers, TTL values, and resolver response codes.",
    url: "https://yoryantra.com/tools/dns-records-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DNS Records Checker | A, AAAA, MX, TXT, NS & More | Yoryantra",
    description:
      "Inspect common DNS records and resolver response details through Cloudflare DNS over HTTPS.",
  },
};

export default function Page() {
  return <ToolClient />;
}
