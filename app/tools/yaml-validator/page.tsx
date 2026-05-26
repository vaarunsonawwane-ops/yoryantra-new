import ToolClient from "./ToolClient";

export const metadata = {
  title: "YAML Validator | Yoryantra",

  description:
    "Validate YAML syntax instantly, detect YAML formatting errors, and check YAML content directly in your browser.",

  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-validator",
  },

  openGraph: {
    title: "YAML Validator | Yoryantra",

    description:
      "Validate YAML syntax instantly, detect YAML formatting errors, and check YAML content directly in your browser.",

    url: "https://yoryantra.com/tools/yaml-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "YAML Validator | Yoryantra",

    description:
      "Validate YAML syntax instantly, detect YAML formatting errors, and check YAML content directly in your browser.",
  },
};

export default function YAMLValidatorPage() {
  return <ToolClient />;
}
