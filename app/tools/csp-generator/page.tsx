import ToolClient from "./ToolClient";

export const metadata = {
  title: "Content Security Policy Header Generator | Yoryantra",

  description:
    "Build a Content-Security-Policy header with common fetch and document directives, source cleanup, and warnings for risky values.",

  keywords: [
    "csp generator",
    "content security policy generator",
    "csp header generator",
    "security headers generator",
    "content security policy builder",
    "web security tools",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/csp-generator",
  },

  openGraph: {
    title:
      "Content Security Policy Header Generator | Yoryantra",

    description:
      "Build a Content-Security-Policy header and review warnings for risky source values.",

    url:
      "https://yoryantra.com/tools/csp-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Content Security Policy Header Generator | Yoryantra",

    description:
      "Build a Content-Security-Policy header with common directives and safety warnings."
  },
};

export default function Page() {
  return <ToolClient />;
}