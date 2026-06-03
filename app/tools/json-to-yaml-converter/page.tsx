import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON to YAML Converter Online Free | Yoryantra",

  description:
    "Convert JSON to YAML instantly with this free online JSON to YAML Converter.",

  keywords: [
    "json to yaml",
    "json yaml converter",
    "convert json to yaml",
    "json to yaml online",
    "json yaml parser",
    "devops yaml converter",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/json-to-yaml-converter",
  },

  openGraph: {
    title:
      "JSON to YAML Converter Online Free | Yoryantra",

    description:
      "Convert JSON to YAML instantly online.",

    url:
      "https://yoryantra.com/tools/json-to-yaml-converter",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JSON to YAML Converter Online Free | Yoryantra",

    description:
      "Convert JSON to YAML instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}