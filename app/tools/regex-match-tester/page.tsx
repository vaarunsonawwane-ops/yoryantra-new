import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Regex Match Tester | JavaScript Flags, Groups and Replacements | Yoryantra",
  description:
    "Run JavaScript regular expressions against sample text with selectable flags, capture groups, match indexes, zero-length handling, and replacement previews.",
  keywords: [
    "regex match tester",
    "javascript regex tester",
    "regex capture groups",
    "regex named groups",
    "regex replacement preview",
    "regex flags tester",
    "regular expression debugging",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/regex-match-tester",
  },
  openGraph: {
    title: "Regex Match Tester | JavaScript Flags, Groups and Replacements | Yoryantra",
    description:
      "Test JavaScript regex behavior with explicit flags, match indexes, capture groups, and replacement semantics.",
    url: "https://yoryantra.com/tools/regex-match-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Match Tester | Yoryantra",
    description:
      "Run JavaScript regex patterns with selected flags, capture groups, match indexes, and replacement semantics.",
  },
};

export default function RegexMatchTesterPage() {
  return <ToolClient />;
}
