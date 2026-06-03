import ToolClient from "./ToolClient";

export const metadata = {
  title: "Regex Tester Online Free | Yoryantra",

  description:
    "Test and validate regular expressions instantly with this free online Regex Tester. Live regex matching, pattern testing, and quick debugging for developers and text workflows.",

  keywords: [
    "regex tester",
    "regular expression tester",
    "regex checker",
    "regex validator",
    "test regex online",
    "regex pattern matcher",
    "regex debug tool",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/regex-tester",
  },

  openGraph: {
    title: "Regex Tester Online Free | Yoryantra",

    description:
      "Free online Regex Tester for live regular expression matching and debugging.",

    url: "https://yoryantra.com/tools/regex-tester",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Regex Tester Online Free | Yoryantra",

    description:
      "Quickly test and debug regular expressions with this free online regex utility.",
  },
};

export default function Page() {
  return <ToolClient />;
}