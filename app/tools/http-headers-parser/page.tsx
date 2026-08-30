import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Headers Parser | Preserve Repeated Fields | Yoryantra",
  description:
    "Parse HTTP request or response headers into ordered structured data while preserving repeated fields, start lines, and parsing diagnostics.",
  alternates: {
    canonical: "https://yoryantra.com/tools/http-headers-parser",
  },
  openGraph: {
    title: "HTTP Headers Parser | Preserve Repeated Fields | Yoryantra",
    description:
      "Inspect raw HTTP header blocks without silently overwriting duplicate field lines.",
    url: "https://yoryantra.com/tools/http-headers-parser",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HTTP Headers Parser | Yoryantra",
    description:
      "Parse raw HTTP headers, preserve repeated fields, and surface malformed lines for debugging.",
  },
};

export default function Page() {
  return <ToolClient />;
}
