import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Environment Variable Diff Checker | Compare .env Files Online | Yoryantra",
  description:
    "Compare two .env files or environment variable blocks, find added, removed, changed, duplicate, empty, and secret-looking variables directly in your browser.",
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
    title: "Environment Variable Diff Checker | Compare .env Files Online | Yoryantra",
    description:
      "Compare two .env files or environment variable blocks, find added, removed, changed, duplicate, empty, and secret-looking variables directly in your browser.",
    url: "https://yoryantra.com/tools/environment-variable-diff-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Environment Variable Diff Checker | Compare .env Files Online | Yoryantra",
    description:
      "Compare two .env files or environment variable blocks, find added, removed, changed, duplicate, empty, and secret-looking variables directly in your browser.",
  },
};

export default function EnvironmentVariableDiffCheckerPage() {
  return <ToolClient />;
}
