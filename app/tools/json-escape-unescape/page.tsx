import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Escape Unescape Online Free | Yoryantra",

  description:
    "Escape and unescape JSON strings instantly with this free online JSON Escape Unescape tool.",

  keywords: [
    "json escape",
    "json unescape",
    "json escape unescape",
    "escape json string",
    "unescape json string",
    "json string formatter",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/json-escape-unescape",
  },

  openGraph: {
    title:
      "JSON Escape Unescape Online Free | Yoryantra",

    description:
      "Escape and unescape JSON strings instantly online.",

    url:
      "https://yoryantra.com/tools/json-escape-unescape",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JSON Escape Unescape Online Free | Yoryantra",

    description:
      "Escape and unescape JSON strings instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}