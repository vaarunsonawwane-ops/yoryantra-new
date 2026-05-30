import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Request Header Builder | Build HTTP Headers Online | Yoryantra",
  description:
    "Build HTTP request headers, add common API headers, format header blocks, and copy clean header output directly in your browser.",
  keywords: [
    "request header builder",
    "HTTP header builder",
    "build HTTP headers",
    "API header builder",
    "request headers generator",
    "Authorization header builder",
    "Content-Type header builder",
    "HTTP tools",
    "API debugging tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/request-header-builder",
  },
  openGraph: {
    title: "Request Header Builder | Build HTTP Headers Online | Yoryantra",
    description:
      "Build HTTP request headers, add common API headers, format header blocks, and copy clean header output directly in your browser.",
    url: "https://yoryantra.com/tools/request-header-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Request Header Builder | Build HTTP Headers Online | Yoryantra",
    description:
      "Build HTTP request headers, add common API headers, format header blocks, and copy clean header output directly in your browser.",
  },
};

export default function RequestHeaderBuilderPage() {
  return <ToolClient />;
}
