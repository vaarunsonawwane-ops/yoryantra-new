import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "API Request Header Builder | Fetch, cURL & HTTP | Yoryantra",
  description:
    "Build API request headers with syntax validation, duplicate-field awareness, browser restrictions, secret warnings, and HTTP, Fetch, cURL or JSON output.",
  alternates: {
    canonical: "https://yoryantra.com/tools/api-request-header-builder",
  },
  openGraph: {
    title: "API Request Header Builder | Yoryantra",
    description:
      "Prepare API request headers for HTTP, Fetch and cURL while catching injection characters, duplicate singular fields, browser-controlled names, and secret exposure risks.",
    url: "https://yoryantra.com/tools/api-request-header-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "API Request Header Builder | Yoryantra",
    description:
      "Build safer API request-header snippets for Fetch, cURL and raw HTTP without sending an API request.",
  },
};

export default function Page() {
  return <ToolClient />;
}
