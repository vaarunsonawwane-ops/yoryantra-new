import ToolClient from "./ToolClient";

export const metadata = {
  title: "DNS Records Checker Online Free | Yoryantra",

  description:
    "Check DNS records online including A, AAAA, CNAME, MX, TXT, NS, SOA, CAA, and domain configuration details with this free DNS Records Checker.",

  keywords: [
    "dns records checker",
    "dns lookup tool",
    "check dns records",
    "a record checker",
    "mx record checker",
    "txt record checker",
    "cname record checker",
    "ns record checker",
    "soa record checker",
    "caa record checker",
    "devops tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/dns-records-checker",
  },

  openGraph: {
    title: "DNS Records Checker Online Free | Yoryantra",

    description:
      "Check DNS records including A, AAAA, CNAME, MX, TXT, NS, SOA, CAA, and domain configuration details online.",

    url: "https://yoryantra.com/tools/dns-records-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "DNS Records Checker Online Free | Yoryantra",

    description:
      "Free online DNS Records Checker for A, AAAA, CNAME, MX, TXT, NS, SOA, CAA, and domain configuration checks.",
  },
};

export default function Page() {
  return <ToolClient />;
}
