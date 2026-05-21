import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "Hex Encoder Decoder – Convert Text to Hex & Hex to Text | Yoryantra",

  description:
    "Encode text to hexadecimal and decode hex to readable text for debugging, APIs, logs, binary data inspection, and encoding workflows.",

  keywords: [
    "hex encoder decoder",
    "hex decoder",
    "hex encoder",
    "text to hex",
    "hex to text",
    "hex converter",
    "hexadecimal decoder",
    "hexadecimal encoder",
    "ascii to hex",
    "decode hex string",
    "encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/hex-encoder-decoder",
  },

  openGraph: {
    title:
      "Hex Encoder Decoder – Convert Text to Hex & Hex to Text | Yoryantra",

    description:
      "Encode text to hexadecimal and decode hex values back into readable text for debugging, APIs, logs, and encoding workflows.",

    url: "https://yoryantra.com/tools/hex-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Hex Encoder Decoder – Convert Text to Hex & Hex to Text | Yoryantra",

    description:
      "Free Hex Encoder Decoder for text, APIs, logs, binary data inspection, and development debugging.",
  },
};

export default function Page() {
  return <ToolClient />;
}
