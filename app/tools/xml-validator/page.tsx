import ToolClient from "./ToolClient";

export const metadata = {
  title: "XML Validator | Check XML Well-Formedness | Yoryantra",
  description:
    "Check XML well-formedness in your browser, inspect the root element and namespaces, and distinguish syntax checks from DTD or XSD validation.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-validator",
  },
  openGraph: {
    title: "XML Validator | Check XML Well-Formedness | Yoryantra",
    description:
      "Check XML well-formedness in your browser, inspect the root element and namespaces, and distinguish syntax checks from DTD or XSD validation.",
    url: "https://yoryantra.com/tools/xml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XML Validator | Check XML Well-Formedness | Yoryantra",
    description:
      "Check XML well-formedness in your browser, inspect the root element and namespaces, and distinguish syntax checks from DTD or XSD validation.",
  },
};

export default function Page() {
  return <ToolClient />;
}
