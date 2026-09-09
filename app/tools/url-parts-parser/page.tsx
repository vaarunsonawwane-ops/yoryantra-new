import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Parts Parser | Components & Query Values | Yoryantra",
  description:
    "Parse absolute or relative URLs into serialized components, path segments, duplicate query parameters, fragments, origin, and credential boundaries.",
  keywords: [
    "URL parts parser",
    "URL component parser",
    "parse URL components",
    "relative URL resolver",
    "URL query parser",
    "URL path segments",
    "WHATWG URL parser",
    "developer URL tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/url-parts-parser",
  },
  openGraph: {
    title: "URL Parts Parser | Components & Query Values | Yoryantra",
    description:
      "Separate URLs into browser-serialized components while preserving duplicate query parameters and relative-resolution context.",
    url: "https://yoryantra.com/tools/url-parts-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Parts Parser | Components & Query Values | Yoryantra",
    description:
      "Parse absolute or relative URLs into serialized components, path segments, query values, and fragments.",
  },
};

export default function URLPartsParserPage() {
  return <ToolClient />;
}
