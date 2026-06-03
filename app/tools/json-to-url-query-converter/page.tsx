import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JSON to URL Query Converter | Convert JSON to Query Strings",
  description:
    "Convert JSON objects into URL query strings, inspect encoded parameters, choose array and nested key styles, and decode query strings back into JSON locally.",
  keywords: [
    "json to url query converter",
    "json to query string",
    "json to url parameters",
    "object to query string",
    "query string to json",
    "url query converter",
    "json query params",
    "api query parameter converter",
    "browser json converter",
    "json data tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-url-query-converter",
  },
  openGraph: {
    title: "JSON to URL Query Converter | Yoryantra",
    description:
      "Convert JSON objects into URL query strings or decode query strings back into JSON with local browser-side processing.",
    url: "https://yoryantra.com/tools/json-to-url-query-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON to URL Query Converter | Yoryantra",
    description:
      "Turn JSON objects into query parameters, URL encoded strings, and API-ready query output.",
  },
};

export default function JsonToUrlQueryConverterPage() {
  return <ToolClient />;
}
