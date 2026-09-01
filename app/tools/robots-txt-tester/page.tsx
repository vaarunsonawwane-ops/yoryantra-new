import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Robots.txt Tester | RFC 9309 & Google Matching | Yoryantra",
  description:
    "Test URL paths against robots.txt groups, merged user-agent rules, wildcard patterns, percent-encoding, query strings, Allow/Disallow precedence and crawl defaults.",
  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-tester",
  },
  openGraph: {
    title: "Robots.txt Tester | Yoryantra",
    description:
      "Evaluate robots.txt crawl rules with RFC 9309 matching plus an explicit Google-style full User-Agent selection mode.",
    url: "https://yoryantra.com/tools/robots-txt-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Robots.txt Tester | Yoryantra",
    description:
      "Test crawler access using merged groups, longest rule matches, wildcards, percent-encoding and Allow tie precedence.",
  },
};

export default function Page() {
  return <ToolClient />;
}
