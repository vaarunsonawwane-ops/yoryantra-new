import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Headers Checker Online Free | Yoryantra",

  description:
    "Check HTTP response headers, status codes, redirects, security headers, cache headers, and server response details with this free online HTTP Headers Checker.",

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
    title: "HTTP Headers Checker Online Free | Yoryantra",

    description:
      "Check HTTP response headers, status codes, redirects, security headers, cache headers, and server response details online.",

    url: "https://yoryantra.com/tools/http-headers-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTTP Headers Checker Online Free | Yoryantra",

    description:
      "Free online HTTP Headers Checker for response headers, status codes, redirects, cache headers, and security headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
