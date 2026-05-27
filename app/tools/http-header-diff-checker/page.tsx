import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Header Diff Checker | Compare Response Headers Online | Yoryantra",

  description:
    "Compare two sets of HTTP headers, find added, removed, and changed header values, and review response header differences directly in your browser.",

  keywords: [
    "http header diff checker",
    "compare http headers",
    "http headers diff",
    "response header comparison",
    "header diff tool",
    "compare response headers",
    "http header checker",
    "developer tools",
    "security tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/http-header-diff-checker",
  },

  openGraph: {
    title: "HTTP Header Diff Checker | Compare Response Headers Online | Yoryantra",

    description:
      "Compare two sets of HTTP headers, find added, removed, and changed header values, and review response header differences directly in your browser.",

    url: "https://yoryantra.com/tools/http-header-diff-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTTP Header Diff Checker | Compare Response Headers Online | Yoryantra",

    description:
      "Compare two sets of HTTP headers, find added, removed, and changed header values, and review response header differences directly in your browser.",
  },
};

export default function HTTPHeaderDiffCheckerPage() {
  return <ToolClient />;
}
