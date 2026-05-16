import ToolClient from "./ToolClient";

export const metadata = {
  title: "Cookie Parser Online Free | Yoryantra",

  description:
    "Parse HTTP cookies into readable key-value pairs instantly with this free online Cookie Parser.",

  keywords: [
    "cookie parser",
    "http cookie parser",
    "parse cookies",
    "cookie header parser",
    "cookies to json",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/cookie-parser",
  },

  openGraph: {
    title: "Cookie Parser Online Free | Yoryantra",
    description: "Parse HTTP cookie headers instantly online.",
    url: "https://yoryantra.com/tools/cookie-parser",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Cookie Parser Online Free | Yoryantra",
    description: "Parse HTTP cookies instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}