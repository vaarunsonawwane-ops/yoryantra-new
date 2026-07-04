import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSP Report Analyzer – Parse Violation Reports | Yoryantra",
  description:
    "Analyze CSP violation reports, parse report JSON or NDJSON, group blocked resources, inspect directives, and review report-only or enforced Content Security Policy signals.",
  keywords: [
    "CSP report analyzer",
    "Content Security Policy report analyzer",
    "CSP violation report analyzer",
    "CSP violation report parser",
    "analyze CSP reports",
    "CSP report JSON parser",
    "CSP blocked URI analyzer",
    "CSP report-only analyzer",
    "CSP debugging tool",
    "Content Security Policy violations",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csp-report-analyzer",
  },
  openGraph: {
    title: "CSP Report Analyzer – Parse Violation Reports | Yoryantra",
    description:
      "Analyze CSP violation reports, parse report JSON or NDJSON, group blocked resources, inspect directives, and review report-only or enforced Content Security Policy signals.",
    url: "https://yoryantra.com/tools/csp-report-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSP Report Analyzer – Parse Violation Reports | Yoryantra",
    description:
      "Analyze CSP violation reports, parse report JSON or NDJSON, group blocked resources, inspect directives, and review report-only or enforced Content Security Policy signals.",
  },
};

export default function CspReportAnalyzerPage() {
  return <ToolClient />;
}
