import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Query String Builder | Build URL Query Parameters Online | Yoryantra",
  description:
    "Build URL query strings from key-value parameters, encode values, preview the final URL, and copy clean API query strings directly in your browser.",
  keywords: [
    "query string builder",
    "URL query string builder",
    "query parameter builder",
    "build query params",
    "URL parameter builder",
    "API query builder",
    "query string generator",
    "URL tools",
    "API debugging tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/query-string-builder",
  },
  openGraph: {
    title: "Query String Builder | Build URL Query Parameters Online | Yoryantra",
    description:
      "Build URL query strings from key-value parameters, encode values, preview the final URL, and copy clean API query strings directly in your browser.",
    url: "https://yoryantra.com/tools/query-string-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Query String Builder | Build URL Query Parameters Online | Yoryantra",
    description:
      "Build URL query strings from key-value parameters, encode values, preview the final URL, and copy clean API query strings directly in your browser.",
  },
};

export default function QueryStringBuilderPage() {
  return <ToolClient />;
}
