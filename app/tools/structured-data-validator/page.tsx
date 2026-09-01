import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Structured Data Validator | JSON-LD Review | Yoryantra",
  description:
    "Inspect JSON-LD or HTML for syntax, contexts, types, IDs, graphs, duplicate identifiers, URL fields, and common markup issues without claiming rich-result eligibility.",
  alternates: {
    canonical: "https://yoryantra.com/tools/structured-data-validator",
  },
  openGraph: {
    title: "Structured Data Validator | Yoryantra",
    description:
      "Review JSON-LD structure and entity relationships separately from Schema.org vocabulary correctness and Google Search feature requirements.",
    url: "https://yoryantra.com/tools/structured-data-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Structured Data Validator | Yoryantra",
    description:
      "Inspect JSON-LD structure, graphs, types, IDs, contexts, and common Schema.org implementation issues.",
  },
};

export default function Page() {
  return <ToolClient />;
}
