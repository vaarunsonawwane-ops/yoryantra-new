import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "API Rate Limit Header Parser | Yoryantra",
  description:
    "Interpret RateLimit, RateLimit-Policy, Retry-After, legacy RateLimit-* and provider-specific X-RateLimit fields without guessing ambiguous reset timing.",
  keywords: [
    "API Rate Limit Header Parser",
    "RateLimit header parser",
    "RateLimit-Policy parser",
    "X-RateLimit parser",
    "Retry-After parser",
    "rate limit reset semantics",
    "HTTP 429 headers",
    "API throttling headers",
    "developer tools",
    "HTTP headers tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/api-rate-limit-header-parser",
  },
  openGraph: {
    title: "API Rate Limit Header Parser | Yoryantra",
    description:
      "Interpret RateLimit, RateLimit-Policy, Retry-After, legacy RateLimit-* and provider-specific X-RateLimit fields without guessing ambiguous reset timing.",
    url: "https://yoryantra.com/tools/api-rate-limit-header-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Rate Limit Header Parser | Yoryantra",
    description:
      "Interpret RateLimit, RateLimit-Policy, Retry-After, legacy RateLimit-* and provider-specific X-RateLimit fields without guessing ambiguous reset timing.",
  },
};

export default function ApiRateLimitHeaderParserPage() {
  return <ToolClient />;
}
