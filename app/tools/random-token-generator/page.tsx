import ToolClient from "./ToolClient";

export const metadata = {
  title: "Random Token & API Key Secret Generator | Yoryantra",
  description:
    "Create cryptographically random Base64URL, alphanumeric, hex, or numeric token and API-key secret material with unbiased selection and search-space guidance.",
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
    title: "Random Token & API Key Secret Generator | Yoryantra",
    description:
      "Create random token and API-key secret material with Web Crypto, unbiased character selection, and visible search-space estimates.",
    url: "https://yoryantra.com/tools/random-token-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Token & API Key Secret Generator | Yoryantra",
    description:
      "Generate token or API-key secret material with Web Crypto and understand alphabet, length, storage, and lifecycle tradeoffs.",
  },
};

export default function Page() {
  return <ToolClient />;
}
