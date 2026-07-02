import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Response Headers Checker | Yoryantra",

  description:
    "Inspect browser-visible HTTP response headers, final status, final URL, cache directives, content type, and security-related headers.",

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
    title: "HTTP Response Headers Checker | Yoryantra",

    description:
      "Inspect browser-visible response headers, final status, final URL, cache directives, and security-related headers.",

    url: "https://yoryantra.com/tools/http-headers-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTTP Response Headers Checker | Yoryantra",

    description:
      "Check browser-visible HTTP response headers, final status, cache directives, and security-related headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
