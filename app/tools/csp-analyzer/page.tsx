import ToolClient from "./ToolClient";

export const metadata = {
  title: "CSP Analyzer for Directives and Source Review | Yoryantra",

  description:
    "Inspect Content Security Policy directives, source values, duplicate rules, unsafe keywords, and common configuration gaps in your browser.",

  keywords: [
    "csp analyzer",
    "content security policy analyzer",
    "csp checker",
    "content security policy checker",
    "csp header analyzer",
    "csp validator",
    "check csp header",
    "security tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/csp-analyzer",
  },

  openGraph: {
    title: "CSP Analyzer for Directives and Source Review | Yoryantra",

    description:
      "Inspect Content Security Policy directives, source values, duplicate rules, unsafe keywords, and common configuration gaps in your browser.",

    url: "https://yoryantra.com/tools/csp-analyzer",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "CSP Analyzer for Directives and Source Review | Yoryantra",

    description:
      "Inspect Content Security Policy directives, source values, duplicate rules, unsafe keywords, and common configuration gaps in your browser.",
  },
};

export default function CSPAnalyzerPage() {
  return <ToolClient />;
}
