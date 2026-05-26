import ToolClient from "./ToolClient";

export const metadata = {
  title: "CSP Analyzer | Check Content Security Policy Online | Yoryantra",

  description:
    "Analyze Content Security Policy headers, check CSP directives, find unsafe values, missing directives, and common CSP security issues in your browser.",

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
    title: "CSP Analyzer | Check Content Security Policy Online | Yoryantra",

    description:
      "Analyze Content Security Policy headers, check CSP directives, find unsafe values, missing directives, and common CSP security issues in your browser.",

    url: "https://yoryantra.com/tools/csp-analyzer",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "CSP Analyzer | Check Content Security Policy Online | Yoryantra",

    description:
      "Analyze Content Security Policy headers, check CSP directives, find unsafe values, missing directives, and common CSP security issues in your browser.",
  },
};

export default function CSPAnalyzerPage() {
  return <ToolClient />;
}
