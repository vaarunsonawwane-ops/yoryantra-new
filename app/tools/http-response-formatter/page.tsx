import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Response Formatter | Format Raw HTTP Responses Online | Yoryantra",

  description:
    "Format raw HTTP responses, inspect status codes, headers, content type, cookies, redirects, and response body data directly in your browser.",

  keywords: [
    "http response formatter",
    "raw http response formatter",
    "format http response",
    "http response parser",
    "http headers formatter",
    "api response formatter",
    "parse http response",
    "status code checker",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/http-response-formatter",
  },

  openGraph: {
    title: "HTTP Response Formatter | Format Raw HTTP Responses Online | Yoryantra",

    description:
      "Format raw HTTP responses, inspect status codes, headers, content type, cookies, redirects, and response body data directly in your browser.",

    url: "https://yoryantra.com/tools/http-response-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTTP Response Formatter | Format Raw HTTP Responses Online | Yoryantra",

    description:
      "Format raw HTTP responses, inspect status codes, headers, content type, cookies, redirects, and response body data directly in your browser.",
  },
};

export default function HTTPResponseFormatterPage() {
  return <ToolClient />;
}
