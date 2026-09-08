import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Decoder for JWS Claims and JWE Structure | Yoryantra",
  description:
    "Decode JWT protected headers and JWS claims, interpret common timestamps, and recognize five-part encrypted JWE tokens without implying verification.",
  keywords: [
    "JWT decoder",
    "JWT claims",
    "JWS decoder",
    "JWE header",
    "JWT exp claim",
    "JWT payload",
    "Base64URL JWT",
  ],
  alternates: { canonical: "https://yoryantra.com/tools/jwt-decoder" },
  openGraph: {
    title: "JWT Decoder for JWS Claims and JWE Structure | Yoryantra",
    description:
      "Read JWT headers, claims, timestamps, and encrypted-token structure without treating decoded data as verified.",
    url: "https://yoryantra.com/tools/jwt-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Decoder for JWS Claims and JWE Structure | Yoryantra",
    description:
      "Inspect JWT structure and registered claims while keeping decoding separate from cryptographic validation.",
  },
};

export default function Page() {
  return <ToolClient />;
}
