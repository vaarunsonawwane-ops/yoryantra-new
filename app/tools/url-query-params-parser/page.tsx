import ToolClient from "./ToolClient";

export const metadata = {
  title: "URL Query Params Parser | Repeated Query Values | Yoryantra",
  description:
    "Parse full URLs or raw query strings while preserving repeated parameters, blank values, raw encoding, decoded values, and parameter order.",
  alternates: {
    canonical: "https://yoryantra.com/tools/url-query-params-parser",
  },
  openGraph: {
    title: "URL Query Params Parser | Repeated Query Values | Yoryantra",
    description:
      "Inspect URL query parameters without overwriting repeated keys or hiding raw encoding.",
    url: "https://yoryantra.com/tools/url-query-params-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Query Params Parser | Yoryantra",
    description:
      "Parse ordered query parameters with repeated-key and percent-decoding diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
