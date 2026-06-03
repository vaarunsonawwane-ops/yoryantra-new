import ToolClient from "./ToolClient";

export const metadata = {
  title: "CSV to JSON Converter Online Free | Yoryantra",

  description:
    "Convert CSV data into JSON format instantly with this free online CSV to JSON Converter.",

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
    title: "CSV to JSON Converter Online Free | Yoryantra",

    description:
      "Convert CSV data into JSON format instantly with this free online CSV to JSON Converter.",

    url: "https://yoryantra.com/tools/csv-to-json",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "CSV to JSON Converter Online Free | Yoryantra",

    description:
      "Convert CSV data into JSON instantly with this fast online converter.",
  },
};

export default function Page() {
  return <ToolClient />;
}