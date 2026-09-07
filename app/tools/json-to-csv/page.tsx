import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON to CSV Converter – Safe Object Record Export | Yoryantra",
  description:
    "Convert JSON object records to CSV with escaped headers, CRLF rows, nested JSON cells, duplicate-name checks, number-safety checks, and optional spreadsheet-formula protection.",
  keywords: [
    "json to csv",
    "json array to csv",
    "json object csv export",
    "csv escaping",
    "spreadsheet formula csv",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-csv",
  },
  openGraph: {
    title: "JSON to CSV Converter – Safe Object Record Export | Yoryantra",
    description:
      "Serialize JSON object records as CSV while making nested values, missing fields, nulls, escaping, and spreadsheet risks explicit.",
    url: "https://yoryantra.com/tools/json-to-csv",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to CSV Converter – Safe Object Record Export | Yoryantra",
    description:
      "Turn JSON object records into escaped CSV without hiding nested values or parse-time data loss.",
  },
};

export default function Page() {
  return <ToolClient />;
}
