import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Secret Decoder | Decode K8s Secret YAML",
  description:
    "Decode base64 values from Kubernetes Secret YAML, inspect data and stringData fields, identify invalid values, and review secret metadata locally in your browser.",
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-secret-decoder",
  },
  openGraph: {
    title: "Kubernetes Secret Decoder | Yoryantra",
    description:
      "Decode Kubernetes Secret data values, inspect stringData, and review secret metadata locally in your browser.",
    url: "https://yoryantra.com/tools/kubernetes-secret-decoder",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Kubernetes Secret Decoder | Yoryantra",
    description:
      "Decode base64 values from Kubernetes Secret YAML and inspect data and stringData fields locally.",
  },
};

export default function KubernetesSecretDecoderPage() {
  return <ToolClient />;
}
