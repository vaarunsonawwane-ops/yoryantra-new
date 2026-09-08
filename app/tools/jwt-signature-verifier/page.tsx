import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT HS256 Signature Verifier | Yoryantra",
  description:
    "Verify an HS256 JWT against an exact UTF-8 shared secret while keeping signature validity separate from claim and authorization checks.",
  keywords: [
    "jwt signature verifier",
    "hs256 jwt verifier",
    "verify jwt hmac",
    "jwt shared secret",
    "jwt signature checker",
    "hmac sha256 jwt",
    "jwt verification",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-signature-verifier",
  },
  openGraph: {
    title: "JWT HS256 Signature Verifier | Yoryantra",
    description:
      "Verify an HS256 JWT signature locally and keep cryptographic matching separate from token-claim acceptance.",
    url: "https://yoryantra.com/tools/jwt-signature-verifier",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT HS256 Signature Verifier | Yoryantra",
    description:
      "Compare an HS256 JWT signature with the exact UTF-8 shared secret used for verification.",
  },
};

export default function Page() {
  return <ToolClient />;
}
