import ToolClient from "./ToolClient";

export const metadata = {
  title: "HTML Encoder Decoder Online Free | Yoryantra",

  description:
    "Encode and decode HTML entities instantly with this free online HTML Encoder Decoder.",

  keywords: [
    "html encoder",
    "html decoder",
    "html entity encoder",
    "html entity decoder",
    "encode html online",
    "decode html online",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/html-encoder-decoder",
  },

  openGraph: {
    title: "HTML Encoder Decoder Online Free | Yoryantra",

    description:
      "Encode and decode HTML entities instantly with this free online HTML Encoder Decoder.",

    url: "https://yoryantra.com/tools/html-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "HTML Encoder Decoder Online Free | Yoryantra",

    description:
      "Encode and decode HTML entities instantly with this free online utility.",
  },
};

export default function Page() {
  return <ToolClient />;
}