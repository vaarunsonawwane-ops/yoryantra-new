import ToolClient from "./ToolClient";

export const metadata = {
  title: "SQL Formatter Online Free | Yoryantra",

  description:
    "Format and beautify SQL queries instantly with this free online SQL Formatter. Improve query readability, structure SQL code, and clean database queries quickly.",

  keywords: [
    "sql formatter",
    "sql beautifier",
    "format sql online",
    "sql query formatter",
    "sql prettifier",
    "beautify sql",
    "sql query beautifier",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/sql-formatter",
  },

  openGraph: {
    title: "SQL Formatter Online Free | Yoryantra",

    description:
      "Free online SQL Formatter for beautifying and structuring SQL queries instantly.",

    url: "https://yoryantra.com/tools/sql-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "SQL Formatter Online Free | Yoryantra",

    description:
      "Beautify SQL queries instantly with this clean and fast SQL Formatter.",
  },
};

export default function Page() {
  return <ToolClient />;
}