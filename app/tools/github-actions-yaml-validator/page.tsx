import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "GitHub Actions YAML Validator | Check Workflow YAML Online | Yoryantra",
  description:
    "Validate GitHub Actions workflow YAML, check jobs, steps, triggers, permissions, runners, and common workflow mistakes directly in your browser.",
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
    title: "GitHub Actions YAML Validator | Check Workflow YAML Online | Yoryantra",
    description:
      "Validate GitHub Actions workflow YAML, check jobs, steps, triggers, permissions, runners, and common workflow mistakes directly in your browser.",
    url: "https://yoryantra.com/tools/github-actions-yaml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Actions YAML Validator | Check Workflow YAML Online | Yoryantra",
    description:
      "Validate GitHub Actions workflow YAML, check jobs, steps, triggers, permissions, runners, and common workflow mistakes directly in your browser.",
  },
};

export default function GitHubActionsYAMLValidatorPage() {
  return <ToolClient />;
}
