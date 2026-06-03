import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "HTTP Basic Auth Header Generator | Authorization Basic Header Builder | Yoryantra",
  description:
    "Generate HTTP Basic Authorization headers from username and password values. Create Basic Auth headers, cURL examples, Fetch snippets, Axios snippets, and JSON header objects in your browser.",
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
    title: "HTTP Basic Auth Header Generator | Authorization Basic Header Builder | Yoryantra",
    description:
      "Generate HTTP Basic Authorization headers from username and password values. Create Basic Auth headers, cURL examples, Fetch snippets, Axios snippets, and JSON header objects in your browser.",
    url: "https://yoryantra.com/tools/http-basic-auth-header-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Basic Auth Header Generator | Authorization Basic Header Builder | Yoryantra",
    description:
      "Generate HTTP Basic Authorization headers from username and password values. Create Basic Auth headers, cURL examples, Fetch snippets, Axios snippets, and JSON header objects in your browser.",
  },
};

export default function HttpBasicAuthHeaderGeneratorPage() {
  return <ToolClient />;
}
