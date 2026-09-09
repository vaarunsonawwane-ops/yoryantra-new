import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JavaScript Fetch to cURL Converter | Yoryantra",
  description:
    "Convert supported literal fetch() requests into POSIX-shell cURL commands with safe quoting, redirect handling, and optional secret masking.",
  keywords: [
    "fetch to curl converter",
    "JavaScript fetch to curl",
    "fetch request curl",
    "RequestInit to curl",
    "curl command generator",
    "API request debugging",
    "HTTP developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/fetch-to-curl-converter",
  },
  openGraph: {
    title: "JavaScript Fetch to cURL Converter | Yoryantra",
    description:
      "Convert supported literal fetch() requests into POSIX-shell cURL commands with safe quoting and explicit browser-to-terminal boundaries.",
    url: "https://yoryantra.com/tools/fetch-to-curl-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JavaScript Fetch to cURL Converter | Yoryantra",
    description:
      "Convert supported literal fetch() requests into POSIX-shell cURL commands without executing the source.",
  },
};

export default function FetchToCurlConverterPage() {
  return <ToolClient />;
}
