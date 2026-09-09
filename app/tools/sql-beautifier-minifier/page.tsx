import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "SQL Beautifier / Minifier | Format and Compact SQL | Yoryantra",
  description:
    "Beautify or minify common SQL while protecting quoted text, comments, and dialect-sensitive constructs from unsafe whitespace rewrites.",
  keywords: [
    "SQL beautifier",
    "SQL formatter",
    "SQL minifier",
    "beautify SQL query",
    "minify SQL query",
    "SQL quoted strings",
    "SQL comment removal",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/sql-beautifier-minifier",
  },
  openGraph: {
    title: "SQL Beautifier / Minifier | Format and Compact SQL | Yoryantra",
    description:
      "Beautify or minify common SQL while protecting quoted text, comments, and dialect-sensitive constructs from unsafe whitespace rewrites.",
    url: "https://yoryantra.com/tools/sql-beautifier-minifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQL Beautifier / Minifier | Format and Compact SQL | Yoryantra",
    description:
      "Beautify or minify common SQL while protecting quoted text, comments, and dialect-sensitive constructs from unsafe whitespace rewrites.",
  },
};

export default function SQLBeautifierMinifierPage() {
  return <ToolClient />;
}
