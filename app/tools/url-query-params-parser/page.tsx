import ToolClient from "./ToolClient";

export const metadata = {
  title: "URL Query Params Parser Online Free | Yoryantra",

  description:
    "Parse URL query parameters instantly with this free online URL Query Params Parser.",

  keywords: [
    "url query params parser",
    "query string parser",
    "parse url parameters",
    "url params parser",
    "query params to json",
    "utm parser",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/url-query-params-parser",
  },

  openGraph: {
    title: "URL Query Params Parser Online Free | Yoryantra",
    description: "Parse URL query parameters instantly online.",
    url: "https://yoryantra.com/tools/url-query-params-parser",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "URL Query Params Parser Online Free | Yoryantra",
    description: "Parse URL query parameters instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}