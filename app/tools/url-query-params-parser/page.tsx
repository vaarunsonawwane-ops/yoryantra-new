import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Query Params Parser | Read URL Parameters | Yoryantra",
  description:
    "Parse URL query parameters, see what values such as utm_source or repeated filters contain, preserve raw encoding and order, and diagnose malformed percent encoding.",
  alternates: {
    canonical: "https://yoryantra.com/tools/url-query-params-parser",
  },
  openGraph: {
    title: "URL Query Params Parser | Read URL Parameters | Yoryantra",
    description:
      "Read the parameters after ? in a URL, preserve repeated values, and compare raw and decoded forms.",
    url: "https://yoryantra.com/tools/url-query-params-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "URL Query Params Parser | Yoryantra",
    description:
      "Parse URL parameters and understand repeated keys, blank values, plus signs, and percent encoding.",
  },
};

export default function Page() {
  return <ToolClient />;
}
