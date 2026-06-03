import ToolClient from "./ToolClient";

export const metadata = {
  title: "JWT Decoder Online Free | Yoryantra",

  description:
    "Decode and inspect JWT tokens instantly with this free online JWT Decoder. View JWT header, payload, and token data securely in a fast and clean interface.",

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
    title: "JWT Decoder Online Free | Yoryantra",

    description:
      "Decode JWT tokens instantly and inspect header and payload data online.",

    url: "https://yoryantra.com/tools/jwt-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JWT Decoder Online Free | Yoryantra",

    description:
      "Free online JWT Decoder to inspect token header and payload data instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}