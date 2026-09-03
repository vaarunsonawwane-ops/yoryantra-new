import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "MIME Type Finder | File Extension to Media Type | Yoryantra",
  description:
    "Match common file names and extensions with media types, inspect Content-Type values, and distinguish filename conventions from actual file-content detection.",
  alternates: {
    canonical: "https://yoryantra.com/tools/mime-type-finder",
  },
  openGraph: {
    title: "MIME Type Finder | File Extension to Media Type | Yoryantra",
    description:
      "Find common Content-Type mappings for file extensions and inspect known media type names.",
    url: "https://yoryantra.com/tools/mime-type-finder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MIME Type Finder | Yoryantra",
    description:
      "Look up common media types from file names, extensions, and Content-Type values.",
  },
};

export default function Page() {
  return <ToolClient />;
}
