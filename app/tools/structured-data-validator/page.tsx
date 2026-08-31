import ToolClient from "./ToolClient";

export const metadata = {
  title: "Structured Data Validator | Inspect JSON-LD | Yoryantra",
  description:
    "Inspect Schema.org JSON-LD structure, contexts, types, identifiers, graphs, URLs, and common JSON-LD issues directly in your browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/structured-data-validator",
  },
  openGraph: {
    title: "Structured Data Validator | Inspect JSON-LD | Yoryantra",
    description:
      "Inspect Schema.org JSON-LD structure, contexts, types, identifiers, graphs, URLs, and common JSON-LD issues directly in your browser.",
    url: "https://yoryantra.com/tools/structured-data-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Structured Data Validator | Inspect JSON-LD | Yoryantra",
    description:
      "Inspect Schema.org JSON-LD structure, contexts, types, identifiers, graphs, URLs, and common JSON-LD issues directly in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
