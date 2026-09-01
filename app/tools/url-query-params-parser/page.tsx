import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Query Params Parser | Read URL Parameters | Yoryantra",
  description:
    "Parse URL query parameters, understand long links, preserve repeated values and raw encoding, and diagnose plus signs, blank values, fragments, and malformed percent encoding.",
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
      "Parse URL parameters and understand repeated keys, blank values, plus signs, fragments, and percent encoding.",
  },
};

export default function Page() {
  return <ToolClient />;
}
