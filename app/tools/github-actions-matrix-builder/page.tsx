import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "GitHub Actions Matrix Builder | Include & Exclude Semantics | Yoryantra",
  description:
    "Build GitHub Actions matrix YAML with typed values, include/exclude expansion, fail-fast, max-parallel, job previews, and the 256-job limit.",
  keywords: [
    "GitHub Actions matrix builder",
    "strategy matrix YAML",
    "GitHub matrix include exclude",
    "GitHub Actions max-parallel",
    "GitHub Actions matrix jobs",
  ],
  alternates: { canonical: "https://yoryantra.com/tools/github-actions-matrix-builder" },
  openGraph: {
    title: "GitHub Actions Matrix Builder | Yoryantra",
    description:
      "Build and preview GitHub Actions matrices with include/exclude semantics, scalar typing, and job-limit checks.",
    url: "https://yoryantra.com/tools/github-actions-matrix-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitHub Actions Matrix Builder | Yoryantra",
    description:
      "Build and preview GitHub Actions matrices with include/exclude semantics, scalar typing, and job-limit checks.",
  },
};

export default function GitHubActionsMatrixBuilderPage() {
  return <ToolClient />;
}
