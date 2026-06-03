import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML Validator | Check XML Syntax Online | Yoryantra",

  description:
    "Validate XML syntax, check XML structure, find parsing errors, inspect tags, and review XML content directly in your browser.",

  keywords: [
    "xml validator",
    "validate xml",
    "xml syntax checker",
    "xml checker",
    "xml parser",
    "check xml format",
    "xml format validator",
    "xml tools",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/xml-validator",
  },

  openGraph: {
    title: "XML Validator | Check XML Syntax Online | Yoryantra",

    description:
      "Validate XML syntax, check XML structure, find parsing errors, inspect tags, and review XML content directly in your browser.",

    url: "https://yoryantra.com/tools/xml-validator",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "XML Validator | Check XML Syntax Online | Yoryantra",

    description:
      "Validate XML syntax, check XML structure, find parsing errors, inspect tags, and review XML content directly in your browser.",
  },
};

export default function XMLValidatorPage() {
  return <ToolClient />;
}
