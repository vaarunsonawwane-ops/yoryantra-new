import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "JWT Decoder & Claims Inspector – exp, nbf, iss & aud | Yoryantra",
  description:
    "Decode JWT headers and claims, inspect exp, nbf, iat, issuer, audience, scopes, and roles, and keep decoded data separate from signature verification.",
  keywords: [
    "JWT claims inspector",
    "JWT exp nbf iat",
    "JWT issuer audience",
    "JWT NumericDate",
    "JWT scope roles",
    "JWT claims decoder",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-claims-inspector",
  },
  openGraph: {
    title: "JWT Decoder & Claims Inspector – exp, nbf, iss & aud | Yoryantra",
    description:
      "Decode JWT structure and inspect timing and identity claims without treating decoded data as cryptographically verified.",
    url: "https://yoryantra.com/tools/jwt-claims-inspector",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Decoder & Claims Inspector – exp, nbf, iss & aud | Yoryantra",
    description:
      "Decode JWT structure and inspect timing and identity claims without treating decoded data as cryptographically verified.",
  },
};

export default function JWTClaimsInspectorPage() {
  return <ToolClient />;
}
