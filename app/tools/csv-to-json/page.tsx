import ToolClient from "./ToolClient";

export const metadata = {
  title: "CSV to JSON Converter – Strict Quoted CSV Parsing | Yoryantra",
  description:
    "Parse header-based CSV into JSON records with strict quoted-field handling, exact column counts, multiline values, duplicate-header checks, and string-preserving output.",
  keywords: [
    "csv to json",
    "csv parser",
    "quoted csv to json",
    "multiline csv parser",
    "csv header to json",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csv-to-json",
  },
  openGraph: {
    title: "CSV to JSON Converter – Strict Quoted CSV Parsing | Yoryantra",
    description:
      "Parse CSV headers and records into JSON while preserving quoted commas, embedded line breaks, quotes, and text values.",
    url: "https://yoryantra.com/tools/csv-to-json",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to JSON Converter – Strict Quoted CSV Parsing | Yoryantra",
    description:
      "Parse header-based CSV into JSON records without guessing field types or hiding mismatched columns.",
  },
};

export default function Page() {
  return <ToolClient />;
}
