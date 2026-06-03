import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML Formatter Online Free | Yoryantra",

  description:
    "Format and beautify XML instantly with this free online XML Formatter. Improve readability and validate XML structure easily.",

  keywords: [
    "xml formatter",
    "format xml",
    "xml beautifier",
    "pretty print xml",
    "xml validator",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/xml-formatter",
  },

  openGraph: {
    title: "XML Formatter Online Free | Yoryantra",

    description:
      "Format and beautify XML instantly with this free online XML Formatter.",

    url: "https://yoryantra.com/tools/xml-formatter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "XML Formatter Online Free | Yoryantra",

    description:
      "Beautify and format XML instantly with this clean online XML Formatter.",
  },
};

export default function Page() {
  return <ToolClient />;
}