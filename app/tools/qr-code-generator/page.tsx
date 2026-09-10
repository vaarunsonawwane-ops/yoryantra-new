import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "QR Code Generator | Error Correction and PNG Download",
  description:
    "Create QR codes from text or URLs, choose image size and error correction, preview the symbol, and download a PNG without sending the content to a QR service.",
  alternates: {
    canonical: "https://yoryantra.com/tools/qr-code-generator",
  },
  openGraph: {
    title: "QR Code Generator | Yoryantra",
    description:
      "Encode text or URLs as downloadable QR images with selectable size and error correction.",
    url: "https://yoryantra.com/tools/qr-code-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "QR Code Generator | Yoryantra",
    description:
      "Create a QR image locally, choose its error-correction level, and download the PNG.",
  },
};

export default function QrCodeGeneratorPage() {
  return <ToolClient />;
}
