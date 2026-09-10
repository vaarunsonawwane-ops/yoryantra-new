import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Cache Header Analyzer | Yoryantra",
  description:
    "Interpret Cache-Control, ETag, Expires, Date, Vary, Age, and Cache-Status to understand storage, private/shared freshness, and revalidation behavior.",
  keywords: [
    "HTTP Cache Header Analyzer",
    "Cache-Control analyzer",
    "HTTP caching",
    "ETag revalidation",
    "Expires header",
    "Vary header",
    "Age header",
    "Cache-Status",
    "browser cache freshness",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-cache-header-analyzer",
  },
  openGraph: {
    title: "HTTP Cache Header Analyzer | Yoryantra",
    description:
      "Interpret Cache-Control, ETag, Expires, Date, Vary, Age, and Cache-Status to understand storage, private/shared freshness, and revalidation behavior.",
    url: "https://yoryantra.com/tools/http-cache-header-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Cache Header Analyzer | Yoryantra",
    description:
      "Interpret Cache-Control, ETag, Expires, Date, Vary, Age, and Cache-Status to understand storage, private/shared freshness, and revalidation behavior.",
  },
};

export default function HttpCacheHeaderAnalyzerPage() {
  return <ToolClient />;
}
