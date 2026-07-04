import ToolClient from "./ToolClient";

export const metadata = {
  title: "Base64URL Encoder Decoder | Yoryantra",
  description:
    "Encode and decode URL-safe Base64 strings, JWT segments, and padded or unpadded Base64URL values in your browser.",
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
    canonical: "https://yoryantra.com/tools/base64url-encoder-decoder",
  },
  openGraph: {
    title: "Base64URL Encoder Decoder | Yoryantra",
    description:
      "Encode and decode URL-safe Base64 strings, JWT parts, and Base64URL values in your browser.",
    url: "https://yoryantra.com/tools/base64url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base64URL Encoder Decoder | Yoryantra",
    description:
      "Encode and decode URL-safe Base64 strings, JWT parts, and Base64URL values in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
