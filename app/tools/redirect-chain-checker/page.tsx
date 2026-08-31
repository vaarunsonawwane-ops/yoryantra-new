import ToolClient from "./ToolClient";

export const metadata = {
  title: "Redirect Chain Checker | Analyze Redirect Hops | Yoryantra",
  description:
    "Analyze pasted HTTP redirect response headers, resolve Location values, detect loops and HTTPS downgrades, and inspect each redirect hop.",
  alternates: {
    canonical: "https://yoryantra.com/tools/redirect-chain-checker",
  },
  openGraph: {
    title: "Redirect Chain Checker | Analyze Redirect Hops | Yoryantra",
    description:
      "Analyze redirect response headers, resolve Location values, and inspect redirect loops, hops, status codes, and final destinations.",
    url: "https://yoryantra.com/tools/redirect-chain-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redirect Chain Checker | Analyze Redirect Hops | Yoryantra",
    description:
      "Inspect pasted redirect traces for hops, loops, Location targets, HTTPS downgrades, and final responses.",
  },
};

export default function Page() {
  return <ToolClient />;
}
