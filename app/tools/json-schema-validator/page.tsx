import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Schema Validator Online Free | Yoryantra",

  description:
    "Validate JSON data against a JSON schema instantly with this free online JSON Schema Validator.",

  keywords: [
    "json schema validator",
    "validate json schema",
    "json schema checker",
    "json validator schema",
    "json structure validator",
    "api json validator",
    "developer json tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/json-schema-validator",
  },

  openGraph: {
    title:
      "JSON Schema Validator Online Free | Yoryantra",

    description:
      "Validate JSON data against a JSON schema instantly online.",

    url:
      "https://yoryantra.com/tools/json-schema-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JSON Schema Validator Online Free | Yoryantra",

    description:
      "Validate JSON against schemas instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}