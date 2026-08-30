import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON to YAML Converter | Indent & Quote Controls | Yoryantra",
  description:
    "Convert JSON to YAML with indentation, line-width, quoting, and key-order controls plus diagnostics for JavaScript number precision.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-to-yaml-converter",
  },
  openGraph: {
    title: "JSON to YAML Converter | Indent & Quote Controls",
    description:
      "Convert JSON values to readable YAML with practical formatting controls and precision warnings.",
    url: "https://yoryantra.com/tools/json-to-yaml-converter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to YAML Converter | Yoryantra",
    description:
      "Convert JSON to YAML with indentation, wrapping, quoting, and precision diagnostics.",
  },
};

export default function Page() {
  return <ToolClient />;
}
