import ToolClient from "./ToolClient";

export const metadata = {
  title: "Base64 Encoder & Decoder Online Free | Yoryantra",

  description:
    "Free online Base64 encoder and decoder tool to encode or decode text instantly. Fast, clean, and easy-to-use Base64 utility for developers and everyday workflows.",

  keywords: [
    "base64 encoder",
    "base64 decoder",
    "encode base64",
    "decode base64",
    "base64 converter",
    "online base64 tool",
    "developer utilities",
    "base64 encode decode",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/base64-encoder-decoder",
  },

  openGraph: {
    title: "Base64 Encoder & Decoder Online Free | Yoryantra",

    description:
      "Encode and decode Base64 text instantly with this free online Base64 utility tool.",

    url: "https://yoryantra.com/tools/base64-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Base64 Encoder & Decoder Online Free | Yoryantra",

    description:
      "Fast and free Base64 encoder and decoder for text and developer workflows.",
  },
};

export default function Page() {
  return <ToolClient />;
}