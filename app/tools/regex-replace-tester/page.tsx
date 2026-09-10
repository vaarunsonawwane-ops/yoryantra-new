import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Regex Replace Tester | JavaScript Replacement Preview | Yoryantra",
  description:
    "Preview JavaScript regex replacements with numbered and named capture groups, replacement tokens, match positions, changed lines, and literal replacement mode.",
  keywords: [
    "regex replace tester",
    "JavaScript regex replace",
    "regex replacement preview",
    "named capture group replacement",
    "regex replacement tokens",
    "regular expression substitution",
    "regex changed lines",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/regex-replace-tester",
  },
  openGraph: {
    title: "Regex Replace Tester | JavaScript Replacement Preview | Yoryantra",
    description:
      "Preview JavaScript regex replacement behavior, capture references, changed lines, and final output before applying an edit.",
    url: "https://yoryantra.com/tools/regex-replace-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Replace Tester | JavaScript Replacement Preview | Yoryantra",
    description:
      "Test JavaScript replacement strings, capture groups, match positions, and before-after output in the browser.",
  },
};

export default function RegexReplaceTesterPage() {
  return <ToolClient />;
}
