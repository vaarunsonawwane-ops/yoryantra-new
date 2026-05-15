import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON to CSV Converter Online Free | Yoryantra",

  description:
    "Convert JSON data into CSV format instantly with this free online JSON to CSV Converter. Useful for spreadsheets, APIs, exports, and data workflows.",

  keywords: [
    "json to csv",
    "json to csv converter",
    "convert json to csv",
    "json csv converter",
    "json to spreadsheet",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-csv",
  },

  openGraph: {
    title: "JSON to CSV Converter Online Free | Yoryantra",
    description:
      "Convert JSON data into CSV format instantly with this free online JSON to CSV Converter.",
    url: "https://yoryantra.com/tools/json-to-csv",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "JSON to CSV Converter Online Free | Yoryantra",
    description:
      "Convert JSON arrays into CSV instantly with this clean online converter.",
  },
};

export default function Page() {
  return <ToolClient />;
}