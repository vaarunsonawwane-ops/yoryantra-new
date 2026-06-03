import ToolClient from "./ToolClient";

export const metadata = {
  title: "Base64URL Encoder Decoder Online Free | Yoryantra",

  description:
    "Encode and decode Base64URL strings instantly with this free online Base64URL Encoder Decoder.",

  keywords: [
    "base64url encoder decoder",
    "base64url encode",
    "base64url decode",
    "jwt base64url decoder",
    "url safe base64",
    "base64url converter",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/base64url-encoder-decoder",
  },

  openGraph: {
    title:
      "Base64URL Encoder Decoder Online Free | Yoryantra",

    description:
      "Encode and decode Base64URL strings instantly online.",

    url:
      "https://yoryantra.com/tools/base64url-encoder-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Base64URL Encoder Decoder Online Free | Yoryantra",

    description:
      "Encode and decode Base64URL strings instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}