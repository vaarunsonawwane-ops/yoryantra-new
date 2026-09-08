import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes YAML Resource Summarizer | Manifest Inventory | Yoryantra",
  description:
    "Inventory Kubernetes YAML resources with apiVersion, kind, scope, namespaces, workload images, scaling hints, ports, hosts, ConfigMap keys, and Secret key counts.",
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
    title: "Kubernetes YAML Resource Summarizer | Manifest Inventory | Yoryantra",
    description:
      "Inventory Kubernetes YAML resources with apiVersion, kind, scope, namespaces, workload images, scaling hints, ports, hosts, ConfigMap keys, and Secret key counts.",
    url: "https://yoryantra.com/tools/kubernetes-yaml-resource-summarizer",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes YAML Resource Summarizer | Manifest Inventory | Yoryantra",
    description:
      "Inventory Kubernetes YAML resources with apiVersion, kind, scope, namespaces, workload images, scaling hints, ports, hosts, ConfigMap keys, and Secret key counts.",
  },
};

export default function KubernetesYamlResourceSummarizerPage() {
  return <ToolClient />;
}
