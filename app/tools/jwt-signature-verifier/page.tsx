import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT HS256 Signature Verifier | Yoryantra",

  description:
    "Verify HS256 JWT signatures with a shared secret and check whether the token header and payload match the signature.",

  keywords: [
    "jwt signature verifier",
    "jwt verify",
    "verify jwt token",
    "jwt hs256 verifier",
    "jwt signature checker",
    "jwt authentication tools",
    "developer security tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/jwt-signature-verifier",
  },

  openGraph: {
    title:
      "JWT HS256 Signature Verifier | Yoryantra",

    description:
      "Verify HS256 JWT signatures locally with a shared secret and review signature-match results before checking token claims separately.",

    url:
      "https://yoryantra.com/tools/jwt-signature-verifier",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JWT HS256 Signature Verifier | Yoryantra",

    description:
      "Verify HS256 JWT signatures locally with a shared secret.",
  },
};

export default function Page() {
  return <ToolClient />;
}