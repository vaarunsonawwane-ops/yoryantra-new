import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Bearer Token Header Generator | Authorization Header & Request Snippets",
  description:
    "Format Bearer Authorization headers and cURL, fetch, or raw HTTP request snippets with redaction and browser-local handling.",
  keywords: [
    "bearer token header generator",
    "authorization bearer header",
    "bearer token generator",
    "api authorization header",
    "jwt bearer header",
    "curl bearer token",
    "fetch bearer token",
    "api auth header tool",
    "security tools",
    "browser token header tool",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/bearer-token-header-generator",
  },
  openGraph: {
    title: "Bearer Token Header Generator | Yoryantra",
    description:
      "Format Bearer Authorization headers and request snippets with redaction, prefix cleanup, and browser-local processing.",
    url: "https://yoryantra.com/tools/bearer-token-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Bearer Token Header Generator | Yoryantra",
    description:
      "Format Bearer Authorization headers and API request snippets with optional credential redaction.",
  },
};

export default function BearerTokenHeaderGeneratorPage() {
  return <ToolClient />;
}
