import ToolClient from "./ToolClient";

export const metadata = {
  title: "Security Header Generator | Generate HTTP Security Headers | Yoryantra",

  description:
    "Generate HTTP security headers for websites, review recommended header values, and prepare security header snippets directly in your browser.",

  keywords: [
    "security header generator",
    "http security headers generator",
    "generate security headers",
    "security headers",
    "content security policy header",
    "x frame options generator",
    "referrer policy generator",
    "permissions policy generator",
    "security tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/security-header-generator",
  },

  openGraph: {
    title: "Security Header Generator | Generate HTTP Security Headers | Yoryantra",

    description:
      "Generate HTTP security headers for websites, review recommended header values, and prepare security header snippets directly in your browser.",

    url: "https://yoryantra.com/tools/security-header-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Security Header Generator | Generate HTTP Security Headers | Yoryantra",

    description:
      "Generate HTTP security headers for websites, review recommended header values, and prepare security header snippets directly in your browser.",
  },
};

export default function SecurityHeaderGeneratorPage() {
  return <ToolClient />;
}
