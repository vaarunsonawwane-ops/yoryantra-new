import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Base64URL Encoder Decoder | Compact JOSE Parts | Yoryantra",
  description:
    "Decode compact JWT/JWS/JWE Base64URL parts, encode UTF-8 JSON or text, validate padding rules, and compare standard Base64 with Base64URL.",
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
    title: "JWT Base64URL Encoder Decoder | Compact JOSE Parts | Yoryantra",
    description:
      "Decode compact JWT/JWS/JWE Base64URL parts, encode UTF-8 JSON or text, validate padding rules, and compare standard Base64 with Base64URL.",
    url: "https://yoryantra.com/tools/jwt-base64url-encoder-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Base64URL Encoder Decoder | Compact JOSE Parts | Yoryantra",
    description:
      "Decode compact JWT/JWS/JWE Base64URL parts, encode UTF-8 JSON or text, validate padding rules, and compare standard Base64 with Base64URL.",
  },
};

export default function JWTBase64URLEncoderDecoderPage() {
  return <ToolClient />;
}
