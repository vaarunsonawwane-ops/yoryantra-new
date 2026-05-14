import ToolClient from "./ToolClient";

export const metadata = {
  title: "URL Encoder Decoder Online Free | Yoryantra",

  description:
    "Encode and decode URLs instantly with this free online URL Encoder Decoder. Convert special characters safely for web URLs, APIs, query strings, and browser-safe encoding.",

  keywords: [
    "url encoder",
    "url decoder",
    "url encode decode",
    "encode url online",
    "decode url online",
    "url encoding tool",
    "query string encoder",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/url-encoder-decoder",
  },

  openGraph: {
    title: "URL Encoder Decoder Online Free | Yoryantra",

    description:
      "Free online URL Encoder Decoder for safely encoding and decoding URLs instantly.",

    url: "https://yoryantra.com/tools/url-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "URL Encoder Decoder Online Free | Yoryantra",

    description:
      "Encode and decode URLs instantly with this fast and clean URL utility tool.",
  },
};

export default function Page() {
  return <ToolClient />;
}