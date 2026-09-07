import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Environment Variable Diff Checker | Compare .env Files | Yoryantra",
  description:
    "Compare dotenv assignments across two environments and find missing keys, changed values, duplicates, empty values, and secret-sensitive differences.",
  keywords: [
    "environment variable diff checker",
    ".env diff checker",
    "compare env files",
    "compare environment variables",
    "env file compare",
    "dotenv diff",
    "environment variable checker",
    "DevOps tools",
    "deployment debugging tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/environment-variable-diff-checker",
  },
  openGraph: {
    title: "Environment Variable Diff Checker | Compare .env Files | Yoryantra",
    description:
      "Compare dotenv assignments across two environments and find missing keys, changed values, duplicates, empty values, and secret-sensitive differences.",
    url: "https://yoryantra.com/tools/environment-variable-diff-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Environment Variable Diff Checker | Compare .env Files | Yoryantra",
    description:
      "Compare dotenv assignments across two environments and find missing keys, changed values, duplicates, empty values, and secret-sensitive differences.",
  },
};

export default function EnvironmentVariableDiffCheckerPage() {
  return <ToolClient />;
}
