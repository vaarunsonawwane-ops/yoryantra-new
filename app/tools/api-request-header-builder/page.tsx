import ToolClient from "./ToolClient";

export const metadata = {
  title: "API Request Header Builder | Build HTTP Headers Online | Yoryantra",

  description:
    "Build API request headers, prepare Authorization, Content-Type, Accept, CORS, cache, and custom HTTP header blocks directly in your browser.",

  keywords: [
    "api request header builder",
    "http header builder",
    "request header generator",
    "api headers generator",
    "authorization header builder",
    "bearer token header",
    "content type header",
    "custom http headers",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/api-request-header-builder",
  },

  openGraph: {
    title: "API Request Header Builder | Build HTTP Headers Online | Yoryantra",

    description:
      "Build API request headers, prepare Authorization, Content-Type, Accept, CORS, cache, and custom HTTP header blocks directly in your browser.",

    url: "https://yoryantra.com/tools/api-request-header-builder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "API Request Header Builder | Build HTTP Headers Online | Yoryantra",

    description:
      "Build API request headers, prepare Authorization, Content-Type, Accept, CORS, cache, and custom HTTP header blocks directly in your browser.",
  },
};

export default function APIRequestHeaderBuilderPage() {
  return <ToolClient />;
}
