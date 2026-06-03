import ToolClient from "./ToolClient";

export const metadata = {
  title: "API Key Generator Online Free | Yoryantra",

  description:
    "Generate random API keys, secret tokens, and secure strings instantly with this free online API Key Generator.",

  keywords: [
    "api key generator",
    "random api key generator",
    "secret key generator",
    "token generator",
    "random token generator",
    "developer utilities",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/api-key-generator",
  },

  openGraph: {
    title: "API Key Generator Online Free | Yoryantra",

    description:
      "Generate random API keys and secure tokens instantly with this free online tool.",

    url:
      "https://yoryantra.com/tools/api-key-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "API Key Generator Online Free | Yoryantra",

    description:
      "Generate secure API keys and random tokens instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}