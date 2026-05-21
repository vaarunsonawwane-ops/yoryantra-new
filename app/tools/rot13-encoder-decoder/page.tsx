import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "ROT13 Encoder Decoder – Encode & Decode ROT13 Text | Yoryantra",

  description:
    "Encode and decode ROT13 text for simple letter substitution, puzzles, examples, lightweight obfuscation, and text transformation workflows.",

  keywords: [
    "rot13 encoder decoder",
    "rot13 decoder",
    "rot13 encoder",
    "rot13 converter",
    "rot13 translator",
    "decode rot13",
    "encode rot13",
    "rot13 cipher",
    "text obfuscation tool",
    "encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/rot13-encoder-decoder",
  },

  openGraph: {
    title:
      "ROT13 Encoder Decoder – Encode & Decode ROT13 Text | Yoryantra",

    description:
      "Encode and decode ROT13 text for simple substitution, puzzles, examples, and text transformation workflows.",

    url: "https://yoryantra.com/tools/rot13-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "ROT13 Encoder Decoder – Encode & Decode ROT13 Text | Yoryantra",

    description:
      "Free ROT13 Encoder Decoder for simple letter substitution, puzzles, examples, and text transformation.",
  },
};

export default function Page() {
  return <ToolClient />;
}
