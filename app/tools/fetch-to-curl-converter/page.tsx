import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Fetch to cURL Converter | Convert JavaScript Fetch to cURL | Yoryantra",
  description:
    "Convert JavaScript fetch requests into cURL commands with method, URL, headers, body, and safe placeholders directly in your browser.",
  keywords: [
    "Fetch to cURL converter",
    "convert fetch to curl",
    "JavaScript fetch to curl",
    "fetch request to curl",
    "fetch converter",
    "curl generator",
    "API debugging tool",
    "HTTP tools",
    "developer tools",
    "JavaScript tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/fetch-to-curl-converter",
  },
  openGraph: {
    title: "Fetch to cURL Converter | Convert JavaScript Fetch to cURL | Yoryantra",
    description:
      "Convert JavaScript fetch requests into cURL commands with method, URL, headers, body, and safe placeholders directly in your browser.",
    url: "https://yoryantra.com/tools/fetch-to-curl-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fetch to cURL Converter | Convert JavaScript Fetch to cURL | Yoryantra",
    description:
      "Convert JavaScript fetch requests into cURL commands with method, URL, headers, body, and safe placeholders directly in your browser.",
  },
};

export default function FetchToCurlConverterPage() {
  return <ToolClient />;
}
