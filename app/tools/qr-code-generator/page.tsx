import ToolClient from "./ToolClient";

export const metadata = {
  title: "QR Code Generator Online Free | Yoryantra",

  description:
    "Generate QR codes instantly from text, URLs, and other content with this free online QR Code Generator.",

  keywords: [
    "qr code generator",
    "free qr code generator",
    "url to qr code",
    "generate qr code",
    "online qr generator",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/qr-code-generator",
  },

  openGraph: {
    title: "QR Code Generator Online Free | Yoryantra",

    description:
      "Generate QR codes instantly from text, URLs, and more with this free online QR Code Generator.",

    url: "https://yoryantra.com/tools/qr-code-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "QR Code Generator Online Free | Yoryantra",

    description:
      "Generate QR codes instantly with this free online QR Code Generator.",
  },
};

export default function Page() {
  return <ToolClient />;
}