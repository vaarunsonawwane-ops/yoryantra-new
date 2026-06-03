import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes YAML Resource Summarizer | Summarize K8s Manifests Online | Yoryantra",
  description:
    "Summarize Kubernetes YAML manifests in your browser. Extract resources, namespaces, images, replicas, ports, services, ingress hosts, config maps, secrets, and review notes.",
  keywords: [
    "Kubernetes YAML Resource Summarizer",
    "Kubernetes manifest summarizer",
    "K8s YAML summarizer",
    "Kubernetes YAML analyzer",
    "Kubernetes resource summary",
    "K8s manifest checker",
    "Kubernetes deployment summary",
    "Kubernetes service ports",
    "DevOps tools",
    "Kubernetes tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-yaml-resource-summarizer",
  },
  openGraph: {
    title: "Kubernetes YAML Resource Summarizer | Summarize K8s Manifests Online | Yoryantra",
    description:
      "Summarize Kubernetes YAML manifests in your browser. Extract resources, namespaces, images, replicas, ports, services, ingress hosts, config maps, secrets, and review notes.",
    url: "https://yoryantra.com/tools/kubernetes-yaml-resource-summarizer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes YAML Resource Summarizer | Summarize K8s Manifests Online | Yoryantra",
    description:
      "Summarize Kubernetes YAML manifests in your browser. Extract resources, namespaces, images, replicas, ports, services, ingress hosts, config maps, secrets, and review notes.",
  },
};

export default function KubernetesYamlResourceSummarizerPage() {
  return <ToolClient />;
}
