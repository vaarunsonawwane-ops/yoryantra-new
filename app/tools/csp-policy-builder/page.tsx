import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSP Policy Builder | Content Security Policy Generator | Yoryantra",
  description:
    "Build Content Security Policy headers, configure CSP directives, add trusted sources, generate report-only policies, and copy production-ready CSP output directly in your browser.",
  keywords: [
    "CSP policy builder",
    "Content Security Policy generator",
    "CSP header generator",
    "security header builder",
    "Content-Security-Policy tool",
    "CSP directive builder",
    "report only CSP",
    "web security tools",
    "security tools",
    "developer tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csp-policy-builder",
  },
  openGraph: {
    title: "CSP Policy Builder | Content Security Policy Generator | Yoryantra",
    description:
      "Build Content Security Policy headers, configure CSP directives, add trusted sources, generate report-only policies, and copy production-ready CSP output directly in your browser.",
    url: "https://yoryantra.com/tools/csp-policy-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSP Policy Builder | Content Security Policy Generator | Yoryantra",
    description:
      "Build Content Security Policy headers, configure CSP directives, add trusted sources, generate report-only policies, and copy production-ready CSP output directly in your browser.",
  },
};

export default function CSPPolicyBuilderPage() {
  return <ToolClient />;
}
