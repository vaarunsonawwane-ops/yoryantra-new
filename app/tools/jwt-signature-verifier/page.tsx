import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT Signature Verifier Online Free | Yoryantra",

  description:
    "Verify JWT signatures using a secret key instantly with this free online JWT Signature Verifier.",

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
      "JWT Signature Verifier Online Free | Yoryantra",

    description:
      "Verify JWT signatures using a secret key instantly online.",

    url:
      "https://yoryantra.com/tools/jwt-signature-verifier",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JWT Signature Verifier Online Free | Yoryantra",

    description:
      "Verify JWT signatures instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}