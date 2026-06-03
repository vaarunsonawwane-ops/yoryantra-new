import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTTP Headers Parser Online Free | Yoryantra",

  description:
    "Parse and format HTTP headers instantly with this free online HTTP Headers Parser.",

  keywords: [
    "http headers parser",
    "parse http headers",
    "http header parser",
    "http headers to json",
    "request headers parser",
    "api header parser",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/http-headers-parser",
  },

  openGraph: {
    title:
      "HTTP Headers Parser Online Free | Yoryantra",

    description:
      "Parse and format HTTP headers instantly online.",

    url:
      "https://yoryantra.com/tools/http-headers-parser",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "HTTP Headers Parser Online Free | Yoryantra",

    description:
      "Parse and format HTTP headers instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}