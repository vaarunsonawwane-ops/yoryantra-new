import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSONPath Tester | Test RFC 9535 Paths | Yoryantra",
  description:
    "Test JSONPath expressions against JSON data with child, wildcard, index, slice, descendant, and basic filter selectors based on RFC 9535.",
  alternates: {
    canonical: "https://yoryantra.com/tools/json-path-tester",
  },
  openGraph: {
    title: "JSONPath Tester | Test RFC 9535 Paths | Yoryantra",
    description:
      "Test JSONPath expressions against JSON data with child, wildcard, index, slice, descendant, and basic filter selectors based on RFC 9535.",
    url: "https://yoryantra.com/tools/json-path-tester",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JSONPath Tester | Test RFC 9535 Paths | Yoryantra",
    description:
      "Test JSONPath expressions against JSON data with child, wildcard, index, slice, descendant, and basic filter selectors based on RFC 9535.",
  },
};

export default function Page() {
  return <ToolClient />;
}
