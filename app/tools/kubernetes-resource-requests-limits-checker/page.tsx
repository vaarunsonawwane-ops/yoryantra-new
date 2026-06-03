import type { Metadata } from "next";
import ToolClient from "./ToolClient";

export const metadata: Metadata = {
  title: "Kubernetes Resource Requests and Limits Checker | K8s CPU Memory Review | Yoryantra",
  description:
    "Check Kubernetes YAML for CPU and memory requests and limits. Review missing resources, container settings, namespaces, workloads, and deployment notes.",
  keywords: [
    "Kubernetes Resource Requests and Limits Checker",
    "K8s resource limits checker",
    "Kubernetes CPU memory checker",
    "Kubernetes requests limits analyzer",
    "Kubernetes manifest resource checker",
    "K8s YAML resource analyzer",
    "Kubernetes container resources",
    "CPU memory limits Kubernetes",
    "DevOps tools",
    "Kubernetes tools",
  ],
  alternates: {
    canonical: "https://yoryantra.com/tools/kubernetes-resource-requests-limits-checker",
  },
  openGraph: {
    title: "Kubernetes Resource Requests and Limits Checker | K8s CPU Memory Review | Yoryantra",
    description:
      "Check Kubernetes YAML for CPU and memory requests and limits. Review missing resources, container settings, namespaces, workloads, and deployment notes.",
    url: "https://yoryantra.com/tools/kubernetes-resource-requests-limits-checker",
    siteName: "Yoryantra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kubernetes Resource Requests and Limits Checker | K8s CPU Memory Review | Yoryantra",
    description:
      "Check Kubernetes YAML for CPU and memory requests and limits. Review missing resources, container settings, namespaces, workloads, and deployment notes.",
  },
};

export default function KubernetesResourceRequestsLimitsCheckerPage() {
  return <ToolClient />;
}
