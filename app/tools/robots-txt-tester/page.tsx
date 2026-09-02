import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Robots.txt Tester | RFC 9309 Rule Matching | Yoryantra",
  description:
    "Compare URL paths with robots.txt groups, wildcard rules, percent-encoding and query strings using RFC 9309 precedence, plus an explicit Google-style User-Agent mode.",
  alternates: {
    canonical: "https://yoryantra.com/tools/robots-txt-tester",
  },
  openGraph: {
    title: "Robots.txt Tester | Yoryantra",
    description:
      "Review robots.txt group selection, wildcard paths, percent-encoding and Allow/Disallow precedence with RFC 9309 and a separate Google-style User-Agent mode.",
    url: "https://yoryantra.com/tools/robots-txt-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Robots.txt Tester | Yoryantra",
    description:
      "Compare crawler access rules using merged groups, longest path matches, wildcards, percent-encoding and Allow tie precedence.",
  },
};

export default function Page() {
  return <ToolClient />;
}
