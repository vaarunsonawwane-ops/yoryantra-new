import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SQL Beautifier / Minifier | Format and Minify SQL Online | Yoryantra",
  description:
    "Beautify, format, minify, and clean SQL queries directly in your browser with keyword casing, indentation, compact output, and query structure preview.",
  keywords: [
    "SQL beautifier",
    "SQL formatter",
    "SQL minifier",
    "format SQL online",
    "beautify SQL query",
    "minify SQL query",
    "SQL query formatter",
    "database tools",
    "developer tools",
    "SQL tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/sql-beautifier-minifier",
  },
  openGraph: {
    title: "SQL Beautifier / Minifier | Format and Minify SQL Online | Yoryantra",
    description:
      "Beautify, format, minify, and clean SQL queries directly in your browser with keyword casing, indentation, compact output, and query structure preview.",
    url: "https://yoryantra.com/tools/sql-beautifier-minifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Beautifier / Minifier | Format and Minify SQL Online | Yoryantra",
    description:
      "Beautify, format, minify, and clean SQL queries directly in your browser with keyword casing, indentation, compact output, and query structure preview.",
  },
};

export default function SQLBeautifierMinifierPage() {
  return <ToolClient />;
}
