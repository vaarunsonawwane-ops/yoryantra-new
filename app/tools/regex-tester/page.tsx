import ToolClient from "./ToolClient";

export const metadata = {
  title: "Regex Tester for JavaScript Patterns | Yoryantra",
  description:
    "Test JavaScript regular expressions against sample text with selectable flags, match positions, capture groups, and highlighted results.",
  keywords: [
    "regex tester",
    "JavaScript regex tester",
    "regular expression tester",
    "regex flags",
    "regex capture groups",
    "regex match positions",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/regex-tester",
  },
  openGraph: {
    title: "Regex Tester for JavaScript Patterns | Yoryantra",
    description:
      "Test JavaScript regular expressions with selectable flags, capture groups, match indexes, and highlighted text.",
    url: "https://yoryantra.com/tools/regex-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Tester for JavaScript Patterns | Yoryantra",
    description:
      "Test JavaScript regex patterns and inspect flags, capture groups, match indexes, and highlighted results.",
  },
};

export default function Page() {
  return <ToolClient />;
}
