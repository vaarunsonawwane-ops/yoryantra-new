import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Secret Decoder | YAML, Base64 & stringData | Yoryantra",
  description:
    "Parse Kubernetes Secret YAML, decode Base64 data, inspect stringData, binary values, type-specific keys, immutable state and YAML errors in the browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-secret-decoder",
  },
  openGraph: {
    title: "Kubernetes Secret Decoder | Yoryantra",
    description:
      "Read Kubernetes Secret YAML, decode Base64 data, inspect stringData and keep decoded values masked while reviewing the manifest.",
    url: "https://yoryantra.com/tools/kubernetes-secret-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kubernetes Secret Decoder | Yoryantra",
    description:
      "Decode Kubernetes Secret data and inspect YAML, stringData, binary values, type-specific keys and immutable state locally.",
  },
};

export default function Page() {
  return <ToolClient />;
}
