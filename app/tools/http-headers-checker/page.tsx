import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Headers Checker | Inspect Browser-Visible Responses | Yoryantra",

  description:
    "Inspect browser-visible response headers, final status and URL, caching, content type, and security-related fields.",

  keywords: [
    "http headers checker",
    "check http headers",
    "response headers checker",
    "security headers checker",
    "http status code checker",
    "server headers checker",
    "cache headers checker",
    "developer tools",
    "technical seo tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/http-headers-checker",
  },

  openGraph: {
    title: "HTTP Headers Checker | Inspect Browser-Visible Responses | Yoryantra",

    description:
      "Inspect browser-visible response headers, final status and URL, caching, content type, and security-related fields.",

    url: "https://yoryantra.com/tools/http-headers-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTTP Headers Checker | Inspect Browser-Visible Responses | Yoryantra",

    description:
      "Inspect browser-visible response headers, final status and URL, caching, content type, and security-related fields.",
  },
};

export default function Page() {
  return <ToolClient />;
}
