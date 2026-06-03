import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML to JSON Converter Online Free | Yoryantra",

  description:
    "Convert XML to JSON instantly with this free online XML to JSON Converter.",

  keywords: [
    "xml to json",
    "xml json converter",
    "convert xml to json",
    "xml parser",
    "xml to json online",
    "xml json formatter",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/xml-to-json-converter",
  },

  openGraph: {
    title:
      "XML to JSON Converter Online Free | Yoryantra",

    description:
      "Convert XML to JSON instantly online.",

    url:
      "https://yoryantra.com/tools/xml-to-json-converter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "XML to JSON Converter Online Free | Yoryantra",

    description:
      "Convert XML to JSON instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}