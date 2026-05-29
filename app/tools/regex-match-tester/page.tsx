import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Regex Match Tester | Test Regular Expressions Online | Yoryantra",
  description:
    "Test regular expressions against sample text, preview matches, inspect capture groups, toggle regex flags, and copy match results directly in your browser.",
  keywords: [
    "Regex match tester",
    "regular expression tester",
    "regex tester online",
    "test regex pattern",
    "regex capture groups",
    "JavaScript regex tester",
    "regex match tool",
    "developer tools",
    "text tools",
    "debugging tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/regex-match-tester",
  },
  openGraph: {
    title: "Regex Match Tester | Test Regular Expressions Online | Yoryantra",
    description:
      "Test regular expressions against sample text, preview matches, inspect capture groups, toggle regex flags, and copy match results directly in your browser.",
    url: "https://yoryantra.com/tools/regex-match-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Match Tester | Test Regular Expressions Online | Yoryantra",
    description:
      "Test regular expressions against sample text, preview matches, inspect capture groups, toggle regex flags, and copy match results directly in your browser.",
  },
};

export default function RegexMatchTesterPage() {
  return <ToolClient />;
}
