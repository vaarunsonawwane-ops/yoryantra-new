import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "Morse Code Translator – Convert Text to Morse & Morse to Text | Yoryantra",

  description:
    "Translate text to Morse code and decode Morse code back into readable text for messages, learning, encoded text checks, and simple communication workflows.",

  keywords: [
    "morse code translator",
    "morse code decoder",
    "morse code encoder",
    "text to morse code",
    "morse code to text",
    "morse translator",
    "decode morse code",
    "encode morse code",
    "morse code converter",
    "encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/morse-code-translator",
  },

  openGraph: {
    title:
      "Morse Code Translator – Convert Text to Morse & Morse to Text | Yoryantra",

    description:
      "Translate text to Morse code and decode Morse code back into readable text for messages, learning, and encoded text checks.",

    url: "https://yoryantra.com/tools/morse-code-translator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Morse Code Translator – Convert Text to Morse & Morse to Text | Yoryantra",

    description:
      "Free Morse Code Translator for converting text to Morse and Morse code back to readable text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
