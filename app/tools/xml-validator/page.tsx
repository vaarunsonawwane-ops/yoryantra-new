import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "XML Validator | Well-Formedness & Namespaces | Yoryantra",
  description:
    "Check XML well-formedness and inspect root element, namespaces, attributes, declaration, DOCTYPE, CDATA, schema hints, and parser boundaries.",
  alternates: {
    canonical: "https://yoryantra.com/tools/xml-validator",
  },
  openGraph: {
    title: "XML Validator | Yoryantra",
    description:
      "Validate XML parsing and inspect document structure while distinguishing well-formed XML from DTD, XSD, application-schema, and external-resource validation.",
    url: "https://yoryantra.com/tools/xml-validator",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "XML Validator | Yoryantra",
    description:
      "Check XML well-formedness, namespaces, DOCTYPE, schema hints, and parser-level document structure.",
  },
};

export default function Page() {
  return <ToolClient />;
}
