import ToolClient from "./ToolClient";

export const metadata = {
  title: "YAML Formatter Online Free | Yoryantra",

  description:
    "Format and beautify YAML instantly with this free online YAML Formatter. Clean, validate, and improve YAML readability.",

  keywords: [
    "yaml formatter",
    "format yaml",
    "yaml beautifier",
    "yaml validator",
    "pretty print yaml",
    "developer utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-formatter",
  },

  openGraph: {
    title: "YAML Formatter Online Free | Yoryantra",
    description:
      "Format and beautify YAML instantly with this free online YAML Formatter.",
    url: "https://yoryantra.com/tools/yaml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "YAML Formatter Online Free | Yoryantra",
    description:
      "Beautify and format YAML instantly with this clean online YAML Formatter.",
  },
};

export default function Page() {
  return <ToolClient />;
}