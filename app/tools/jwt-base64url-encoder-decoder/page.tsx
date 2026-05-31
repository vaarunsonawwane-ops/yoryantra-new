import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Base64URL Encoder Decoder | Encode and Decode JWT Parts | Yoryantra",
  description:
    "Encode and decode JWT Base64URL strings, convert JWT header and payload JSON, add or remove padding, and compare Base64 with Base64URL directly in your browser.",
  keywords: [
    "JWT Base64URL encoder decoder",
    "Base64URL encoder decoder",
    "JWT payload Base64URL decoder",
    "JWT header encoder",
    "JWT payload encoder",
    "Base64 to Base64URL",
    "Base64URL to Base64",
    "JWT tools",
    "Encoding tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-base64url-encoder-decoder",
  },
  openGraph: {
    title: "JWT Base64URL Encoder Decoder | Encode and Decode JWT Parts | Yoryantra",
    description:
      "Encode and decode JWT Base64URL strings, convert JWT header and payload JSON, add or remove padding, and compare Base64 with Base64URL directly in your browser.",
    url: "https://yoryantra.com/tools/jwt-base64url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Base64URL Encoder Decoder | Encode and Decode JWT Parts | Yoryantra",
    description:
      "Encode and decode JWT Base64URL strings, convert JWT header and payload JSON, add or remove padding, and compare Base64 with Base64URL directly in your browser.",
  },
};

export default function JWTBase64URLEncoderDecoderPage() {
  return <ToolClient />;
}
