import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "CSV Escape Formatter – Escape CSV Values Safely | Yoryantra",

  description:
    "Escape and format CSV values for spreadsheets, exports, logs, data cleanup, and API workflows with this free CSV Escape Formatter.",

  keywords: [
    "csv escape formatter",
    "csv escaper",
    "escape csv values",
    "csv formatter",
    "csv quote formatter",
    "csv value escaper",
    "csv text formatter",
    "csv data cleanup",
    "spreadsheet csv formatter",
    "encoding tools",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/csv-escape-formatter",
  },

  openGraph: {
    title:
      "CSV Escape Formatter – Escape CSV Values Safely | Yoryantra",

    description:
      "Escape and format CSV values for spreadsheets, exports, logs, data cleanup, and API workflows.",

    url: "https://yoryantra.com/tools/csv-escape-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "CSV Escape Formatter – Escape CSV Values Safely | Yoryantra",

    description:
      "Free CSV Escape Formatter for spreadsheets, exports, logs, data cleanup, and API workflows.",
  },
};

export default function Page() {
  return <ToolClient />;
}
