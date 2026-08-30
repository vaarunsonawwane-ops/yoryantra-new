import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Status Code Explorer – 1xx to 5xx Reference | Yoryantra",
  description:
    "Look up registered HTTP status codes, understand 1xx–5xx classes, and review redirect, authentication, rate-limit, caching, and server-error semantics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-status-code-explorer",
  },
  openGraph: {
    title: "HTTP Status Code Explorer – 1xx to 5xx Reference | Yoryantra",
    description:
      "Look up HTTP status codes with practical IANA- and RFC-based explanations.",
    url: "https://yoryantra.com/tools/http-status-code-explorer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Status Code Explorer – 1xx to 5xx Reference | Yoryantra",
    description:
      "Explore registered HTTP status codes and the semantics developers need while debugging requests.",
  },
};

export default function Page() {
  return <ToolClient />;
}
