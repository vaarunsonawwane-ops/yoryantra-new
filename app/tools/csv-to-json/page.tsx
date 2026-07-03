import ToolClient from "./ToolClient";

export const metadata = {
  title: "CSV to JSON Converter with Quoted Field Support | Yoryantra",

  description:
    "Convert CSV rows into a JSON array while preserving quoted commas, escaped quotes, multiline fields, empty values, and UTF-8 text in your browser."
,
  keywords: [
    "csv to json",
    "csv json converter",
    "convert csv to json",
    "csv parser",
    "csv converter",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/csv-to-json",
  },

  openGraph: {
    title: "CSV to JSON Converter with Quoted Field Support | Yoryantra",

    description:
      "Convert CSV rows into a JSON array while preserving quoted commas, escaped quotes, multiline fields, empty values, and UTF-8 text in your browser."
,
    url: "https://yoryantra.com/tools/csv-to-json",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "CSV to JSON Converter with Quoted Field Support | Yoryantra",

    description:
      "Convert CSV rows to JSON with quoted-field and multiline-field support in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}