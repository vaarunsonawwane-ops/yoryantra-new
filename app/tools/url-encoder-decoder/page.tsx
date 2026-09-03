import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "URL Encoder Decoder — URL, Component & Form | Yoryantra",
  description:
    "Encode or decode URL components, complete URL-shaped strings, and form values. Covers percent escapes, UTF-8, + versus %20, delimiters, and double encoding.",
  alternates: {
    canonical: "https://yoryantra.com/tools/url-encoder-decoder",
  },
  openGraph: {
    title: "URL Encoder Decoder — URL, Component & Form | Yoryantra",
    description:
      "Work with percent-encoding while keeping URL components, structural delimiters, UTF-8, and form-style plus handling separate.",
    url: "https://yoryantra.com/tools/url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "URL Encoder Decoder | Yoryantra",
    description:
      "Encode and decode URL components, URL-shaped strings, and form values without mixing their delimiter rules.",
  },
};

export default function Page() {
  return <ToolClient />;
}
