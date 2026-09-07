import ToolClient from "./ToolClient";

export const metadata = {
  title: "SQL Formatter – Preserve Strings and Comments | Yoryantra",
  description:
    "Format SQL clauses, SELECT lists, joins, conditions, and keyword case while preserving quoted strings, identifiers, comments, dollar-quoted bodies, and statement boundaries.",
  keywords: [
    "sql formatter",
    "sql beautifier",
    "format sql",
    "sql query formatter",
    "sql comments strings formatter",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/sql-formatter",
  },
  openGraph: {
    title: "SQL Formatter – Preserve Strings and Comments | Yoryantra",
    description:
      "Reflow SQL clauses and lists while protecting quoted text, comments, dollar-quoted bodies, and semicolons inside literals.",
    url: "https://yoryantra.com/tools/sql-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Formatter – Preserve Strings and Comments | Yoryantra",
    description:
      "Format SQL layout without treating strings, comments, or quoted identifiers as ordinary query text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
