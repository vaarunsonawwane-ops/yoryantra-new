import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "API Key Generator — Random URL-Safe Secret Material | Yoryantra",
  description:
    "Create cryptographically random URL-safe secret material in the browser, compare nominal search-space sizes, and review safe API-key storage considerations.",
  keywords: [
    "api key generator",
    "secret key generator",
    "random token generator",
    "base64url secret",
    "cryptographic random string",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/api-key-generator",
  },
  openGraph: {
    title: "API Key Generator — Random URL-Safe Secret Material | Yoryantra",
    description:
      "Create browser-generated URL-safe secret material and see how alphabet and length determine the nominal search space.",
    url: "https://yoryantra.com/tools/api-key-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Key Generator — Random URL-Safe Secret Material | Yoryantra",
    description:
      "Generate URL-safe secret material with browser cryptographic randomness and a visible search-space estimate.",
  },
};

export default function Page() {
  return <ToolClient />;
}
