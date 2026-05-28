import ToolClient from "./ToolClient";

export const metadata = {
  title: "DNS Propagation Checker | Check DNS Records Online | Yoryantra",

  description:
    "Check DNS propagation for A, AAAA, CNAME, MX, TXT, NS, SOA, and CAA records across public DNS resolvers directly in your browser.",

  keywords: [
    "dns propagation checker",
    "dns checker",
    "check dns propagation",
    "dns record checker",
    "dns lookup tool",
    "dns propagation test",
    "a record checker",
    "txt record checker",
    "mx record checker",
    "devops tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/dns-propagation-checker",
  },

  openGraph: {
    title: "DNS Propagation Checker | Check DNS Records Online | Yoryantra",

    description:
      "Check DNS propagation for A, AAAA, CNAME, MX, TXT, NS, SOA, and CAA records across public DNS resolvers directly in your browser.",

    url: "https://yoryantra.com/tools/dns-propagation-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "DNS Propagation Checker | Check DNS Records Online | Yoryantra",

    description:
      "Check DNS propagation for A, AAAA, CNAME, MX, TXT, NS, SOA, and CAA records across public DNS resolvers directly in your browser.",
  },
};

export default function DNSPropagationCheckerPage() {
  return <ToolClient />;
}
