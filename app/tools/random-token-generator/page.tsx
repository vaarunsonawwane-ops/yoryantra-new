import ToolClient from "./ToolClient";

export const metadata = {
  title: "Random Token Generator Online Free | Yoryantra",

  description:
    "Generate random tokens, secret strings, and secure identifiers instantly with this free online Random Token Generator.",

  keywords: [
    "random token generator",
    "secure token generator",
    "secret token generator",
    "access token generator",
    "random string generator",
    "authentication token generator",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/random-token-generator",
  },

  openGraph: {
    title:
      "Random Token Generator Online Free | Yoryantra",

    description:
      "Generate random tokens and secure identifiers instantly online.",

    url:
      "https://yoryantra.com/tools/random-token-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Random Token Generator Online Free | Yoryantra",

    description:
      "Generate random tokens and secret strings instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}