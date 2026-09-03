import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Query Params Parser | Decode Query Strings | Yoryantra",
  description:
    "Parse a full URL or raw query string while preserving original encoding, repeated parameters, empty names and values, fragments, and decoding warnings.",
  alternates: {
    canonical: "https://yoryantra.com/tools/url-query-params-parser",
  },
  openGraph: {
    title: "URL Query Params Parser | Decode Query Strings | Yoryantra",
    description:
      "Read the query after ?, preserve repeated values and original encoding, and compare raw with decoded forms.",
    url: "https://yoryantra.com/tools/url-query-params-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "URL Query Params Parser | Yoryantra",
    description:
      "Read URL query parameters, repeated names, blank values, fragments, plus signs, and percent encoding.",
  },
};

export default function Page() {
  return <ToolClient />;
}
