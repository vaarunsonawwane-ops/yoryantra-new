import ToolClient from "./ToolClient";

export const metadata = {
  title: "API Key Generator for Random Secret Strings | Yoryantra",
  description:
    "Generate Base64URL-safe random secret strings in your browser, review estimated entropy, and copy keys for development or controlled application use.",
  keywords: [
    "api key generator",
    "random api key generator",
    "secret key generator",
    "random token generator",
    "base64url token generator",
    "developer utilities",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/api-key-generator",
  },
  openGraph: {
    title: "API Key Generator for Random Secret Strings | Yoryantra",
    description:
      "Generate Base64URL-safe random secret strings locally in your browser and review their estimated entropy.",
    url: "https://yoryantra.com/tools/api-key-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Key Generator for Random Secret Strings | Yoryantra",
    description:
      "Generate Base64URL-safe random secret strings locally in your browser.",
  },
};

export default function Page() {
  return <ToolClient />;
}
