import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base64 Image Encoder Decoder | Convert Image to Base64 Online | Yoryantra",
  description:
    "Convert images to Base64 data URLs, decode Base64 image strings, preview images, check size, MIME type, and copy clean output directly in your browser.",
  keywords: [
    "Base64 image encoder decoder",
    "image to Base64",
    "Base64 to image",
    "Base64 image converter",
    "data URL generator",
    "image data URI converter",
    "Base64 image preview",
    "convert image to Base64 online",
    "Encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/base64-image-encoder-decoder",
  },
  openGraph: {
    title: "Base64 Image Encoder Decoder | Convert Image to Base64 Online | Yoryantra",
    description:
      "Convert images to Base64 data URLs, decode Base64 image strings, preview images, check size, MIME type, and copy clean output directly in your browser.",
    url: "https://yoryantra.com/tools/base64-image-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base64 Image Encoder Decoder | Convert Image to Base64 Online | Yoryantra",
    description:
      "Convert images to Base64 data URLs, decode Base64 image strings, preview images, check size, MIME type, and copy clean output directly in your browser.",
  },
};

export default function Base64ImageEncoderDecoderPage() {
  return <ToolClient />;
}
