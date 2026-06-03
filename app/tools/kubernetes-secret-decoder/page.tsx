import ToolClient from "./ToolClient";

export const metadata = {
  title: "Kubernetes Secret Decoder | Decode K8s Secrets Online | Yoryantra",

  description:
    "Decode Kubernetes Secret YAML values, inspect base64 encoded data, and review Kubernetes secret content directly in your browser.",

  keywords: [
    "kubernetes secret decoder",
    "k8s secret decoder",
    "decode kubernetes secret",
    "decode k8s secret",
    "kubernetes secret yaml",
    "base64 secret decoder",
    "kubernetes base64 decoder",
    "devops tools",
  ],

  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-secret-decoder",
  },

  openGraph: {
    title: "Kubernetes Secret Decoder | Decode K8s Secrets Online | Yoryantra",

    description:
      "Decode Kubernetes Secret YAML values, inspect base64 encoded data, and review Kubernetes secret content directly in your browser.",

    url: "https://yoryantra.com/tools/kubernetes-secret-decoder",

    siteName: "Yoryantra",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Kubernetes Secret Decoder | Decode K8s Secrets Online | Yoryantra",

    description:
      "Decode Kubernetes Secret YAML values, inspect base64 encoded data, and review Kubernetes secret content directly in your browser.",
  },
};

export default function KubernetesSecretDecoderPage() {
  return <ToolClient />;
}
