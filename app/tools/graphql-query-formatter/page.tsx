import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "GraphQL Query Formatter | Format, Minify and Inspect GraphQL Online | Yoryantra",
  description:
    "Format, minify, and inspect GraphQL queries, mutations, subscriptions, fragments, variables, operation names, and request payloads directly in your browser.",
  keywords: [
    "GraphQL Query Formatter",
    "GraphQL formatter",
    "GraphQL minifier",
    "GraphQL query beautifier",
    "GraphQL mutation formatter",
    "GraphQL variables formatter",
    "GraphQL request formatter",
    "GraphQL operation extractor",
    "developer tools",
    "API debugging tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/graphql-query-formatter",
  },
  openGraph: {
    title: "GraphQL Query Formatter | Format, Minify and Inspect GraphQL Online | Yoryantra",
    description:
      "Format, minify, and inspect GraphQL queries, mutations, subscriptions, fragments, variables, operation names, and request payloads directly in your browser.",
    url: "https://yoryantra.com/tools/graphql-query-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GraphQL Query Formatter | Format, Minify and Inspect GraphQL Online | Yoryantra",
    description:
      "Format, minify, and inspect GraphQL queries, mutations, subscriptions, fragments, variables, operation names, and request payloads directly in your browser.",
  },
};

export default function GraphqlQueryFormatterPage() {
  return <ToolClient />;
}
