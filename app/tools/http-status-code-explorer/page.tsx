import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Status Code Explorer | 1xx–5xx Reference | Yoryantra",
  description:
    "Look up registered HTTP status codes, search by name or meaning, and review redirect, authentication, caching, rate-limit, gateway, and server-error semantics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-status-code-explorer",
  },
  openGraph: {
    title: "HTTP Status Code Explorer | Yoryantra",
    description:
      "Search HTTP status codes and review practical 1xx–5xx semantics with registry-status notes.",
    url: "https://yoryantra.com/tools/http-status-code-explorer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTTP Status Code Explorer | Yoryantra",
    description:
      "Look up HTTP status codes and understand the semantics behind common API and web responses.",
  },
};

export default function Page() {
  return <ToolClient />;
}
