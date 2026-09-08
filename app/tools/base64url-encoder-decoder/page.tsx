import ToolClient from "./ToolClient";

export const metadata = {
  title: "Base64URL Encoder Decoder for UTF-8 and JWT | Yoryantra",
  description:
    "Encode UTF-8 text as unpadded Base64URL, decode padded or unpadded values, and read normal JWT payload segments with canonical Base64 checks.",
  keywords: [
    "base64url encoder decoder",
    "base64url encode",
    "base64url decode",
    "jwt payload decoder",
    "url safe base64",
    "unpadded base64url",
    "rfc 4648 base64url",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/base64url-encoder-decoder",
  },
  openGraph: {
    title: "Base64URL Encoder Decoder for UTF-8 and JWT | Yoryantra",
    description:
      "Encode UTF-8 as unpadded Base64URL, decode padded or unpadded values, and read normal JWT payload segments with canonical checks.",
    url: "https://yoryantra.com/tools/base64url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base64URL Encoder Decoder for UTF-8 and JWT | Yoryantra",
    description:
      "Encode UTF-8 as Base64URL, decode padded or unpadded values, and read normal JWT payload segments.",
  },
};

export default function Page() {
  return <ToolClient />;
}
