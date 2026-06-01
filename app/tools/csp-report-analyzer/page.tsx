import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSP Report Analyzer | Analyze Content Security Policy Violation Reports | Yoryantra",
  description:
    "Analyze Content Security Policy violation reports in your browser. Parse CSP report JSON, group blocked resources, inspect violated directives, detect risky sources, and create clean security reports.",
  keywords: [
    "CSP Report Analyzer",
    "Content Security Policy report analyzer",
    "CSP violation report parser",
    "analyze CSP reports",
    "CSP report JSON",
    "CSP blocked URI analyzer",
    "security tools",
    "web security tools",
    "CSP debugging",
    "developer security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csp-report-analyzer",
  },
  openGraph: {
    title: "CSP Report Analyzer | Analyze Content Security Policy Violation Reports | Yoryantra",
    description:
      "Analyze Content Security Policy violation reports in your browser. Parse CSP report JSON, group blocked resources, inspect violated directives, detect risky sources, and create clean security reports.",
    url: "https://yoryantra.com/tools/csp-report-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSP Report Analyzer | Analyze Content Security Policy Violation Reports | Yoryantra",
    description:
      "Analyze Content Security Policy violation reports in your browser. Parse CSP report JSON, group blocked resources, inspect violated directives, detect risky sources, and create clean security reports.",
  },
};

export default function CspReportAnalyzerPage() {
  return <ToolClient />;
}
