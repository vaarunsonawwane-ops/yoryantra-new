import ToolClient from "./ToolClient";

export const metadata = {
  title: "IP Address Inspector Online Free | Yoryantra",

  description:
    "Inspect IPv4 and IPv6 address format instantly with this free online IP Address Inspector.",

  keywords: [
    "ip address inspector",
    "ip address checker",
    "ipv4 validator",
    "ipv6 validator",
    "ip format checker",
    "network tools",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/ip-address-inspector",
  },

  openGraph: {
    title: "IP Address Inspector Online Free | Yoryantra",
    description: "Inspect IPv4 and IPv6 address formats instantly online.",
    url: "https://yoryantra.com/tools/ip-address-inspector",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "IP Address Inspector Online Free | Yoryantra",
    description: "Inspect IP address formats instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}