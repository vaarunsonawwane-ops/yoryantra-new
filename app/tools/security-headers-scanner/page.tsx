import ToolClient from "./ToolClient";

export const metadata = {
  title: "Security Headers Scanner Online Free | Yoryantra",

  description:
    "Scan website security headers online and check CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, COEP, and other browser security headers.",

  keywords: [
    "security headers scanner",
    "security headers checker",
    "http security headers",
    "csp checker",
    "hsts checker",
    "x frame options checker",
    "referrer policy checker",
    "permissions policy checker",
    "website security scanner",
    "developer security tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/security-headers-scanner",
  },

  openGraph: {
    title: "Security Headers Scanner Online Free | Yoryantra",

    description:
      "Scan website security headers and check CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, COEP, and related headers.",

    url: "https://yoryantra.com/tools/security-headers-scanner",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Security Headers Scanner Online Free | Yoryantra",

    description:
      "Free online Security Headers Scanner for CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, COEP, and browser security headers.",
  },
};

export default function Page() {
  return <ToolClient />;
}
