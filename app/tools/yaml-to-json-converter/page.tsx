import ToolClient from "./ToolClient";

export const metadata = {
  title: "YAML to JSON Converter Online Free | Yoryantra",

  description:
    "Convert YAML to JSON instantly with this free online YAML to JSON Converter.",

  keywords: [
    "yaml to json",
    "yaml json converter",
    "convert yaml to json",
    "yaml parser",
    "yaml to json online",
    "devops yaml converter",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/yaml-to-json-converter",
  },

  openGraph: {
    title:
      "YAML to JSON Converter Online Free | Yoryantra",

    description:
      "Convert YAML to JSON instantly online.",

    url:
      "https://yoryantra.com/tools/yaml-to-json-converter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "YAML to JSON Converter Online Free | Yoryantra",

    description:
      "Convert YAML to JSON instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}