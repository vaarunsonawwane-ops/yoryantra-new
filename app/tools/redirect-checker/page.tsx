import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Redirect Checker | Analyze Redirect Chains & Status Codes | Yoryantra",
  description:
    "Analyze HTTP redirect response headers, follow Location hops, resolve relative redirects, spot loops, HTTPS downgrades, missing Location headers, and long chains locally.",
  alternates: {
    canonical: "https://yoryantra.com/tools/redirect-checker",
  },
  openGraph: {
    title: "Redirect Checker | Analyze Redirect Chains & Status Codes | Yoryantra",
    description:
      "Inspect redirect response headers, Location hops, loops, HTTPS downgrades, and redirect-chain issues locally.",
    url: "https://yoryantra.com/tools/redirect-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Redirect Checker | Analyze Redirect Chains & Status Codes | Yoryantra",
    description:
      "Analyze HTTP redirect chains and Location headers without sending pasted response data anywhere.",
  },
};

export default function Page() {
  return <ToolClient />;
}
