import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT Decoder for Header and Payload Inspection | Yoryantra",

  description:
    "Decode JWT header and payload data in your browser. Inspect claims and token structure without verifying the signature.",

  keywords: [
    "jwt decoder",
    "decode jwt",
    "jwt token decoder",
    "jwt parser",
    "jwt payload viewer",
    "jwt inspector",
    "online jwt decoder",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/jwt-decoder",
  },

  openGraph: {
    title: "JWT Decoder for Header and Payload Inspection | Yoryantra",

    description:
      "Decode JWT header and payload data in your browser without verifying the token signature.",

    url: "https://yoryantra.com/tools/jwt-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JWT Decoder for Header and Payload Inspection | Yoryantra",

    description:
      "Inspect JWT header, payload, and claims in your browser. Decoding does not verify trust.",
  },
};

export default function Page() {
  return <ToolClient />;
}