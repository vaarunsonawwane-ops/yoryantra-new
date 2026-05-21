import ToolClient from "./ToolClient";

export const metadata = {
  title:
    "Unicode Encoder Decoder – Encode & Decode Unicode Escapes | Yoryantra",

  description:
    "Encode and decode Unicode escape sequences for JavaScript, JSON, APIs, logs, debugging, and encoded text with this free Unicode Encoder Decoder.",

  keywords: [
    "unicode encoder decoder",
    "unicode decoder",
    "unicode encoder",
    "unicode escape decoder",
    "unicode escape encoder",
    "javascript unicode decoder",
    "json unicode decoder",
    "unicode converter",
    "unicode escape sequence",
    "encoding tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/unicode-encoder-decoder",
  },

  openGraph: {
    title:
      "Unicode Encoder Decoder – Encode & Decode Unicode Escapes | Yoryantra",

    description:
      "Encode and decode Unicode escape sequences for JavaScript, JSON, APIs, logs, debugging, and encoded text.",

    url: "https://yoryantra.com/tools/unicode-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Unicode Encoder Decoder – Encode & Decode Unicode Escapes | Yoryantra",

    description:
      "Free Unicode Encoder Decoder for JavaScript, JSON, APIs, logs, debugging, and encoded text.",
  },
};

export default function Page() {
  return <ToolClient />;
}
