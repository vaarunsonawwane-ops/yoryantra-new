import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "GitHub Actions Matrix Builder | Generate Workflow Matrix YAML | Yoryantra",
  description:
    "Build GitHub Actions strategy matrix YAML for OS runners, language versions, include rules, exclude rules, fail-fast, and max-parallel settings directly in your browser.",
  keywords: [
    "GitHub Actions matrix builder",
    "GitHub Actions matrix generator",
    "GitHub workflow matrix",
    "strategy matrix GitHub Actions",
    "GitHub Actions YAML matrix",
    "GitHub Actions include exclude matrix",
    "CI matrix generator",
    "DevOps tools",
    "YAML tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/github-actions-matrix-builder",
  },
  openGraph: {
    title: "GitHub Actions Matrix Builder | Generate Workflow Matrix YAML | Yoryantra",
    description:
      "Build GitHub Actions strategy matrix YAML for OS runners, language versions, include rules, exclude rules, fail-fast, and max-parallel settings directly in your browser.",
    url: "https://yoryantra.com/tools/github-actions-matrix-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Actions Matrix Builder | Generate Workflow Matrix YAML | Yoryantra",
    description:
      "Build GitHub Actions strategy matrix YAML for OS runners, language versions, include rules, exclude rules, fail-fast, and max-parallel settings directly in your browser.",
  },
};

export default function GitHubActionsMatrixBuilderPage() {
  return <ToolClient />;
}
