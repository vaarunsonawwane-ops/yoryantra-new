import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "GitHub Actions YAML Validator | Workflow Structure Review | Yoryantra",
  description:
    "Parse GitHub Actions workflow YAML and review triggers, jobs, steps, runners, permissions, action references, and secret-handling risks.",
  keywords: [
    "GitHub Actions YAML validator",
    "GitHub Actions validator",
    "GitHub workflow validator",
    "workflow YAML validator",
    "GitHub Actions linter",
    "validate GitHub Actions workflow",
    "GitHub CI YAML checker",
    "DevOps tools",
    "YAML tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/github-actions-yaml-validator",
  },
  openGraph: {
    title: "GitHub Actions YAML Validator | Workflow Structure Review | Yoryantra",
    description:
      "Parse GitHub Actions workflow YAML and review triggers, jobs, steps, runners, permissions, action references, and secret-handling risks.",
    url: "https://yoryantra.com/tools/github-actions-yaml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Actions YAML Validator | Workflow Structure Review | Yoryantra",
    description:
      "Parse GitHub Actions workflow YAML and review triggers, jobs, steps, runners, permissions, action references, and secret-handling risks.",
  },
};

export default function GitHubActionsYAMLValidatorPage() {
  return <ToolClient />;
}
