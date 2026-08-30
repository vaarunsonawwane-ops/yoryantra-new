import ToolClient from "./ToolClient";

export const metadata = {
  title: "IP Address Inspector – Validate IPv4 & IPv6 | Yoryantra",
  description:
    "Validate IPv4 and IPv6 addresses, normalize IPv6 notation, and identify common private, loopback, link-local, documentation, multicast, and special ranges.",
  alternates: {
    canonical: "https://yoryantra.com/tools/ip-address-inspector",
  },
  openGraph: {
    title: "IP Address Inspector – Validate IPv4 & IPv6 | Yoryantra",
    description:
      "Validate IPv4 and IPv6 syntax and inspect common special-purpose address ranges.",
    url: "https://yoryantra.com/tools/ip-address-inspector",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Address Inspector – Validate IPv4 & IPv6 | Yoryantra",
    description:
      "Validate IP address syntax and recognize common IPv4 and IPv6 special-purpose ranges.",
  },
};

export default function Page() {
  return <ToolClient />;
}
