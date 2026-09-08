import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Base64 Image Encoder Decoder | Image Data URLs | Yoryantra",
  description:
    "Encode image files as Base64 or decode image data URLs with byte validation, MIME checks, previews, dimensions, and browser-local processing.",
  keywords: [
    "Base64 image encoder decoder",
    "image to Base64",
    "Base64 to image",
    "Base64 image converter",
    "data URL generator",
    "image data URI converter",
    "Base64 image preview",
    "image Base64 encoding",
    "Encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/base64-image-encoder-decoder",
  },
  openGraph: {
    title: "Base64 Image Encoder Decoder | Image Data URLs | Yoryantra",
    description:
      "Encode image files as Base64 or decode image data URLs with byte validation, MIME checks, previews, dimensions, and browser-local processing.",
    url: "https://yoryantra.com/tools/base64-image-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base64 Image Encoder Decoder | Image Data URLs | Yoryantra",
    description:
      "Encode image files as Base64 or decode image data URLs with byte validation, MIME checks, previews, dimensions, and browser-local processing.",
  },
};

export default function Base64ImageEncoderDecoderPage() {
  return <ToolClient />;
}
