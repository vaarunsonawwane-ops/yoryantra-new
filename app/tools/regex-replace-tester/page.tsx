import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Regex Replace Tester | Test Regex Find and Replace Online | Yoryantra",
  description:
    "Test regex find and replace patterns directly in your browser. Preview replacements, capture groups, named groups, changed lines, match positions, flags, and before-after output.",
  keywords: [
    "Regex Replace Tester",
    "regex replace online",
    "regular expression replace tester",
    "regex substitution tester",
    "test regex replacement",
    "regex capture group replace",
    "regex named group replace",
    "developer tools",
    "regex tools",
    "online regex replace",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/regex-replace-tester",
  },
  openGraph: {
    title: "Regex Replace Tester | Test Regex Find and Replace Online | Yoryantra",
    description:
      "Test regex find and replace patterns directly in your browser. Preview replacements, capture groups, named groups, changed lines, match positions, flags, and before-after output.",
    url: "https://yoryantra.com/tools/regex-replace-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Replace Tester | Test Regex Find and Replace Online | Yoryantra",
    description:
      "Test regex find and replace patterns directly in your browser. Preview replacements, capture groups, named groups, changed lines, match positions, flags, and before-after output.",
  },
};

export default function RegexReplaceTesterPage() {
  return <ToolClient />;
}
