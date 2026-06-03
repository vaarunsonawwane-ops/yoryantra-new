import ToolClient from "./ToolClient";

export const metadata = {
  title: "CORS Header Checker Online Free | Yoryantra",

  description:
    "Analyze and validate CORS headers instantly with this free online CORS Header Checker.",

  keywords: [
    "cors header checker",
    "cors checker",
    "analyze cors headers",
    "cors validator",
    "access control allow origin checker",
    "cors debugging tool",
    "developer security tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/cors-header-checker",
  },

  openGraph: {
    title:
      "CORS Header Checker Online Free | Yoryantra",

    description:
      "Analyze and validate CORS headers instantly online.",

    url:
      "https://yoryantra.com/tools/cors-header-checker",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "CORS Header Checker Online Free | Yoryantra",

    description:
      "Analyze and validate CORS headers instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}