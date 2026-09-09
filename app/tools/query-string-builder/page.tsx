import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Query String Builder | URL Parameters | Yoryantra",
  description:
    "Build query strings from key-value rows with controlled percent encoding, repeated keys, optional array conventions, and full URL output.",
  keywords: [
    "query string builder",
    "URL query parameters",
    "query parameter builder",
    "percent encode query string",
    "repeated query parameters",
    "API query builder",
    "URL parameter tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/query-string-builder",
  },
  openGraph: {
    title: "Query String Builder | URL Parameters | Yoryantra",
    description:
      "Build query strings with explicit encoding, duplicate-key preservation, array conventions, and full URL assembly.",
    url: "https://yoryantra.com/tools/query-string-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Query String Builder | URL Parameters | Yoryantra",
    description:
      "Build query strings with controlled encoding, repeated keys, and optional array conventions.",
  },
};

export default function QueryStringBuilderPage() {
  return <ToolClient />;
}
