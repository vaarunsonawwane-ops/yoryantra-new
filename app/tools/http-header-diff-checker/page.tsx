import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Header Diff Checker | Compare Field Changes | Yoryantra",
  description:
    "Compare HTTP header sections case-insensitively with repeated fields, pseudo-fields, malformed-line warnings, value order and sensitive-value redaction.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-header-diff-checker",
  },
  openGraph: {
    title: "HTTP Header Diff Checker | Yoryantra",
    description:
      "Compare response or request header sections without losing repeated fields, Set-Cookie lines, pseudo-fields, status/request lines, or case-insensitive field-name semantics.",
    url: "https://yoryantra.com/tools/http-header-diff-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Header Diff Checker | Yoryantra",
    description:
      "Find added, removed and changed HTTP fields with repeated-line preservation and sensitive-value redaction.",
  },
};

export default function Page() {
  return <ToolClient />;
}
