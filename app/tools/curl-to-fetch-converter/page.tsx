import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CURL to Fetch Converter | cURL Request to JavaScript Fetch | Yoryantra",
  description:
    "Convert common HTTP cURL requests into browser fetch() code while surfacing headers, body modes, and curl options that Fetch cannot reproduce directly.",
  keywords: [
    "curl to fetch converter",
    "convert curl to fetch",
    "curl to javascript fetch",
    "curl request parser",
    "fetch request generator",
    "curl headers to fetch",
    "curl data to fetch body",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/curl-to-fetch-converter",
  },
  openGraph: {
    title: "CURL to Fetch Converter | cURL Request to JavaScript Fetch | Yoryantra",
    description:
      "Translate HTTP cURL requests into browser fetch() code and see where browser request rules differ from curl.",
    url: "https://yoryantra.com/tools/curl-to-fetch-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CURL to Fetch Converter | Yoryantra",
    description:
      "Translate HTTP cURL requests into browser fetch() code and flag options Fetch cannot reproduce.",
  },
};

export default function CurlToFetchConverterPage() {
  return <ToolClient />;
}
