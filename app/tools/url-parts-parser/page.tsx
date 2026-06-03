import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Parts Parser | Parse URL Components Online | Yoryantra",
  description:
    "Parse URLs into protocol, hostname, port, path, query parameters, hash, origin, and readable URL parts directly in your browser.",
  keywords: [
    "URL parts parser",
    "URL parser",
    "parse URL online",
    "URL component parser",
    "URL query parser",
    "URL analyzer",
    "URL structure checker",
    "developer tools",
    "API debugging tools",
    "URL tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/url-parts-parser",
  },
  openGraph: {
    title: "URL Parts Parser | Parse URL Components Online | Yoryantra",
    description:
      "Parse URLs into protocol, hostname, port, path, query parameters, hash, origin, and readable URL parts directly in your browser.",
    url: "https://yoryantra.com/tools/url-parts-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Parts Parser | Parse URL Components Online | Yoryantra",
    description:
      "Parse URLs into protocol, hostname, port, path, query parameters, hash, origin, and readable URL parts directly in your browser.",
  },
};

export default function URLPartsParserPage() {
  return <ToolClient />;
}
