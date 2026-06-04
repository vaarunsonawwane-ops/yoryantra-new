import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Bearer Token Header Generator | Build Authorization Headers Safely",
  description:
    "Generate Bearer token Authorization headers, cURL snippets, fetch examples, and safe redacted reports for API testing without sending tokens anywhere.",
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
      "Build Bearer token Authorization headers, cURL commands, and fetch examples locally with redaction and safety checks.",
    url: "https://yoryantra.com/tools/bearer-token-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Bearer Token Header Generator | Yoryantra",
    description:
      "Generate Bearer token headers and API request snippets locally in your browser.",
  },
};

export default function BearerTokenHeaderGeneratorPage() {
  return <ToolClient />;
}
