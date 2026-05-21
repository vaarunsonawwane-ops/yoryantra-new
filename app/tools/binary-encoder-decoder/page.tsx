import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "Binary Encoder Decoder – Convert Text to Binary & Binary to Text | Yoryantra",

  description:
    "Encode text to binary and decode binary values back into readable text for debugging, learning, encoding workflows, and data inspection.",

  keywords: [
    "binary encoder decoder",
    "binary decoder",
    "binary encoder",
    "text to binary",
    "binary to text",
    "binary converter",
    "decode binary",
    "encode binary",
    "binary translator",
    "encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/binary-encoder-decoder",
  },

  openGraph: {
    title:
      "Binary Encoder Decoder – Convert Text to Binary & Binary to Text | Yoryantra",

    description:
      "Encode text to binary and decode binary values back into readable text for debugging, learning, and encoding workflows.",

    url: "https://yoryantra.com/tools/binary-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Binary Encoder Decoder – Convert Text to Binary & Binary to Text | Yoryantra",

    description:
      "Free Binary Encoder Decoder for converting text to binary and binary back to readable text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
