import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Cache Header Analyzer | Check Cache-Control, ETag and CDN Headers | Yoryantra",
  description:
    "Analyze HTTP cache headers from pasted responses. Check Cache-Control, ETag, Expires, Last-Modified, Vary, Age, CDN cache status, browser caching, and revalidation behavior.",
  keywords: [
    "HTTP Cache Header Analyzer",
    "Cache-Control checker",
    "HTTP cache checker",
    "ETag checker",
    "Expires header checker",
    "Last-Modified checker",
    "Vary header checker",
    "CDN cache header analyzer",
    "browser cache checker",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-cache-header-analyzer",
  },
  openGraph: {
    title: "HTTP Cache Header Analyzer | Check Cache-Control, ETag and CDN Headers | Yoryantra",
    description:
      "Analyze HTTP cache headers from pasted responses. Check Cache-Control, ETag, Expires, Last-Modified, Vary, Age, CDN cache status, browser caching, and revalidation behavior.",
    url: "https://yoryantra.com/tools/http-cache-header-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Cache Header Analyzer | Check Cache-Control, ETag and CDN Headers | Yoryantra",
    description:
      "Analyze HTTP cache headers from pasted responses. Check Cache-Control, ETag, Expires, Last-Modified, Vary, Age, CDN cache status, browser caching, and revalidation behavior.",
  },
};

export default function HttpCacheHeaderAnalyzerPage() {
  return <ToolClient />;
}
