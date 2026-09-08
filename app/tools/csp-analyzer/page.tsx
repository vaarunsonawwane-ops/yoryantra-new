import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSP Analyzer | Parse Directives, Sources and Fallbacks | Yoryantra",
  description:
    "Parse one Content Security Policy, inspect directives and source expressions, and spot duplicate rules, risky allowances, fallback gaps, and reporting mistakes.",
  keywords: [
    "csp analyzer",
    "content security policy analyzer",
    "csp directive parser",
    "csp source expression checker",
    "csp fallback checker",
    "content security policy review",
    "csp header parser",
    "security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csp-analyzer",
  },
  openGraph: {
    title: "CSP Analyzer | Parse Directives, Sources and Fallbacks | Yoryantra",
    description:
      "Parse one CSP policy and inspect duplicate directives, source expressions, fallback behavior, reporting rules, and risky allowances.",
    url: "https://yoryantra.com/tools/csp-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSP Analyzer | Yoryantra",
    description:
      "Parse one CSP policy and inspect directives, source expressions, duplicate rules, fallbacks, and reporting mistakes.",
  },
};

export default function CSPAnalyzerPage() {
  return <ToolClient />;
}
