import ToolClient from "./ToolClient";

export const metadata = {
  title: "Random Token Generator – Secure Browser Randomness | Yoryantra",
  description:
    "Create cryptographically random Base64URL-alphabet, alphanumeric, hex, or numeric token strings with unbiased selection and search-space guidance.",
  keywords: [
    "random token generator",
    "secure token generator",
    "api token generator",
    "webhook secret generator",
    "base64url token generator",
    "hex token generator",
    "crypto getrandomvalues token",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/random-token-generator",
  },
  openGraph: {
    title: "Random Token Generator – Secure Browser Randomness | Yoryantra",
    description:
      "Create random token strings with Web Crypto, unbiased character selection, and visible search-space estimates.",
    url: "https://yoryantra.com/tools/random-token-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Token Generator – Secure Browser Randomness | Yoryantra",
    description:
      "Generate token strings with Web Crypto and understand the alphabet, length, and lifecycle tradeoffs.",
  },
};

export default function Page() {
  return <ToolClient />;
}
