import ToolClient from "./ToolClient";

export const metadata = {
  title: "Structured Data Validator | Check JSON-LD Schema Online | Yoryantra",

  description:
    "Validate JSON-LD structured data, check schema markup, inspect schema types, and find common structured data issues directly in your browser.",

  keywords: [
    "structured data validator",
    "json ld validator",
    "schema markup validator",
    "validate structured data",
    "check json ld",
    "schema validator",
    "structured data checker",
    "seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/structured-data-validator",
  },

  openGraph: {
    title: "Structured Data Validator | Check JSON-LD Schema Online | Yoryantra",

    description:
      "Validate JSON-LD structured data, check schema markup, inspect schema types, and find common structured data issues directly in your browser.",

    url: "https://yoryantra.com/tools/structured-data-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Structured Data Validator | Check JSON-LD Schema Online | Yoryantra",

    description:
      "Validate JSON-LD structured data, check schema markup, inspect schema types, and find common structured data issues directly in your browser.",
  },
};

export default function StructuredDataValidatorPage() {
  return <ToolClient />;
}
