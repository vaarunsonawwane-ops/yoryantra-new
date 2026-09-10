import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Basic Auth Header Generator | Yoryantra",
  description:
    "Create RFC 7617 Basic Authorization headers and cURL, Fetch, Axios or JSON snippets with UTF-8 and legacy byte encoding guidance.",
  keywords: [
    "HTTP Basic Auth Header Generator",
    "Basic Auth header generator",
    "Authorization Basic generator",
    "Basic authentication header",
    "HTTP Authorization header generator",
    "Base64 Basic Auth",
    "curl Basic Auth header",
    "API auth header generator",
    "developer tools",
    "API testing tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/http-basic-auth-header-generator",
  },
  openGraph: {
    title: "HTTP Basic Auth Header Generator | Yoryantra",
    description:
    "Create RFC 7617 Basic Authorization headers and cURL, Fetch, Axios or JSON snippets with UTF-8 and legacy byte encoding guidance.",
    url: "https://yoryantra.com/tools/http-basic-auth-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Basic Auth Header Generator | Yoryantra",
    description:
    "Create RFC 7617 Basic Authorization headers and cURL, Fetch, Axios or JSON snippets with UTF-8 and legacy byte encoding guidance.",
  },
};

export default function HttpBasicAuthHeaderGeneratorPage() {
  return <ToolClient />;
}
