import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "GraphQL Query Formatter & Minifier | Yoryantra",
  description:
    "Format and minify GraphQL source, inspect operations, fragments and variables, and build JSON or cURL requests without sending the document.",
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
    title: "GraphQL Query Formatter & Minifier | Yoryantra",
    description:
    "Format and minify GraphQL source, inspect operations, fragments and variables, and build JSON or cURL requests without sending the document.",
    url: "https://yoryantra.com/tools/graphql-query-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GraphQL Query Formatter & Minifier | Yoryantra",
    description:
    "Format and minify GraphQL source, inspect operations, fragments and variables, and build JSON or cURL requests without sending the document.",
  },
};

export default function GraphqlQueryFormatterPage() {
  return <ToolClient />;
}
