import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Formatter & Validator Online Free | Yoryantra",

  description:
    "Format, beautify, validate, and minify JSON instantly with Yoryantra's free online JSON Formatter. Fast, clean, and easy-to-use JSON formatting tool for developers and everyday workflows.",

  keywords: [
    "json formatter",
    "json validator",
    "json beautifier",
    "format json online",
    "json pretty print",
    "online json tool",
    "json minifier",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/json-formatter",
  },

  openGraph: {
    title: "JSON Formatter & Validator Online Free | Yoryantra",

    description:
      "Free online JSON formatter and validator tool to beautify and validate JSON instantly.",

    url: "https://yoryantra.com/tools/json-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Formatter & Validator Online Free | Yoryantra",

    description:
      "Beautify, validate, and format JSON instantly with this free online JSON formatter.",
  },
};

export default function Page() {
  return <ToolClient />;
}