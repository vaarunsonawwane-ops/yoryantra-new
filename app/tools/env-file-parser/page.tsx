import ToolClient from "./ToolClient";

export const metadata = {
  title: ".env File Parser Online Free | Yoryantra",

  description:
    "Parse and format .env files instantly with this free online .env File Parser.",

  keywords: [
    "env file parser",
    ".env parser",
    "environment variable parser",
    "parse env file",
    "env to json",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/env-file-parser",
  },

  openGraph: {
    title: ".env File Parser Online Free | Yoryantra",
    description: "Parse .env files into readable JSON instantly online.",
    url: "https://yoryantra.com/tools/env-file-parser",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: ".env File Parser Online Free | Yoryantra",
    description: "Parse and format .env files instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}