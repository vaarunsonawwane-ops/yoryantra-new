import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JavaScript Fetch to cURL Converter | Yoryantra",
  description:
    "Convert common JavaScript fetch() calls into reviewable cURL commands with method, URL, headers, body handling, and masked sensitive values.",
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
    title: "JavaScript Fetch to cURL Converter | Yoryantra",
    description:
      "Convert common JavaScript fetch() calls into reviewable cURL commands with method, URL, headers, body handling, and masked sensitive values.",
    url: "https://yoryantra.com/tools/fetch-to-curl-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JavaScript Fetch to cURL Converter | Yoryantra",
    description:
      "Convert common JavaScript fetch() calls into reviewable cURL commands with method, URL, headers, body handling, and masked sensitive values.",
  },
};

export default function FetchToCurlConverterPage() {
  return <ToolClient />;
}
