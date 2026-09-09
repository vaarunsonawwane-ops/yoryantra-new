import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Secret Strength Checker – JWA Key Size | Yoryantra",
  description:
    "Check JWT HMAC secret bytes against JWA minimum key sizes, decode common key representations, and flag obvious weak or predictable secret patterns.",
  keywords: [
    "JWT secret strength checker",
    "HS256 secret length",
    "HS384 key size",
    "HS512 key size",
    "JWT HMAC key checker",
    "JWA HMAC key size",
    "JWT signing secret",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-secret-strength-checker",
  },
  openGraph: {
    title: "JWT Secret Strength Checker – JWA Key Size | Yoryantra",
    description:
      "Check JWT HMAC secret bytes against JWA minimum key sizes and obvious predictable-secret patterns.",
    url: "https://yoryantra.com/tools/jwt-secret-strength-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Secret Strength Checker – JWA Key Size | Yoryantra",
    description:
      "Check JWT HMAC secret bytes against JWA minimum key sizes and obvious predictable-secret patterns.",
  },
};

export default function JwtSecretStrengthCheckerPage() {
  return <ToolClient />;
}
