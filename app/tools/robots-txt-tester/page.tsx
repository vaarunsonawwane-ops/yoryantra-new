import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Robots.txt Tester | Test Allow & Disallow Rules | Yoryantra",
  description:
    "Test robots.txt Allow and Disallow rules against a URL and crawler, using longest-match precedence, user-agent groups, wildcards, end anchors, comments, and RFC 9309 behavior.",
  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-tester",
  },
  openGraph: {
    title: "Robots.txt Tester | Test Allow & Disallow Rules | Yoryantra",
    description:
      "Check which robots.txt rule applies to a crawler and URL, including longest-match precedence and wildcard patterns.",
    url: "https://yoryantra.com/tools/robots-txt-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robots.txt Tester | Test Allow & Disallow Rules | Yoryantra",
    description:
      "Test crawler access against robots.txt rules and inspect the rule that wins.",
  },
};

export default function Page() {
  return <ToolClient />;
}
