import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Data URI Encoder Decoder | Convert Text and Files to Data URLs | Yoryantra",
  description:
    "Encode text or small files into Data URIs, decode existing data URLs, inspect MIME types, Base64 payloads, charset values, and copied inline assets locally in your browser.",
  keywords: [
    "Data URI Encoder Decoder",
    "data URL decoder",
    "data URI generator",
    "Base64 data URI decoder",
    "text to data URI",
    "image data URI decoder",
    "data URL validator",
    "inline asset converter",
    "encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/data-uri-encoder-decoder",
  },
  openGraph: {
    title: "Data URI Encoder Decoder | Convert Text and Files to Data URLs | Yoryantra",
    description:
      "Encode text or small files into Data URIs, decode existing data URLs, inspect MIME types, Base64 payloads, charset values, and copied inline assets locally in your browser.",
    url: "https://yoryantra.com/tools/data-uri-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Data URI Encoder Decoder | Convert Text and Files to Data URLs | Yoryantra",
    description:
      "Encode text or small files into Data URIs, decode existing data URLs, inspect MIME types, Base64 payloads, charset values, and copied inline assets locally in your browser.",
  },
};

export default function DataUriEncoderDecoderPage() {
  return <ToolClient />;
}
