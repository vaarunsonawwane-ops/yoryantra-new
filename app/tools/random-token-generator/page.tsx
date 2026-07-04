import ToolClient from "./ToolClient";

export const metadata = {
  title: "Random Token Generator | Yoryantra",
  description:
    "Generate browser-based random tokens for API keys, webhook secrets, session IDs, and testing with Base64URL, alphanumeric, or hex output.",
  keywords: [
    "random token generator",
    "secure token generator",
    "secret token generator",
    "api token generator",
    "webhook secret generator",
    "base64url token generator",
    "hex token generator",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/random-token-generator",
  },
  openGraph: {
    title: "Random Token Generator | Yoryantra",
    description:
      "Generate browser-based random tokens for API keys, webhook secrets, session IDs, and testing.",
    url: "https://yoryantra.com/tools/random-token-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Token Generator | Yoryantra",
    description:
      "Generate browser-based random tokens in Base64URL, alphanumeric, or hex formats.",
  },
};

export default function Page() {
  return <ToolClient />;
}
