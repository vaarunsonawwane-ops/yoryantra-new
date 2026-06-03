import ToolClient from "./ToolClient";

export const metadata = {
  title: "JSON Path Tester | Test JSON Paths Online | Yoryantra",

  description:
    "Test JSON paths against JSON data, inspect matched values, check nested keys, arrays, and JSON query results directly in your browser.",

  keywords: [
    "json path tester",
    "jsonpath tester",
    "test json path",
    "json path checker",
    "json query tester",
    "json path online",
    "json path evaluator",
    "json tools",
    "developer tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/json-path-tester",
  },

  openGraph: {
    title: "JSON Path Tester | Test JSON Paths Online | Yoryantra",

    description:
      "Test JSON paths against JSON data, inspect matched values, check nested keys, arrays, and JSON query results directly in your browser.",

    url: "https://yoryantra.com/tools/json-path-tester",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "JSON Path Tester | Test JSON Paths Online | Yoryantra",

    description:
      "Test JSON paths against JSON data, inspect matched values, check nested keys, arrays, and JSON query results directly in your browser.",
  },
};

export default function JSONPathTesterPage() {
  return <ToolClient />;
}
