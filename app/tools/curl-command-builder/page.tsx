import ToolClient from "./ToolClient";

export const metadata = {
  title: "CURL Command Builder Online Free | Yoryantra",

  description:
    "Build CURL commands for API requests instantly with this free online CURL Command Builder.",

  keywords: [
    "curl command builder",
    "curl generator",
    "api curl builder",
    "generate curl command",
    "curl request generator",
    "rest api curl tool",
    "developer api tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/curl-command-builder",
  },

  openGraph: {
    title:
      "CURL Command Builder Online Free | Yoryantra",

    description:
      "Build CURL commands for API requests instantly online.",

    url:
      "https://yoryantra.com/tools/curl-command-builder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "CURL Command Builder Online Free | Yoryantra",

    description:
      "Generate CURL commands instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}