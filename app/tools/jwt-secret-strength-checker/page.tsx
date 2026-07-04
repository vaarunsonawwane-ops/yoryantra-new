import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Secret Strength Checker | Check JWT Signing Secret Safety | Yoryantra",
  description:
    "Check JWT signing secret strength locally in your browser. Estimate practical entropy, detect weak/default secrets, repeated patterns, short keys, UUIDs, phrase-like values, and risky HMAC secret formats.",
  keywords: [
    "JWT Secret Strength Checker",
    "JWT secret checker",
    "JWT signing secret strength",
    "HMAC secret checker",
    "JWT security tool",
    "weak JWT secret detector",
    "JWT key strength checker",
    "security tools",
    "developer security tools",
    "token security checker",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-secret-strength-checker",
  },
  openGraph: {
    title: "JWT Secret Strength Checker | Check JWT Signing Secret Safety | Yoryantra",
    description:
      "Check JWT signing secret strength locally in your browser. Estimate practical entropy, detect weak/default secrets, repeated patterns, short keys, UUIDs, phrase-like values, and risky HMAC secret formats.",
    url: "https://yoryantra.com/tools/jwt-secret-strength-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Secret Strength Checker | Check JWT Signing Secret Safety | Yoryantra",
    description:
      "Check JWT signing secret strength locally in your browser. Estimate practical entropy, detect weak/default secrets, repeated patterns, short keys, UUIDs, phrase-like values, and risky HMAC secret formats.",
  },
};

export default function JwtSecretStrengthCheckerPage() {
  return <ToolClient />;
}
