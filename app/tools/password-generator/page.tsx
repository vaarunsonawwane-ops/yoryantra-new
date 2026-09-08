import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Password Generator with Cryptographic Browser Randomness | Yoryantra",
  description:
    "Generate cryptographically random passwords with configurable length, character groups, unbiased sampling, and clear handling guidance.",
  keywords: [
    "password generator",
    "cryptographic random password",
    "browser password generator",
    "password length",
    "password character set",
    "crypto getRandomValues",
  ],
  alternates: { canonical: "https://yoryantra.com/tools/password-generator" },
  openGraph: {
    title: "Password Generator with Cryptographic Browser Randomness | Yoryantra",
    description:
      "Choose length and character groups, then generate a password locally with cryptographic randomness and unbiased character sampling.",
    url: "https://yoryantra.com/tools/password-generator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Password Generator with Cryptographic Browser Randomness | Yoryantra",
    description:
      "Generate a local random password with configurable character sets and transparent randomness rules.",
  },
};

export default function Page() {
  return <ToolClient />;
}
