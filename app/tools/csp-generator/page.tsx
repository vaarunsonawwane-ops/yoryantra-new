import ToolClient from "./ToolClient";

export const metadata = {
  title: "CSP Generator Online Free | Yoryantra",

  description:
    "Generate Content Security Policy headers instantly with this free online CSP Generator.",

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
      "CSP Generator Online Free | Yoryantra",

    description:
      "Generate Content Security Policy headers instantly online.",

    url:
      "https://yoryantra.com/tools/csp-generator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "CSP Generator Online Free | Yoryantra",

    description:
      "Generate Content Security Policy headers instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}