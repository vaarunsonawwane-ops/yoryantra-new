import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Random Password Generator | Yoryantra",
  description:
    "Generate a random password locally with uppercase and lowercase letters, numbers, and symbols. Uses the browser cryptography API and avoids modulo-biased character selection.",
  keywords: [
    "password generator",
    "random password generator",
    "strong password generator",
    "secure password generator",
    "browser password generator",
    "cryptographic password generator",
    "developer security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/password-generator",
  },
  openGraph: {
    title: "Random Password Generator | Yoryantra",
    description:
      "Generate random passwords locally in your browser with letters, numbers, and symbols.",
    url: "https://yoryantra.com/tools/password-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Password Generator | Yoryantra",
    description:
      "Generate random passwords locally using the browser cryptography API.",
  },
};

export default function Page() {
  return <ToolClient />;
}
