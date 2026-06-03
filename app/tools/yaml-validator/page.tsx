import ToolClient from "./ToolClient";

export const metadata = {
  title: "YAML Validator Online Free | Yoryantra",

  description:
    "Validate YAML syntax instantly with this free online YAML Validator. Check YAML formatting errors, indentation issues, and YAML structure in your browser.",

  keywords: [
    "yaml validator",
    "validate yaml",
    "yaml syntax checker",
    "yaml checker",
    "yaml parser",
    "yaml formatting errors",
    "yaml indentation checker",
    "devops utilities",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-validator",
  },

  openGraph: {
    title: "YAML Validator Online Free | Yoryantra",
    description:
      "Validate YAML syntax instantly with this free online YAML Validator.",
    url: "https://yoryantra.com/tools/yaml-validator",
    siteName: "Yoryantra",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "YAML Validator Online Free | Yoryantra",
    description:
      "Check YAML syntax, formatting errors, and indentation issues instantly with this clean online YAML Validator.",
  },
};

export default function Page() {
  return <ToolClient />;
}
