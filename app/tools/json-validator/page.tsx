import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Validator Online Free | Yoryantra",

  description:
    "Validate JSON syntax and find JSON errors instantly with this free online JSON Validator.",

  keywords: [
    "json validator",
    "validate json",
    "json syntax checker",
    "json error checker",
    "json parser",
    "json validation tool",
    "developer tools",
  ],

  alternates: {
    canonical:
      "https://yoryantra.com/tools/json-validator",
  },

  openGraph: {
    title:
      "JSON Validator Online Free | Yoryantra",

    description:
      "Validate JSON syntax and detect JSON errors instantly online.",

    url:
      "https://yoryantra.com/tools/json-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "JSON Validator Online Free | Yoryantra",

    description:
      "Validate JSON syntax and find errors instantly.",
  },
};

export default function Page() {
  return <ToolClient />;
}