import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "CSP Policy Builder | Directives, Sources and Report-Only Output | Yoryantra",
  description:
    "Assemble Content Security Policy directives and source expressions, compare enforce and report-only delivery, and generate header, meta, Nginx, Apache, or JSON output.",
  keywords: [
    "csp policy builder",
    "content security policy builder",
    "csp header generator",
    "csp directives",
    "csp source expressions",
    "report only csp",
    "content security policy header",
    "csp nginx header",
    "csp apache header",
    "security tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/csp-policy-builder",
  },
  openGraph: {
    title: "CSP Policy Builder | Directives, Sources and Report-Only Output | Yoryantra",
    description:
      "Assemble CSP directives and source expressions with enforce, report-only, header, meta, Nginx, Apache, and JSON output.",
    url: "https://yoryantra.com/tools/csp-policy-builder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSP Policy Builder | Yoryantra",
    description:
      "Assemble CSP directives and sources into enforce or report-only policies with deployment-format output.",
  },
};

export default function CSPPolicyBuilderPage() {
  return <ToolClient />;
}
