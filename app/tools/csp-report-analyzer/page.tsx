import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSP Report Analyzer – Violation JSON & NDJSON | Yoryantra",
  description:
    "Group CSP violation reports by directive or blocked resource, distinguish enforced from report-only events, and parse legacy or Reporting API payloads.",
  keywords: [
    "CSP report analyzer",
    "CSP violation report parser",
    "Content Security Policy reports",
    "CSP report JSON",
    "CSP Reporting API",
    "CSP report-only",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csp-report-analyzer",
  },
  openGraph: {
    title: "CSP Report Analyzer – Violation JSON & NDJSON | Yoryantra",
    description:
      "Group CSP violation reports, separate enforced and report-only events, and read legacy or Reporting API payloads.",
    url: "https://yoryantra.com/tools/csp-report-analyzer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSP Report Analyzer – Violation JSON & NDJSON | Yoryantra",
    description:
      "Group CSP violation reports, separate enforced and report-only events, and read legacy or Reporting API payloads.",
  },
};

export default function CspReportAnalyzerPage() {
  return <ToolClient />;
}
