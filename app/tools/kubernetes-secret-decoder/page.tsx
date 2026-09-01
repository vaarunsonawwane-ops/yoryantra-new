import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Secret Decoder | YAML & Base64 | Yoryantra",
  description:
    "Parse Kubernetes Secret YAML with a real YAML parser, decode data values, inspect stringData, binary fields, metadata and type-specific key expectations locally.",
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-secret-decoder",
  },
  openGraph: {
    title: "Kubernetes Secret Decoder | Yoryantra",
    description:
      "Decode Kubernetes Secret data safely while preserving YAML semantics, stringData precedence, binary values and Secret-type review notes.",
    url: "https://yoryantra.com/tools/kubernetes-secret-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kubernetes Secret Decoder | Yoryantra",
    description:
      "Parse Secret YAML, decode base64 data, inspect stringData and review Secret metadata and type-specific fields locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
