import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "YAML Formatter | Comments, Anchors & Documents | Yoryantra",
  description:
    "Format YAML through its document model with indentation and line-width controls while retaining comments, anchors, aliases, directives, and document boundaries.",
  alternates: {
    canonical: "https://yoryantra.com/tools/yaml-formatter",
  },
  openGraph: {
    title: "YAML Formatter | Comments, Anchors & Documents | Yoryantra",
    description:
      "Reformat YAML without reducing it first to plain JavaScript objects and unnecessarily throwing away YAML-specific structure.",
    url: "https://yoryantra.com/tools/yaml-formatter",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YAML Formatter | Yoryantra",
    description:
      "Format YAML documents while preserving comments, aliases, anchors, and stream boundaries where the parser can.",
  },
};

export default function Page() {
  return <ToolClient />;
}
