import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Request Formatter | Format Raw HTTP Requests Online | Yoryantra",

  description:
    "Format raw HTTP requests, inspect methods, URLs, headers, query parameters, and request body data directly in your browser.",

  keywords: [
    "http request formatter",
    "raw http request formatter",
    "format http request",
    "http request parser",
    "http headers formatter",
    "api request formatter",
    "parse http request",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/http-request-formatter",
  },

  openGraph: {
    title: "HTTP Request Formatter | Format Raw HTTP Requests Online | Yoryantra",

    description:
      "Format raw HTTP requests, inspect methods, URLs, headers, query parameters, and request body data directly in your browser.",

    url: "https://yoryantra.com/tools/http-request-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTTP Request Formatter | Format Raw HTTP Requests Online | Yoryantra",

    description:
      "Format raw HTTP requests, inspect methods, URLs, headers, query parameters, and request body data directly in your browser.",
  },
};

export default function HTTPRequestFormatterPage() {
  return <ToolClient />;
}
