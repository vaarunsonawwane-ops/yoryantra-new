import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "API Rate Limit Header Parser | Parse RateLimit and X-RateLimit Headers | Yoryantra",
  description:
    "Parse API rate limit headers from pasted HTTP responses. Understand RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-RateLimit headers, Retry-After, reset time, quota usage, and retry guidance.",
  keywords: [
    "API Rate Limit Header Parser",
    "RateLimit header parser",
    "X-RateLimit header parser",
    "Retry-After parser",
    "API rate limit checker",
    "HTTP rate limit headers",
    "RateLimit-Reset converter",
    "API debugging tools",
    "developer tools",
    "HTTP headers tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/api-rate-limit-header-parser",
  },
  openGraph: {
    title: "API Rate Limit Header Parser | Parse RateLimit and X-RateLimit Headers | Yoryantra",
    description:
      "Parse API rate limit headers from pasted HTTP responses. Understand RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-RateLimit headers, Retry-After, reset time, quota usage, and retry guidance.",
    url: "https://yoryantra.com/tools/api-rate-limit-header-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Rate Limit Header Parser | Parse RateLimit and X-RateLimit Headers | Yoryantra",
    description:
      "Parse API rate limit headers from pasted HTTP responses. Understand RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, X-RateLimit headers, Retry-After, reset time, quota usage, and retry guidance.",
  },
};

export default function ApiRateLimitHeaderParserPage() {
  return <ToolClient />;
}
